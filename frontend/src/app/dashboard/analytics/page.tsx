"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Calendar,
  Video,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
  PieChart,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");

  const metrics = [
    { label: "Total Revenue", value: "895,000", change: "+23%", up: true, prefix: "ETB", icon: DollarSign, color: "from-green-500 to-emerald-600" },
    { label: "Total Bookings", value: "47", change: "+12%", up: true, prefix: "", icon: Calendar, color: "from-blue-500 to-cyan-600" },
    { label: "Video Views", value: "12,340", change: "+8%", up: true, prefix: "", icon: Eye, color: "from-purple-500 to-pink-500" },
    { label: "Downloads", value: "856", change: "+15%", up: true, prefix: "", icon: Download, color: "from-yellow-500 to-orange-500" },
    { label: "Unique Players", value: "286", change: "+18", up: true, prefix: "", icon: Users, color: "from-rose-500 to-pink-600" },
    { label: "Avg Session", value: "12:34", change: "+2:15", up: true, prefix: "", icon: Clock, color: "from-cyan-500 to-blue-500" },
  ];

  const dailyData = [12, 19, 15, 22, 18, 25, 20, 28, 24, 32, 28, 35, 30, 38];
  const weeklyData = [65, 78, 52, 92, 85, 70, 95, 88, 102, 78, 95, 110];

  const topFields = [
    { name: "Bambis - Field 1", bookings: 18, revenue: 45000, views: 4200 },
    { name: "Bambis - Field 2", bookings: 15, revenue: 37500, views: 3100 },
    { name: "St George - Field 1", bookings: 12, revenue: 30000, views: 2800 },
    { name: "St George - Field 2", bookings: 2, revenue: 7000, views: 2240 },
  ];

  const popularMatches = [
    { title: "Bambis vs Lion City", views: 2340, downloads: 156, date: "Aug 20" },
    { title: "Sunday League Final", views: 1890, downloads: 203, date: "Aug 18" },
    { title: "Bambis Youth Cup", views: 1456, downloads: 98, date: "Aug 15" },
  ];

  const revenueByMethod = [
    { method: "Telebirr", percent: 62, color: "bg-green-500" },
    { method: "CBE Birr", percent: 21, color: "bg-blue-500" },
    { method: "Credit Card", percent: 12, color: "bg-purple-500" },
    { method: "Cash", percent: 5, color: "bg-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-gray-400 text-sm mt-1">Track your performance and revenue</p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "quarter", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <StaggerItem key={m.label}>
              <GlowCard className="!p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-xs text-gray-400">{m.label}</p>
                </div>
                <p className="text-xl font-bold text-white">
                  {m.prefix && <span className="text-sm text-gray-400 mr-1">{m.prefix}</span>}
                  {m.value}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${m.up ? "text-green-400" : "text-red-400"}`}>
                  {m.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {m.change}
                </div>
              </GlowCard>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <FadeUp className="lg:col-span-2">
          <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <BarChart3 size={20} className="text-gray-500" />
            </div>
            <div className="h-48 flex items-end gap-1">
              {dailyData.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(h / 40) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                  className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm hover:from-green-500 hover:to-green-300 transition-colors cursor-pointer relative group min-w-[4px]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(h * 1000).toLocaleString()} ETB
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">Daily revenue (last 14 days)</p>
          </div>
        </FadeUp>

        {/* Payment Methods */}
        <FadeUp delay={0.1}>
          <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
              <PieChart size={20} className="text-gray-500" />
            </div>
            <div className="space-y-4">
              {revenueByMethod.map((m) => (
                <div key={m.method}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300">{m.method}</span>
                    <span className="text-white font-medium">{m.percent}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${m.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Revenue</span>
                <span className="text-white font-bold">895,000 ETB</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Platform Fee (5%)</span>
                <span className="text-yellow-400 font-medium">44,750 ETB</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Views Chart & Top Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <FadeUp>
          <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Video Views</h3>
            <div className="h-48 flex items-end gap-1">
              {weeklyData.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(h / 120) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm hover:from-purple-500 hover:to-purple-300 transition-colors cursor-pointer relative group min-w-[4px]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h.toLocaleString()} views
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">Weekly views (last 12 weeks)</p>
          </div>
        </FadeUp>

        {/* Top Fields */}
        <FadeUp delay={0.1}>
          <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Performing Fields</h3>
            <div className="space-y-3">
              {topFields.map((field, i) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{field.name}</p>
                    <p className="text-xs text-gray-400">{field.bookings} bookings · {field.views.toLocaleString()} views</p>
                  </div>
                  <p className="text-sm font-medium text-green-400">{field.revenue.toLocaleString()} ETB</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Popular Matches */}
      <FadeUp>
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Popular Match Replays</h3>
            <span className="text-xs text-gray-500">Last 30 days</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularMatches.map((match, i) => (
              <motion.div
                key={match.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Video size={16} className="text-purple-400" />
                  <span className="text-xs text-gray-500">{match.date}</span>
                </div>
                <h4 className="text-sm font-medium text-white mb-2">{match.title}</h4>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye size={12} /> {match.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Download size={12} /> {match.downloads}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
