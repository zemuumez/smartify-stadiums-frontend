"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Camera,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const adminLinks = [
  { href: "/admin", label: "Registry Overview", icon: LayoutDashboard },
  { href: "/admin/stadiums", label: "Stadium & Field Approvals", icon: Building2 },
  { href: "/admin/users", label: "Owners & Players Directory", icon: Users },
  { href: "/admin/analytics", label: "Platform Financials", icon: BarChart3 },
  { href: "/admin/settings", label: "System Config", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  // If on /admin/login, don't show admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#f4f3ef] text-[#111] overflow-x-hidden">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-black/[0.06] sticky top-0 h-screen z-30 transition-all duration-300 ${
          collapsed ? "w-[78px]" : "w-[260px]"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-20 border-b border-black/[0.06] flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: "#1a4731" }}
            >
              <Shield size={20} className="text-[#74c69d]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-[#111] truncate">ETSF SuperAdmin</span>
                <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider">Master Registry</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#1a4731] text-white shadow-md"
                    : "text-[#5a5a5a] hover:bg-[#f0faf4] hover:text-[#111]"
                }`}
                title={collapsed ? link.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-black/[0.06] flex-shrink-0">
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-[#5a5a5a] hover:text-[#111] hover:bg-[#f4f3ef]"
            >
              {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
            </button>
            <Link
              href="/"
              className="p-2 rounded-xl text-[#7a7a7a] hover:text-[#111] hover:bg-[#f4f3ef]"
              title="Return to Public Site"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="bg-white border-b border-black/[0.06] sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 rounded-xl border border-black/10 text-[#111] lg:hidden hover:bg-[#f4f3ef]"
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f]">Platform Operator Console</div>
                <h1 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight">SuperAdmin Management</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f]">
                <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-pulse" /> Live Telemetry
              </span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs"
                style={{ background: "#1a4731" }}
              >
                SA
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
