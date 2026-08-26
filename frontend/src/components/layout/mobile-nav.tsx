"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Tv, Tag, Mail } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/stadiums", label: "Venues", icon: Search },
  { href: "/stadiums/live", label: "Live", icon: Tv },
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function MobileNav() {
  const pathname = usePathname();

  // Don't show on dashboard, admin, official stadium microsites, or registration wizard
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/microsite") ||
    pathname.startsWith("/auth/register")
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
          borderTop: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
              >
                <div className="relative">
                  <Icon
                    size={20}
                    className={`transition-all duration-300 ${
                      active
                        ? "text-[#2d6a4f] stroke-[2.5]"
                        : "text-[#8a8a8a] group-hover:text-[#111]"
                    }`}
                  />
                  {active && (
                    <motion.div
                      layoutId="activeTabDot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2d6a4f]"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${
                    active ? "text-[#2d6a4f]" : "text-[#8a8a8a]"
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
