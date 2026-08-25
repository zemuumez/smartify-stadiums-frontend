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

  // Don't show on dashboard, admin, or official stadium microsites
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/microsite")
  ) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div
        className="safe-bottom"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[52px] rounded-xl transition-all"
              >
                {/* Active indicator dot */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-0.5 w-6 h-1 rounded-full"
                    style={{ background: "#2d6a4f" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Active background */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(45, 106, 79, 0.08)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon
                  size={20}
                  className={`relative z-10 transition-colors duration-200 ${
                    active ? "text-[#2d6a4f]" : "text-[#aaaaaa]"
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] font-semibold transition-colors duration-200 ${
                    active ? "text-[#2d6a4f]" : "text-[#aaaaaa]"
                  }`}
                >
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
