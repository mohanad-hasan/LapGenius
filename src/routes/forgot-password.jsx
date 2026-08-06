import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { authService } from "@/services/authService";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — LapGenius" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErr(""); 
    setLoading(true);
    try {
      await authService.forgotPassword(email); 
      setSuccess(true);
    } catch (er) { 
      setErr(er.message || (lang === "ar" ? "حدث خطأ ما. يرجى المحاولة لاحقاً." : "Something went wrong. Please try again.")); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen p-6 sm:p-10 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="mb-8 text-center sm:text-left"><Link to="/"><Logo /></Link></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-card p-8 rounded-2xl border shadow-sm"
        >
          <h1 className="text-3xl font-black mb-4 text-center">
            {t("auth.resetTitle")}
          </h1>
          
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                <p className="text-muted-foreground text-center">
                  {lang === "ar" 
                    ? "أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور." 
                    : "Enter your email to receive a password reset link."}
                </p>
                
                <Field 
                  label={t("auth.email")} 
                  type="email" 
                  value={email} 
                  onChange={setEmail} 
                  required 
                />
                
                {err && <p className="text-sm text-destructive font-semibold">{err}</p>}
                
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {loading ? t("common.loading") : (lang === "ar" ? "إرسال رابط إعادة التعيين" : "Send Reset Link")}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <p className="text-muted-foreground">
                  {lang === "ar" 
                    ? "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من علبة الوارد (أو البريد المهمل)." 
                    : "We have sent a password reset link to your email. Please check your inbox (or spam folder)."}
                </p>
                <Link 
                  to="/login"
                  className="block w-full h-12 rounded-xl border border-input bg-background font-bold flex items-center justify-center hover:bg-accent transition"
                >
                  {lang === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-1">{label}</span>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required}
        className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition" 
      />
    </label>
  );
}
