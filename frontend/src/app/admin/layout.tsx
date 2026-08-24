"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Building2, BarChart3, Settings, Shield, Menu, X, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/stadiums", label: "Stadiums", icon: Building2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors">
      {/* Desktop Sidebar */}
      <motion.aside initial={false} animate={{ width: collapsed ? 72 : 260 }} transition={{ duration: 0.3 }} className="hidden lg:flex fixed left-0 top-0 h-screen flex-col bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-white/10 z-40 transition-colors">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 dark:border-white/10">
          <Image
            src="/logo/et-smart-fields-icon.jpg"
            alt="ET Smart Fields"
            width={36}
            height={36}
            className="w-9 h-9 rounded-lg flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex items-baseline">
              <span className="text-slate-900 dark:text-white font-bold">ETSF</span>
              <span className="text-green-600 dark:text-green-400 font-bold ml-1">Admin</span>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 dark:border-white/10 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-shrink-0 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-white/10 z-50 lg:hidden transition-colors">
              <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo/et-smart-fields-icon.jpg"
                    alt="ET Smart Fields"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-lg"
                  />
                  <span className="text-slate-900 dark:text-white font-bold">Admin</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive(link.href) ? "bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
                      <Icon size={20} />{link.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-[260px] transition-all" style={{ marginLeft: collapsed ? 72 : undefined }}>
        <div className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center px-4 lg:px-8 transition-colors">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-4 text-slate-500 dark:text-slate-400"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{adminLinks.find((l) => isActive(l.href))?.label || "Admin"}</h1>
          <div className="flex-1" />
          <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">Admin</span>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
