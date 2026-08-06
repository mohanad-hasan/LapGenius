import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import PasswordInput from "@/components/common/PasswordInput";
import { authService } from "@/services/authService";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — LapGenius" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Extract token and email from URL manually if needed, or from search params
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");
    const pathParts = window.location.pathname.split('/');
    // Either /reset-password?token=XXX&email=YYY or /reset-password/XXX?email=YYY
    const tokenParam = searchParams.get("token") || (pathParts.length > 2 ? pathParts[2] : "");

    if (!emailParam || !tokenParam) {
      setErr("Invalid link. Missing token or email.");
      setChecking(false);
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);

    // Verify token
    authService.verifyCode(emailParam, tokenParam).then(() => {
      setIsValid(true);
    }).catch((e) => {
      setErr(e.message || "Invalid or expired reset link.");
    }).finally(() => {
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErr(""); 
    setLoading(true);
    try {
      if (pw !== pwConfirm) throw new Error(t("auth.passwordsMismatch") || "Passwords do not match");
      await authService.resetPassword(email, pw, token);
      navigate({ to: "/login" });
    } catch (er) { 
      setErr(er.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen p-6 sm:p-10 flex flex-col items-center justify-center">
      <div className="mb-8"><Link to="/"><Logo /></Link></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.newPassword") || "Set New Password"}</h1>
        
        {checking ? (
          <div className="text-center text-muted-foreground py-8">Checking link...</div>
        ) : !isValid ? (
          <div className="text-center">
            <p className="text-destructive font-medium mb-4">{err}</p>
            <Link to="/forgot-password" className="text-primary hover:underline">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordInput label={t("auth.newPassword") || "New Password"} value={pw} onChange={setPw} required />
            <PasswordInput label={t("auth.confirmPassword") || "Confirm Password"} value={pwConfirm} onChange={setPwConfirm} required />
            
            {err && <p className="text-sm text-destructive font-medium">{err}</p>}
            
            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition disabled:opacity-60 mt-4">
              {loading ? t("common.loading") || "Loading..." : t("auth.reset") || "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
