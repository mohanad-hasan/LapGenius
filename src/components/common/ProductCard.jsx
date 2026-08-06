import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Check, X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { evaluatePrice, getPriceEvaluationClasses, PRICE_EVALUATION_STATUS } from "@/services/priceEvaluationService";
import { priceEstimatorService } from "@/services/priceEstimatorService";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";

const CONDITION_STYLES = {
  New: "bg-success/15 text-success border-success/30",
  Used: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  Refurbished: "bg-primary/15 text-primary border-primary/30"
};

// Cache AI prices so we don't re-fetch on re-renders
const aiPriceCache = new Map();

export function ProductCard({ product, index = 0 }) {
  const { toggleWishlist, inWishlist, addToCart, user } = useApp();
  const { t } = useI18n();
  const liked = inWishlist(product.id);
  const isCustomer = !user || user.role === "customer";
  const img = product.colors[0].images[0];

  const [liveAiPrice, setLiveAiPrice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const cardRef = useRef(null);
  const fetchedRef = useRef(false);

  // Fetch AI price when card enters viewport (IntersectionObserver)
  useEffect(() => {
    if (!cardRef.current || fetchedRef.current) return;

    // Check cache first
    if (aiPriceCache.has(product.id)) {
      setLiveAiPrice(aiPriceCache.get(product.id));
      fetchedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchedRef.current) {
          fetchedRef.current = true;
          setAiLoading(true);
          priceEstimatorService.estimate({
            brand: product.brand || "",
            cpu: product.cpu || "",
            gpu: product.gpu || "",
            ram: product.ram || "",
            storage: product.storage || "",
            condition: product.condition || "New",
          }).then((r) => {
            if (r?.predicted_price) {
              const price = Number(r.predicted_price);
              aiPriceCache.set(product.id, price);
              setLiveAiPrice(price);
            }
          }).catch(() => {
            // silently fallback
          }).finally(() => setAiLoading(false));
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [product.id]);

  // Determine which AI price to show
  const displayAiPrice = liveAiPrice ?? product.aiPrice;
  const evaluation = evaluatePrice(product.price, displayAiPrice);
  const evaluationClasses = getPriceEvaluationClasses(evaluation.status);
  const statusLabel = t(`priceEvaluation.status.${evaluation.status}`);
  const reasonLabel = t(`priceEvaluation.reason.${evaluation.status}`);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group relative rounded-3xl bg-card border shadow-soft overflow-hidden card-hover flex flex-col"
    >
      <div className="absolute top-3 end-3 z-10 flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${CONDITION_STYLES[product.condition] || ""}`}>
          {product.condition}
        </span>
        {product.discountPercent > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-destructive text-destructive-foreground">
            -{product.discountPercent}%
          </span>
        )}
        {isCustomer && (
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            aria-label="Wishlist"
            className="size-9 rounded-full glass-strong grid place-items-center hover:scale-110 transition"
          >
            <Heart className={`size-4 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
        )}
      </div>
      <Link to="/product/$id" params={{ id: String(product.id) }} className="flex flex-col flex-1">
        <div className="aspect-[4/3] overflow-hidden bg-section">
          <img src={img} alt={product.name} loading="lazy" width={800} height={600}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2 py-1 rounded-full bg-accent text-accent-foreground font-semibold">{product.category}</span>
            <span className="text-muted-foreground font-semibold">{product.brand}</span>
          </div>
          <h3 className="font-bold text-base leading-tight line-clamp-2">{product.name}</h3>

          {/* Price Section */}
          <div className="space-y-2 pt-1">
            {/* Seller Price */}
            <div className="rounded-xl border bg-background/40 p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-0.5">{t("product.sellerPrice")}</div>
              {product.discountPercent > 0 ? (
                <div className="flex items-end gap-1.5">
                  <span className="text-base font-extrabold text-destructive leading-tight">${product.discountedPrice.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground line-through pb-0.5">${product.price.toLocaleString()}</span>
                </div>
              ) : (
                <div className="text-lg font-extrabold leading-tight">${product.price.toLocaleString()}</div>
              )}
            </div>

            {/* AI Suggested Price */}
            <div className={`rounded-xl border p-2.5 ${evaluationClasses.bg} ${evaluationClasses.border}`}>
              <div className={`text-[10px] uppercase tracking-wide font-bold mb-0.5 flex items-center justify-between ${evaluationClasses.text}`}>
                <span>{t("product.aiPrice")}</span>
                {aiLoading && <Loader2 className="size-3 animate-spin opacity-70" />}
                {liveAiPrice && !aiLoading && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-bold ${evaluationClasses.border}`}>AI Live</span>
                )}
              </div>
              {aiLoading && !liveAiPrice ? (
                <div className={`text-sm font-semibold ${evaluationClasses.text} opacity-60`}>Estimating…</div>
              ) : (
                <div className={`text-lg font-extrabold leading-tight ${evaluationClasses.text}`}>
                  ${displayAiPrice?.toLocaleString() ?? "—"}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1 mt-auto">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold inline-flex items-center gap-1 ${evaluationClasses.text}`}>
                {evaluation.status !== PRICE_EVALUATION_STATUS.OVERPRICED ? <Check className="size-3" /> : <X className="size-3" />}
                {statusLabel}
              </span>
            </div>
            <p className={`text-[11px] leading-5 ${evaluationClasses.text} opacity-90`}>{reasonLabel}</p>
            {product.is_active === false ? (
              <div className="h-10 rounded-full bg-destructive/10 text-destructive text-xs font-bold grid place-items-center">
                ⛔ غير متاح
              </div>
            ) : isCustomer ? (
              <button
                onClick={(e) => { e.preventDefault(); addToCart(product, 1); }}
                aria-label="Add to cart"
                className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center hover:bg-primary-dark transition shadow-soft"
              >
                <ShoppingCart className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
