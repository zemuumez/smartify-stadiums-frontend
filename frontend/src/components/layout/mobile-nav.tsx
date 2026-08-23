"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Calendar, User, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/stadiums", label: "Find", icon: Search },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/auth/login", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Don't show on dashboard (has its own sidebar)
  if (pathname.startsWith("/dashboard")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-bottom">
      <div className="bg-gray-950/90 backdrop-blur-2xl border-t border-white/10">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const needsAuth = item.href === "/dashboard" && !isAuthenticated;

            return (
              <Link
                key={item.href}
                href={needsAuth ? "/auth/login" : item.href}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-[48px]"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-1 w-8 h-1 bg-green-500 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`transition-colors ${active ? "text-green-400" : "text-gray-500"}`}
                />
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-green-400" : "text-gray-500"}`}>
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
