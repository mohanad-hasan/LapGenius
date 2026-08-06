import { api, makeAbsoluteUrl } from "@/lib/api";
import { applyOrderStockChange } from "@/services/orderStockManager";
import { productService } from "@/services/productService";

function isNetworkError(err) {
  const m = (err?.message || "").toLowerCase();
  return (
    m.includes("fetch") ||
    m.includes("network") ||
    m.includes("connection") ||
    m.includes("503") ||
    m.includes("502")
  );
}

/*
  sellerService — متصل بـ Laravel API الحقيقي
  Endpoints:
    GET  /api/v1/seller/products             → منتجات البائع
    POST /api/v1/seller/products             → إضافة منتج
    PUT  /api/v1/seller/products/:id         → تعديل منتج
    DELETE /api/v1/seller/products/:id       → حذف منتج
    GET  /api/v1/seller/orders               → طلبات البائع
    PUT  /api/v1/seller/orders/:id/accept    → قبول الطلب (ينقص من المخزون - COD)
    PUT  /api/v1/seller/orders/:id/reject    → رفض الطلب
    GET  /api/v1/seller/dashboard/stats      → إحصائيات
*/

function normalizeOrder(o) {
  const resolveUrl = (url) => makeAbsoluteUrl(url);

  // Backend stores payment method as payment_method (not method)
  const paymentMethod =
    o.payment?.payment_method ||
    o.payment?.method ||
    o.payment_method ||
    "cash_on_delivery";

  // Resolve sham cash fields — may live at order root OR nested under payment
  const shamCashNumber =
    o.payment?.sham_cash_number ||
    o.sham_cash_number ||
    null;

  const bankAccountImageRaw =
    o.payment?.bank_account_image ||
    o.bank_account_image ||
    null;

  // proof_url can be JSON string "[\"path\"]", array, or single string
  const resolveProofUrls = () => {
    let raw =
      o.payment?.proof_url ??
      o.payment?.proof_urls ??
      o.proof_url ??
      o.proof_urls ??
      [];
    try {
      if (typeof raw === "string" && raw.trim().startsWith("[")) {
        raw = JSON.parse(raw);
      }
    } catch (e) {}
    if (Array.isArray(raw)) return raw.map(resolveUrl).filter(Boolean);
    if (typeof raw === "string" && raw) return [resolveUrl(raw)];
    return [];
  };

  const proofUrls = resolveProofUrls();

  return {
    id: String(o.order_id || o.id),
    userId: String(o.customer?.id || o.user?.id || ""),
    date: (o.order_date || o.created_at || "").slice(0, 10),
    total: parseFloat(o.total_amount || o.total_price || 0),
    status: o.status || "processing",
    items: (o.items || []).length || 1,
    customer: {
      id: String(o.customer?.id || o.user?.id || ""),
      name: o.customer?.name || o.customer?.full_name || o.user?.full_name || o.user?.name || "",
      email: o.customer?.email || o.user?.email || "",
      phone: o.customer?.phone || o.user?.phone || o.phone || "",
      image: o.customer?.image || o.user?.image || null,
      address: o.shipping_address || "",
      city: o.customer?.location || o.user?.location || "",
      paymentMethod,
      deleted_at: o.customer?.deleted_at || o.user?.deleted_at || null,
    },
    paymentMethod,
    phone: o.phone || o.customer?.phone || o.user?.phone || null,
    shipping: o.shipping_address || "",
    orderItems: (o.items || []).map((i) => ({
      productId: i.product_id,
      name: i.product?.name || i.product_name || "",
      price: parseFloat(i.price_at_purchase || i.price || 0),
      qty: parseInt(i.quantity || 1),
      image: resolveUrl(i.image_url || i.product?.image_url || null),
    })),
    // Sham Cash payment details
    shamCashNumber,
    bankAccountImage: bankAccountImageRaw ? resolveUrl(bankAccountImageRaw) : null,
    proofUrls,
    // Legacy single proof (backward compat)
    paymentProof: (() => {
      const legacy =
        o.payment?.proof_url ||
        o.proof_url ||
        o.payment_proof ||
        o.payment?.payment_proof;
      if (legacy) {
        return { name: "proof", url: resolveUrl(Array.isArray(legacy) ? legacy[0] : legacy) };
      }
      return null;
    })(),
    note: o.note || null,
  };
}

