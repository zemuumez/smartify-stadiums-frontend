"use client";

import { motion } from "framer-motion";
import { Users, Building2, Calendar, DollarSign, TrendingUp, Shield } from "lucide-react";

export default function AdminOverview() {
  const stats = [
    { label: "Total Users", value: "12,847", change: "+8.2%", icon: <Users className="text-blue-600" size={24} />, bg: "bg-blue-50" },
    { label: "Active Stadiums", value: "52", change: "+3", icon: <Building2 className="text-green-600" size={24} />, bg: "bg-green-50" },
    { label: "Monthly Bookings", value: "8,432", change: "+12.5%", icon: <Calendar className="text-purple-600" size={24} />, bg: "bg-purple-50" },
    { label: "Revenue (ETB)", value: "2.4M", change: "+18.3%", icon: <DollarSign className="text-yellow-600" size={24} />, bg: "bg-yellow-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>{stat.icon}</div>
              <span className="text-sm font-bold text-green-600">{stat.change}</span>
            </div>
            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {[
              { name: "St. George Stadium", type: "Stadium", date: "Today", status: "Pending" },
              { name: "Abebe Kebede", type: "Player", date: "Today", status: "Active" },
              { name: "Bole Arena", type: "Stadium", date: "Yesterday", status: "Active" },
              { name: "Fatuma Hassan", type: "Player", date: "Yesterday", status: "Active" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.type} • {item.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Platform Health</h3>
          <div className="space-y-4">
            {[
              { label: "API Uptime", value: "99.97%", color: "bg-green-500" },
              { label: "Avg Response Time", value: "142ms", color: "bg-blue-500" },
              { label: "Error Rate", value: "0.03%", color: "bg-green-500" },
              { label: "Camera Online", value: "48/52", color: "bg-green-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: "95%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
