import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Calculator, Cpu, Briefcase, GraduationCap, Palette, Gamepad2, Zap, Users, ShoppingBag, Award, Filter, Wallet, MousePointer2, Layers, Code2, Brain } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/common/ProductCard";
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES } from "@/data/products";
import { MOCK_USERS, MOCK_ORDERS } from "@/data/users";
import { productService } from "@/services/productService";
import { useI18n } from "@/lib/i18n";
import hero1 from "@/assets/hero-1.webp";
import hero2 from "@/assets/hero-2.webp";
import hero3 from "@/assets/hero-3.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LapGenius — Smart Laptop Marketplace" },
      { name: "description", content: "Discover the perfect laptop with AI recommendations, fair-price estimation, and curated picks from top brands." },
      { property: "og:title", content: "LapGenius — Smart Laptop Marketplace" },
      { property: "og:description", content: "AI-powered laptop marketplace. Compare, recommend, estimate fair prices." },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: hero1, fetchPriority: "high" },
    ],
  }),
  component: HomePage,
});

const SLIDES = [
  { img: hero1, eyebrow: "Gaming Powerhouses", title: "Unleash performance.", sub: "RTX 4090 laptops with 240Hz displays — game like a pro." },
  { img: hero2, eyebrow: "Business Essentials", title: "Built for productivity.", sub: "All-day battery, MIL-SPEC durability, premium build." },
  { img: hero3, eyebrow: "Creator Tools", title: "OLED. Color-accurate.", sub: "Built for designers, video editors, and creators." }
];

const CAT_ICONS = { Gaming: Gamepad2, Business: Briefcase, Programming: Cpu, Design: Palette, Lightweight: Zap, Study: GraduationCap, General: ShoppingBag };

const WHY_ITEMS = [
  { icon: Filter, key: "why1" },
  { icon: Wallet, key: "why2" },
  { icon: MousePointer2, key: "why3" },
  { icon: Layers, key: "why4" },
  { icon: Code2, key: "why5" },
  { icon: Brain, key: "why6" }
];

