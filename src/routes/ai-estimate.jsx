import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { priceEstimatorService } from "@/services/priceEstimatorService";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/ai-estimate")({
  head: () => ({
    meta: [
      { title: "AI Price Estimator — LapGenius" },
      { name: "description", content: "Get an instant fair market price for any laptop configuration powered by our AI estimator." },
      { property: "og:url", content: "/ai-estimate" },
    ],
    links: [{ rel: "canonical", href: "/ai-estimate" }],
  }),
  component: AiEstPage,
});

const CONDITIONS = ["New", "Refurbished", "Used"];
const BATTERY = ["Excellent (>90%)", "Good (70-90%)", "Fair (50-70%)", "Poor (<50%)"];
const OS = ["Windows 11", "Windows 10", "macOS", "Linux", "ChromeOS"];
const CATEGORIES = ["Gaming", "Business", "Programming", "Design", "Lightweight", "Study", "General"];
const USAGE = ["Gaming", "Programming", "Design", "Business", "Study", "General"];

function AiEstPage() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    brand: "",
    cpu: "Intel Core i7-13700H",
    gpu: "NVIDIA RTX 4060",
    igpu: "",
    ram: "16GB",
    storage: "1TB",
    screen: "15.6\"",
    battery: "Good (70-90%)",
    os: "Windows 11",
    condition: "New",
    category: "Programming",
    usage: "Programming"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await priceEstimatorService.estimate(form);
      setResult(r);
    } catch (err) {
      setResult({ _error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="size-16 mx-auto rounded-2xl bg-primary-dark text-white grid place-items-center mb-5"><Calculator className="size-8" /></div>
          <h1 className="text-4xl sm:text-5xl font-black gradient-text leading-tight mb-4 py-4">{t("ai.estTitle")}</h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{t("ai.estSub")}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <form onSubmit={submit} className="p-6 sm:p-8 rounded-3xl border bg-card shadow-soft space-y-4">
            <Field label="Brand" value={form.brand} onChange={(v) => set("brand", v)} placeholder="e.g. Dell, HP, Lenovo" />
            <Field label={t("ai.cpu")} value={form.cpu} onChange={(v) => set("cpu", v)} />
            <Field label={t("ai.gpu")} value={form.gpu} onChange={(v) => set("gpu", v)} />
            <Field label={t("ai.igpu")} value={form.igpu} onChange={(v) => set("igpu", v)} placeholder="Intel Iris Xe" />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("ai.ram")} value={form.ram} onChange={(v) => set("ram", v)} placeholder="16GB" />
              <Field label={t("ai.storage")} value={form.storage} onChange={(v) => set("storage", v)} placeholder="1TB" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("ai.screen")} value={form.screen} onChange={(v) => set("screen", v)} placeholder='15.6"' />
              <Select label={t("ai.os")} value={form.os} onChange={(v) => set("os", v)} options={OS} />
            </div>
            <Select label={t("ai.battery")} value={form.battery} onChange={(v) => set("battery", v)} options={BATTERY} />
            <div className="grid grid-cols-2 gap-3">
              <Select label={t("ai.category")} value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} />
              <Select label={t("ai.usage2")} value={form.usage} onChange={(v) => set("usage", v)} options={USAGE} />
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground block mb-1">{t("ai.condition")}</span>
              <div className="grid grid-cols-3 gap-2">
                {CONDITIONS.map((c) => (
                  <button key={c} type="button" onClick={() => set("condition", c)}
                    className={`h-11 rounded-xl font-semibold text-sm transition ${form.condition === c ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}>{c}</button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition disabled:opacity-60">
              {loading ? t("loading") : t("ai.estimate")}
            </button>
          </form>

          <div className="p-6 sm:p-8 rounded-3xl shadow-elev text-white lg:sticky lg:top-20 h-fit" style={{ background: "var(--gradient-hero)" }}>
            <div className="text-sm opacity-90 font-semibold uppercase mb-3 tracking-wide">{t("ai.estimated")}</div>
            {result ? (
              <motion.div key={JSON.stringify(result)} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                {result._error ? (
                  <div className="text-sm font-semibold text-red-300 bg-white/10 rounded-xl p-4">
                    ⚠️ {result._error}
                  </div>
                ) : (
                  <>
                    <div className="text-5xl sm:text-6xl font-black mb-4 leading-none">
                      ${Number(result.predicted_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm opacity-80 leading-relaxed">
                      Estimated fair market price based on your configuration.
                      {form.condition !== "New" && (
                        <span className="block mt-1 opacity-70 text-xs">
                          Condition: {form.condition}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="text-5xl sm:text-6xl font-black opacity-40 leading-none">$ —</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-1">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function BreakRow({ k, v }) {
  return <div className="flex justify-between border-b border-white/15 pb-1.5"><span className="opacity-85">{k}</span><span className="font-bold">{v}</span></div>;
}
