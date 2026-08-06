import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import PasswordInput from "@/components/common/PasswordInput";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — LapGenius" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try { const u = await login(email, password); navigate({ to: u.role === "admin" ? "/admin" : u.role === "seller" ? "/seller" : "/" }); }
    catch (er) { setErr(er.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 grid place-items-center p-12 text-white text-center">
          <div>
            <Logo size={56} className="justify-center mb-6 [&>span]:text-white" />
            <h2 className="text-4xl font-black mb-3">The smarter way to laptop shopping.</h2>
            <p className="opacity-85 max-w-md mx-auto">AI recommendations. Fair-price estimates. Curated top brands.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-10">
        <Link to="/"><Logo /></Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 grid place-items-center">
          <form onSubmit={submit} className="w-full max-w-md space-y-4">
            <div className="mb-2">
              <h1 className="text-3xl font-black mb-1">{t("auth.login")}</h1>
              <p className="text-muted-foreground">{t("auth.loginSub")}</p>
            </div>
            <Field label={t("auth.email")} type="email" value={email} onChange={setEmail} required />
            <PasswordInput label={t("auth.password")} value={password} onChange={setPassword} required />
            {err && <p className="text-sm text-destructive font-semibold">{err}</p>}
            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition disabled:opacity-60">
              {loading ? t("common.loading") : t("auth.signIn")}
            </button>
            <div className="flex justify-between text-sm">
              <Link to="/forgot-password" className="text-primary font-semibold">{t("auth.forgot")}</Link>
              <span className="text-muted-foreground">{t("auth.noAccount")} <Link to="/register" className="text-primary font-semibold">{t("auth.signUp")}</Link></span>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-2">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition" />
    </label>
  );
}
