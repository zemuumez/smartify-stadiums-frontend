"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Camera,
  Calendar,
  DollarSign,
  Users,
  Eye,
  ArrowUpRight,
  Clock,
  Zap,
  BarChart3,
  Globe,
  CheckCircle2,
  Shield,
  Activity,
  ArrowRight
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
import api from "@/lib/api";

interface DashboardStats {
  totalStadiums: number;
  activeStadiums: number;
  totalFields: number;
  totalCameras: number;
  onlineCameras: number;
  todayBookings: number;
  monthBookings: number;
  monthRevenue: number;
  totalViews: number;
  totalPlayers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStadiums: 2,
    activeStadiums: 2,
    totalFields: 4,
    totalCameras: 2,
    onlineCameras: 2,
    todayBookings: 6,
    monthBookings: 54,
    monthRevenue: 135000,
    totalViews: 14250,
    totalPlayers: 312,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([
    { id: "1", player: "Dawit Tadesse", field: "Field 1 — Artificial Turf", time: "14:00 - 15:00", amount: "2,500 ETB", status: "confirmed" },
    { id: "2", player: "Samuel Kebede", field: "Field 2 — 7v7 Grass", time: "16:00 - 17:00", amount: "2,000 ETB", status: "pending" },
    { id: "3", player: "Yonas Mekonnen", field: "Field 1 — Artificial Turf", time: "17:00 - 18:00", amount: "2,500 ETB", status: "confirmed" },
    { id: "4", player: "Kidist Alemayehu", field: "Indoor Futsal Court", time: "18:00 - 19:00", amount: "1,800 ETB", status: "confirmed" },
    { id: "5", player: "Henok Berhanu", field: "Field 1 — Artificial Turf", time: "19:00 - 20:00", amount: "2,500 ETB", status: "confirmed" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [stadiumsRes, camerasRes] = await Promise.allSettled([
        api.get("/stadiums"),
        api.get("/cameras"),
      ]);

      const stadiums = stadiumsRes.status === "fulfilled" && Array.isArray(stadiumsRes.value.data) ? stadiumsRes.value.data : [];
      const cameras = camerasRes.status === "fulfilled" && Array.isArray(camerasRes.value.data) ? camerasRes.value.data : [];

      if (stadiums.length > 0) {
        setStats((prev) => ({
          ...prev,
          totalStadiums: stadiums.length,
          activeStadiums: stadiums.filter((s: any) => s.status === "active").length || stadiums.length,
          totalFields: stadiums.reduce((acc: number, s: any) => acc + (s.field_count || 2), 0),
          totalCameras: cameras.length || 2,
          onlineCameras: cameras.filter((c: any) => c.status === "active").length || 2,
        }));
      }
    } catch {
      // Keep solid demo defaults
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Stadiums",
      value: stats.totalStadiums,
      change: "+1 new",
      icon: Building2,
    },
    {
      label: "Active AI Cameras",
      value: `${stats.onlineCameras}/${stats.totalCameras}`,
      change: "All Online",
      icon: Camera,
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      change: "+18% vs avg",
      icon: Calendar,
    },
    {
      label: "Monthly Revenue",
      value: `${(stats.monthRevenue).toLocaleString()} ETB`,
      change: "+24% vs last mo",
      icon: DollarSign,
    },
    {
      label: "Profile Views",
      value: stats.totalViews.toLocaleString(),
      change: "+12% this week",
      icon: Eye,
    },
    {
      label: "Registered Players",
      value: stats.totalPlayers,
      change: "+28 new",
      icon: Users,
    },
  ];

  const monthlyRevenue = [
    { month: "Jan", revenue: 65000, height: 48 },
    { month: "Feb", revenue: 78000, height: 58 },
    { month: "Mar", revenue: 72000, height: 53 },
    { month: "Apr", revenue: 89000, height: 66 },
    { month: "May", revenue: 95000, height: 71 },
    { month: "Jun", revenue: 84000, height: 62 },
    { month: "Jul", revenue: 108000, height: 80 },
    { month: "Aug", revenue: 135000, height: 100 },
  ];

  return (
    <div className="space-y-8">

      {/* ── SOLID HERO GREETING BANNER (No Gradients) ── */}
      <FadeUp>
        <div
          className="rounded-3xl p-7 sm:p-9 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
          style={{ background: "#1a4731" }}
        >
          {/* Subtle background pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/[0.03] pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#74c69d] bg-white/10 border border-white/10 mb-3">
              <Shield size={12} /> Stadium Owner Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
              Welcome back, Abebe
            </h2>
            <p className="text-white/75 text-sm max-w-xl leading-relaxed">
              Here is what is happening across your stadiums and AI camera feeds today.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#2d6a4f] text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#74c69d]" /> 2 Active Venues
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15">
              <Camera size={13} className="text-[#74c69d]" /> 2/2 AI Cameras Live
            </span>
          </div>
        </div>
      </FadeUp>

      {/* ── 6 KEY STAT CARDS (Clean Solid Design, No Neon Gradients) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-3xl p-5 shadow-sm border border-black/[0.05] flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f]">
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold text-[#2d6a4f] bg-[#f0faf4] px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-[#111] mb-0.5 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-[#7a7a7a] font-semibold">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── REVENUE ANALYTICS & RECENT BOOKINGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left: Monthly Revenue Bar Chart (Solid Forest Green) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
                  Revenue Analytics
                </div>
                <h3 className="text-lg font-black text-[#111]">
                  Monthly Performance (2026)
                </h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#111]">135,000 ETB</div>
                <div className="text-[11px] text-[#7a7a7a] font-medium">August Earnings</div>
              </div>
            </div>

            {/* Solid Bar Visualizer */}
            <div className="pt-6 pb-2">
              <div className="flex items-end justify-between gap-2 sm:gap-3 h-48">
                {monthlyRevenue.map((item, idx) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-[#f4f3ef] rounded-2xl h-40 flex items-end p-1 relative overflow-hidden">
                      <div
                        className="w-full rounded-xl transition-all duration-500 group-hover:opacity-90"
                        style={{
                          height: `${item.height}%`,
                          backgroundColor: idx === monthlyRevenue.length - 1 ? "#2d6a4f" : "#52b788",
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#7a7a7a] group-hover:text-[#111]">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#7a7a7a]">
            <span>Average revenue per booking: <strong className="text-[#111]">2,500 ETB</strong></span>
            <Link href="/dashboard/analytics" className="font-bold text-[#2d6a4f] hover:underline flex items-center gap-1">
              Detailed Analytics <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Right: Recent Bookings List */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
                  Real-Time Bookings
                </div>
                <h3 className="text-lg font-black text-[#111]">
                  Recent Field Slots
                </h3>
              </div>
              <Link href="/dashboard/stadiums" className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f4f3ef] hover:bg-[#eae8e1] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: "#2d6a4f" }}
                    >
                      {b.player[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#111] truncate">{b.player}</div>
                      <div className="text-[11px] text-[#7a7a7a] flex items-center gap-1 truncate">
                        <Clock size={11} /> {b.time} • {b.field}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-xs font-black text-[#111]">{b.amount}</div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        b.status === "confirmed"
                          ? "text-[#2d6a4f] bg-[#f0faf4]"
                          : "text-amber-700 bg-amber-50"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#7a7a7a]">
            <span>Automated SMS confirmations active</span>
            <span className="font-bold text-[#2d6a4f] flex items-center gap-1">
              <CheckCircle2 size={13} /> Telebirr Synced
            </span>
          </div>
        </div>

      </div>

      {/* ── QUICK ACTION SHORTCUTS (Clean Solid Cards) ── */}
      <div>
        <h3 className="text-base font-black text-[#111] mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Manage Stadiums", desc: "Configure fields, pricing, amenities", href: "/dashboard/stadiums", icon: Building2 },
            { label: "AI Camera Control", desc: "Check 4K stream status & storage", href: "/dashboard/cameras", icon: Camera },
            { label: "Revenue Analytics", desc: "View daily payout & trends", href: "/dashboard/analytics", icon: BarChart3 },
            { label: "Edit Public Microsite", desc: "Update banner, photos, tournaments", href: "/dashboard/microsite", icon: Globe },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.05] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f] group-hover:bg-[#2d6a4f] group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <ArrowUpRight size={16} className="text-[#8a8a8a] group-hover:text-[#2d6a4f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <div>
                  <h4 className="font-black text-[#111] text-sm mb-1">{action.label}</h4>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
