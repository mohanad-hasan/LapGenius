import { api, BACKEND_BASE } from "@/lib/api";
import { applyOrderStockChange } from "@/services/orderStockManager";
import { productService } from "@/services/productService";

/*
  orderService — متصل بـ Laravel API الحقيقي
  Endpoints (Customer):
    GET  /api/v1/customer/orders              → طلبات الزبون
    GET  /api/v1/customer/orders/:id          → تفاصيل طلب
    POST /api/v1/customer/orders              → إنشاء طلب (COD أو Sham Cash multipart)
    POST /api/v1/customer/payment/process     → معالجة دفع شام كاش (إذا كان الـ backend يدعمها)
    PUT  /api/v1/customer/orders/:id/cancel   → إلغاء طلب
*/

function normalizeCustomerOrder(o) {
  // helper to pick first existing key
  const pick = (obj, keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };

  // id
  const id = pick(o, ["order_id", "id"]);

  // items fallback (some backends use order_items / products / cart)
  const items = pick(o, ["items", "order_items", "products", "cart"]) || [];

  // total — try common fields, fallback to summing item subtotals or prices
  let totalRaw = pick(o, ["total_amount", "total_price", "total", "amount", "grand_total", "grandTotal"]);
  let total = parseFloat(totalRaw || 0) || 0;
  if ((!total || total === 0) && Array.isArray(items) && items.length > 0) {
    total = items.reduce((sum, it) => {
      const sub = parseFloat(it.subtotal || it.total || (it.price_at_purchase && (it.price_at_purchase * (it.quantity || it.qty || 1))) || it.price || 0) || 0;
      return sum + sub;
    }, 0);
  }

  // date — support many possible field names and formats
  const rawDate = pick(o, ["order_date", "created_at", "createdAt", "date", "placed_at"]);
  let date = null;
  if (rawDate) {
    try {
      if (typeof rawDate === "string" && /^\d+$/.test(rawDate.trim())) {
        const n = rawDate.trim();
        const ms = n.length <= 10 ? Number(n) * 1000 : Number(n);
        date = new Date(ms).toISOString().slice(0, 10);
      } else if (typeof rawDate === "number") {
        const ms = String(rawDate).length <= 10 ? rawDate * 1000 : rawDate;
        date = new Date(ms).toISOString().slice(0, 10);
      } else {
        date = new Date(rawDate).toISOString().slice(0, 10);
      }
    } catch (e) {
      date = String(rawDate).slice(0, 10);
    }
  }
  // payment helpers: normalize bank image, sham cash number, and proof URLs
  const payment = o.payment || {};

  const resolveUrl = (val) => {
    if (!val) return null;
    const s = String(val).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s) || /^data:/i.test(s)) return s;
    const base = (BACKEND_BASE || "").replace(/\/+$/, "");
    const path = s.replace(/^\/+/, "");
    return base ? `${base}/${path}` : `/${path}`;
  };

  const pickPayment = (keys) => pick(payment, keys) ?? pick(o, keys.map(k => k.replace(/payment_?/, '')));

  const bankRaw = pick(payment, ["bank_account_image"]) || o.bank_account_image || null;
  const bank_account_image = bankRaw ? resolveUrl(bankRaw) : null;

  // sham cash number
  const sham_cash_number = pick(payment, ["sham_cash_number"]) || o.sham_cash_number || null;

  // proof urls / legacy payment_proof
  let rawProofs = pick(payment, ["proof_url", "proof_urls"]) ?? o.proof_url ?? o.proof_urls ?? null;
  // also consider payment_proof which might be a JSON array string or a single url
  const legacyProof = o.payment_proof || payment.payment_proof || null;

  if (!rawProofs && legacyProof) rawProofs = legacyProof;

  let proofList = [];
  if (typeof rawProofs === "string") {
    try {
      const parsed = JSON.parse(rawProofs);
      if (Array.isArray(parsed)) proofList = parsed;
      else proofList = [parsed];
    } catch (e) {
      const idx = rawProofs.indexOf('[');
      if (idx !== -1) {
        try {
          const parsed = JSON.parse(rawProofs.slice(idx));
          if (Array.isArray(parsed)) proofList = parsed;
          else proofList = [rawProofs];
        } catch (e2) {
          proofList = [rawProofs];
        }
      } else {
        proofList = [rawProofs];
      }
    }
  } else if (Array.isArray(rawProofs)) {
    proofList = rawProofs;
  } else if (rawProofs) {
    proofList = [rawProofs];
  }

  const proof_urls = proofList.map(resolveUrl).filter(Boolean);

  const paymentObj = { ...payment };
  if (!paymentObj.bank_account_image && bank_account_image) paymentObj.bank_account_image = bank_account_image;
  if (!paymentObj.sham_cash_number && sham_cash_number) paymentObj.sham_cash_number = sham_cash_number;
  if (!paymentObj.proof_url && proof_urls.length) paymentObj.proof_url = proof_urls;
  if (!paymentObj.payment_proof && proof_urls.length) paymentObj.payment_proof = proof_urls[0];

  return {
    // المعرّف — الـ backend يرجع order_id وليس id
    id,
    // التاريخ
    date: date || null,
    // الإجمالي
    total,
    // الحالة
    status: o.status || "pending",
    // العنوان
    shipping_address: o.shipping_address || o.address || "",
    // الهاتف
    phone: o.phone || o.customer?.phone || o.user?.phone || null,
    // طريقة الدفع — من payment object أو من الجذر
    payment_method:
      (o.payment && (o.payment.payment_method || o.payment.method)) || o.payment_method || "cash_on_delivery",
    // كائن الدفع الكامل (للتفاصيل مثل sham_cash_number)
    payment: paymentObj,
    // bank image and sham cash at root for older consumers
    bank_account_image,
    sham_cash_number,
    // normalized proof urls array
    proof_url: proof_urls,
    // المنتجات — نبقيها كما هي من الـ backend
    items,
    // keep raw for debugging
    _raw: o,
  };
}

