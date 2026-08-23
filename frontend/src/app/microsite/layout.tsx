"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Info, Phone, Wrench, Grid3X3, Play, Shield, MapPin, Calendar } from "lucide-react";
import { useStadium } from "@/lib/sanity/hooks";

const DEMO_STADIUM = {
  name: "Bambis Meda Stadium",
  slug: "bambis-meda",
  city: "Addis Ababa",
  primary_color: "#16a34a",
};

export default function MicrositeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { stadium } = useStadium(DEMO_STADIUM.slug);

  // Use CMS data if available, fallback to demo
  const stadiumName = stadium?.name || DEMO_STADIUM.name;
  const stadiumCity = stadium?.city || DEMO_STADIUM.city;
  const primaryColor = stadium?.primaryColor || DEMO_STADIUM.primary_color;
  const isVerified = stadium?.isVerified ?? true;
  const openingHours = stadium?.openingHours || "Mon-Sun: 6:00 AM - 10:00 PM";

  const navLinks = [
    { href: "/microsite", label: "Home", icon: <Home size={18} /> },
    { href: "/microsite/about", label: "About", icon: <Info size={18} /> },
    { href: "/microsite/fields", label: "Fields", icon: <Grid3X3 size={18} /> },
    { href: "/microsite/matches", label: "Matches", icon: <Play size={18} /> },
    { href: "/microsite/services", label: "Services", icon: <Wrench size={18} /> },
    { href: "/microsite/contact", label: "Contact", icon: <Phone size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Microsite Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/microsite" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: primaryColor }}>
                🏟️
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">{stadiumName}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  {isVerified && <Shield size={10} className="text-green-600" />}
                  Powered by ET Smart Fields
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "bg-green-50 text-green-700"
                      : "text-slate-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/bookings/new" className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">
                Book Now
              </Link>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-700">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-16 left-0 right-0 bg-white border-b border-slate-100 z-40 md:hidden shadow-lg">
            <nav className="py-2 px-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === link.href ? "bg-green-50 text-green-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  {link.icon}{link.label}
                </Link>
              ))}
              <Link href="/bookings/new" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 mt-2 bg-green-600 text-white rounded-xl text-sm font-bold">Book Now</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-16">{children}</main>

      {/* Microsite Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">{stadiumName}</h3>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={12} /> {stadiumCity}, Ethiopia</p>
              {isVerified && <p className="text-slate-400 text-sm mt-1 flex items-center gap-1"><Shield size={12} className="text-green-400" /> ULS Verified Stadium</p>}
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-slate-400">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {navLinks.map((link) => (
                  <li key={link.href}><Link href={link.href} className="hover:text-green-400 transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-slate-400">Opening Hours</h4>
              <p className="text-sm text-slate-300">{openingHours}</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wider text-slate-400">Book a Field</h4>
              <p className="text-sm text-slate-300 mb-3">Available 7 days a week. Telebirr, Chapa, and cash accepted.</p>
              <Link href="/bookings/new" className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                Book Now
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2026 {stadiumName}. All rights reserved.</p>
            <p className="text-sm text-slate-500 flex items-center gap-1">Powered by <span className="text-green-400 font-bold">ET Smart Fields</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
