"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Calendar,
  Download,
  ArrowUpRight,
  Clock,
  BarChart3,
  Smartphone
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");

  const metrics = [
    { label: "Total Revenue", value: "135,000", change: "+24%", prefix: "ETB", icon: DollarSign },
    { label: "Total Bookings", value: "54", change: "+14%", prefix: "", icon: Calendar },
    { label: "AI Video Views", value: "14,250", change: "+18%", prefix: "", icon: Eye },
    { label: "Clip Downloads", value: "980", change: "+22%", prefix: "", icon: Download },
    { label: "Active Players", value: "312", change: "+28", prefix: "", icon: Users },
    { label: "Avg Slot Usage", value: "84%", change: "+6%", prefix: "", icon: Clock },
  ];

  const weeklyData = [65, 78, 52, 92, 85, 70, 95, 88, 102, 78, 95, 120];

  const topFields = [
    { name: "Bambis Meda — Pitch A (11v11)", bookings: 22, revenue: 55000, views: 5200 },
    { name: "Bambis Meda — Pitch B (7v7)", bookings: 18, revenue: 32400, views: 4100 },
    { name: "Unity Complex — Indoor Court", bookings: 14, revenue: 21000, views: 3400 },
  ];

  const revenueByMethod = [
    { method: "Telebirr", percent: 68, amount: "91,800 ETB", color: "#2d6a4f" },
    { method: "CBE Birr", percent: 22, amount: "29,700 ETB", color: "#40916c" },
    { method: "Chapa / Card", percent: 10, amount: "13,500 ETB", color: "#52b788" },
  ];

  return (
    <div className="space-y-6">

      {/* ── HEADER & PERIOD SELECTOR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111] tracking-tight">Revenue &amp; Venue Analytics</h2>
          <p className="text-[#7a7a7a] text-xs sm:text-sm mt-0.5">
            Real-time telemetry, payment breakdowns, and player engagement stats
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
          {["week", "month", "quarter", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "text-[#5a5a5a] hover:text-[#111]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── METRICS GRID (Solid Styling) ── */}
      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <StaggerItem key={m.label}>
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/[0.05] flex flex-col justify-between hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f]">
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#2d6a4f] bg-[#f0faf4] px-2 py-0.5 rounded-full">
                    {m.change}
                  </span>
                </div>
                <div>
                  <div className="text-xl font-black text-[#111] tracking-tight">
                    {m.value} {m.prefix && <span className="text-xs text-[#7a7a7a] font-normal">{m.prefix}</span>}
                  </div>
                  <div className="text-[11px] text-[#7a7a7a] font-semibold mt-0.5">{m.label}</div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      {/* ── PERFORMANCE BARS & PAYMENT METHOD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Weekly Revenue Visualizer */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-[#111]">Weekly Booking Distribution</h3>
                <p className="text-xs text-[#7a7a7a]">Number of booked slots per week across all fields</p>
              </div>
              <span className="text-xs font-bold text-[#2d6a4f] bg-[#f0faf4] px-3 py-1 rounded-full">
                Target: 90% Capacity
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-6">
              {weeklyData.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-[#f4f3ef] rounded-2xl h-36 flex items-end p-1">
                    <div
                      className="w-full rounded-xl transition-all duration-300 bg-[#2d6a4f]"
                      style={{ height: `${(val / 120) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#7a7a7a]">W{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods (Telebirr / CBE Birr) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-[#111] mb-1">Payment Gateways</h3>
            <p className="text-xs text-[#7a7a7a] mb-6">Instant synchronization ratio</p>

            <div className="space-y-4">
              {revenueByMethod.map((item) => (
                <div key={item.method} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#111]">{item.method}</span>
                    <span className="font-bold text-[#2d6a4f]">{item.percent}% ({item.amount})</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#f4f3ef] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-black/[0.06] text-xs text-[#7a7a7a]">
            Automatic payouts transferred weekly to verified CBE bank account.
          </div>
        </div>

      </div>

    </div>
  );
}
