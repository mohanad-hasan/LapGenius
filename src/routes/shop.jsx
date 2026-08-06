import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/common/ProductCard";
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES, CONDITIONS, BRANDS } from "@/data/products";
import { productService } from "@/services/productService";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Laptops — LapGenius" },
      { name: "description", content: "Browse and filter our full catalog of new, used, and refurbished laptops from ASUS, Apple, Dell, HP, Lenovo, MSI, and Acer." },
      { property: "og:title", content: "Shop Laptops — LapGenius" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  validateSearch: (s) => ({ category: typeof s.category === "string" ? s.category : "all" }),
  component: ShopPage,
});

const PER_PAGE = 8;

function ShopPage() {
  const { t, lang } = useI18n();
  const { category: initCat } = Route.useSearch();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initCat || "all");
  const [condition, setCondition] = useState("all");
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real products from API, fallback to mock data
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.all();
      setProducts(data.length > 0 ? data : FALLBACK_PRODUCTS);
    } catch {
      setProducts(FALLBACK_PRODUCTS);
    } finally {
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

  const filtered = useMemo(() => {
    let r = [...products];
    if (search) { const q = search.toLowerCase(); r = r.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)); }
    if (category !== "all") r = r.filter((p) => p.category === category);
    if (condition !== "all") r = r.filter((p) => p.condition?.toLowerCase() === condition.toLowerCase());
    if (brand !== "all") r = r.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    if (sort === "price-asc") r.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r.sort((a, b) => b.price - a.price);
    if (sort === "name") r.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "most-sold") r.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    if (sort === "popular") r.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0));
    return r;
  }, [search, category, condition, brand, sort, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clear = () => { setSearch(""); setCategory("all"); setCondition("all"); setBrand("all"); setSort("featured"); setPage(1); };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black mb-8">{t("shop.title")}</motion.h1>

        {/* Search + Sort — relative + z-30 keeps native select dropdown above product grid */}
        <div className="relative z-30 flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("shop.search")}
              className="w-full h-12 ps-11 pe-4 rounded-2xl border bg-card focus:outline-none focus:ring-2 focus:ring-ring transition" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="h-12 px-4 rounded-2xl border bg-card text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring relative z-30">
            <option value="featured">{t("shop.featured")}</option>
            <option value="price-asc">{t("shop.priceLow")}</option>
            <option value="price-desc">{t("shop.priceHigh")}</option>
            <option value="name">{t("shop.nameAZ")}</option>
            <option value="most-sold">{lang === "ar" ? "الأكثر مبيعاً" : "Most Sold"}</option>
            <option value="popular">{lang === "ar" ? "اللابتوبات الشائعة" : "Popular Laptops"}</option>
          </select>
          <button onClick={() => setOpen((o) => !o)} className="md:hidden h-12 px-4 rounded-2xl border bg-card font-semibold inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4" />{t("shop.filters")}
          </button>
        </div>

        <div className="relative grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className={`${open ? "block" : "hidden"} lg:block space-y-5 h-fit p-5 rounded-3xl border bg-card shadow-soft lg:sticky lg:top-20 z-10`}>
            <FilterGroup label={t("shop.category")} value={category} setValue={(v) => { setCategory(v); setPage(1); }} options={["all", ...CATEGORIES]} type="category" t={t} />
            <FilterGroup label={t("shop.brand")} value={brand} setValue={(v) => { setBrand(v); setPage(1); }} options={["all", ...BRANDS]} type="brand" t={t} />
            <FilterGroup label={t("shop.condition")} value={condition} setValue={(v) => { setCondition(v); setPage(1); }} options={["all", ...CONDITIONS]} type="condition" t={t} />
            <button onClick={clear} className="w-full h-10 rounded-xl border font-semibold text-sm hover:bg-accent inline-flex items-center gap-2 justify-center">
              <X className="size-4" />{t("shop.clear")}
            </button>
          </aside>

          <div className="relative z-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed p-16 text-center text-muted-foreground">{t("shop.noResults")}</div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </motion.div>
            )}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="h-10 px-4 rounded-xl border font-semibold disabled:opacity-40 hover:bg-accent">{t("shop.prev")}</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`size-10 rounded-xl font-bold ${page === i + 1 ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}>{i + 1}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="h-10 px-4 rounded-xl border font-semibold disabled:opacity-40 hover:bg-accent">{t("shop.next")}</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FilterGroup({ label, value, setValue, options, type, t }) {
  const getLabel = (opt) => {
    if (opt === "all") return t("shop.all");
    if (type === "category") return t(`shop.categories.${opt}`);
    if (type === "condition") return t(`shop.conditions.${opt}`);
    return opt;
  };
  return (
    <div>
      <div className="font-bold text-sm mb-2">{label}</div>
      <div className="space-y-1">
        {options.map((opt) => (
          <button key={opt} onClick={() => setValue(opt)}
            className={`w-full text-start px-3 py-2 rounded-lg text-sm transition ${value === opt ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"}`}>
            {getLabel(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}
