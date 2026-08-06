import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, Activity } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import { DashboardLayout, StatCard } from "@/components/layout/DashboardLayout";
import { adminService } from "@/services/adminService";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

function AdminHome() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminService.stats(),
      adminService.userGrowth(),
      adminService.activity(),
    ]).then(([s, g, a]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (g.status === "fulfilled") setGrowth(g.value);
      if (a.status === "fulfilled") setActivity(a.value);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout kind="admin">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label={t("admin.users")} value={stats?.users ?? "—"} />
        <StatCard icon={Package} label={t("admin.products")} value={stats?.products ?? "—"} />
        <StatCard icon={ShoppingBag} label={t("admin.orders")} value={stats?.orders ?? "—"} />
        <StatCard icon={DollarSign} label={t("admin.revenue")} value={stats ? `$${stats.revenue.toLocaleString()}` : "—"} color="success" />
      </div>

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-card border shadow-soft h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* User Growth Line Chart */}
          <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="size-4 text-primary" />
              {t("admin.userGrowth")}
            </h3>
            <div className="w-full h-[240px] sm:h-[280px] min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#usersGrad)"
                    dot={{ r: 4, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Activity Bar Chart */}
          <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Activity className="size-4 text-primary" />
              {t("admin.activity")}
            </h3>
            <div className="w-full h-[240px] sm:h-[280px] min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="logins" name="Logins" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Line Chart - full width */}
          <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden xl:col-span-2">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <DollarSign className="size-4 text-success" />
              {t("admin.revenue")} — Monthly Trend
            </h3>
            <div className="w-full h-[220px] sm:h-[260px] min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
