import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, DollarSign, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { DashboardLayout, StatCard } from "@/components/layout/DashboardLayout";
import { sellerService } from "@/services/sellerService";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/seller/")({
  head: () => ({ meta: [{ title: "Seller Dashboard — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: SellerHome,
});

const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

function SellerHome() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [mix, setMix] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.allStats().then(({ stats, sales, mix }) => {
      setStats(stats);
      setSales(sales);
      setMix(mix);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout kind="seller">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label={t("seller.revenue")} value={stats ? `$${Number(stats.revenue ?? 0).toLocaleString()}` : "—"} color="success" />
        <StatCard icon={Package} label={t("seller.totalProducts")} value={stats?.products ?? "—"} />
        <StatCard icon={ShoppingBag} label={t("seller.totalOrders")} value={stats?.orders ?? "—"} />
        <StatCard icon={Clock} label={t("seller.pending")} value={stats?.pending ?? "—"} color="destructive" />
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-card border shadow-soft h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Line Chart */}
          <div className="p-6 rounded-3xl bg-card border shadow-soft">
            <h3 className="font-bold mb-4">{t("seller.sales")}</h3>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={sales} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={50} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Mix Pie */}
          {mix.length > 0 && (
            <div className="p-6 rounded-3xl bg-card border shadow-soft">
              <h3 className="font-bold mb-4">{t("seller.mix")}</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart margin={{ top: 5, right: 5, bottom: 30, left: 5 }}>
                    <Pie data={mix} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={2}>
                      {mix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sales Bar Chart */}
          <div className="p-6 rounded-3xl bg-card border shadow-soft lg:col-span-2">
            <h3 className="font-bold mb-4">Monthly Sales</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={sales} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={50} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
