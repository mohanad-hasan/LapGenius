import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Activity — Admin — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const [activity, setActivity] = useState([]);
  const [growth, setGrowth] = useState([]);
  useEffect(() => { adminService.activity().then(setActivity); adminService.userGrowth().then(setGrowth); }, []);
  return (
    <DashboardLayout kind="admin">
      <h2 className="text-2xl font-black mb-6">Activity Analytics</h2>
      <div className="grid gap-6">
        <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden">
          <h3 className="font-bold mb-4 text-sm sm:text-base">User Growth</h3>
          <div className="w-full h-[240px] sm:h-[280px] lg:h-[320px] min-w-0 overflow-hidden"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#03A9F4" stopOpacity={0.6}/><stop offset="95%" stopColor="#03A9F4" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} width={50} /><Tooltip />
              <Area type="monotone" dataKey="users" stroke="#03A9F4" strokeWidth={3} fill="url(#ag)" />
            </AreaChart>
          </ResponsiveContainer></div>
        </div>
        <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden">
          <h3 className="font-bold mb-4 text-sm sm:text-base">Weekly Logins vs Orders</h3>
          <div className="w-full h-[240px] sm:h-[280px] lg:h-[300px] min-w-0 overflow-hidden"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activity} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} /><XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} width={50} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="logins" stroke="#03A9F4" fill="#03A9F4" fillOpacity={0.3} />
              <Area type="monotone" dataKey="orders" stroke="#01579B" fill="#01579B" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
