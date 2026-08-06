import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import PasswordInput from "@/components/common/PasswordInput";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account — LapGenius" }] }),
  component: RegisterPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9\s\-()]{7,20}$/;

function validate(form, t) {
  const e = {};
  if (!form.name.trim()) e.name = t("auth.vRequired");
  if (!form.email.trim()) e.email = t("auth.vRequired");
  else if (!EMAIL_RE.test(form.email)) e.email = t("auth.vEmail");
  if (!form.phone.trim()) e.phone = t("auth.vRequired");
  else if (!PHONE_RE.test(form.phone)) e.phone = t("auth.vPhone");
  if (!form.password) e.password = t("auth.vRequired");
  else if (form.password.length < 8) e.password = t("auth.vPassLen");
  else if (!/[A-Z]/.test(form.password)) e.password = t("auth.vPassUpper");
  else if (!/[0-9]/.test(form.password)) e.password = t("auth.vPassNum");
  else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = t("auth.vPassSpec");
  return e;
}

function RegisterPage() {
  const { t } = useI18n();
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", role: "customer" });
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (errors[k]) setErrors(validate(next, t));
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerErr("");
    const errs = validate(form, t);
    // check password confirmation match
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = t("auth.passwordsMismatch");
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      // TODO: When using Laravel backend, call POST /api/register here and handle server validation errors.
      // Example: const res = await fetch('/api/register', { method: 'POST', body: JSON.stringify(form) });
      // If res.ok then navigate; else show server errors from response.
      await register(form);
      toast.success(t("auth.successCreated"));
      navigate({ to: "/" });
    } catch (er) {
      setServerErr(er.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 sm:p-10" style={{ background: "var(--gradient-mesh), var(--color-background)" }}>
      <Link to="/"><Logo /></Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-10 p-7 sm:p-8 rounded-3xl bg-card border shadow-elev">
        <h1 className="text-3xl font-black mb-2">{t("auth.register")}</h1>
        <p className="text-muted-foreground mb-6">{t("auth.registerSub")}</p>
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label={t("auth.name")} value={form.name} onChange={(v) => update("name", v)} error={errors.name} />
          <Field label={t("auth.email")} type="email" value={form.email} onChange={(v) => update("email", v)} error={errors.email} />
          <Field label={t("auth.phone")} type="tel" value={form.phone} onChange={(v) => update("phone", v)} error={errors.phone} placeholder="0999999999" />
          <PasswordInput label={t("auth.password")} value={form.password} onChange={(v) => update("password", v)} error={errors.password} />
          <PasswordInput label={t("auth.confirmPassword") || "Confirm Password"} value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} error={errors.confirmPassword} />
          <div>
            <span className="text-xs font-bold text-muted-foreground block mb-1">{t("auth.role")}</span>
            <div className="grid grid-cols-2 gap-2">
              {["customer", "seller"].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                  className={`h-11 rounded-xl font-semibold capitalize transition ${form.role === r ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}>{t(`auth.${r}`)}</button>
              ))}
            </div>
          </div>
          {serverErr && <p className="text-sm text-destructive font-semibold">{serverErr}</p>}
          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition disabled:opacity-60">
            {loading ? t("common.loading") : t("auth.signUp")}
          </button>
          <p className="text-sm text-center text-muted-foreground">{t("auth.haveAccount")} <Link to="/login" className="text-primary font-semibold">{t("auth.signIn")}</Link></p>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, error, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-2">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? "border-destructive focus:ring-destructive/30" : ""}`} />
      {error && <span className="block mt-1 text-xs font-semibold text-destructive">{error}</span>}
    </label>
  );
}
