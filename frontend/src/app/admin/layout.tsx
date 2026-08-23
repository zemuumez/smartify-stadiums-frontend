"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Building2, BarChart3, Settings, Shield, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

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

  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <motion.aside initial={false} animate={{ width: collapsed ? 72 : 260 }} transition={{ duration: 0.3 }} className="hidden lg:flex fixed left-0 top-0 h-screen flex-col bg-slate-900 z-40">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="text-white" size={18} />
          </div>
          {!collapsed && <span className="text-white font-bold">ETSF Admin</span>}
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-green-500/20 text-green-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 h-screen w-64 bg-slate-900 z-50 lg:hidden">
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
                <span className="text-white font-bold">Admin</span>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive(link.href) ? "bg-green-500/20 text-green-400" : "text-slate-400 hover:text-white"}`}>
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
        <div className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center px-4 lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-4 text-slate-500"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-slate-900">{adminLinks.find((l) => isActive(l.href))?.label || "Admin"}</h1>
          <div className="flex-1" />
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Admin</span>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
