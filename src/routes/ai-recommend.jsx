import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Cpu, MemoryStick, HardDrive, Monitor,
  BatteryCharging, Check, Layers
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { recommendationService } from "@/services/recommendationService";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/ai-recommend")({
  head: () => ({
    meta: [
      { title: "AI Laptop Recommendation — LapGenius" },
      { name: "description", content: "Tell us your budget and use case. Our AI picks the right laptop for you in seconds." },
      { property: "og:title", content: "AI Laptop Recommendation — LapGenius" },
      { property: "og:url", content: "/ai-recommend" },
    ],
    links: [{ rel: "canonical", href: "/ai-recommend" }],
  }),
  component: AiRecPage,
});

const USAGES = ["Gaming", "Programming", "Design", "Business", "Study"];
const MIN_BUDGET = 100;
const MAX_BUDGET = 2000;

function AiRecPage() {
  const { t } = useI18n();
  const [budget, setBudget] = useState("800");
  const [usage, setUsage] = useState("Programming");
  const [igpu, setIgpu] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(budget);
    if (!Number.isFinite(n) || n < MIN_BUDGET) return setErr(t("ai.vBudgetMin"));
    if (n > MAX_BUDGET) return setErr(t("ai.vBudgetMax"));
    setErr("");
    setLoading(true);
    try {
      const r = await recommendationService.recommend({ budget: n, usage });
      setResults(r);
    } catch (ex) {
      setResults({ error: ex.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="size-16 mx-auto rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5"><Sparkles className="size-8" /></div>
          <h1 className="text-4xl sm:text-5xl font-black gradient-text leading-snug  mb-4 py-4">{t("ai.recTitle")}</h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{t("ai.recSub")}</p>
        </motion.div>

        <form onSubmit={submit} className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border bg-card shadow-soft space-y-6">
          <div>
            <label className="font-bold block mb-2">{t("ai.budget")}</label>
            <input
              type="number" inputMode="numeric" min={MIN_BUDGET} max={MAX_BUDGET} step="10"
              value={budget}
              onChange={(e) => { setBudget(e.target.value); setErr(""); }}
              className={`w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition text-lg font-bold ${err ? "border-destructive focus:ring-destructive/30" : ""}`}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">{t("ai.budgetHint")}</span>
              {err && <span className="text-xs font-semibold text-destructive">{err}</span>}
            </div>
          </div>
          <div>
            <label className="font-bold block mb-2">{t("ai.usage")}</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {USAGES.map((u) => (
                <button key={u} type="button" onClick={() => setUsage(u)}
                  className={`h-11 rounded-xl font-semibold text-sm transition ${usage === u ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}>{u}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-bold block mb-2">{t("ai.igpu")}</label>
            <input type="text" value={igpu} onChange={(e) => setIgpu(e.target.value)} placeholder="Intel Iris Xe / AMD Radeon Integrated"
              className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition" />
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition disabled:opacity-60 inline-flex items-center justify-center gap-2">
            <Sparkles className="size-4" />{loading ? t("common.loading") : t("ai.recommend")}
          </button>
        </form>

        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-14">
            <h2 className="text-2xl font-black mb-8 text-center">{t("ai.results")}</h2>

            {results.error ? (
              <div className="max-w-xl mx-auto p-6 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive font-semibold text-sm text-center">
                ⚠️ {results.error}
              </div>
            ) : results.meta?.status === "no_results" || (!results.best_performance && !results.top_k?.length) ? (
              <div className="max-w-xl mx-auto p-8 rounded-2xl border bg-card text-center">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-bold text-lg mb-1">No laptops found</div>
                <div className="text-muted-foreground text-sm">Try increasing your budget or selecting a different use case.</div>
              </div>
            ) : (
              <div className="space-y-10 max-w-6xl mx-auto">

                {/* Best Performance + Best Value highlights */}
                {(results.best_performance || results.best_value) && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center mb-5">⭐ Top Picks</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      {results.best_performance && (
                        <AiLaptopCard
                          laptop={results.best_performance}
                          badge={{ label: "🏆 Best Performance", accent: "from-violet-600 to-blue-600", accentBg: "bg-gradient-to-br from-violet-600/10 to-blue-600/10", border: "border-violet-500/30" }}
                          index={0}
                        />
                      )}
                      {results.best_value && results.best_value.id !== results.best_performance?.id && (
                        <AiLaptopCard
                          laptop={results.best_value}
                          badge={{ label: "💰 Best Value", accent: "from-emerald-600 to-teal-600", accentBg: "bg-gradient-to-br from-emerald-600/10 to-teal-600/10", border: "border-emerald-500/30" }}
                          index={1}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Top-K grid */}
                {results.top_k?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center mb-5">All Matches</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {results.top_k.map((laptop, i) => (
                        <AiLaptopCard key={laptop.id ?? i} laptop={laptop} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {results.meta && (
                  <p className="text-center text-xs text-muted-foreground pb-4">
                    {results.meta.candidates} laptop{results.meta.candidates !== 1 ? "s" : ""} matched your criteria · Budget: ${results.meta.budget}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}

      </main>
      <Footer />
    </div>
  );
}

/* ─── AI Laptop Card ─────────────────────────────────────────────────────── */
const CONDITION_STYLES = {
  true: "bg-success/15 text-success border-success/30",
  false: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
};

function AiLaptopCard({ laptop, badge, index = 0 }) {
  const isNew = laptop.new === true || laptop.new === 1;
  const conditionKey = String(isNew);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
      className="group relative rounded-3xl bg-card border shadow-soft overflow-hidden flex flex-col card-hover"
    >
      {/* Badge strip (only for highlight cards) */}
      {badge && (
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${badge.accent}`} />
      )}

      {/* Top badges */}
      <div className="absolute top-3 end-3 z-10 flex flex-wrap gap-1.5 justify-end">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${CONDITION_STYLES[conditionKey] ?? ""}`}>
          {isNew ? "New" : "Used"}
        </span>
        {badge && (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r ${badge.accent}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Header */}
      <div className={`relative px-5 pt-6 pb-4 ${badge ? badge.accentBg : "bg-gradient-to-br from-primary/5 to-primary/10"}`}>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{laptop.brand?.toUpperCase()}</span>
          <h3 className="font-black text-lg leading-tight mt-0.5 line-clamp-2">{laptop.model}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Brand + Name */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="px-2 py-1 rounded-full bg-accent text-accent-foreground font-semibold">
              {laptop.use_case ?? "Laptop"}
            </span>
            <span className="text-muted-foreground font-semibold">{laptop.brand?.toUpperCase()}</span>
          </div>
          <h3 className="font-bold text-base leading-tight line-clamp-2">
            {laptop.brand?.toUpperCase()} {laptop.model}
          </h3>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-1.5">
          <SpecChip icon={Cpu} label="CPU" value={laptop.cpu} />
          <SpecChip icon={Layers} label="GPU" value={laptop.gpu || laptop.igpu || "—"} />
          <SpecChip icon={MemoryStick} label="RAM" value={laptop.ram} />
          <SpecChip icon={HardDrive} label="Storage" value={laptop.hard || laptop.storage} />
          {laptop.screen && <SpecChip icon={Monitor} label="Screen" value={laptop.screen} />}
          {laptop.battery && <SpecChip icon={BatteryCharging} label="Battery" value={laptop.battery} />}
        </div>

        {/* Price */}
        <div className="pt-1">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Price</div>
          <div className="text-2xl font-black leading-none">${Number(laptop.price).toLocaleString()}</div>
        </div>

        {/* Reasons */}
        {laptop.reasons?.length > 0 && (
          <div className="rounded-xl bg-accent/50 p-3 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3" /> Why this laptop?
            </div>
            <ul className="space-y-1">
              {laptop.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3 mt-0.5 shrink-0 text-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </motion.div>
  );
}

function SpecChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-accent/40 px-2 py-1.5 min-w-0">
      <Icon className="size-3 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground leading-none">{label}</div>
        <div className="text-[11px] font-semibold truncate leading-tight mt-0.5">{value}</div>
      </div>
    </div>
  );
}
