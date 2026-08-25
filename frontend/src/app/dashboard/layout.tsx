"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Camera,
  BarChart3,
  Globe,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Menu,
  X,
  User,
  Shield,
  Bell,
  ArrowUpRight
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/stadiums", label: "Stadiums", icon: Building2 },
  { href: "/dashboard/fields", label: "Fields", icon: Zap },
  { href: "/dashboard/cameras", label: "Cameras", icon: Camera },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/microsite", label: "Microsite", icon: Globe },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const current = sidebarLinks.find((l) => isActive(l.href));
    return current ? current.label : "Dashboard";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f3ef]">
        <div className="w-8 h-8 border-3 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f4f3ef] text-[#111] overflow-x-hidden">

      {/* ── DESKTOP SIDEBAR (Auto adjusts width with smooth transition) ── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-black/[0.06] sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out ${
          collapsed ? "w-[78px]" : "w-[260px]"
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-5 h-20 border-b border-black/[0.06] flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group overflow-hidden">
            <Image
              src="/logo/et-smart-fields-icon.jpg"
              alt="ET Smart Fields"
              width={38}
              height={38}
              className="rounded-xl object-cover flex-shrink-0"
              priority
            />
            {!collapsed && (
              <div className="flex items-baseline gap-0.5 whitespace-nowrap overflow-hidden">
                <span className="text-lg font-black text-[#111]">ET</span>
                <span className="text-lg font-black text-[#2d6a4f]">Smart Fields</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? "bg-[#2d6a4f] text-white shadow-md shadow-[#2d6a4f]/20"
                    : "text-[#5a5a5a] hover:text-[#111] hover:bg-[#f0faf4]"
                }`}
                title={collapsed ? link.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer — User & Collapse Button */}
        <div className="p-3 border-t border-black/[0.06] flex-shrink-0 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#f4f3ef]">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                style={{ background: "#2d6a4f" }}
              >
                {user?.full_name ? user.full_name[0] : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-[#111] truncate">
                  {user?.full_name || "Stadium Owner"}
                </div>
                <div className="text-[10px] text-[#7a7a7a] font-semibold truncate capitalize">
                  {user?.role || "Owner"} Account
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-[#5a5a5a] hover:text-[#111] hover:bg-[#f4f3ef] transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
            </button>

            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-[#7a7a7a] hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE SLIDE-OUT DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 h-20 border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/logo/et-smart-fields-icon.jpg"
                    alt="ET Smart Fields"
                    width={36}
                    height={36}
                    className="rounded-xl object-cover"
                  />
                  <span className="text-base font-black text-[#111]">Owner Dashboard</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-[#7a7a7a] hover:text-[#111]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        active
                          ? "bg-[#2d6a4f] text-white shadow-md"
                          : "text-[#5a5a5a] hover:bg-[#f0faf4] hover:text-[#111]"
                      }`}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-black/[0.06]">
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA (Dynamically occupies remaining space) ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">

        {/* Dashboard Top Header Bar */}
        <header className="bg-white border-b border-black/[0.06] sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

            {/* Left: Mobile menu toggle + Page title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 rounded-xl border border-black/10 text-[#111] lg:hidden hover:bg-[#f4f3ef]"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f]">
                  Owner Portal
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#111] tracking-tight">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            {/* Right: Quick shortcuts & user badge */}
            <div className="flex items-center gap-3">
              <Link
                href="/microsite"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#2d6a4f] bg-[#f0faf4] border border-[#2d6a4f]/20 hover:bg-[#2d6a4f] hover:text-white transition-all shadow-sm"
              >
                <Globe size={13} /> View Live Microsite <ArrowUpRight size={11} />
              </Link>

              <div className="flex items-center gap-2.5 pl-2 border-l border-black/[0.06]">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm"
                  style={{ background: "#2d6a4f" }}
                >
                  {user?.full_name ? user.full_name[0] : "A"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-black text-[#111]">
                    {user?.full_name || "Abebe Kebede"}
                  </div>
                  <div className="text-[10px] text-[#7a7a7a] font-medium">Bambis Meda Stadium</div>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Dashboard Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
