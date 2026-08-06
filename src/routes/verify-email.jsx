import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify Email — LapGenius" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("id");
      const hash = searchParams.get("hash");

      if (!id || !hash) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${id}/${hash}`);
        setStatus("success");
        setMessage(res?.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Failed to verify email. The link may have expired.");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-muted/30">
      <div className="mb-8"><Link to="/"><Logo /></Link></div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-card p-10 rounded-3xl border shadow-sm text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h1 className="text-xl font-bold">Verifying Email...</h1>
            <p className="text-muted-foreground mt-2">Please wait a moment while we verify your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold">Email Verified!</h1>
            <p className="text-muted-foreground mt-2 mb-6">{message}</p>
            <Link to="/login" className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
              Continue to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground mt-2 mb-6">{message}</p>
            <Link to="/login" className="px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/90 transition-colors">
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
