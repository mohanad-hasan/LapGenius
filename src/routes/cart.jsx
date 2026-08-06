import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { evaluatePrice, getPriceEvaluationClasses, PRICE_EVALUATION_STATUS } from "@/services/priceEvaluationService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: CartPage,
});

function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal, user } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();
  const goCheckout = () => {
    if (!user) { toast.error(t("cart.loginRequired")); navigate({ to: "/login" }); return; }
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-4xl font-black mb-8">{t("cart.title")}</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="size-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-6">{t("cart.empty")}</p>
            <Link to="/shop" className="inline-flex h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold items-center">{t("cart.continue")}</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
            <div className="space-y-3 min-w-0">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div key={`${item.id}-${item.color}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border bg-card shadow-soft">
                    <img src={item.image} alt={item.name} className="w-20 sm:size-24 h-20 rounded-xl object-cover bg-section shrink-0" />
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="font-bold truncate text-sm sm:text-base">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.color}</div>
                      <div className="font-black text-base sm:text-lg mt-1">${item.price.toLocaleString()}</div>
                      {item.aiPrice != null && (
                        (() => {
                          const evaluation = evaluatePrice(item.price, item.aiPrice);
                          const classes = getPriceEvaluationClasses(evaluation.status);
                          const statusLabel = t(`priceEvaluation.status.${evaluation.status}`);
                          const reasonLabel = t(`priceEvaluation.reason.${evaluation.status}`);
                          return (
                            <div className={`mt-2 rounded-2xl border ${classes.border} ${classes.bg} p-2 text-xs sm:text-sm`}>
                              <div className={`font-bold ${classes.text}`}>{statusLabel}</div>
                              <div className={`mt-1 ${classes.text} opacity-90`}>{reasonLabel}</div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-0 w-full sm:w-auto">
                      <span className="text-sm sm:text-base font-semibold text-muted-foreground">Qty:</span>
                      <div className="flex items-center border rounded-xl">
                        <button onClick={() => updateQty(item.id, item.color, item.qty - 1)} className="size-9 hover:bg-accent grid place-items-center"><Minus className="size-3" /></button>
                        <span className="w-10 text-center font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.color, item.qty + 1)} className="size-9 hover:bg-accent grid place-items-center"><Plus className="size-3" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.color)} aria-label={t("cart.remove")}
                        className="size-9 rounded-xl hover:bg-destructive/10 hover:text-destructive grid place-items-center transition ms-auto sm:ms-2">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <aside className="p-4 sm:p-6 rounded-3xl border bg-card shadow-soft h-fit lg:sticky lg:top-20 space-y-3">
              <h2 className="font-bold text-lg">{t("cart.total")}</h2>
              <Row label={t("cart.subtotal")} value={`$${cartTotal.toLocaleString()}`} />
              <hr />
              <Row label={t("cart.total")} value={`$${cartTotal.toLocaleString()}`} big />
              <button type="button" onClick={goCheckout} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2 hover:bg-primary-dark transition">
                {t("cart.checkout")} <ArrowRight className="size-4" />
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value, big }) {
  return (
    <div className={`flex justify-between ${big ? "text-xl font-black" : "text-sm"}`}>
      <span className={big ? "" : "text-muted-foreground"}>{label}</span><span>{value}</span>
    </div>
  );
}
