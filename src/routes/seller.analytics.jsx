import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { sellerService } from "@/services/sellerService";

export const Route = createFileRoute("/seller/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Seller — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: SellerAnalytics,
});

function SellerAnalytics() {
  const [sales, setSales] = useState([]);
  useEffect(() => { sellerService.sales().then(setSales); }, []);
  return (
    <DashboardLayout kind="seller">
      <h2 className="text-2xl font-black mb-6">Analytics</h2>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden">
          <h3 className="font-bold mb-4 text-sm sm:text-base">Revenue Trend</h3>
          <div className="w-full h-[240px] sm:h-[280px] lg:h-[300px] min-w-0 overflow-hidden"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#03A9F4" stopOpacity={0.5}/><stop offset="95%" stopColor="#03A9F4" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} width={50} /><Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#03A9F4" strokeWidth={3} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer></div>
        </div>
        <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden">
          <h3 className="font-bold mb-4 text-sm sm:text-base">Units Sold</h3>
          <div className="w-full h-[240px] sm:h-[280px] lg:h-[300px] min-w-0 overflow-hidden"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={sales} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} width={50} /><Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#01579B" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
