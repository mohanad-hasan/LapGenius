import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const COPY = {
  privacy: {
    en: {
      title: "Privacy Policy",
      paragraphs: [
        "LapGenius respects your privacy. We collect only the data needed to provide our marketplace services — account information, order history, and usage analytics to improve recommendations.",
        "We never sell your data to third parties. All sensitive information is encrypted in transit and at rest.",
        "You may request deletion of your account at any time via support@lapgenius.com."
      ]
    },
    ar: {
      title: "سياسة الخصوصية",
      paragraphs: [
        "نحترم في LapGenius خصوصيتك. نجمع فقط البيانات اللازمة لتقديم خدماتنا — معلومات الحساب، سجل الطلبات، وتحليلات الاستخدام لتحسين الترشيحات.",
        "نحن لا نبيع بياناتك لأي طرف ثالث. جميع المعلومات الحساسة مشفّرة أثناء النقل والتخزين.",
        "يمكنك طلب حذف حسابك في أي وقت عبر support@lapgenius.com."
      ]
    }
  },
  terms: {
    en: {
      title: "Terms of Use",
      paragraphs: [
        "By using LapGenius, you agree to use the platform lawfully and respect other users.",
        "Listings must be accurate and complete. AI price estimates are guidance, not guarantees.",
        "We reserve the right to suspend accounts violating these terms."
      ]
    },
    ar: {
      title: "شروط الاستخدام",
      paragraphs: [
        "باستخدام LapGenius، فإنك توافق على استخدام المنصة بشكل قانوني واحترام المستخدمين الآخرين.",
        "يجب أن تكون القوائم دقيقة وكاملة. تقديرات الأسعار الذكية هي إرشاد وليست ضمانات.",
        "نحتفظ بحق تعليق الحسابات المخالفة لهذه الشروط."
      ]
    }
  }
};

export function PolicyModal({ kind, onClose }) {
  const { lang, t } = useI18n();
  return (
    <AnimatePresence>
      {kind && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl shadow-elev border bg-card max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between gap-4 p-6 sm:p-8 pb-4 border-b">
              <h2 className="text-2xl sm:text-3xl font-extrabold gradient-text leading-tight">{COPY[kind][lang].title}</h2>
              <button onClick={onClose} aria-label={t("close")}
                className="shrink-0 size-9 grid place-items-center rounded-full hover:bg-accent transition">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 pt-5 overflow-y-auto space-y-4">
              {COPY[kind][lang].paragraphs.map((p, i) => (
                <p key={i} className="text-base text-foreground/85 leading-[1.85]">{p}</p>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
