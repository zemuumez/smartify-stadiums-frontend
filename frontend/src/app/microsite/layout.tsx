"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, Calendar, MapPin, Phone, ChevronRight } from "lucide-react";
import { useStadium } from "@/lib/sanity/hooks";

const DEMO_STADIUM = {
  name: "Bambis Meda Stadium",
  slug: "bambis-meda",
  city: "Bole, Addis Ababa",
  phone: "+251 911 445 678",
  primaryColor: "#2d6a4f",
};

const navLinks = [
  { href: "/microsite",          label: "Home" },
  { href: "/microsite/about",    label: "About" },
  { href: "/microsite/fields",   label: "Fields" },
  { href: "/microsite/matches",  label: "Matches" },
  { href: "/microsite/services", label: "Services" },
  { href: "/microsite/contact",  label: "Contact" },
];

export default function MicrositeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { stadium } = useStadium(DEMO_STADIUM.slug);

  const stadiumName = stadium?.name || DEMO_STADIUM.name;
  const stadiumCity = stadium?.city || DEMO_STADIUM.city;
  const primaryColor = stadium?.primaryColor || DEMO_STADIUM.primaryColor;
  const isVerified = stadium?.isVerified ?? true;
  const openingHours = stadium?.openingHours || "Mon–Sun: 6:00 AM – 10:00 PM";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/microsite" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── TOP INFO BAR ─────────────────────────── */}
      <div
        className="hidden md:block text-xs py-2"
        style={{ background: "#1a4731", color: "rgba(255,255,255,0.7)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin size={11} style={{ color: "#74c69d" }} />
              {stadiumCity}, Ethiopia
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={11} style={{ color: "#74c69d" }} />
              {DEMO_STADIUM.phone}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ color: "#74c69d" }}>⏰ {openingHours}</span>
            {isVerified && (
              <span className="flex items-center gap-1 font-semibold" style={{ color: "#74c69d" }}>
                <Shield size={11} /> ULS Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY HEADER ───────────────────────── */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.97)" : "white",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
          borderBottom: `1px solid ${scrolled ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.07)"}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px] gap-6">

            {/* Logo */}
            <Link href="/microsite" className="flex items-center gap-3 flex-shrink-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ background: `linear-gradient(135deg, #1a4731, ${primaryColor})` }}
              >
                🏟️
              </div>
              <div>
                <div className="font-black text-[#111] text-base leading-tight">{stadiumName}</div>
                <div className="text-[10px] text-[#aaa] font-medium flex items-center gap-1">
                  {isVerified && <Shield size={9} style={{ color: primaryColor }} />}
                  Powered by ET Smart Fields
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={
                    isActive(link.href)
                      ? { background: "#f0faf4", color: primaryColor }
                      : { color: "#5a5a5a" }
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <Link
                href="/microsite/contact"
                className="text-sm font-semibold transition-colors"
                style={{ color: primaryColor }}
              >
                +{DEMO_STADIUM.phone.replace("+", "")}
              </Link>
              <Link
                href="/bookings/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: primaryColor, boxShadow: "0 4px 12px rgba(45,106,79,0.3)" }}
              >
                <Calendar size={14} />
                Book Now
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl"
              style={{ color: "#111" }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE NAV ──────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[105px] left-0 right-0 z-40 md:hidden"
            style={{
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <nav className="py-3 px-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold"
                  style={
                    isActive(link.href)
                      ? { background: "#f0faf4", color: primaryColor }
                      : { color: "#5a5a5a" }
                  }
                >
                  {link.label}
                  <ChevronRight size={14} className="opacity-40" />
                </Link>
              ))}
              <Link
                href="/bookings/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold text-sm mt-2"
                style={{ background: primaryColor }}
              >
                <Calendar size={16} /> Book a Field
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE CONTENT ─────────────────────────── */}
      <main>{children}</main>

      {/* ── MICROSITE FOOTER ─────────────────────── */}
      <footer style={{ background: "#0d2b1d" }}>
        {/* Top CTA Strip */}
        <div
          className="py-10 text-center"
          style={{ background: "linear-gradient(135deg, #1a4731, #2d6a4f)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-white/70 text-sm mb-3">Reserve your field in under 2 minutes</p>
          <h3 className="text-white font-black text-2xl mb-6">Ready to Play at {stadiumName}?</h3>
          <Link
            href="/bookings/new"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "white", color: primaryColor }}
          >
            <Calendar size={15} />
            Book a Field Now
          </Link>
        </div>

        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  🏟️
                </div>
                <div>
                  <div className="text-white font-black text-base leading-tight">{stadiumName}</div>
                  {isVerified && (
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: "#74c69d" }}>
                      <Shield size={9} /> ULS Verified
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Ethiopia&apos;s premier smart sports facility in the heart of {stadiumCity}.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "11px" }}>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-bold text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "11px" }}>
                Opening Hours
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <li>Monday – Friday</li>
                <li className="font-semibold text-white">6:00 AM – 10:00 PM</li>
                <li className="mt-2">Saturday – Sunday</li>
                <li className="font-semibold text-white">6:00 AM – 10:00 PM</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "11px" }}>
                Contact
              </h4>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <li className="flex items-start gap-2">
                  <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#74c69d" }} />
                  {stadiumCity}, Ethiopia
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} style={{ color: "#74c69d" }} />
                  {DEMO_STADIUM.phone}
                </li>
              </ul>
              <Link
                href="/bookings/new"
                className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "#2d6a4f", color: "white" }}
              >
                <Calendar size={13} /> Book Now
              </Link>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © 2026 {stadiumName}. All rights reserved.
            </p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Powered by{" "}
              <Link href="/" className="font-bold transition-colors hover:text-white" style={{ color: "#74c69d" }}>
                ET Smart Fields
              </Link>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