function HomePage() {
  const { t } = useI18n();
  const [slide, setSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState(FALLBACK_PRODUCTS.slice(0, 8));

  useEffect(() => { const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000); return () => clearInterval(id); }, []);

  const refreshFeaturedProducts = async () => {
    try {
      const data = await productService.all();
      if (data.length > 0) setFeaturedProducts(data.slice(0, 8));
    } catch {}
  };

  // Fetch real products from API for featured section
  useEffect(() => {
    refreshFeaturedProducts();
  }, []);

  useEffect(() => {
    const refresh = () => {
      refreshFeaturedProducts();
    };
    window.addEventListener("products:updated", refresh);
    return () => window.removeEventListener("products:updated", refresh);
  }, []);

  const stats = [
    { icon: Users, n: `${MOCK_USERS.filter(u => u.role === "customer").length * 2500}+`, l: t("home.statCustomers") },
    { icon: ShoppingBag, n: `${MOCK_ORDERS.length * 1300}+`, l: t("home.statOrders") },
    { icon: Award, n: `${MOCK_USERS.filter(u => u.role === "seller").length * 250}+`, l: t("home.statSellers") },
    { icon: Cpu, n: `${featuredProducts.length}+`, l: t("home.statProducts") }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }} className="absolute inset-0 will-change-[opacity]">
              <img src={SLIDES[slide].img} alt="" width="1600" height="900"
                loading={slide === 0 ? "eager" : "lazy"}
                fetchPriority={slide === 0 ? "high" : "low"}
                decoding="async"
                className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(1,87,155,0.85) 0%, rgba(1,87,155,0.4) 50%, rgba(3,169,244,0.15) 100%)" }} />
            </motion.div>
          </AnimatePresence>
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center max-w-3xl text-white">
            <motion.span key={`e-${slide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong w-fit text-sm font-bold text-white border-white/20">
              <Sparkles className="size-4" /> {SLIDES[slide].eyebrow}
            </motion.span>
            <motion.h1 key={`t-${slide}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-6 text-5xl md:text-7xl font-black leading-snug">
              {t("home.heroTitle1")}<br /><span className="text-white">{t("home.heroTitle2")}</span>
            </motion.h1>
            <motion.p key={`s-${slide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-white/90 max-w-xl">{t("home.heroSub")}</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 h-12 px-7 rounded-2xl bg-white text-primary-dark font-bold hover:scale-105 transition shadow-elev">
                {t("home.shopNow")} <ArrowRight className="size-4" />
              </Link>
              <Link to="/ai-recommend" className="inline-flex items-center gap-2 h-12 px-7 rounded-2xl glass-strong text-white font-bold border-white/30 hover:bg-white/20 transition">
                <Sparkles className="size-4" /> {t("home.tryAi")}
              </Link>
            </motion.div>
          </div>
          <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex gap-2 z-10">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-10 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-20 container mx-auto px-4">
          <SectionHead title={t("home.browseBy")} />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-10">
            {CATEGORIES.map((cat, i) => {
              const Icon = CAT_ICONS[cat];
              return (
                <motion.div key={cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link to="/shop" search={{ category: cat }} className="group block">
                    <div className="aspect-square rounded-3xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all card-hover grid place-items-center text-center p-4">
                      <div>
                        <Icon className="size-8 mx-auto mb-2 group-hover:scale-110 transition" />
                        <div className="font-bold text-sm">{cat}</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FEATURED */}
        <section className="py-20 bg-section">
          <div className="container mx-auto px-4">
            <SectionHead title={t("home.featured")} sub={t("home.featuredSub")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {featuredProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
            <div className="text-center mt-10">
              <Link to="/shop" className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition">
                {t("home.shopNow")} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* AI BANNERS */}
        <section className="py-20 container mx-auto px-4 grid md:grid-cols-2 gap-6">
          <AIBanner to="/ai-recommend" icon={Sparkles} title={t("home.aiRecTitle")} sub={t("home.aiRecSub")} cta={t("home.tryNow")} />
          <AIBanner to="/ai-estimate" icon={Calculator} title={t("home.aiEstTitle")} sub={t("home.aiEstSub")} cta={t("home.estimate")} alt />
        </section>

        {/* STATS */}
        <section className="py-20 gradient-hero text-white">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <s.icon className="size-8 mx-auto mb-3 opacity-90" />
                <div className="text-4xl md:text-5xl font-black">{s.n}</div>
                <div className="text-sm opacity-90 mt-1 font-semibold">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="py-20 container mx-auto px-4">
          <SectionHead title={t("home.whyTitle")} sub={t("home.whySub")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {WHY_ITEMS.map((item, i) => (
              <motion.div key={item.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-7 rounded-3xl border bg-card shadow-soft card-hover">
                <div className="size-12 rounded-2xl grid place-items-center mb-4"
                  style={{ background: "var(--gradient-card)" }}>
                  <item.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-extrabold text-lg mb-2">{t(`home.${item.key}Title`)}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{t(`home.${item.key}`)}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-3xl md:text-4xl font-black tracking-tight">{title}</motion.h2>
      {sub && <p className="mt-3 text-muted-foreground text-base md:text-lg">{sub}</p>}
    </div>
  );
}

function AIBanner({ to, icon: Icon, title, sub, cta, alt }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-elev ${alt ? "bg-primary-dark text-white" : "text-white"}`}
      style={alt ? {} : { background: "var(--gradient-hero)" }}>
      <Icon className="size-10 mb-4 opacity-90" />
      <h3 className="text-2xl md:text-3xl font-black mb-2">{title}</h3>
      <p className="opacity-90 mb-5 max-w-md leading-relaxed">{sub}</p>
      <Link to={to} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-primary-dark font-bold hover:scale-105 transition">
        {cta} <ArrowRight className="size-4" />
      </Link>
    </motion.div>
  );
}