function normalizeProduct(p) {
  // Backend returns relationship as product_images with field image_path
  const imgs = p.product_images || p.images || [];
  const primaryImg = imgs.find((i) => i.is_primary) || imgs[0];
  const primaryImageUrl = primaryImg
    ? makeAbsoluteUrl(primaryImg.image_path || primaryImg.url || primaryImg.path)
    : p.primary_image_url ||
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

  const allImages = imgs.length
    ? imgs.map((i) => makeAbsoluteUrl(i.image_path || i.url || i.path))
    : [primaryImageUrl];

  return {
    id: p.id,
    name: p.name || "",
    brand: p.brand || "",
    category: p.category?.name || p.category || "",
    category_id: p.category_id || p.category?.id || "",
    condition: p.condition || "New",
    price: parseFloat(p.price) || 0,
    discountPercent: parseFloat(p.discount_percent) || 0,
    discountedPrice: parseFloat(p.discounted_price) || parseFloat(p.price) || 0,
    stock: p.stock_quantity ?? p.stock ?? 0,
    description: p.description || "",
    cpu: p.cpu_type || p.specifications?.cpu || "",
    gpu: p.gpu_type || p.specifications?.gpu || "",
    igpu: p.igpu || p.specifications?.igpu || null,
    ram: p.ram_size || p.specifications?.ram || "",
    storage: p.storage_size || p.specifications?.storage || "",
    battery: p.battery_capacity || p.specifications?.battery || "",
    os: p.os || "Windows 11",
    screen: p.screen_size || "",
    weight: p.weight || "1.5",
    recommended_usage: p.recommended_usage || "",
    seller: {
      id: String(p.seller_id || ""),
      name: p.seller?.full_name || p.seller?.name || "",
      rating: p.rating || 4.5,
    },
    colors: [
      {
        name: "Default",
        hex: "#222",
        images: allImages,
      },
    ],
  };
}

