"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin, Calendar, Video, User, LogOut } from "lucide-react";
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
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl border-b border-white/20 shadow-xl shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <span className="text-white text-xl">⚽</span>
              </motion.div>
              <div>
                <span className={`text-xl font-bold ${scrolled ? "text-gray-900" : "text-white"}`}>
                  Play
                </span>
                <span className="text-xl font-bold text-yellow-400 ml-1">Ethiopia</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    scrolled
                      ? "text-gray-600 hover:text-green-600 hover:bg-green-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      scrolled
                        ? "text-gray-600 hover:text-green-600 hover:bg-green-50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <User size={16} />
                    {user?.full_name || "Dashboard"}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      scrolled
                        ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      scrolled
                        ? "text-gray-600 hover:text-green-600"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
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
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-gray-950/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-white text-2xl font-bold hover:text-green-400 transition-colors"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col gap-4"
              >
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="text-white text-xl font-medium text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-lg font-bold text-center"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
