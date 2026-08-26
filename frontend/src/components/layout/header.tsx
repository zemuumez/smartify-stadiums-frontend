"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide on dashboard, admin, and stadium official microsite routes (they have their own standalone navigation)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/microsite")
  ) {
    return null;
  }

  const isDarkHeroPage = pathname === "/" || pathname === "/stadiums";
  const isSolid = scrolled || !isDarkHeroPage;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/stadiums", label: "Venues" },
    { href: "/stadiums/live", label: "Live" },
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isSolid
            ? "bg-white/95 backdrop-blur-xl border-b border-black/[0.06] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="spotnow-container">
          <div className="flex items-center justify-between h-16 lg:h-[76px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/logo/et-smart-fields-icon.jpg"
                  alt="ET Smart Fields"
                  width={36}
                  height={36}
                  className="rounded-xl object-cover"
                  priority
                />
              </motion.div>
              <div className="hidden sm:flex items-baseline gap-0.5">
                <span
                  className={`text-[17px] font-black tracking-tight transition-colors ${
                    isSolid ? "text-[#111]" : "text-white"
                  }`}
                >
                  ET
                </span>
                <span
                  className={`text-[17px] font-black tracking-tight transition-colors ${
                    isSolid ? "text-[#2d6a4f]" : "text-[#74c69d]"
                  }`}
                >
                  Smart Fields
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isSolid
                      ? "text-[#3d3d3d] hover:text-[#2d6a4f] hover:bg-[#f0faf4]"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right — Partner CTA (No public admin login button) */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/about"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isSolid
                    ? "text-[#3d3d3d] hover:text-[#2d6a4f]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Partner With Us
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#1a4731] hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
                <span className="w-5 h-5 bg-white/15 rounded-full flex items-center justify-center">
                  <ArrowUpRight size={11} />
                </span>
              </Link>
            </div>

            {/* Mobile — hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl transition-all ${
                  isSolid
                    ? "text-[#111] hover:bg-[#f0faf4]"
                    : "text-white hover:bg-white/15"
                }`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl z-50"
            >
              {/* Drawer header */}
              <div className="flex items-center gap-3 px-5 h-16 border-b border-black/[0.06]">
                <Image
                  src="/logo/et-smart-fields-icon.jpg"
                  alt="ET Smart Fields"
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
                <div className="flex items-baseline gap-0.5">
                  <span className="text-base font-black text-[#111]">ET</span>
                  <span className="text-base font-black text-[#2d6a4f]">Smart Fields</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto p-2 text-[#7a7a7a] hover:text-[#111] rounded-lg hover:bg-[#f0faf4]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer links */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 rounded-2xl text-sm font-semibold text-[#3d3d3d] hover:text-[#2d6a4f] hover:bg-[#f0faf4] transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Drawer footer CTA */}
              <div className="p-4 border-t border-black/[0.06] space-y-2.5">
                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-sm font-bold text-white bg-[#2d6a4f] shadow-lg shadow-[#2d6a4f]/25 hover:bg-[#1a4731] transition-all"
                >
                  Get Started
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
