"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin, Calendar, Video, User, LogOut, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
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
                    scrolled ? "text-[#111]" : "text-white"
                  }`}
                >
                  ET
                </span>
                <span
                  className={`text-[17px] font-black tracking-tight transition-colors ${
                    scrolled ? "text-[#2d6a4f]" : "text-[#74c69d]"
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
                    scrolled
                      ? "text-[#3d3d3d] hover:text-[#2d6a4f] hover:bg-[#f0faf4]"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right — Auth + CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      scrolled
                        ? "text-[#3d3d3d] hover:text-[#2d6a4f] hover:bg-[#f0faf4]"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <User size={15} />
                    {user?.full_name?.split(" ")[0] || "Dashboard"}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className={`p-2 rounded-lg transition-all ${
                      scrolled
                        ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    aria-label="Logout"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      scrolled
                        ? "text-[#3d3d3d] hover:text-[#2d6a4f]"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-full text-sm font-bold shadow-lg shadow-[#2d6a4f]/30 hover:bg-[#1a4731] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Contact Us
                    <span className="w-5 h-5 bg-white/15 rounded-full flex items-center justify-center">
                      <ArrowUpRight size={11} />
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile — hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl transition-all ${
                  scrolled
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
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl flex flex-col"
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

              {/* Nav links */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-[0.9375rem] font-semibold text-[#3d3d3d] hover:bg-[#f0faf4] hover:text-[#2d6a4f] transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Drawer footer CTA */}
              <div className="p-4 border-t border-black/[0.06] space-y-2.5">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-sm font-bold text-white bg-[#2d6a4f] shadow-lg shadow-[#2d6a4f]/25"
                    >
                      <User size={15} />
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="w-full text-center px-4 py-2.5 rounded-full text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-all"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center px-4 py-3 rounded-full text-sm font-semibold text-[#3d3d3d] border border-black/[0.1] hover:bg-[#f0faf4] transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full text-sm font-bold text-white bg-[#2d6a4f] shadow-lg shadow-[#2d6a4f]/25 hover:bg-[#1a4731] transition-all"
                    >
                      Contact Us
                      <ArrowUpRight size={14} />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