export const sellerService = {
  async products() {
    try {
      const data = await api.get("/seller/products");
      return (data?.data?.data || data?.data || []).map(normalizeProduct);
    } catch (err) {
      if (isNetworkError(err)) {
        const { PRODUCTS } = await import("@/data/products");
        return PRODUCTS;
      }
      throw err;
    }
  },

  async addProduct(productData) {
    if (productData._imageFiles && productData._imageFiles.length > 0) {
      const form = new FormData();
      Object.entries(productData).forEach(([k, v]) => {
        if (k !== "_imageFiles" && k !== "_imageFile" && v !== undefined && v !== null) {
          form.append(k, String(v));
        }
      });
      productData._imageFiles.forEach((file) => {
        form.append("images[]", file);
      });
      return api.postForm("/seller/products", form);
    } else if (productData._imageFile) {
      const form = new FormData();
      Object.entries(productData).forEach(([k, v]) => {
        if (k !== "_imageFile" && v !== undefined && v !== null) {
          form.append(k, String(v));
        }
      });
      form.append("images[]", productData._imageFile);
      return api.postForm("/seller/products", form);
    }
    return api.post("/seller/products", productData);
  },

  async updateProduct(id, patch) {
    if (patch._imageFiles && patch._imageFiles.length > 0) {
      const form = new FormData();
      Object.entries(patch).forEach(([k, v]) => {
        if (k !== "_imageFiles" && k !== "_imageFile" && v !== undefined && v !== null) {
          form.append(k, String(v));
        }
      });
      patch._imageFiles.forEach((file) => {
        form.append("images[]", file);
      });
      form.append("_method", "PUT");
      return api.postForm(`/seller/products/${id}`, form);
    } else if (patch._imageFile) {
      const form = new FormData();
      Object.entries(patch).forEach(([k, v]) => {
        if (k !== "_imageFile" && v !== undefined && v !== null) {
          form.append(k, String(v));
        }
      });
      form.append("images[]", patch._imageFile);
      form.append("_method", "PUT");
      return api.postForm(`/seller/products/${id}`, form);
    }
    return api.put(`/seller/products/${id}`, patch);
  },

  async deleteProduct(id) {
    return api.delete(`/seller/products/${id}`);
  },

  async orders() {
    try {
      const data = await api.get("/seller/orders");
      return (data?.data || []).map(normalizeOrder);
    } catch (err) {
      if (isNetworkError(err)) {
        const { MOCK_ORDERS } = await import("@/data/users");
        return MOCK_ORDERS;
      }
      throw err;
    }
  },

  /** قبول الطلب — ينقص من المخزون فقط للـ COD */
  async acceptOrder(id, orderPayload = {}) {
    const result = await api.put(`/seller/orders/${id}/accept`, {});
    const paymentMethod = orderPayload?.paymentMethod || orderPayload?.payment?.payment_method || orderPayload?.payment_method || "cash_on_delivery";
    const items = (orderPayload?.orderItems || orderPayload?.items || []).map((item) => ({
      id: item?.productId || item?.product_id || item?.id,
      qty: item?.qty || item?.quantity || 1,
    })).filter((item) => item.id != null);

    if (items.length > 0) {
      const products = await productService.all();
      const stockLookup = Object.fromEntries((products || []).map((product) => [String(product.id), Number(product.stock || 0)]));
      await applyOrderStockChange({
        orderId: String(id),
        paymentMethod,
        action: "accept",
        items,
        stockLookup,
      });
    }

    return result;
  },

  /** رفض الطلب */
  async rejectOrder(id, reason, orderPayload = {}) {
    const result = await api.put(`/seller/orders/${id}/reject`, { note: reason });
    const paymentMethod = orderPayload?.paymentMethod || orderPayload?.payment?.payment_method || orderPayload?.payment_method || "cash_on_delivery";
    const items = (orderPayload?.orderItems || orderPayload?.items || []).map((item) => ({
      id: item?.productId || item?.product_id || item?.id,
      qty: item?.qty || item?.quantity || 1,
    })).filter((item) => item.id != null);

    if (items.length > 0) {
      const products = await productService.all();
      const stockLookup = Object.fromEntries((products || []).map((product) => [String(product.id), Number(product.stock || 0)]));
      await applyOrderStockChange({
        orderId: String(id),
        paymentMethod,
        action: "reject",
        items,
        stockLookup,
      });
    }

    return result;
  },

  async allStats() {
    const data = await api.get("/seller/dashboard/stats");
    const d = data?.data || {};
    return {
      stats: {
        products: d.total_products ?? 0,
        orders: d.total_orders ?? 0,
        revenue: d.total_revenue ?? 0,
        pending: d.pending_orders ?? 0,
      },
      sales: (d.monthly_sales || []).map((m) => ({
        month: String(m.month || "").slice(0, 3),
        sales: m.orders_count || 0,
        revenue: m.revenue || 0,
      })),
      mix: (d.categories_mix || []).map((c) => ({
        name: c.name,
        value: c.total || c.value || 0,
      })),
    };
  },

  async stats() {
    const data = await api.get("/seller/dashboard/stats");
    const d = data?.data || {};
    return {
      products: d.total_products ?? 0,
      orders: d.total_orders ?? 0,
      revenue: d.total_revenue ?? 0,
      pending: d.pending_orders ?? 0,
    };
  },

  async sales() {
    const data = await api.get("/seller/dashboard/stats");
    return (data?.data?.monthly_sales || []).map((m) => ({
      month: String(m.month || "").slice(0, 3),
      sales: m.orders_count || 0,
      revenue: m.revenue || 0,
    }));
  },

  async productMix() {
    const data = await api.get("/seller/dashboard/stats");
    return (data?.data?.categories_mix || []).map((c) => ({
      name: c.name,
      value: c.total || c.value || 0,
    }));
  },

  async discounts() {
    const data = await api.get("/seller/discounts");
    return data?.data?.data || data?.data || [];
  },

  async addDiscount(payload) {
    return api.post("/seller/discounts", payload);
  },

  async updateDiscount(id, payload) {
    return api.put(`/seller/discounts/${id}`, payload);
  },

  async deleteDiscount(id) {
    return api.delete(`/seller/discounts/${id}`);
  },

  async toggleActiveDiscount(id) {
    return api.put(`/seller/discounts/${id}/toggle-active`);
  },
};
