import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Search, Calendar, CreditCard, Box, MapPin, Eye, ShoppingCart } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserAvatar } from "@/components/common/UserAvatar";
import { adminService } from "@/services/adminService";
import { useI18n } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "All Orders — Admin — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleCustomerClick = (customer) => {
    if (!customer?.id) return;
    if (customer.deleted_at) {
      toast.error(isAr ? "هذا المستخدم محذوف" : "This user is deleted");
    } else {
      navigate({ to: `/u/${customer.id}` });
    }
  };

  useEffect(() => {
    adminService.orders()
      .then(data => {
        const resolveUrl = (url) => {
          if (!url) return null;
          if (/^https?:\/\//i.test(url)) return url;
          const base = (import.meta.env.VITE_BACKEND_BASE || "").replace(/\/+$/, "");
          return `${base}/${url.replace(/^\/+/, "")}`;
        };
        const normalized = data.map(o => ({
          id: String(o.id),
          customer: {
            id: o.user?.id || o.customer?.id || null,
            name: o.user?.full_name || o.user?.name || o.customer?.full_name || o.customer?.name || "Unknown",
            email: o.user?.email || o.customer?.email || "",
            phone: o.user?.phone || o.customer?.phone || o.phone || "Not provided",
            image: o.user?.image || o.customer?.image || null,
            deleted_at: o.user?.deleted_at || o.customer?.deleted_at || null,
          },
          date: (o.created_at || "").slice(0, 10),
          total: parseFloat(o.total_price || o.total_amount || 0),
          status: o.status || "pending",
          items: o.items || [],
          payment: o.payment || {},
          paymentMethod:
            o.payment?.payment_method ||
            o.payment?.method ||
            o.payment_method ||
            "cash_on_delivery",
          shipping: o.shipping_address || o.user?.location || "Not provided",
          phone: o.phone || o.user?.phone || o.customer?.phone || null,
          // Sham Cash details
          shamCashNumber:
            o.payment?.sham_cash_number ||
            o.sham_cash_number ||
            null,
          bankAccountImage: (() => {
            const img = o.payment?.bank_account_image || o.bank_account_image;
            return img ? resolveUrl(img) : null;
          })(),
          proofUrls: (() => {
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
          })(),
        }));
        setOrders(normalized);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openOrder = (o) => {
    setSelectedOrder(o);
    setShowDetails(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-amber-500/15 text-amber-500 border-amber-500/20";
      case "confirmed": return "bg-blue-500/15 text-blue-500 border-blue-500/20";
      case "processing": return "bg-purple-500/15 text-purple-500 border-purple-500/20";
      case "shipped": return "bg-primary/15 text-primary border-primary/20";
      case "delivered": return "bg-success/15 text-success border-success/20";
      case "cancelled": return "bg-destructive/15 text-destructive border-destructive/20";
      default: return "bg-accent text-foreground border-border";
    }
  };

  const filtered = orders.filter(o =>
    o.id.includes(search) ||
    o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    o.status.includes(search.toLowerCase())
  );

  return (
    <DashboardLayout kind="admin">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{isAr ? "جميع الطلبات" : "All Orders"}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isAr ? "عرض جميع طلبات الموقع (للقراءة فقط)" : "View all orders across the platform (Read-only)"}
          </p>
        </div>
      </div>

      <div className="flex mb-6">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "البحث برقم الطلب، اسم الزبون..." : "Search by order ID, customer name..."}
            className="w-full h-11 ps-10 pe-4 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 grid place-items-center">
          <span className="text-muted-foreground text-sm font-semibold">{isAr ? "جاري التحميل..." : "Loading orders..."}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-48 border border-dashed rounded-3xl grid place-items-center bg-card/20">
          <span className="text-muted-foreground text-sm">{isAr ? "لم يتم العثور على طلبات" : "No orders found"}</span>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-3xl bg-card border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-section">
                  <tr>
                    <th className="p-3 sm:p-4 text-start font-bold">{isAr ? "الطلب" : "Order"}</th>
                    <th className="p-3 sm:p-4 text-start font-bold">{isAr ? "الزبون" : "Customer"}</th>
                    <th className="p-3 sm:p-4 text-start font-bold">{isAr ? "المبلغ" : "Total"}</th>
                    <th className="p-3 sm:p-4 text-start font-bold">{isAr ? "الحالة" : "Status"}</th>
                    <th className="p-3 sm:p-4 text-end font-bold">{isAr ? "تفاصيل" : "Details"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(o => (
                    <tr key={o.id} className="hover:bg-accent/10 transition">
                      <td className="p-3 sm:p-4 min-w-[120px]">
                        <div className="font-mono font-bold break-all">#{o.id}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="size-3 shrink-0" /> <span className="break-words">{o.date}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 min-w-[220px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar name={o.customer.name} src={o.customer.image} size="sm" />
                          <div className="min-w-0">
                            <button
                              onClick={() => handleCustomerClick(o.customer)}
                              className="font-bold truncate max-w-[180px] hover:text-primary transition text-start block"
                            >
                              {o.customer.name}
                            </button>
                            <div className="text-[10px] text-muted-foreground break-all">{o.customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 font-bold text-primary min-w-[100px]">
                        ${o.total.toLocaleString()}
                      </td>
                      <td className="p-3 sm:p-4 min-w-[110px]">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-end min-w-[100px]">
                        <button
                          onClick={() => openOrder(o)}
                          className="inline-flex h-8 px-3 rounded-lg bg-accent hover:bg-accent/80 text-foreground text-xs font-bold items-center gap-1.5 transition"
                        >
                          <Eye className="size-3.5" />
                          {isAr ? "عرض" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map(o => (
              <div key={o.id} className="rounded-2xl bg-card border shadow-soft p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono font-bold break-all">#{o.id}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="size-3 shrink-0" /> <span className="break-words">{o.date}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(o.status)}`}>
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <UserAvatar name={o.customer.name} src={o.customer.image} size="sm" />
                  <div className="min-w-0">
                    <button
                      onClick={() => handleCustomerClick(o.customer)}
                      className="font-bold text-sm truncate max-w-full hover:text-primary transition text-start block"
                    >
                      {o.customer.name}
                    </button>
                    <div className="text-[10px] text-muted-foreground break-all">{o.customer.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "المبلغ" : "Total"}</div>
                    <div className="font-bold text-primary">${o.total.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => openOrder(o)}
                    className="inline-flex h-8 px-3 rounded-lg bg-accent hover:bg-accent/80 text-foreground text-xs font-bold items-center gap-1.5 transition"
                  >
                    <Eye className="size-3.5" />
                    {isAr ? "عرض" : "View"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="size-5 text-primary" />
              <span>{isAr ? "تفاصيل الطلب" : "Order Details"} #{selectedOrder?.id}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Customer + Payment + Status */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-section/50 border space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                    <UserAvatar name={selectedOrder.customer.name} src={selectedOrder.customer.image} size="sm" />
                    {isAr ? "معلومات الزبون" : "Customer Info"}
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>{isAr ? "الاسم:" : "Name:"}</strong>{" "}
                      <button
                        onClick={() => handleCustomerClick(selectedOrder.customer)}
                        className="hover:text-primary underline font-semibold transition text-start"
                      >
                        {selectedOrder.customer.name}
                      </button>
                    </div>
                    <div><strong>{isAr ? "الإيميل:" : "Email:"}</strong> {selectedOrder.customer.email}</div>
                    <div><strong>{isAr ? "الهاتف:" : "Phone:"}</strong> {selectedOrder.phone || selectedOrder.customer.phone || "—"}</div>
                    <div className="flex items-start gap-1 mt-2 text-muted-foreground">
                      <MapPin className="size-4 shrink-0 mt-0.5" />
                      <span>{selectedOrder.shipping}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-section/50 border space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                    <CreditCard className="size-4" />
                    {isAr ? "معلومات الدفع" : "Payment Info"}
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>{isAr ? "الطريقة:" : "Method:"}</strong>{" "}
                      {selectedOrder.paymentMethod === "sham_cash"
                        ? (isAr ? "💳 شام كاش" : "💳 Sham Cash")
                        : (isAr ? "🚚 الدفع عند الاستلام" : "🚚 Cash on Delivery")}
                    </div>
                    <div><strong>{isAr ? "الحالة:" : "Status:"}</strong> {selectedOrder.payment?.status || selectedOrder.status || "N/A"}</div>
                    <div className="font-black text-lg mt-2 text-primary">
                      {isAr ? "الإجمالي:" : "Total:"} ${selectedOrder.total.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-section/50 border space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                    <Package className="size-4" />
                    {isAr ? "حالة الطلب" : "Order Status"}
                  </h4>
                  <div className="text-sm space-y-1.5">
                    <div className="mt-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3 pt-1">
                      <strong>{isAr ? "تاريخ الطلب:" : "Order Date:"}</strong> {selectedOrder.date}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordered Items */}
              <div>
                <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                  <ShoppingCart className="size-4" />
                  {isAr ? "المنتجات المطلوبة" : "Ordered Items"}
                </h4>
                <div className="divide-y border rounded-2xl overflow-hidden bg-card">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-accent/5 transition">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-section border grid place-items-center">
                          <Box className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{item.product?.name || item.product_name || "Product"}</div>
                          <div className="text-xs text-muted-foreground">{isAr ? "الكمية:" : "Qty:"} {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-bold">
                        ${(parseFloat(item.price_at_purchase || item.price) * parseInt(item.quantity)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sham Cash Payment Details */}
              {(selectedOrder.paymentMethod === "sham_cash" ||
                selectedOrder.payment?.payment_method === "sham_cash" ||
                selectedOrder.payment?.method === "sham_cash") && (
                <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-4">
                  <h4 className="font-bold text-sm text-violet-700 dark:text-violet-300 flex items-center gap-2">
                    💳 {isAr ? "تفاصيل دفع شام كاش" : "Sham Cash Payment Details"}
                  </h4>

                  {selectedOrder.shamCashNumber && (
                    <div className="flex items-center justify-between rounded-xl border border-violet-500/20 bg-white/50 dark:bg-background/50 p-3">
                      <span className="text-xs font-bold text-muted-foreground">{isAr ? "رقم الحساب" : "Account Number"}</span>
                      <span className="font-mono font-black text-sm text-violet-700 dark:text-violet-300 select-all">
                        {selectedOrder.shamCashNumber}
                      </span>
                    </div>
                  )}

                  {selectedOrder.bankAccountImage && (
                    <div>
                      <div className="text-xs font-bold text-muted-foreground mb-2">{isAr ? "صورة الحساب البنكي" : "Bank Account Image"}</div>
                      <a href={selectedOrder.bankAccountImage} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={selectedOrder.bankAccountImage}
                          alt="Bank account"
                          className="w-full max-h-52 rounded-xl object-contain border hover:opacity-90 transition cursor-zoom-in"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </a>
                    </div>
                  )}

                  {selectedOrder.proofUrls?.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-muted-foreground mb-2">
                        {isAr ? "إيصالات الدفع" : "Payment Receipts"} ({selectedOrder.proofUrls.length})
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedOrder.proofUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Proof ${i + 1}`}
                              className="w-full aspect-video rounded-xl object-cover border hover:opacity-90 transition cursor-zoom-in"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedOrder.shamCashNumber && !selectedOrder.bankAccountImage && !selectedOrder.proofUrls?.length && (
                    <p className="text-sm text-muted-foreground italic">
                      {isAr ? "لم يتم رفع إيصال دفع بعد." : "No payment proof uploaded yet."}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <DialogClose className="h-10 px-5 rounded-xl border bg-card font-bold hover:bg-accent transition">
                  {isAr ? "إغلاق" : "Close"}
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
