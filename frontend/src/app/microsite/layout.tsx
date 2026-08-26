"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Clock,
  Building2,
  PhoneCall,
  KeyRound,
  CheckCircle2,
  DollarSign,
  Smartphone,
  ArrowRight,
  User
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const STADIUM_DATA = {
  name: "Bambis Meda Stadium",
  slug: "bambis-meda",
  city: "Bole, Addis Ababa",
  phone: "+251 911 445 678",
  openingHours: "Mon-Sun: 6:00 AM - 11:30 PM",
  isVerified: true,
};

const navLinks = [
  { href: "/microsite", label: "Overview" },
  { href: "/microsite#fields", label: "Pitches & Courts" },
  { href: "/microsite#highlights", label: "Match Replays" },
  { href: "/microsite#events", label: "Tournaments" },
  { href: "/microsite#location", label: "Location & Contact" },
];

export default function StandaloneMicrositeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Authentication Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<"player" | "owner">("player");
  const [phone, setPhone] = useState("0911234567");
  const [authLoading, setAuthLoading] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedField, setSelectedField] = useState("Pitch 1 — FIFA Artificial Turf (2,500 ETB/hr)");
  const [bookingDate, setBookingDate] = useState("2026-08-27");
  const [bookingTime, setBookingTime] = useState("18:00 - 19:00");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { setDemoUser } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setTimeout(() => {
      setDemoUser("player");
      setAuthLoading(false);
      setShowAuthModal(false);
    }, 400);
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setTimeout(() => {
      setDemoUser("owner");
      setAuthLoading(false);
      setShowAuthModal(false);
      router.push("/dashboard");
    }, 400);
  };

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#111] overflow-x-hidden flex flex-col justify-between">

      {/* ── SINGLE OFFICIAL STADIUM TOPBAR ── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-xl shadow-md border-b border-black/[0.08]" : "bg-white border-b border-black/[0.06]"
        }`}
      >
        <div className="max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* Stadium Identity */}
            <Link href="/microsite" className="flex items-center gap-3 flex-shrink-0 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ background: "#2d6a4f" }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black text-[#111]">
                    {STADIUM_DATA.name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0faf4] text-[#2d6a4f]">
                    <Shield size={9} /> Verified
                  </span>
                </div>
                <div className="text-[10px] text-[#7a7a7a] font-medium">
                  Official Stadium Site • Powered by ET Smart Fields
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#5a5a5a] hover:text-[#2d6a4f] hover:bg-[#f0faf4] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Right CTAs */}
            <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
              <a
                href={`tel:${STADIUM_DATA.phone}`}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] px-3.5 py-2 rounded-full bg-[#f0faf4] border border-[#2d6a4f]/20 hover:bg-[#2d6a4f] hover:text-white transition-all"
              >
                <Phone size={13} /> {STADIUM_DATA.phone}
              </a>

              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2.5 rounded-full text-xs font-bold border border-black/15 text-[#111] hover:bg-[#f4f3ef] transition-colors"
              >
                Sign In
              </button>

              <button
                onClick={() => setShowBookingModal(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
                style={{ background: "#2d6a4f" }}
              >
                <Calendar size={14} /> Book Pitch
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-[#111] hover:bg-[#f4f3ef]"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white border-b border-black/[0.08] shadow-2xl p-4 lg:hidden"
          >
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-xs font-bold text-[#111] hover:bg-[#f0faf4]"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-black/[0.06] flex gap-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="flex-1 py-3 rounded-full text-xs font-bold border border-black/15 text-[#111]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowBookingModal(true);
                  }}
                  className="flex-1 py-3 rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ background: "#2d6a4f" }}
                >
                  Book Pitch
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE BODY ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── SINGLE OFFICIAL FOOTER ── */}
      <footer className="bg-white border-t border-black/[0.06] py-12 text-xs text-[#7a7a7a]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                style={{ background: "#2d6a4f" }}
              >
                <Building2 size={20} />
              </div>
              <div className="text-left">
                <div className="font-black text-[#111] text-sm">{STADIUM_DATA.name}</div>
                <div className="text-[11px] text-[#7a7a7a]">
                  Bole Road, Near Medhanialem • Operating: {STADIUM_DATA.openingHours}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  setAuthRole("owner");
                  setShowAuthModal(true);
                }}
                className="text-[#2d6a4f] font-bold hover:underline"
              >
                Stadium Staff / Owner Login
              </button>
              <span>•</span>
              <a href={`tel:${STADIUM_DATA.phone}`} className="font-bold text-[#111]">
                Hotline: {STADIUM_DATA.phone}
              </a>
              <span>•</span>
              <Link href="/" className="hover:underline">
                ET Smart Fields Platform ↗
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── GLOBAL MODAL: PLAYER & STAFF LOGIN ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-black/[0.06]"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.06]">
                <div>
                  <h3 className="text-lg font-black text-[#111]">
                    {authRole === "player" ? "Player Match Portal" : "Stadium Staff Portal"}
                  </h3>
                  <p className="text-xs text-[#7a7a7a]">Bambis Meda Stadium Access</p>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-2 rounded-xl text-[#7a7a7a] hover:text-[#111] hover:bg-[#f4f3ef]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Role Switcher */}
              <div className="flex rounded-2xl bg-[#f4f3ef] p-1 mb-6">
                <button
                  onClick={() => setAuthRole("player")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authRole === "player" ? "bg-white text-[#111] shadow-sm" : "text-[#7a7a7a]"
                  }`}
                >
                  Player Access
                </button>
                <button
                  onClick={() => setAuthRole("owner")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authRole === "owner" ? "bg-white text-[#111] shadow-sm" : "text-[#7a7a7a]"
                  }`}
                >
                  Stadium Owner / Staff
                </button>
              </div>

              <form onSubmit={authRole === "player" ? handlePlayerLogin : handleOwnerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Ethiopian Mobile Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0911234567"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    {authRole === "player" ? "SMS Code / Password" : "Staff Passkey / PIN"}
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                    <input
                      type="password"
                      placeholder="123456"
                      defaultValue="123456"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{ background: "#2d6a4f" }}
                >
                  {authLoading
                    ? "Authenticating..."
                    : authRole === "player"
                    ? "Sign In to Match Highlights"
                    : "Access Owner Dashboard ↗"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── GLOBAL MODAL: PITCH RESERVATION ── */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-black/[0.06]"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.06]">
                <div>
                  <h3 className="text-lg font-black text-[#111]">Reserve Pitch at Bambis Meda</h3>
                  <p className="text-xs text-[#7a7a7a]">Instant Telebirr / CBE confirmation</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 rounded-xl text-[#7a7a7a] hover:text-[#111] hover:bg-[#f4f3ef]"
                >
                  <X size={18} />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto shadow-lg"
                    style={{ background: "#2d6a4f" }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-black text-[#111]">Booking Confirmed!</h4>
                  <p className="text-xs text-[#7a7a7a] max-w-xs mx-auto">
                    SMS receipt &amp; Telebirr reference sent to your mobile. See you on the pitch!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCompleteBooking} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Selected Pitch
                    </label>
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    >
                      <option value="Pitch 1 — FIFA Artificial Turf (2,500 ETB/hr)">Pitch 1 — FIFA Artificial Turf (2,500 ETB/hr)</option>
                      <option value="Pitch 2 — 7v7 Grass Pitch (1,800 ETB/hr)">Pitch 2 — 7v7 Grass Pitch (1,800 ETB/hr)</option>
                      <option value="Court 3 — Hardwood Indoor Arena (1,500 ETB/hr)">Court 3 — Hardwood Indoor Arena (1,500 ETB/hr)</option>
                      <option value="Court 4 — Outdoor Volleyball Sand (1,000 ETB/hr)">Court 4 — Outdoor Volleyball Sand (1,000 ETB/hr)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        Booking Date
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        Time Slot
                      </label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      >
                        <option value="16:00 - 17:00">16:00 - 17:00</option>
                        <option value="17:00 - 18:00">17:00 - 18:00</option>
                        <option value="18:00 - 19:00">18:00 - 19:00 (Floodlit)</option>
                        <option value="19:00 - 20:00">19:00 - 20:00 (Floodlit)</option>
                        <option value="20:00 - 21:00">20:00 - 21:00 (Floodlit)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f0faf4] border border-[#2d6a4f]/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#111]">Payment Method</div>
                      <div className="text-[11px] text-[#2d6a4f] flex items-center gap-1">
                        <Smartphone size={12} /> Instant Telebirr / CBE Birr
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#111]">
                      2,500 ETB
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    style={{ background: "#2d6a4f" }}
                  >
                    Confirm &amp; Pay via Telebirr <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
