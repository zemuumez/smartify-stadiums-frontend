"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin, Calendar, Video, User, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/stadiums", label: "Find Stadiums", icon: <MapPin size={16} /> },
    { href: "/bookings", label: "My Bookings", icon: <Calendar size={16} /> },
    { href: "/stadiums/live", label: "Live Matches", icon: <Video size={16} /> },
    { href: "/about", label: "About", icon: null },
    { href: "/pricing", label: "Pricing", icon: null },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-900/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20"
              >
                <span className="text-white text-lg">⚽</span>
              </motion.div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-slate-900">ET</span>
                <span className="text-lg font-bold text-green-600 ml-0.5">Smart Fields</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-green-600 hover:bg-green-50 transition-all"
                  >
                    <User size={16} />
                    {user?.full_name || "Dashboard"}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-green-600 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
                <span className="text-lg font-bold text-slate-900">Menu</span>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-600 transition-all"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/25"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
