import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Package, Settings as SettingsIcon, Info, CreditCard, MapPin } from "lucide-react";
import PasswordInput from "@/components/common/PasswordInput";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";
import { orderService } from "@/services/orderService";
import { authService } from "@/services/authService";
import { api, makeAbsoluteUrl } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

const STATUS_CLASS = {
  pending:    "bg-yellow-500/15 text-yellow-600",
  processing: "bg-blue-500/15 text-blue-600",
  confirmed:  "bg-success/15 text-success",
  accepted:   "bg-success/15 text-success",
  delivered:  "bg-success/15 text-success",
  shipped:    "bg-primary/15 text-primary",
  cancelled:  "bg-destructive/15 text-destructive",
  rejected:   "bg-destructive/15 text-destructive",
};

function ProfilePage() {
  const { user, isUserLoaded } = useApp();
  const { t } = useI18n();
  const [tab, setTab] = useState("info");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user && tab === "orders") {
      setLoadingOrders(true);
      orderService.list()
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [user, tab]);

  if (!isUserLoaded) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-4xl font-black mb-8">{t("profile.title")}</h1>
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="p-6 rounded-3xl border bg-card shadow-soft h-fit">
            <div className="text-center mb-5">
              <div className="flex justify-center">
                <UserAvatar name={user.name} src={user.image} size="xl" />
              </div>
              <div className="font-bold mt-3">{user.name}</div>
              <div className="text-xs font-mono text-muted-foreground/60 mt-0.5">#{user.id}</div>
              <div className="text-sm text-muted-foreground break-all">{user.email}</div>
              <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">{user.role}</div>
            </div>
            <nav className="space-y-1">
              <TabBtn icon={User} label={t("profile.info")} active={tab === "info"} onClick={() => setTab("info")} />
              {user.role === "customer" && (
                <TabBtn icon={Package} label={t("profile.orders")} active={tab === "orders"} onClick={() => setTab("orders")} />
              )}
              <TabBtn icon={SettingsIcon} label={t("profile.settings")} active={tab === "settings"} onClick={() => setTab("settings")} />
            </nav>
          </aside>
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl border bg-card shadow-soft">
            {tab === "info" && <EditProfileForm />}
            {tab === "orders" && (
              <div>
                <h2 className="font-bold text-lg mb-4">{t("profile.orders")}</h2>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-14 rounded-2xl bg-section animate-pulse" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-start text-muted-foreground border-b">
                        <tr>
                          <th className="py-2 text-start">Order</th>
                          <th className="text-start">Date</th>
                          <th className="text-start">Total</th>
                          <th className="text-start">Status</th>
                          <th className="text-start"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id} className="border-b last:border-0 hover:bg-accent/30 transition">
                            <td className="py-3 font-bold">#{o.id}</td>
                            <td className="py-3">{o.date || "—"}</td>
                            <td className="py-3 font-bold">${Number(o.total || 0).toLocaleString()}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASS[o.status] || "bg-accent"}`}>
                                {t(`orderStatus.${o.status}`)}
                              </span>
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-accent transition"
                              >
                                <Info className="size-3.5" /> View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {tab === "settings" && <ChangePasswordForm />}
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.id} — Details</DialogTitle>
              <DialogDescription>Full order information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">

              {/* Order + Status */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Order</div>
                  <div className="font-bold text-lg">#{selectedOrder.id}</div>
                  <div className="text-sm text-muted-foreground">{selectedOrder.date}</div>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CLASS[selectedOrder.status] || "bg-accent"}`}>
                    {t(`orderStatus.${selectedOrder.status}`)}
                  </span>
                </div>
              </div>

              {/* Shipping + Phone */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2 flex items-center gap-1">
                    <MapPin className="size-3.5" /> Delivery Address
                  </div>
                  <div className="text-sm font-semibold">{selectedOrder.shipping_address || "—"}</div>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">Phone</div>
                  <div className="text-sm font-semibold">{selectedOrder.phone || selectedOrder.user?.phone || "—"}</div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2 flex items-center gap-1">
                  <CreditCard className="size-3.5" /> Payment
                </div>
                <div className="font-semibold mb-2">
                  {selectedOrder.payment_method === "sham_cash" ? "💳 Sham Cash" : "🚚 Cash on Delivery"}
                </div>

                {/* Sham Cash Number */}
                {(selectedOrder.payment?.sham_cash_number || selectedOrder.sham_cash_number) && (
                  <div className="flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2 mb-2">
                    <span className="text-xs font-bold text-muted-foreground">رقم حساب شام كاش</span>
                    <span className="font-mono font-black text-sm text-violet-700 dark:text-violet-300 select-all">
                      {selectedOrder.payment?.sham_cash_number || selectedOrder.sham_cash_number}
                    </span>
                  </div>
                )}

                {selectedOrder.payment_method === "sham_cash" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-600 text-xs font-bold">
                    ✅ تم الدفع عبر شام كاش
                  </div>
                )}
                {selectedOrder.payment_method === "cash_on_delivery" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold">
                    ⚡ الدفع عند الاستلام
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="rounded-3xl border bg-background p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3">Products</div>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 rounded-2xl border p-3 bg-section">
                      {item.image_url ? (
                        <img
                          src={makeAbsoluteUrl(item.image_url)}
                          alt={item.product_name}
                          className="size-16 rounded-2xl object-cover border shrink-0"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="size-16 rounded-2xl border bg-accent grid place-items-center text-xs text-muted-foreground shrink-0">No img</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{item.product_name}</div>
                        {item.color && <div className="text-xs text-muted-foreground">Color: {item.color}</div>}
                        {item.seller_name && (
                          <div className="text-xs text-muted-foreground mt-0.5">Sold by: <span className="font-semibold text-foreground">{item.seller_name}</span></div>
                        )}
                        <div className="text-sm font-bold mt-2">
                          ${Number(item.price_at_purchase || 0).toLocaleString()} × {item.quantity}
                          <span className="ml-2 text-muted-foreground font-normal">= ${Number(item.subtotal || item.price_at_purchase * item.quantity || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Proofs — bank_account_image + proof_url[] + payment_proof */}
              {(() => {
                const bankImage = selectedOrder.payment?.bank_account_image || selectedOrder.bank_account_image;
                const rawProofs = selectedOrder.payment?.proof_url || selectedOrder.proof_url || [];
                const legacyProof = selectedOrder.payment_proof || selectedOrder.payment?.payment_proof;
                
                if (!bankImage && !rawProofs && !legacyProof && (!Array.isArray(rawProofs) || rawProofs.length === 0)) {
                  return null;
                }

                return (
                  <div className="rounded-3xl border bg-background p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Payment Receipts</div>

                    {/* Bank account image */}
                    {bankImage && (
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-1">صورة الحساب البنكي</div>
                        <a href={makeAbsoluteUrl(bankImage)} target="_blank" rel="noopener noreferrer">
                          <img
                            src={makeAbsoluteUrl(bankImage)}
                            alt="Bank account"
                            className="w-full max-h-52 rounded-2xl object-contain border hover:opacity-90 transition cursor-zoom-in"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        </a>
                      </div>
                    )}

                    {/* proof_url array */}
                    {(() => {
                      let urls = [];
                      try {
                        if (typeof rawProofs === "string" && rawProofs.trim().startsWith("[")) {
                          urls = JSON.parse(rawProofs);
                        } else {
                          urls = Array.isArray(rawProofs) ? rawProofs : (rawProofs ? [rawProofs] : []);
                        }
                      } catch (e) {
                        urls = Array.isArray(rawProofs) ? rawProofs : (rawProofs ? [rawProofs] : []);
                      }
                      
                      return urls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {urls.map((url, i) => (
                            <a key={i} href={makeAbsoluteUrl(url)} target="_blank" rel="noopener noreferrer">
                              <img
                                src={makeAbsoluteUrl(url)}
                                alt={`Proof ${i + 1}`}
                                className="w-full aspect-video rounded-xl object-cover border hover:opacity-90 transition cursor-zoom-in"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </a>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Legacy payment_proof */}
                    {legacyProof && !bankImage && (
                      <a href={makeAbsoluteUrl(legacyProof)} target="_blank" rel="noopener noreferrer">
                        <img
                          src={makeAbsoluteUrl(legacyProof)}
                          alt="Payment proof"
                          className="w-full max-h-72 rounded-3xl object-contain border hover:opacity-90 transition cursor-zoom-in"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </a>
                    )}
                  </div>
                );
              })()}

              {selectedOrder.note && (
                <div className="rounded-2xl border bg-destructive/5 p-3 text-sm text-destructive">
                  📝 {selectedOrder.note}
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <DialogClose className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition">
                {t("common.close")}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9\s\-()]{7,20}$/;

function EditProfileForm() {
  const { user, setUser } = useApp();
  const { t } = useI18n();
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = t("auth.vRequired");
    if (!form.email.trim()) errs.email = t("auth.vRequired");
    else if (!EMAIL_RE.test(form.email)) errs.email = t("auth.vEmail");
    if (!form.phone.trim()) errs.phone = t("auth.vRequired");
    else if (!PHONE_RE.test(form.phone)) errs.phone = t("auth.vPhone");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const formData = new FormData();
      formData.append('full_name', form.name.trim());
      formData.append('email', form.email.trim());
      formData.append('phone', form.phone.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Backend route /api/v1/[role]/profile expects PUT or POST with _method=PUT
      formData.append('_method', 'PUT');

      const path = user.role === 'admin' ? '/admin/profile' : user.role === 'seller' ? '/seller/profile' : '/customer/profile';
      const res = await api.postForm(path, formData);
      const imageUrl = makeAbsoluteUrl(res.data?.image || user.image);
      setUser({ ...user, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), image: imageUrl });
      toast.success(t("profile.updated"));
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2 className="font-bold text-lg mb-4">{t("profile.editProfile")}</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <span className="text-xs font-bold text-muted-foreground block mb-2">{t("profile.editProfile") === "تعديل الملف الشخصي" ? "صورة الحساب" : "Profile Image"}</span>
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-full overflow-hidden border bg-accent flex-shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`; }} />
              ) : (
                <div className="w-full h-full grid place-items-center text-lg font-bold bg-primary/10 text-primary">
                  {user.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <label className="cursor-pointer h-11 px-5 rounded-xl border font-bold text-sm bg-primary text-primary-foreground hover:bg-primary-dark transition inline-flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              {t("profile.uploadPhoto")}
            </label>
          </div>
        </div>
        <FieldI label={t("auth.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
        <FieldI label={t("auth.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
        <FieldI label={t("auth.phone")} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={errors.phone} />
        <button type="submit" className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition">{t("profile.save")}</button>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const { t } = useI18n();
  const { logout } = useApp();
  const navigate = useNavigate();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (next.length < 8) return setErr(t("auth.vPassLen"));
    if (!/[A-Z]/.test(next)) return setErr(t("auth.vPassUpper"));
    if (!/[0-9]/.test(next)) return setErr(t("auth.vPassNum"));
    if (!/[^A-Za-z0-9]/.test(next)) return setErr(t("auth.vPassSpec"));
    if (next !== confirmNew) return setErr(t("auth.passwordsMismatch"));
    try {
      await authService.changePassword(cur, next);
      toast.success(t("profile.passwordUpdated") + " — سيتم تسجيل خروجك الآن");
      // Auto-logout after password change for security
      setTimeout(async () => {
        await logout();
        navigate({ to: "/login" });
      }, 1500);
    } catch (e2) {
      setErr(e2.message || "Failed to update password");
    }
  };
  return (
    <form onSubmit={submit}>
      <h2 className="font-bold text-lg mb-4">{t("profile.changePassword")}</h2>
      <div className="space-y-4 max-w-md">
        <PasswordInput label={t("profile.currentPassword")} value={cur} onChange={setCur} />
        <PasswordInput label={t("auth.newPassword")} value={next} onChange={setNext} error={err} />
        <PasswordInput label={t("auth.confirmPassword") || "Confirm Password"} value={confirmNew} onChange={setConfirmNew} />
        <button type="submit" className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition">{t("profile.save")}</button>
      </div>
    </form>
  );
}

function FieldI({ label, type = "text", value, onChange, error }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? "border-destructive focus:ring-destructive/30" : ""}`} />
      {error && <span className="block mt-1 text-xs font-semibold text-destructive">{error}</span>}
    </label>
  );
}

function TabBtn({ icon: Icon, label, active, onClick }) {
  return <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}><Icon className="size-4" />{label}</button>;
}
