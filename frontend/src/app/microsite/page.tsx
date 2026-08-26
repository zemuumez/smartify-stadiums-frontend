"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Star,
  Play,
  ArrowRight,
  Shield,
  MapPin,
  Users,
  Camera,
  Trophy,
  Lightbulb,
  Phone,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  X,
  Smartphone,
  Award,
  Video,
  Download,
  KeyRound,
  LogOut,
  User,
  Check
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function StadiumMicrositePage() {
  const fields = [
    { id: 1, name: "Pitch 1 — FIFA Artificial Turf (11v11)", sport: "Football", surface: "Turf", size: "11v11 / 7v7", price: "2,500", numPrice: 2500, lighting: true, camera: true, changing: true },
    { id: 2, name: "Pitch 2 — 7v7 Natural Grass Ground", sport: "Football", surface: "Natural Grass", size: "7v7", price: "1,800", numPrice: 1800, lighting: true, camera: true, changing: true },
    { id: 3, name: "Court 3 — Hardwood Indoor Arena", sport: "Basketball / Futsal", surface: "Hardwood", size: "5v5", price: "1,500", numPrice: 1500, lighting: true, camera: true, changing: true },
    { id: 4, name: "Court 4 — Outdoor Volleyball Sand Pitch", sport: "Volleyball", surface: "Sand / Synthetic", size: "6v6", price: "1,000", numPrice: 1000, lighting: true, camera: false, changing: false },
  ];

  const matchHighlights = [
    { id: "h1", title: "Bole Derby: Volley of the Month", teams: "Bole Lions vs Arada FC", time: "Aug 22, 2026", views: 2420, dur: "1:45" },
    { id: "h2", title: "Weekend 7v7 Cup: Double Penalty Save", teams: "Unity Stars vs St. George Youth", time: "Aug 20, 2026", views: 1890, dur: "2:10" },
    { id: "h3", title: "Sunday League: Backheel Goal", teams: "Addis United vs Meskel Warriors", time: "Aug 18, 2026", views: 3120, dur: "1:15" },
  ];

  const events = [
    { id: "e1", title: "Bole Corporate League Final", date: "Sep 6, 2026", time: "8:00 AM", sport: "Football", spots: 4 },
    { id: "e2", title: "Addis 3v3 Weekend Basketball Cup", date: "Sep 13, 2026", time: "10:00 AM", sport: "Basketball", spots: 6 },
    { id: "e3", title: "Youth Development Futsal Championship", date: "Sep 20, 2026", time: "7:30 AM", sport: "Futsal", spots: 8 },
  ];

  // ── Booking State ──
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedField, setSelectedField] = useState(fields[0]);
  const [bookingDate, setBookingDate] = useState("2026-08-27");
  const [bookingTime, setBookingTime] = useState("18:00 - 19:00");
  const [customerPhone, setCustomerPhone] = useState("0911234567");
  const [addReferee, setAddReferee] = useState(false);
  const [addCamera, setAddCamera] = useState(true);
  const [bookingStep, setBookingStep] = useState<"form" | "confirmed">("form");
  const [bookingLoading, setBookingLoading] = useState(false);

  // ── Player Hub State ──
  const [showPlayerPortal, setShowPlayerPortal] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const { user, isAuthenticated, setDemoUser, logout } = useAuthStore();

  const handleOpenBooking = (field?: any) => {
    if (field) setSelectedField(field);
    setBookingStep("form");
    setShowBookingModal(true);
  };

  const calculateTotal = () => {
    let total = selectedField.numPrice;
    if (addReferee) total += 300;
    if (addCamera && !selectedField.camera) total += 200;
    return total;
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      setBookingStep("confirmed");
    }, 600);
  };

  const quickDates = [
    { label: "Today", val: "2026-08-26" },
    { label: "Tomorrow", val: "2026-08-27" },
    { label: "Friday", val: "2026-08-28" },
    { label: "Saturday", val: "2026-08-29" },
  ];

  const timeSlots = [
    { label: "06:00 - 08:00", category: "Morning" },
    { label: "08:00 - 10:00", category: "Morning" },
    { label: "16:00 - 17:00", category: "Afternoon" },
    { label: "17:00 - 18:00", category: "Afternoon" },
    { label: "18:00 - 19:00", category: "Night (Floodlit)" },
    { label: "19:00 - 20:00", category: "Night (Floodlit)" },
    { label: "20:00 - 21:00", category: "Night (Floodlit)" },
  ];

  return (
    <div>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/venue-card-1.jpg"
            alt="Bambis Meda Stadium"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12 py-20 w-full text-white">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#2d6a4f] text-white shadow-sm">
                <Shield size={12} /> ULS Certified Facility
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <Star size={12} className="text-amber-400 fill-amber-400" /> 4.9 Rating (380+ Reviews)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <MapPin size={12} className="text-[#74c69d]" /> Bole, Addis Ababa
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-4">
              Bambis Meda <br />
              <span className="text-[#74c69d]">Sports Ground</span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-xl font-medium">
              Addis Ababa&apos;s premier multi-sport arena featuring FIFA-certified turf, 24/7 night floodlighting, autonomous 4K Veo live match recording, and instant Telebirr bookings.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenBooking(fields[0])}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all"
                style={{ background: "#2d6a4f" }}
              >
                <Calendar size={16} /> Reserve a Pitch
              </button>

              <a
                href="#fields"
                className="px-6 py-4 rounded-full text-white font-bold text-sm bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 transition-all"
              >
                Explore All 4 Pitches ↗
              </a>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 mt-12 border-t border-white/15">
              <div>
                <div className="text-3xl font-black text-white">1,247</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">Total Bookings</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#74c69d]">4 Pitches</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">Multi-Sport Courts</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">3,200+</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">Active Players</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#74c69d]">4K Veo Live</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">Autonomous Stream</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION: AVAILABLE PITCHES & COURTS ── */}
      <section id="fields" className="py-20 max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
              Field Selection
            </div>
            <h2 className="text-3xl font-black text-[#111] tracking-tight">
              Operational Pitches &amp; Courts
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7a7a7a] max-w-md">
            All fields include free access to locker rooms, fresh water stations, and automated match recording.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fields.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.05] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f0faf4] text-[#2d6a4f]">
                    {f.sport}
                  </span>
                  <span className="text-xs font-bold text-[#7a7a7a]">{f.size}</span>
                </div>

                <h3 className="text-base font-black text-[#111] mb-2">{f.name}</h3>
                <div className="text-2xl font-black text-[#111] mb-4">
                  {f.price} ETB <span className="text-xs font-normal text-[#7a7a7a]">/ hour</span>
                </div>

                <div className="space-y-2 pb-6 border-b border-black/[0.06] text-xs text-[#5a5a5a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#2d6a4f]" /> Surface: {f.surface}
                  </div>
                  {f.lighting && (
                    <div className="flex items-center gap-2">
                      <Lightbulb size={13} className="text-amber-600" /> Night Game Floodlights
                    </div>
                  )}
                  {f.camera && (
                    <div className="flex items-center gap-2">
                      <Camera size={13} className="text-[#2d6a4f]" /> 4K AI Camera Recording
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBooking(f)}
                className="w-full mt-6 py-3 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                style={{ background: "#2d6a4f" }}
              >
                <Calendar size={14} /> Book This Pitch
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: AI MATCH REPLAY HIGHLIGHTS ── */}
      <section id="highlights" className="py-20 bg-white border-y border-black/[0.06]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
                Autonomous 4K Broadcasting
              </div>
              <h2 className="text-3xl font-black text-[#111] tracking-tight">
                Recent Match Highlights &amp; Goals
              </h2>
            </div>
            <button
              onClick={() => setShowPlayerPortal(true)}
              className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
            >
              Sign In to View Your Match Video <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matchHighlights.map((m) => (
              <div
                key={m.id}
                className="bg-[#f4f3ef] rounded-3xl p-6 border border-black/[0.05] hover:bg-[#eae8e1] transition-colors group cursor-pointer"
                onClick={() => {
                  setActiveVideo(m);
                  setShowPlayerPortal(true);
                }}
              >
                <div className="relative aspect-video rounded-2xl bg-black/10 overflow-hidden mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={20} className="ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold">
                    {m.dur}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#2d6a4f] text-white text-[9px] font-bold uppercase tracking-wider">
                    4K Replay
                  </span>
                </div>

                <h3 className="font-black text-sm text-[#111] mb-1">{m.title}</h3>
                <div className="text-xs text-[#7a7a7a] flex items-center justify-between">
                  <span>{m.teams}</span>
                  <span>{m.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: TOURNAMENTS & EVENTS ── */}
      <section id="events" className="py-20 max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
              Community Leagues
            </div>
            <h2 className="text-3xl font-black text-[#111] tracking-tight">
              Upcoming Tournaments &amp; Events
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7a7a7a]">
            Register your team or corporate group for organized weekend cups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f] mb-4">
                  <Trophy size={20} />
                </div>
                <div className="text-xs font-bold text-[#2d6a4f] uppercase mb-1">{ev.sport}</div>
                <h3 className="font-black text-base text-[#111] mb-2">{ev.title}</h3>
                <div className="text-xs text-[#7a7a7a] mb-6">
                  📅 {ev.date} • ⏰ {ev.time} • 👥 {ev.spots} team spots open
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBooking(fields[0])}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f] hover:bg-[#2d6a4f] hover:text-white transition-all text-center"
              >
                Register Team
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: LOCATION & CONTACT ── */}
      <section id="location" className="py-20 bg-white border-t border-black/[0.06]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
                Directions &amp; Hours
              </div>
              <h2 className="text-3xl font-black text-[#111] tracking-tight mb-4">
                Visit Bambis Meda Stadium
              </h2>
              <p className="text-sm text-[#7a7a7a] leading-relaxed mb-6">
                Located conveniently on Bole Road, 5 minutes from Edna Mall. Secure on-site parking and 24/7 security on premises.
              </p>

              <div className="space-y-3 text-xs font-semibold text-[#111] mb-8">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f4f3ef]">
                  <MapPin size={16} className="text-[#2d6a4f]" />
                  <span>Bole Road, Near Medhanialem Cathedral, Addis Ababa</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f4f3ef]">
                  <Clock size={16} className="text-[#2d6a4f]" />
                  <span>Open Daily: Monday – Sunday (06:00 AM – 11:30 PM)</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f4f3ef]">
                  <Phone size={16} className="text-[#2d6a4f]" />
                  <span>Direct Hotline: +251 911 445 678 / +251 911 234 567</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBooking(fields[0])}
                className="px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                style={{ background: "#2d6a4f" }}
              >
                Book Your Slot Now
              </button>
            </div>

            {/* Stadium Badge Card */}
            <div
              className="rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between"
              style={{ background: "#1a4731" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#74c69d] animate-pulse" />
                  <span className="text-xs font-bold text-[#74c69d] uppercase">Instant Telebirr Confirmation</span>
                </div>
                <h3 className="text-2xl font-black mb-3">Player Self-Service Portal</h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-6">
                  Are you a player looking to download your match recording or view previous tournament match statistics?
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPlayerPortal(true)}
                className="py-3.5 px-6 rounded-full bg-white text-[#111] font-black text-xs hover:bg-[#f4f3ef] transition-colors text-center"
              >
                Access Player Highlights Portal ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL 1: INTERACTIVE PITCH BOOKING FLOW ── */}
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
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/[0.06] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.06]">
                <div>
                  <h3 className="text-lg font-black text-[#111]">Reserve Pitch at Bambis Meda</h3>
                  <p className="text-xs text-[#7a7a7a]">Instant SMS confirmation &amp; Telebirr sync</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 rounded-xl text-[#7a7a7a] hover:text-[#111] hover:bg-[#f4f3ef]"
                >
                  <X size={18} />
                </button>
              </div>

              {bookingStep === "confirmed" ? (
                <div className="py-6 text-center space-y-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto shadow-lg"
                    style={{ background: "#2d6a4f" }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#111]">Booking Confirmed!</h4>
                    <p className="text-xs text-[#7a7a7a] max-w-xs mx-auto mt-1">
                      Your slot has been reserved at Bambis Meda Stadium. Telebirr transaction reference sent to {customerPhone}.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f4f3ef] text-left text-xs space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-[#7a7a7a]">Selected Pitch:</span>
                      <span className="font-bold text-[#111]">{selectedField.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7a7a7a]">Date &amp; Time:</span>
                      <span className="font-bold text-[#111]">{bookingDate} • {bookingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7a7a7a]">Total Paid:</span>
                      <span className="font-bold text-[#2d6a4f]">{calculateTotal()} ETB</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="w-full py-3.5 rounded-full text-white font-bold text-xs shadow-md"
                    style={{ background: "#2d6a4f" }}
                  >
                    Done &amp; Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {/* Pitch Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-2">
                      1. Select Pitch / Court
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {fields.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedField(f)}
                          className={`p-3 rounded-2xl text-left border transition-all ${
                            selectedField.id === f.id
                              ? "border-[#2d6a4f] bg-[#f0faf4] shadow-sm ring-1 ring-[#2d6a4f]"
                              : "border-black/10 bg-white hover:border-black/20"
                          }`}
                        >
                          <div className="text-xs font-black text-[#111] truncate">{f.name}</div>
                          <div className="text-[11px] font-bold text-[#2d6a4f] mt-0.5">{f.price} ETB/hr</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-2">
                      2. Choose Match Date
                    </label>
                    <div className="flex gap-2 mb-2">
                      {quickDates.map((q) => (
                        <button
                          key={q.val}
                          type="button"
                          onClick={() => setBookingDate(q.val)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            bookingDate === q.val
                              ? "bg-[#2d6a4f] text-white shadow-sm"
                              : "bg-[#f4f3ef] text-[#5a5a5a] hover:text-[#111]"
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-2">
                      3. Select Time Slot
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.label}
                          type="button"
                          onClick={() => setBookingTime(slot.label)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            bookingTime === slot.label
                              ? "border-[#2d6a4f] bg-[#f0faf4] text-[#2d6a4f] font-black shadow-sm"
                              : "border-black/10 bg-[#f4f3ef] text-[#5a5a5a] text-xs font-semibold"
                          }`}
                        >
                          <div className="text-xs font-bold">{slot.label}</div>
                          <div className="text-[9px] opacity-70">{slot.category}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-2">
                      4. Optional Match Extras
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 rounded-2xl bg-[#f4f3ef] border border-black/[0.06] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={addReferee}
                            onChange={(e) => setAddReferee(e.target.checked)}
                            className="rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                          />
                          <span className="text-xs font-bold text-[#111]">Request Certified Referee</span>
                        </div>
                        <span className="text-xs font-bold text-[#2d6a4f]">+300 ETB</span>
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-2xl bg-[#f4f3ef] border border-black/[0.06] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={addCamera}
                            onChange={(e) => setAddCamera(e.target.checked)}
                            className="rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                          />
                          <span className="text-xs font-bold text-[#111]">4K Veo AI Video Recording</span>
                        </div>
                        <span className="text-xs font-bold text-[#2d6a4f]">{selectedField.camera ? "Included Free" : "+200 ETB"}</span>
                      </label>
                    </div>
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      5. Player Mobile Number (for Telebirr SMS)
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0911234567"
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  {/* Pricing Summary & Submit */}
                  <div className="p-4 rounded-2xl bg-[#f0faf4] border border-[#2d6a4f]/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#111]">Total Amount</div>
                      <div className="text-[11px] text-[#2d6a4f] flex items-center gap-1">
                        <Smartphone size={12} /> Instant Telebirr / CBE Birr
                      </div>
                    </div>
                    <div className="text-2xl font-black text-[#111]">
                      {calculateTotal()} ETB
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    style={{ background: "#2d6a4f" }}
                  >
                    {bookingLoading ? "Processing Booking..." : "Confirm & Pay via Telebirr"} <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: PLAYER HIGHLIGHTS & MATCH PORTAL ── */}
      <AnimatePresence>
        {showPlayerPortal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlayerPortal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/[0.06] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-sm"
                    style={{ background: "#2d6a4f" }}
                  >
                    A
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#111]">Player Highlights Portal</h3>
                    <p className="text-xs text-[#2d6a4f] font-semibold">Bambis Meda Stadium Replays</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlayerPortal(false)}
                  className="p-2 rounded-xl text-[#7a7a7a] hover:text-[#111] hover:bg-[#f4f3ef]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Active Bookings Banner */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold text-[#111] uppercase tracking-wider">Your Active Booking</h4>
                <div className="p-4 rounded-2xl bg-[#f0faf4] border border-[#2d6a4f]/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-[#111]">Pitch 1 — FIFA Artificial Turf</div>
                    <div className="text-[11px] text-[#2d6a4f]">Friday, Aug 28 • 18:00 - 19:00 (Floodlit)</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-[#2d6a4f] bg-white shadow-sm">
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Video Replay Clips */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#111] uppercase tracking-wider">Your 4K Match Videos</h4>
                  <span className="text-[10px] font-bold text-[#2d6a4f]">Auto-Recorded by Veo Cam 3</span>
                </div>

                {[
                  { title: "Bole Lions vs Arada FC (Full Match)", date: "Aug 22, 2026", dur: "62 mins", score: "4 - 2 Win" },
                  { title: "Bole Lions vs Unity Stars (Cup Semi)", date: "Aug 15, 2026", dur: "58 mins", score: "3 - 1 Win" },
                ].map((clip, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-[#f4f3ef] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#2d6a4f] text-white">
                        <Play size={16} className="ml-0.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111]">{clip.title}</div>
                        <div className="text-[10px] text-[#7a7a7a]">{clip.date} • {clip.dur} • <span className="text-[#2d6a4f] font-bold">{clip.score}</span></div>
                      </div>
                    </div>
                    <button className="p-2 text-[#2d6a4f] hover:bg-white rounded-xl transition-colors" title="Download 4K Clip">
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                <button
                  onClick={() => setShowPlayerPortal(false)}
                  className="text-xs font-bold text-[#7a7a7a] hover:text-[#111]"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setShowPlayerPortal(false);
                    handleOpenBooking(fields[0]);
                  }}
                  className="px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-sm"
                  style={{ background: "#2d6a4f" }}
                >
                  Book New Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
