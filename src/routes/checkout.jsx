import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Check, Wallet, Truck, Upload, FileCheck2, X, Plus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";
import { orderService } from "@/services/orderService";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import shamQr from "@/assets/shamcash-qr.jpg";
import { productService } from "@/services/productService";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — LapGenius" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s) => ({ buyNow: typeof s.buyNow === "string" ? s.buyNow : undefined }),
  component: CheckoutPage,
});

const SHAM_ACCOUNT = "0999999999";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

function CheckoutPage() {
  const { cart, cartTotal, clearCart, user } = useApp();
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const navigate = useNavigate();
  const { buyNow: buyNowParam } = Route.useSearch();

  const buyNowItem = (() => {
    if (!buyNowParam) return null;
    try { return JSON.parse(buyNowParam); } catch { return null; }
  })();

  const activeCart = buyNowItem ? [{ ...buyNowItem, qty: buyNowItem.qty || 1 }] : cart;
  const activeTotal = buyNowItem
    ? (buyNowItem.price * (buyNowItem.qty || 1))
    : cart.reduce((s, i) => s + i.qty * i.price, 0);

  const [step, setStep] = useState(activeCart.length === 0 ? "empty" : "form");
  const [pay, setPay] = useState(PAYMENT_METHODS.CASH_ON_DELIVERY);
  const [form, setForm] = useState({ fullName: user?.name || "", phone: user?.phone || "", address: "", city: "" });
  const [submitting, setSubmitting] = useState(false);

  // Sham Cash specific state
  const [shamNumber, setShamNumber] = useState("");
  const [shamNumberErr, setShamNumberErr] = useState("");
  const [bankImage, setBankImage] = useState(null);    // bank_account_image
  const [proofFiles, setProofFiles] = useState([]);    // proof_url[0..n]
  const [fileErr, setFileErr] = useState("");
  const [stockVersion, setStockVersion] = useState(0);

  useEffect(() => {
    if (!user) {
      toast.error(t("cart.loginRequired"));
      navigate({ to: "/login" });
    }
  }, [user, navigate, t]);

  if (!user) return null;

  /* ── file helpers ──────────────────────────────────────────── */
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileErr(t("checkout.proofHint"));
      return false;
    }
    setFileErr("");
    return true;
  };

  const onPickBankImage = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) setBankImage(file);
  };

  const onAddProof = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(validateFile);
    setProofFiles((prev) => [...prev, ...valid]);
    e.target.value = ""; // allow re-picking same file
  };

  const removeProof = (idx) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ── submit ────────────────────────────────────────────────── */
  const refreshProducts = async () => {
    try {
      const products = await productService.all();
      window.dispatchEvent(new CustomEvent("products:updated", { detail: { products, source: "checkout" } }));
      setStockVersion((prev) => prev + 1);
    } catch {}
  };

  const place = async (e) => {
    e.preventDefault();

    if (pay === PAYMENT_METHODS.SHAM_CASH) {
      if (!shamNumber.trim()) {
        setShamNumberErr("رقم شام كاش مطلوب.");
        return;
      }
      if (!bankImage && proofFiles.length === 0) {
        setFileErr(t("checkout.proofRequired"));
        return;
      }
    }

    setSubmitting(true);
    try {
      if (pay === PAYMENT_METHODS.SHAM_CASH) {
        await orderService.placeShamCash({
          cart: activeCart,
          form,
          shamCashNumber: shamNumber.trim(),
          bankAccountImage: bankImage,
          proofFiles,
          onStockUpdate: async ({ orderId, stockResult }) => {
            if (stockResult?.newStockForProduct) {
              await refreshProducts();
            }
          },
        });
      } else {
        await orderService.placeCOD({
          cart: activeCart,
          form,
          onStockUpdate: async ({ orderId, stockResult }) => {
            if (stockResult?.newStockForProduct) {
              await refreshProducts();
            }
          },
        });
      }
      if (!buyNowItem) clearCart();
      setStep("success");
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── empty / success screens ───────────────────────────────── */
  if (step === "empty") return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground mb-6">{t("cart.empty")}</p>
        <Link to="/shop" className="inline-flex h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold items-center">{t("cart.continue")}</Link>
      </main><Footer />
    </div>
  );

  if (step === "success") return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 grid place-items-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }}
            className="size-20 rounded-full bg-success grid place-items-center mx-auto mb-5"><Check className="size-10 text-white" /></motion.div>
          <h1 className="text-3xl font-black mb-2">{t("checkout.success")}</h1>
          <p className="text-muted-foreground mb-6">{t("checkout.successMsg")}</p>
          <button onClick={() => navigate({ to: "/" })} className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold">{t("checkout.backHome")}</button>
        </motion.div>
      </main><Footer />
    </div>
  );

  /* ── main form ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-4xl font-black mb-8">{t("checkout.title")}</h1>
        <form onSubmit={place} className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">

            {/* Shipping */}
            <div className="p-6 rounded-3xl border bg-card shadow-soft">
              <h2 className="font-bold text-lg mb-4">{t("checkout.shipping")}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label={t("checkout.fullName")} value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
                <Input label={t("checkout.phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <Input label={t("checkout.address")} value={form.address} onChange={(v) => setForm({ ...form, address: v })} required full />
                <Input label={t("checkout.city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
              </div>
            </div>

            {/* Payment method */}
            <div className="p-6 rounded-3xl border bg-card shadow-soft">
              <h2 className="font-bold text-lg mb-4">{t("checkout.payment")}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <PayOption icon={Truck} label={t("checkout.cash")} active={pay === PAYMENT_METHODS.CASH_ON_DELIVERY} onClick={() => setPay(PAYMENT_METHODS.CASH_ON_DELIVERY)} />
                <PayOption icon={Wallet} label={t("checkout.shamcash")} active={pay === PAYMENT_METHODS.SHAM_CASH} onClick={() => setPay(PAYMENT_METHODS.SHAM_CASH)} />
              </div>

              <AnimatePresence initial={false}>
                {pay === PAYMENT_METHODS.SHAM_CASH && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden">
                    <div className="mt-5 pt-5 border-t space-y-5">
                      <p className="text-sm font-semibold text-foreground/90 leading-relaxed">{t("checkout.shamHeader")}</p>

                      {/* Refund notice */}
                      <div className="p-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-sm text-violet-700 dark:text-violet-300 font-semibold leading-relaxed">
                        ℹ️ إذا تم رفض الطلب سوف يتم إرجاع العربون خلال مدة أقصاها <strong>8 ساعات</strong>.
                      </div>

                      {/* QR + Account */}
                      <div className="grid place-items-center">
                        <img src={shamQr} alt="Sham Cash QR" width="220" height="220" className="size-56 rounded-2xl border bg-white p-3 object-contain shadow-soft" />
                      </div>
                      <div className="p-4 rounded-2xl border bg-background/60 text-center">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">{t("checkout.shamAccount")}</div>
                        <div className="text-xl font-black tracking-wider select-all">{SHAM_ACCOUNT}</div>
                      </div>

                      {/* Sham Cash Number */}
                      <div>
                        <label className="text-xs font-bold text-muted-foreground block mb-1">
                          {isAr ? "رقم حساب شام كاش المحول منه" : "Your Sham Cash Account Number"} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={shamNumber}
                          onChange={(e) => { setShamNumber(e.target.value); setShamNumberErr(""); }}
                          placeholder={isAr ? "أدخل رقمك الخاص بشام كاش هنا..." : "Enter your Sham Cash number here..."}
                          className={`w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition font-mono text-sm ${shamNumberErr ? "border-destructive focus:ring-destructive/30" : ""}`}
                        />
                        {shamNumberErr && <span className="block mt-1 text-xs font-semibold text-destructive">{shamNumberErr}</span>}
                      </div>

                      {/* Bank Account Image */}
                      <div>
                        <span className="text-xs font-bold text-muted-foreground block mb-1">
                          {isAr ? "صورة إثبات ملكية الحساب البنكي (اختياري)" : "Bank Account Ownership Proof (Optional)"}
                        </span>
                        <label className="flex items-center gap-3 p-3 rounded-2xl border border-dashed bg-background/40 cursor-pointer hover:bg-accent/40 transition">
                          <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center">
                            {bankImage ? <FileCheck2 className="size-5" /> : <Upload className="size-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            {bankImage
                              ? <span className="text-sm font-semibold text-success truncate block">{bankImage.name}</span>
                              : <span className="text-sm text-muted-foreground">{isAr ? "اضغط هنا لاختيار صورة الحساب..." : "Click here to select account image..."}</span>}
                          </div>
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                            onChange={onPickBankImage} className="sr-only" />
                        </label>
                      </div>

                      {/* Proof Files (proof_url[]) */}
                      <div>
                        <span className="text-xs font-bold text-muted-foreground block mb-1">
                          {isAr ? "إيصالات الحوالة المالية" : "Payment Transfer Receipts"} <span className="text-destructive">*</span>
                        </span>

                        {/* Existing files list */}
                        {proofFiles.length > 0 && (
                          <ul className="space-y-2 mb-2">
                            {proofFiles.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-success/5 border-success/30">
                                <FileCheck2 className="size-4 text-success shrink-0" />
                                <span className="text-sm font-semibold truncate flex-1">{f.name}</span>
                                <button type="button" onClick={() => removeProof(i)}
                                  className="size-6 rounded-full hover:bg-destructive/10 grid place-items-center text-muted-foreground hover:text-destructive transition">
                                  <X className="size-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Add more proof */}
                        <label className="flex items-center gap-3 p-3 rounded-2xl border border-dashed bg-background/40 cursor-pointer hover:bg-accent/40 transition">
                          <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center">
                            <Plus className="size-5" />
                          </div>
                          <span className="text-sm text-muted-foreground">{isAr ? "انقر هنا لإرفاق إيصالات الحوالة (يمكنك رفع عدة صور)" : "Click here to attach transfer receipts (multiple allowed)"}</span>
                          <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                            onChange={onAddProof} className="sr-only" />
                        </label>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-muted-foreground">{isAr ? "الملفات المسموحة: صور أو PDF" : "Allowed files: Images or PDF"}</span>
                          {fileErr && <span className="text-xs font-semibold text-destructive">{fileErr}</span>}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order summary */}
          <aside className="p-6 rounded-3xl border bg-card shadow-soft h-fit lg:sticky lg:top-20 space-y-3">
            <h2 className="font-bold text-lg mb-2">{t("cart.total")}</h2>
            {buyNowItem ? (
              <div className="flex justify-between text-sm">
                <span className="truncate me-2">{buyNowItem.name} × {buyNowItem.qty || 1}</span>
                <span className="font-bold">${(buyNowItem.price * (buyNowItem.qty || 1)).toLocaleString()}</span>
              </div>
            ) : (
              cart.map((i) => (
                <div key={`${i.id}-${i.color}`} className="flex justify-between text-sm">
                  <span className="truncate me-2">{i.name} × {i.qty}</span><span className="font-bold">${(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))
            )}
            <hr />
            <div className="flex justify-between text-xl font-black"><span>{t("cart.total")}</span><span>${activeTotal.toLocaleString()}</span></div>
            <button type="submit" disabled={submitting}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {submitting && <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
              {submitting ? "جارٍ التأكيد…" : t("checkout.placeOrder")}
            </button>
          </aside>
        </form>
      </main><Footer />
    </div>
  );
}

function Input({ label, value, onChange, required, full, placeholder, error }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold text-muted-foreground block mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className={`w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? "border-destructive focus:ring-destructive/30" : ""}`} />
      {error && <span className="block mt-1 text-xs font-semibold text-destructive">{error}</span>}
    </label>
  );
}

function PayOption({ icon: Icon, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`p-4 rounded-2xl border-2 text-start transition ${active ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}>
      <Icon className="size-6 mb-2" /><div className="font-bold">{label}</div>
    </button>
  );
}
