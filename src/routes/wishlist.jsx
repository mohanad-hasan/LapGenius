import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/common/ProductCard";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";
import { productService } from "@/services/productService";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useApp();
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.all();
      setProducts(data);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const refresh = () => {
      loadProducts();
    };
    window.addEventListener("products:updated", refresh);
    return () => window.removeEventListener("products:updated", refresh);
  }, []);

  const items = products.filter((p) => wishlist.map(String).includes(String(p.id)));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-4xl font-black mb-8">{t("wishlist.title")}</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <Heart className="size-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-6">{t("wishlist.empty")}</p>
            <Link to="/shop" className="inline-flex h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold items-center">{t("wishlist.browse")}</Link>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>{items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</AnimatePresence>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
