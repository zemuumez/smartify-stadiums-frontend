"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Building2, DollarSign, Calendar, BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Monthly Revenue", value: "₂2.4M", change: "+18%", icon: <DollarSign className="text-green-600" size={24} /> },
          { label: "New Users (30d)", value: "1,247", change: "+12%", icon: <Users className="text-blue-600" size={24} /> },
          { label: "Active Stadiums", value: "48", change: "+3", icon: <Building2 className="text-purple-600" size={24} /> },
          { label: "Bookings (30d)", value: "8,432", change: "+22%", icon: <Calendar className="text-yellow-600" size={24} /> },
          { label: "Avg Revenue/Stadium", value: "₂50K", change: "+8%", icon: <BarChart3 className="text-red-600" size={24} /> },
          { label: "Churn Rate", value: "2.1%", change: "-0.3%", icon: <TrendingUp className="text-green-600" size={24} /> },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center gap-3 mb-3">{stat.icon}<span className="text-sm text-slate-500">{stat.label}</span></div>
            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            <span className="text-sm font-bold text-green-600">{stat.change}</span>
          </motion.div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Top Stadiums by Bookings</h3>
          <div className="space-y-3">
            {[
              { name: "Bambis Meda", bookings: 1247, pct: 95 },
              { name: "St George Arena", bookings: 982, pct: 75 },
              { name: "Bole Arena", bookings: 876, pct: 67 },
              { name: "Merkato Field", bookings: 654, pct: 50 },
            ].map((s, i) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{i + 1}. {s.name}</span>
                  <span className="text-slate-500">{s.bookings.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Revenue by City</h3>
          <div className="space-y-3">
            {[
              { city: "Addis Ababa", revenue: "₁1.8M", pct: 75 },
              { city: "Hawassa", revenue: "₁280K", pct: 12 },
              { city: "Bahir Dar", revenue: "₁180K", pct: 8 },
              { city: "Dire Dawa", revenue: "₁140K", pct: 5 },
            ].map((c) => (
              <div key={c.city}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{c.city}</span>
                  <span className="text-slate-500">{c.revenue}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
