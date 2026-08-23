"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Camera,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
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
    totalStadiums: 0,
    activeStadiums: 0,
    totalFields: 0,
    totalCameras: 0,
    onlineCameras: 0,
    todayBookings: 0,
    monthBookings: 0,
    monthRevenue: 0,
    totalViews: 0,
    totalPlayers: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [stadiumsRes, camerasRes] = await Promise.allSettled([
        api.get("/stadiums"),
        api.get("/cameras"),
      ]);

      const stadiums = stadiumsRes.status === "fulfilled" ? stadiumsRes.value.data : [];
      const cameras = camerasRes.status === "fulfilled" ? camerasRes.value.data : [];

      setStats({
        totalStadiums: stadiums.length || 2,
        activeStadiums: stadiums.filter((s: any) => s.status === "active").length || 1,
        totalFields: stadiums.reduce((acc: number, s: any) => acc + (s.field_count || 0), 0) || 4,
        totalCameras: cameras.length || 2,
        onlineCameras: cameras.filter((c: any) => c.status === "active").length || 1,
        todayBookings: 3,
        monthBookings: 47,
        monthRevenue: 89500,
        totalViews: 12340,
        totalPlayers: 286,
      });

      setRecentBookings([
        { id: "1", player: "Dawit T.", field: "Field 1", time: "14:00-15:00", amount: 2500, status: "confirmed" },
        { id: "2", player: "Samuel K.", field: "Field 2", time: "16:00-17:00", amount: 2500, status: "pending" },
        { id: "3", player: "Yonas M.", field: "Field 1", time: "17:00-18:00", amount: 2500, status: "confirmed" },
        { id: "4", player: "Kidist A.", field: "Field 1", time: "18:00-19:00", amount: 2500, status: "pending" },
      ]);
    } catch (err) {
      // Use demo data
      setStats({
        totalStadiums: 2,
        activeStadiums: 1,
        totalFields: 4,
        totalCameras: 2,
        onlineCameras: 1,
        todayBookings: 3,
        monthBookings: 47,
        monthRevenue: 89500,
        totalViews: 12340,
        totalPlayers: 286,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Stadiums",
      value: stats.totalStadiums,
      change: "+1",
      up: true,
      icon: Building2,
      color: "from-green-500 to-emerald-600",
      shadow: "shadow-green-500/20",
    },
    {
      label: "Active Cameras",
      value: `${stats.onlineCameras}/${stats.totalCameras}`,
      change: "Online",
      up: true,
      icon: Camera,
      color: "from-blue-500 to-cyan-600",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      change: "+12%",
      up: true,
      icon: Calendar,
      color: "from-yellow-500 to-orange-500",
      shadow: "shadow-yellow-500/20",
    },
    {
      label: "Monthly Revenue",
      value: `${(stats.monthRevenue / 100).toLocaleString()} ETB`,
      change: "+23%",
      up: true,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
    },
    {
      label: "Total Views",
      value: stats.totalViews.toLocaleString(),
      change: "+8%",
      up: true,
      icon: Eye,
      color: "from-cyan-500 to-blue-500",
      shadow: "shadow-cyan-500/20",
    },
    {
      label: "Active Players",
      value: stats.totalPlayers,
      change: "+15",
      up: true,
      icon: Users,
      color: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/20 via-gray-900 to-yellow-600/20 border border-white/10 p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-400 text-sm lg:text-base">
            Here&apos;s what&apos;s happening with your stadiums today.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
              <Zap size={12} />
              {stats.activeStadiums} Active Stadiums
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
              <Camera size={12} />
              {stats.onlineCameras} Cameras Online
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/20">
              <Clock size={12} />
              {stats.todayBookings} Bookings Today
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <StaggerItem key={card.label}>
              <GlowCard className="h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{card.label}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{card.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${card.up ? "text-green-400" : "text-red-400"}`}>
                      {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {card.change}
                      <span className="text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </GlowCard>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      {/* Revenue Chart & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <FadeUp>
          <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
            <div className="h-64 flex items-end gap-2 px-4">
              {[35, 52, 45, 68, 72, 55, 85, 78, 92, 88, 95, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {((h / 100) * 12000).toLocaleString()} ETB
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-500 px-4">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Recent Bookings */}
        <FadeUp delay={0.1}>
          <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
              <a href="/dashboard/analytics" className="text-green-400 text-sm hover:text-green-300 flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="space-y-3">
              {recentBookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {booking.player[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{booking.player}</p>
                      <p className="text-xs text-gray-400">{booking.field} · {booking.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{booking.amount.toLocaleString()} ETB</p>
                    <p className={`text-xs font-medium ${booking.status === "confirmed" ? "text-green-400" : "text-yellow-400"}`}>
                      {booking.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Quick Actions */}
      <FadeUp>
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Add Stadium", href: "/dashboard/stadiums/new", icon: "🏟️" },
              { label: "Add Camera", href: "/dashboard/cameras", icon: "📹" },
              { label: "View Analytics", href: "/dashboard/analytics", icon: "📊" },
              { label: "Edit Microsite", href: "/dashboard/microsite", icon: "🌐" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 transition-all text-center group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
