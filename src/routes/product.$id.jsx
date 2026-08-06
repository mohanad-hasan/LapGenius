import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Heart, ShoppingCart, Check, X, ChevronLeft, Cpu, MemoryStick, HardDrive, Monitor, BatteryCharging, MonitorSmartphone, Tag, Layers, Boxes, Sparkles, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/data/products";
import { productService } from "@/services/productService";
import { evaluatePrice, getPriceEvaluationClasses, PRICE_EVALUATION_STATUS } from "@/services/priceEvaluationService";
import { priceEstimatorService } from "@/services/priceEstimatorService";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product — LapGenius" },
    ],
  }),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Product not found</h2><Link to="/shop" className="text-primary">Back to shop</Link></div></div>
  ),
  notFoundComponent: () => <div className="min-h-screen grid place-items-center">Not found</div>,
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist, user } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [liveAiPrice, setLiveAiPrice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.get(id);
      if (data && data.id) {
        setProduct(data);
      } else {
        const fallback = FALLBACK_PRODUCTS.find((p) => p.id === Number(id));
        setProduct(fallback || null);
      }
    } catch {
      const fallback = FALLBACK_PRODUCTS.find((p) => p.id === Number(id));
      setProduct(fallback || null);
    } finally {
      setLoading(false);
    }

    try {
      const nextReviews = await productService.reviews(id);
      setReviews(nextReviews || []);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    const refresh = () => {
      loadProduct();
    };
    window.addEventListener("products:updated", refresh);
    return () => window.removeEventListener("products:updated", refresh);
  }, [id]);

  // Fetch live AI price after product loads
  useEffect(() => {
    if (!product) return;
    setAiLoading(true);
    priceEstimatorService.estimate({
      brand: product.brand || "",
      cpu: product.cpu || "",
      gpu: product.gpu || "",
      ram: product.ram || "",
      storage: product.storage || "",
      condition: product.condition || "New",
    }).then((r) => {
      if (r?.predicted_price) setLiveAiPrice(Number(r.predicted_price));
    }).catch(() => {
      // silently fallback to stored aiPrice
    }).finally(() => setAiLoading(false));
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 grid place-items-center">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 grid place-items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Product not found</h2>
            <Link to="/shop" className="text-primary">Back to shop</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const color = product.colors[colorIdx];
  const liked = inWishlist(product.id);
  // Use live AI price if available, else fall back to stored aiPrice
  const displayAiPrice = liveAiPrice ?? product.aiPrice ?? product.price;
  const evaluation = evaluatePrice(product.price, displayAiPrice);
  const evaluationClasses = getPriceEvaluationClasses(evaluation.status);
  const statusLabel = t(`priceEvaluation.status.${evaluation.status}`);
  const reasonLabel = t(`priceEvaluation.reason.${evaluation.status}`);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ChevronLeft className="size-4" />{t("common.back")}
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <motion.div key={color.images[imgIdx]} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-section border shadow-soft">
              <img src={color.images[imgIdx]} alt={`${product.name} — ${color.name}`} className="w-full h-full object-cover"
                onError={e => { e.target.src = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"; }} />
            </motion.div>
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {color.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`shrink-0 size-20 rounded-2xl overflow-hidden border-2 transition ${imgIdx === i ? "border-primary" : "border-transparent opacity-60"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover"
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=60"; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
              <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-bold">{product.category}</span>
              <span className="px-2.5 py-1 rounded-full bg-section font-bold">{product.condition}</span>
              <span className="text-muted-foreground font-semibold">• {product.brand}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{product.name}</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            {/* Prices */}
            <div className="space-y-3 mb-6">
              {/* Seller Price */}
              <div className="rounded-2xl border p-4 bg-background/40">
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1">{t("product.sellerPrice")}</div>
                {product.discountPercent > 0 ? (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-destructive">${product.discountedPrice.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground line-through pb-0.5">${product.price.toLocaleString()}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive inline-block pb-1">
                      -{product.discountPercent}% OFF
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-black">${product.price.toLocaleString()}</div>
                )}
              </div>

              {/* AI Suggested Price — full-width card */}
              <div className={`rounded-2xl p-4 ${evaluationClasses.bg} border ${evaluationClasses.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className={`text-xs font-bold uppercase tracking-wide ${evaluationClasses.text} mb-1`}>{t("product.aiPrice")}</div>
                    {aiLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded-full border-2 border-current border-t-transparent animate-spin opacity-60" />
                        <span className={`text-sm font-semibold ${evaluationClasses.text} opacity-70`}>Estimating...</span>
                      </div>
                    ) : (
                      <div className={`text-3xl font-black ${evaluationClasses.text}`}>${displayAiPrice.toLocaleString()}</div>
                    )}
                    <div className={`text-xs font-bold mt-1.5 inline-flex items-center gap-1 ${evaluationClasses.text}`}>
                      {evaluation.status !== PRICE_EVALUATION_STATUS.OVERPRICED
                        ? <><Check className="size-3" /> {statusLabel}</>
                        : <><X className="size-3" /> {statusLabel}</>}
                    </div>
                  </div>
                  {liveAiPrice && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${evaluationClasses.border} ${evaluationClasses.text} ${evaluationClasses.bg} whitespace-nowrap`}>
                      AI Live
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-2 leading-relaxed ${evaluationClasses.text} opacity-90`}>{reasonLabel}</p>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <div className="font-bold mb-2">{t("product.colors")}</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c, i) => (
                  <button key={i} onClick={() => { setColorIdx(i); setImgIdx(0); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition ${colorIdx === i ? "border-primary bg-primary/5" : "border-border"}`}>
                    <span className="size-5 rounded-full border" style={{ background: c.hex }} />
                    <span className="text-sm font-semibold">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Actions */}
            {(!user || user.role === "customer") ? (
              product.is_active === false ? (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-sm font-semibold text-destructive mb-4">
                  ⛔ هذا المنتج غير متاح حالياً ولا يمكن شراؤه.
                </div>
              ) : (
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-11 hover:bg-accent">−</button>
                  <span className="w-12 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="size-11 hover:bg-accent">+</button>
                </div>
                <button onClick={() => addToCart(product, qty, color)} disabled={product.stock === 0}
                  className="flex-1 min-w-[200px] h-12 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2 hover:bg-primary-dark transition disabled:opacity-50">
                  <ShoppingCart className="size-4" />{t("product.addToCart")}
                </button>
                <button onClick={() => {
                    if (!user) { toast.error(t("cart.loginRequired")); navigate({ to: "/login" }); return; }
                    // Buy Now: go directly to checkout without adding to cart
                    navigate({
                      to: "/checkout",
                      search: {
                        buyNow: JSON.stringify({
                          id: product.id,
                          name: product.name,
                          price: product.discountPercent > 0 ? product.discountedPrice : product.price,
                          image: color.images[0],
                          color: color.name,
                          qty,
                        })
                      }
                    });
                  }} disabled={product.stock === 0}
                  className="h-12 px-6 rounded-xl bg-primary-dark text-white font-bold hover:opacity-90 transition disabled:opacity-50">
                  {t("product.buyNow")}
                </button>
                <button onClick={() => toggleWishlist(product.id)} aria-label="Wishlist"
                  className="size-12 rounded-xl border grid place-items-center hover:bg-accent">
                  <Heart className={`size-5 ${liked ? "fill-destructive text-destructive" : ""}`} />
                </button>
              </div>
              )
            ) : (
              <div className="p-4 rounded-2xl bg-accent/40 border text-sm font-semibold text-muted-foreground mb-4">
                ℹ️ {user.role === "seller" ? "Sellers are not allowed to purchase or wishlist products." : "Administrators cannot purchase products."}
              </div>
            )}

            <div className={`text-sm font-bold ${product.stock > 0 ? "text-success" : "text-destructive"}`}>
              {product.stock > 0 ? `${t("product.inStock")} (${product.stock})` : t("product.outOfStock")}
            </div>
          </div>
        </div>

        {/* Full info grid */}
        <section className="mt-12">
          <h2 className="text-2xl font-black mb-5">{t("product.overview")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Info icon={Tag} label={t("product.category")} value={product.category} />
            <Info icon={Layers} label={t("product.type")} value={product.deviceType || product.category} />
            <Info icon={Sparkles} label={t("product.condition")} value={product.condition} />
            <Info icon={Boxes} label={t("product.stock")} value={`${product.stock}`} />
            <Info icon={MonitorSmartphone} label={t("product.usage")} value={product.recommendedUsage || product.category} />
            <Info icon={Monitor} label={t("product.screen")} value={product.screen || "—"} />
            <Info icon={Cpu} label="CPU" value={product.cpu} />
            <Info icon={MemoryStick} label="RAM" value={product.ram} />
            <Info icon={HardDrive} label="Storage" value={product.storage} />
            <Info icon={Cpu} label="GPU" value={product.gpu || t("product.none")} />
            <Info icon={Cpu} label={t("product.igpu")} value={product.igpu || t("product.none")} />
            <Info icon={BatteryCharging} label={t("product.battery")} value={product.battery || "—"} />
            <Info icon={MonitorSmartphone} label={t("product.os")} value={product.os || "—"} />
          </div>

          {/* Seller */}
          {product.seller?.id && (
            <Link to="/u/$id" params={{ id: product.seller.id }} className="mt-8 p-4 rounded-2xl border flex items-center gap-3 hover:bg-accent transition">
              <div className="size-10 rounded-full bg-primary/10 grid place-items-center font-bold text-primary">{(product.seller.name || "S")[0]}</div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">{t("product.seller")}</div>
                <div className="font-bold">{product.seller.name}</div>
              </div>
            </Link>
          )}
        </section>

        {/* Reviews Section */}
        <section className="mt-16 border-t pt-10">
          <h2 className="text-2xl font-black mb-6">{t("reviews.title") || "Customer Reviews"}</h2>
          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            {/* Summary */}
            <div className="p-6 rounded-3xl border bg-card/50 h-fit space-y-4">
              <div className="text-center">
                <div className="text-5xl font-black text-primary">{(parseFloat(product.rating) || 0).toFixed(1)}</div>
                <div className="flex justify-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xl ${star <= Math.round(product.rating || 0) ? "text-yellow-500" : "text-muted-foreground/30"}`}>★</span>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">{product.reviewsCount} {t("reviews.count") || "reviews"}</div>
              </div>
            </div>

            {/* List + Form */}
            <div className="space-y-6">
              {/* Form */}
              {user && user.role === "customer" && (
                <ReviewForm productId={product.id} onAdded={(newRev) => {
                  setReviews([newRev, ...reviews]);
                  setProduct(prev => ({
                    ...prev,
                    reviewsCount: (prev.reviewsCount || 0) + 1,
                    rating: (((prev.rating || 0) * (prev.reviewsCount || 0)) + newRev.rating) / ((prev.reviewsCount || 0) + 1)
                  }));
                }} />
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground italic">No reviews yet for this product.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id || rev.created_at} className="p-5 rounded-2xl border bg-card">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <div className="font-bold text-sm">{rev.customer?.full_name || rev.user?.name || "Customer"}</div>
                          <div className="flex gap-0.5 text-xs text-yellow-500 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>{star <= rev.rating ? "★" : "☆"}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{(rev.created_at || "").slice(0, 10)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ReviewForm({ productId, onAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/customer/reviews", {
        product_id: productId,
        rating,
        comment: comment.trim()
      });
      toast.success("Review submitted successfully");
      onAdded(res.data?.data || res.data || { rating, comment, created_at: new Date().toISOString() });
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl border bg-card space-y-4">
      <h3 className="font-bold text-base">Write a Review</h3>
      <div>
        <label className="text-xs font-bold text-muted-foreground block mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition hover:scale-110 ${star <= rating ? "text-yellow-500" : "text-muted-foreground/30"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground block mb-1">Your Comment</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full p-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="p-4 rounded-2xl border bg-card flex items-start gap-3">
      <div className="size-9 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wide">{label}</div>
        <div className="font-semibold text-sm mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}
