"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-provider";
import { FadeUp } from "@/components/ui/AnimatedSection";

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
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, [isAuthenticated]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex fixed left-0 top-0 h-screen flex-col bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-white/10 z-40 transition-colors"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-20 border-b border-slate-200 dark:border-white/10">
          <Image
            src="/logo/et-smart-fields-icon.jpg"
            alt="ET Smart Fields"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl flex-shrink-0"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-lg font-bold text-slate-900 dark:text-white">ET</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400 ml-1">Smart Fields</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                  active
                    ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User & Collapse */}
        <div className="border-t border-slate-200 dark:border-white/10 p-3 space-y-2">
          {user && !collapsed && (
            <div className="px-3 py-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {user.full_name?.[0] || user.phone?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.full_name || "Owner"}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{user.business_name || "Stadium Owner"}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-shrink-0 p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-white/10 z-50 lg:hidden transition-colors"
            >
              <div className="flex items-center justify-between px-5 h-20 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo/et-smart-fields-icon.jpg"
                    alt="ET Smart Fields"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-xl"
                  />
                  <div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">ET</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400 ml-1">Smart Fields</span>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                          : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon size={20} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300" style={{ marginLeft: 0 }}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center px-4 lg:px-8 transition-colors">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-4 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            {sidebarLinks.find((l) => isActive(l.href))?.label || "Dashboard"}
          </h1>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-500/20">
              ULS Verified
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <FadeUp>{children}</FadeUp>
        </div>
      </div>
    </div>
  );
}
