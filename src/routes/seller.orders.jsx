import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { sellerService } from "@/services/sellerService";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/context/AppContext";
import { ORDER_STATUS } from "@/constants/orderStatus";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";

export const Route = createFileRoute("/seller/orders")({
  head: () => ({ meta: [{ title: "Orders — Seller — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: SellerOrders,
});

const STATUS_CLASS = {
  [ORDER_STATUS.PENDING]: "bg-yellow-500/15 text-yellow-600",
  [ORDER_STATUS.PROCESSING]: "bg-blue-500/15 text-blue-600",
  [ORDER_STATUS.CONFIRMED]: "bg-success/15 text-success",
  [ORDER_STATUS.ACCEPTED]: "bg-success/15 text-success",
  [ORDER_STATUS.DELIVERED]: "bg-success/15 text-success",
  [ORDER_STATUS.SHIPPED]: "bg-primary/15 text-primary",
  [ORDER_STATUS.CANCELLED]: "bg-destructive/15 text-destructive",
  [ORDER_STATUS.REJECTED]: "bg-destructive/15 text-destructive",
};

function SellerOrders() {
  const { t } = useI18n();
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  // Rejection modal state
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!user) return;
    sellerService.orders().then(setOrders).catch(() => setOrders([]));
  }, [user]);

  const handleAccept = async (order) => {
    setLoading(true);
    try {
      await sellerService.acceptOrder(order.id, order);
      const fresh = await sellerService.orders();
      setOrders(fresh);
      window.dispatchEvent(new CustomEvent("products:updated", { detail: { source: "seller.accept" } }));
      toast.success(t("seller.accepted"));
    } catch (err) {
      toast.error(err.message || "Failed to accept order");
    } finally {
      setLoading(false);
    }
  };

  // Opens rejection modal instead of rejecting directly
  const openRejectModal = (order) => {
    setRejectModalOrder(order);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectModalOrder) return;
    setLoading(true);
    try {
      const reasonText = rejectReason.trim() || "لم يتم تحديد سبب";
      // Send only the reason — backend builds the full notification message
      await sellerService.rejectOrder(rejectModalOrder.id, reasonText, rejectModalOrder);
      const fresh = await sellerService.orders();
      setOrders(fresh);
      window.dispatchEvent(new CustomEvent("products:updated", { detail: { source: "seller.reject" } }));
      setRejectModalOrder(null);
      toast.success(t("seller.rejected"));
    } catch (err) {
      toast.error(err.message || "Failed to reject order");
    } finally {
      setLoading(false);
    }
  };

  const Actions = ({ o }) =>
    (o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.PROCESSING) ? (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAccept(o)}
          disabled={loading}
          className="min-h-10 px-3 rounded-lg bg-success/15 text-success font-semibold text-xs inline-flex items-center gap-1 hover:bg-success/25 transition disabled:opacity-50"
        >
          <Check className="size-3.5" />{t("seller.accept")}
        </button>
        <button
          onClick={() => openRejectModal(o)}
          disabled={loading}
          className="min-h-10 px-3 rounded-lg bg-destructive/15 text-destructive font-semibold text-xs inline-flex items-center gap-1 hover:bg-destructive/25 transition disabled:opacity-50"
        >
          <X className="size-3.5" />{t("seller.reject")}
        </button>
        <button
          onClick={() => setSelectedOrder(o)}
          className="min-h-10 px-3 rounded-lg border bg-background text-foreground font-semibold text-xs inline-flex items-center gap-1 hover:bg-accent transition"
        >
          <Info className="size-3.5" />{t("seller.viewDetails")}
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedOrder(o)}
          className="min-h-10 px-3 rounded-lg border bg-background text-foreground font-semibold text-xs inline-flex items-center gap-1 hover:bg-accent transition"
        >
          <Info className="size-3.5" />{t("seller.viewDetails")}
        </button>
      </div>
    );

  return (
    <DashboardLayout kind="seller">
      <h2 className="text-2xl font-black mb-6">{t("seller.orders")}</h2>

      {/* Desktop table */}
      <div className="hidden md:block rounded-3xl bg-card border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-section">
              <tr>
                <th className="p-4 text-start">Order</th>
                <th className="p-4 text-start">Buyer</th>
                <th className="p-4 text-start">Date</th>
                <th className="p-4 text-start">Items</th>
                <th className="p-4 text-start">Total</th>
                <th className="p-4 text-start">Payment</th>
                <th className="p-4 text-start">Status</th>
                <th className="p-4 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 sm:p-4 font-bold whitespace-normal break-all">{o.id}</td>
                  <td className="p-3 sm:p-4 whitespace-normal break-words min-w-[160px]">
                    {o.customer?.deleted_at ? (
                      <button
                        onClick={() => toast.error(t("user deleted") || "This user is deleted")}
                        className="text-muted-foreground line-through hover:text-destructive transition text-start font-bold"
                      >
                        {o.customer?.name || "—"}
                      </button>
                    ) : (
                      <Link to="/u/$id" params={{ id: String(o.customer?.id) }} className="text-primary hover:underline">
                        {o.customer?.name || "—"}
                      </Link>
                    )}
                  </td>
                  <td className="p-3 sm:p-4 whitespace-nowrap">{o.date}</td>
                  <td className="p-3 sm:p-4 whitespace-normal break-words">{o.items}</td>
                  <td className="p-3 sm:p-4 font-bold whitespace-nowrap">${o.total}</td>
                  <td className="p-3 sm:p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      o.paymentMethod === PAYMENT_METHODS.SHAM_CASH
                        ? "bg-violet-500/15 text-violet-600"
                        : "bg-accent text-foreground"
                    }`}>
                      {o.paymentMethod === PAYMENT_METHODS.SHAM_CASH ? t("checkout.shamcash") : t("checkout.cash")}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASS[o.status] || "bg-accent"}`}>
                      {t(`orderStatus.${o.status}`)}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4"><Actions o={o} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl bg-card border shadow-soft p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold break-all">{o.id}</div>
                <div className="text-xs text-muted-foreground mt-1">{o.date}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_CLASS[o.status] || "bg-accent"}`}>
                {t(`orderStatus.${o.status}`)}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div>
                <div className="text-muted-foreground">Buyer</div>
                <div className="font-bold break-words">
                  {o.customer?.deleted_at ? (
                    <button
                      onClick={() => toast.error(t("user.deleted") || "This user is deleted")}
                      className="text-muted-foreground line-through hover:text-destructive transition text-start text-xs font-bold"
                    >
                      {o.customer?.name || "—"}
                    </button>
                  ) : (
                    <Link to="/u/$id" params={{ id: String(o.customer?.id) }} className="text-primary hover:underline">
                      {o.customer?.name || "—"}
                    </Link>
                  )}
                </div>
              </div>
              <div><div className="text-muted-foreground">Total</div><div className="font-bold">${o.total}</div></div>
            </div>
            <div className="pt-1"><Actions o={o} /></div>
          </div>
        ))}
      </div>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="w-[calc(100%-1rem)] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{t("seller.orderDetails")}</DialogTitle>
              <DialogDescription>{t("seller.orderDetailsSubtitle")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{t("seller.order")}</div>
                  <div className="font-bold text-lg">{selectedOrder.id}</div>
                  <div className="text-sm text-muted-foreground">{selectedOrder.date}</div>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{t("seller.status")}</div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${STATUS_CLASS[selectedOrder.status] || "bg-accent"}`}>
                    {t(`orderStatus.${selectedOrder.status}`)}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Customer info */}
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{t("seller.buyer")}</div>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={selectedOrder.customer?.name} src={selectedOrder.customer?.image} size="sm" />
                    <div className="font-semibold">
                      {selectedOrder.customer?.deleted_at ? (
                        <button
                          onClick={() => toast.error(t("user.deleted") || "This user is deleted")}
                          className="text-muted-foreground line-through hover:text-destructive transition text-start font-semibold"
                        >
                          {selectedOrder.customer?.name}
                        </button>
                      ) : (
                        <Link to="/u/$id" params={{ id: String(selectedOrder.customer?.id) }} className="text-primary hover:underline">
                          {selectedOrder.customer?.name}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedOrder.customer?.email}</div>
                  <div className="text-sm text-muted-foreground">{selectedOrder.customer?.phone}</div>
                  {selectedOrder.customer?.address && (
                    <div className="text-sm text-muted-foreground mt-1">📍 {selectedOrder.customer?.address}</div>
                  )}
                </div>

                {/* Payment method */}
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">{t("seller.paymentMethod")}</div>
                  <div className="font-semibold">
                    {selectedOrder.paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY
                      ? t("checkout.cash")
                      : t("checkout.shamcash")}
                  </div>
                  {selectedOrder.paymentMethod === PAYMENT_METHODS.SHAM_CASH && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-600 text-xs font-bold">
                      ✅ تم الدفع عبر شام كاش — المخزون تم خصمه فوراً
                    </div>
                  )}
                  {selectedOrder.paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold">
                      ⚡ الدفع عند الاستلام — المخزون يُخصم عند القبول
                    </div>
                  )}
                  {selectedOrder.note && (
                    <div className="mt-2 text-sm text-destructive">{selectedOrder.note}</div>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="rounded-3xl border bg-background p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3">{t("seller.product")}</div>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 rounded-2xl border p-3 bg-white dark:bg-background/60">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-16 rounded-2xl object-cover border"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="size-16 rounded-2xl border bg-section grid place-items-center text-xs text-muted-foreground shrink-0">
                          No img
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{item.name}</div>
                        {item.color && <div className="text-xs text-muted-foreground">{item.color}</div>}
                        <div className="text-sm font-bold mt-2">${item.price?.toLocaleString()} × {item.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sham Cash Payment Details */}
              {selectedOrder.paymentMethod === PAYMENT_METHODS.SHAM_CASH && (
                <div className="rounded-3xl border bg-background p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-violet-500/15 text-violet-600 grid place-items-center shrink-0">
                      💳
                    </div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">
                      تفاصيل دفع شام كاش
                    </div>
                  </div>

                  {/* Sham Cash Number */}
                  {selectedOrder.shamCashNumber && (
                    <div className="flex items-center justify-between rounded-xl border bg-violet-500/5 border-violet-500/20 p-3">
                      <span className="text-xs font-bold text-muted-foreground">رقم حساب شام كاش</span>
                      <span className="font-mono font-black text-sm text-violet-700 dark:text-violet-300 select-all">
                        {selectedOrder.shamCashNumber}
                      </span>
                    </div>
                  )}

                  {/* Bank Account Image */}
                  {selectedOrder.bankAccountImage && (
                    <div>
                      <div className="text-xs font-bold text-muted-foreground mb-2">صورة الحساب البنكي</div>
                      <a href={selectedOrder.bankAccountImage} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectedOrder.bankAccountImage}
                          alt="Bank account"
                          className="w-full max-h-52 rounded-2xl object-contain border hover:opacity-90 transition cursor-zoom-in"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </a>
                    </div>
                  )}

                  {/* Proof URLs */}
                  {selectedOrder.proofUrls?.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-muted-foreground mb-2">
                        {t("seller.paymentProof")} ({selectedOrder.proofUrls.length})
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

                  {/* No proof yet */}
                  {!selectedOrder.shamCashNumber && !selectedOrder.bankAccountImage && selectedOrder.proofUrls?.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">لم يتم رفع إيصال دفع بعد.</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition">
                {t("common.close")}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ===== REJECT ORDER REASON MODAL ===== */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card shadow-elev overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-destructive flex items-center gap-2">
                <X className="size-5" />
                <span>سبب رفض الطلب</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Sham Cash warning */}
              {rejectModalOrder.paymentMethod === PAYMENT_METHODS.SHAM_CASH && (
                <div className="p-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-sm text-violet-700 dark:text-violet-300 font-semibold">
                  💜 طلب شام كاش — سيتم إشعار الزبون بأن العربون سيُرجع خلال مدة أقصاها 8 ساعات.
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                أدخل سبب الرفض. سيتم إرساله للزبون مع إشعار رفض الطلب:
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: المنتج غير متوفر، الطلب يحتاج مراجعة، ..."
                className="w-full p-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
              />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setRejectModalOrder(null)}
                  className="h-10 px-4 rounded-xl border font-bold text-sm hover:bg-accent transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmReject}
                  disabled={loading}
                  className="h-10 px-5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "..." : "تأكيد الرفض"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
