import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Phone, Facebook } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";
import { PolicyModal } from "@/components/common/PolicyModal";

export function Footer() {
  const { t } = useI18n();
  const { user } = useApp();
  const [modal, setModal] = useState(null);
  const isCustomer = !user || user.role === "customer";

  return (
    <footer className="mt-24 border-t bg-section">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">{t("footer.tag")}</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("footer.links")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary">{t("nav.shop")}</Link></li>
            <li><Link to="/ai-recommend" className="hover:text-primary">{t("nav.recommend")}</Link></li>
            <li><Link to="/ai-estimate" className="hover:text-primary">{t("nav.estimate")}</Link></li>
            {isCustomer && <li><Link to="/wishlist" className="hover:text-primary">{t("nav.wishlist")}</Link></li>}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("footer.contact")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="size-4" /><a href="tel:0998735242" className="hover:text-primary">0998735242</a></li>
            <li className="flex items-center gap-2"><Mail className="size-4" /><a href="mailto:mohanadhasan226@gmail.com" className="hover:text-primary break-all">mohanadhasan226@gmail.com</a></li>
            <li className="flex items-center gap-2"><Facebook className="size-4" /><a href="https://www.facebook.com/share/1EEZdFHiqJ/" target="_blank" rel="noreferrer" className="hover:text-primary">Facebook</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("footer.legal")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => setModal("privacy")} className="hover:text-primary">{t("footer.privacy")}</button></li>
            <li><button onClick={() => setModal("terms")} className="hover:text-primary">{t("footer.terms")}</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LapGenius. {t("footer.rights")}
      </div>
      <PolicyModal kind={modal} onClose={() => setModal(null)} />
    </footer>
  );
}