export const orderService = {
  async list() {
    const data = await api.get("/customer/orders");
    const raw = data?.data?.data || data?.data || [];
    return Array.isArray(raw) ? raw.map(normalizeCustomerOrder) : [];
  },

  async get(id) {
    const data = await api.get(`/customer/orders/${id}`);
    const raw = data?.data || data;
    return raw ? normalizeCustomerOrder(raw) : raw;
  },

  /**
   * إنشاء طلب — COD (الدفع عند الاستلام)
   */
  async placeCOD({ cart, form, onStockUpdate }) {
    const body = {
      shipping_address: `${form.address}, ${form.city}`,
      phone: form.phone,
      payment_method: "cash_on_delivery",
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.qty,
        price: item.price,
        color: item.color || null,
      })),
      note: null,
    };
    const data = await api.post("/customer/orders", body);
    const responseData = data?.data || data;
    const orderId = responseData?.order_id || responseData?.id || null;

    if (orderId && typeof onStockUpdate === "function") {
      const products = await productService.all();
      const stockLookup = Object.fromEntries((products || []).map((product) => [String(product.id), Number(product.stock || 0)]));
      const stockResult = await applyOrderStockChange({
        orderId,
        paymentMethod: "cash_on_delivery",
        action: "create",
        items: cart.map((item) => ({ id: item.id, qty: item.qty })),
        stockLookup,
      });
      onStockUpdate({ orderId, stockResult, paymentMethod: "cash_on_delivery" });
    }

    return responseData;
  },

  /**
   * إنشاء طلب — شام كاش (multipart/form-data)
   * يرسل كل شيء في طلب واحد: payment_method + sham_cash_number + bank_account_image + proof_url[]
   */
  async placeShamCash({ cart, form, shamCashNumber, bankAccountImage, proofFiles, onStockUpdate }) {
    const fd = new FormData();

    // بيانات الشحن
    fd.append("shipping_address", `${form.address}, ${form.city}`);
    fd.append("phone", form.phone);
    fd.append("payment_method", "sham_cash");

    // المنتجات
    cart.forEach((item, i) => {
      fd.append(`items[${i}][product_id]`, item.id);
      fd.append(`items[${i}][quantity]`, item.qty);
      fd.append(`items[${i}][price]`, item.price);
      if (item.color) fd.append(`items[${i}][color]`, item.color);
    });

    // رقم شام كاش
    if (shamCashNumber) {
      fd.append("sham_cash_number", String(shamCashNumber).trim());
    }

    // صورة الحساب البنكي
    if (bankAccountImage) {
      fd.append("bank_account_image", bankAccountImage);
    }

    // إيصالات الدفع proof_url[0..n]
    const proofArr = Array.isArray(proofFiles) ? proofFiles : proofFiles ? [proofFiles] : [];
    const primaryProof = proofArr[0] || bankAccountImage || null;

    // payment_proof — الحقل الأصلي
    if (primaryProof) {
      fd.append("payment_proof", primaryProof);
    }

    // proof_url[0..n]
    if (proofArr.length === 0 && bankAccountImage) {
      fd.append("proof_url[0]", bankAccountImage);
    } else {
      proofArr.forEach((file, i) => {
        fd.append(`proof_url[${i}]`, file);
      });
    }

    const data = await api.postForm("/customer/orders", fd);

    // استخراج order_id
    const orderId = data?.data?.order_id || data?.data?.id || data?.order_id || data?.id || null;

    if (!orderId) {
      console.error("[placeShamCash] Could not extract order_id from response:", data);
      return data?.data || data;
    }

    if (typeof onStockUpdate === "function") {
      const products = await productService.all();
      const stockLookup = Object.fromEntries((products || []).map((product) => [String(product.id), Number(product.stock || 0)]));
      const stockResult = await applyOrderStockChange({
        orderId,
        paymentMethod: "sham_cash",
        action: "create",
        items: cart.map((item) => ({ id: item.id, qty: item.qty })),
        stockLookup,
      });
      onStockUpdate({ orderId, stockResult, paymentMethod: "sham_cash" });
    }

    // Step 2: حفظ تفاصيل شام كاش
    // (البيكند تم تعديله ليقبل pending + processing + confirmed)
    try {
      const payFd = new FormData();
      payFd.append("order_id", String(orderId));
      payFd.append("payment_method", "sham_cash");
      if (shamCashNumber) payFd.append("sham_cash_number", String(shamCashNumber).trim());
      if (bankAccountImage) payFd.append("bank_account_image", bankAccountImage);
      proofArr.forEach((file, i) => {
        payFd.append(`proof_url[${i}]`, file);
      });

      await api.postForm("/customer/payment/process", payFd);
      console.log("[placeShamCash] Payment details saved for order:", orderId);
    } catch (err) {
      console.error("[placeShamCash] Failed to save payment details:", err.message);
    }

    return data?.data || data;
  },

  async cancel(id) {
    return api.put(`/customer/orders/${id}/cancel`, {});
  },
};
