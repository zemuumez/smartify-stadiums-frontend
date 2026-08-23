"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Calendar, User, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/stadiums", label: "Find", icon: Search },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/auth/login", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  // Don't show on dashboard or admin (has their own sidebar)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/80 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-[48px]"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-1 w-8 h-1 bg-green-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`transition-colors ${active ? "text-green-600" : "text-slate-400"}`}
                />
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-green-600" : "text-slate-400"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
