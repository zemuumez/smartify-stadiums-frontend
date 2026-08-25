"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar, Star, Play, ArrowRight, Shield, MapPin,
  Users, Zap, Camera, Video, Award, CheckCircle2,
  Wifi, User
} from "lucide-react";
import { useStadium, useEvents, useHighlights, useTestimonials } from "@/lib/sanity/hooks";
import { FadeUp, SlideIn, ScaleIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const DEMO_ID = "demo-stadium-1";

/* ── Demo data (shown when CMS is empty) ─ */
const demoEvents = [
  {
    _id: "e1", title: "Bole Premier League — Season 4",
    startDate: "Sep 6, 2026", time: "8:00 AM", spotsLeft: 8,
    sport: "⚽ Football", desc: "A 16-team round-robin league played every Saturday morning.",
  },
  {
    _id: "e2", title: "3v3 Basketball Weekend Cup",
    startDate: "Sep 13, 2026", time: "10:00 AM", spotsLeft: 6,
    sport: "🏀 Basketball", desc: "Weekend knockout tournament on our newly surfaced outdoor court.",
  },
  {
    _id: "e3", title: "Ramadan Futsal Championship",
    startDate: "Sep 20, 2026", time: "7:30 AM", spotsLeft: 12,
    sport: "⚽ Futsal", desc: "Annual community futsal cup — open to all registered teams.",
  },
];

const demoHighlights = [
  { _id: "h1", title: "Goal of the Month", player: "Yonas Tesfaye", desc: "A stunning 30-meter volley from Field 2.", votes: 142 },
  { _id: "h2", title: "Best Save",         player: "Dawit Alemu",   desc: "Two consecutive penalty saves in the Cup Final.", votes: 98 },
  { _id: "h3", title: "Skill of the Week", player: "Mekdes Girma",  desc: "A silky backheel assist in the Raya League.", votes: 74 },
];

const demoTestimonials = [
  { _id: "t1", name: "Abebe Kebede",  role: "Team Captain",    rating: 5, text: "We play here every Friday. The AI replay system is incredible — our whole team watches the match highlights the same evening." },
  { _id: "t2", name: "Fatima Hassan", role: "Basketball Coach", rating: 5, text: "The court quality is excellent and the online booking means I never have to call ahead. Instant confirmation every time." },
  { _id: "t3", name: "Daniel Tadesse", role: "Weekend Player",  rating: 5, text: "Best futsal facility in Addis. Great lights, clean changing rooms, and the referee booking feature is a game-changer." },
];

const fields = [
  { id: 1, name: "Field 1 — Artificial Turf", sport: "Football", surface: "Artificial Turf", size: "7v7", price: "1,200", lighting: true, camera: true, changing: true },
  { id: 2, name: "Field 2 — 5-a-Side",        sport: "Futsal",   surface: "Hardwood",        size: "5v5", price: "800",   lighting: true, camera: true, changing: true },
  { id: 3, name: "Basketball Court",           sport: "Basketball", surface: "Hardwood",      size: "5v5", price: "600",  lighting: true, camera: false, changing: false },
  { id: 4, name: "Volleyball Court",           sport: "Volleyball", surface: "Artificial",    size: "6v6", price: "500",  lighting: false, camera: false, changing: false },
];

export default function MicrositeHome() {
  const [activeTab, setActiveTab] = useState(0);
  const { stadium } = useStadium("bambis-meda");
  const { events }       = useEvents(stadium?._id || DEMO_ID);
  const { highlights }   = useHighlights(stadium?._id || DEMO_ID);
  const { testimonials } = useTestimonials(stadium?._id || DEMO_ID);

  const stadiumName   = stadium?.name || "Bambis Meda Stadium";
  const stadiumCity   = stadium?.city || "Bole, Addis Ababa";
  const stadiumRating = stadium?.rating || 4.9;
  const totalBookings = stadium?.totalBookings || 1247;
  const fieldsCount   = stadium?.fields?.length || 4;
  const isVerified    = stadium?.isVerified ?? true;

  const displayEvents       = events.length > 0       ? events       : demoEvents;
  const displayHighlights   = highlights.length > 0   ? highlights   : demoHighlights;
  const displayTestimonials = testimonials.length > 0 ? testimonials : demoTestimonials;

  return (
    <div>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
          ══════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/venue-card-1.jpg"
            alt={`${stadiumName} aerial view`}
            fill className="object-cover object-center" priority quality={85}
          />
          <div className="absolute inset-0 photo-overlay-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {isVerified && (
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "rgba(45,106,79,0.85)", color: "white", backdropFilter: "blur(8px)" }}
                  >
                    <Shield size={11} /> ULS Verified
                  </span>
                )}
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(0,0,0,0.4)", color: "white", backdropFilter: "blur(8px)" }}
                >
                  <Star size={11} fill="currentColor" style={{ color: "#f59e0b" }} />
                  {stadiumRating} Rating
                </span>
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(0,0,0,0.4)", color: "white", backdropFilter: "blur(8px)" }}
                >
                  📍 {stadiumCity}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-white font-black leading-[1.02] mb-5"
                style={{ fontSize: "clamp(2.6rem, 6vw, 4rem)", letterSpacing: "-0.025em" }}
              >
                {stadiumName.split(" ")[0]}
                <br />
                <span style={{ color: "#74c69d" }}>{stadiumName.split(" ").slice(1).join(" ")}</span>
              </h1>
              <p className="text-white/75 text-lg leading-relaxed mb-10 max-w-md">
                {fieldsCount} premium fields · AI camera systems · Instant booking via Telebirr — all in one place.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/bookings/new"
                  className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: "#2d6a4f", boxShadow: "0 4px 20px rgba(45,106,79,0.45)" }}
                >
                  <Calendar size={16} /> Book a Field
                </Link>
                <Link
                  href="/microsite/fields"
                  className="flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm transition-all border"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}
                >
                  View All Fields <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-14 flex flex-wrap gap-8"
            >
              {[
                { value: totalBookings.toLocaleString(), label: "Total Bookings" },
                { value: `${fieldsCount}`,                label: "Fields" },
                { value: "3,200+",                        label: "Players" },
                { value: "24/7",                          label: "Camera Live" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-white/55 mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — EVENTS & TOURNAMENTS
          ══════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Upcoming</div>
              <h2 className="heading-xl">Events &amp; Tournaments</h2>
            </div>
            <Link href="/microsite/services" className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#2d6a4f" }}>
              All Events <ArrowRight size={14} />
            </Link>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {displayEvents.map((event) => (
              <StaggerItem key={event._id}>
                <div className="photo-card p-7 h-full flex flex-col">
                  <div className="text-2xl mb-4">🏆</div>
                  <div className="text-xs font-bold text-[#2d6a4f] mb-1 uppercase tracking-wide">
                    {(event as any).sport || "Football"}
                  </div>
                  <h3 className="font-black text-[#111] text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-[#7a7a7a] leading-relaxed mb-4 flex-1">
                    {(event as any).desc || "Open to all registered teams."}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-[#111] font-semibold">{(event as any).startDate}</div>
                      <div className="text-[#7a7a7a] text-xs">{(event as any).time} · {(event as any).spotsLeft} spots left</div>
                    </div>
                    <Link
                      href="/bookings/new"
                      className="flex items-center gap-1.5 font-bold text-sm px-4 py-2 rounded-full"
                      style={{ background: "#f0faf4", color: "#2d6a4f" }}
                    >
                      Register <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — OUR FIELDS PREVIEW
          ══════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Available</div>
              <h2 className="heading-xl">Our Fields</h2>
            </div>
            <Link href="/microsite/fields" className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#2d6a4f" }}>
              View All Fields <ArrowRight size={14} />
            </Link>
          </FadeUp>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {fields.map((f) => (
              <StaggerItem key={f.id}>
                <div className="photo-card p-6 h-full flex flex-col">
                  {/* Sport + size */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "#f0faf4", color: "#2d6a4f" }}
                    >
                      {f.sport}
                    </span>
                    <span className="text-xs text-[#aaa] font-semibold">{f.size}</span>
                  </div>

                  <h3 className="font-black text-[#111] mb-1 text-base">{f.name}</h3>
                  <p className="text-xs text-[#7a7a7a] mb-4">{f.surface}</p>

                  {/* Amenity icons */}
                  <div className="flex gap-3 mb-5 flex-1">
                    {f.lighting  && <span title="Lighting"       className="text-lg">💡</span>}
                    {f.camera    && <span title="AI Camera"      className="text-lg">📹</span>}
                    {f.changing  && <span title="Changing Room"  className="text-lg">🚿</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-[#111]">{f.price}</span>
                      <span className="text-xs text-[#7a7a7a] ml-1">ETB/hr</span>
                    </div>
                    <Link
                      href="/bookings/new"
                      className="text-xs font-bold px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
                      style={{ background: "#2d6a4f" }}
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — AI CAMERA HIGHLIGHTS
          ══════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">AI Camera</div>
            <h2 className="heading-xl">Match Highlights</h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {displayHighlights.map((h) => (
              <StaggerItem key={h._id}>
                <div className="photo-card overflow-hidden group cursor-pointer">
                  {/* Video thumbnail */}
                  <div
                    className="aspect-video flex items-center justify-center relative"
                    style={{ background: "linear-gradient(135deg, #0d2b1d 0%, #1a4731 100%)" }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/30 transition-transform group-hover:scale-110"
                      style={{ background: "rgba(45,106,79,0.7)", backdropFilter: "blur(8px)" }}
                    >
                      <Play className="ml-1 text-white" size={26} />
                    </div>
                    <div
                      className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: "#2d6a4f" }}
                    >
                      {h.title}
                    </div>
                    <div
                      className="absolute bottom-3 right-3 text-white/60 text-xs font-bold"
                    >
                      AI Generated
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-black text-[#111] mb-1">{h.title}</h3>
                    <p className="text-sm text-[#7a7a7a] mb-3">{(h as any).description || (h as any).desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#3d3d3d]">
                        by <strong>{h.player}</strong>
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "#2d6a4f" }}>
                        ❤️ {h.votes} votes
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <FadeUp delay={0.2} className="mt-8 text-center">
            <Link
              href="/microsite/matches"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm border transition-all hover:-translate-y-0.5"
              style={{ borderColor: "#2d6a4f", color: "#2d6a4f" }}
            >
              View All Match Replays <ArrowRight size={14} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — SERVICES
          ══════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Amenities</div>
            <h2 className="heading-xl">Everything You Need to Play</h2>
          </FadeUp>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: "📹", title: "AI Camera Recording", desc: "Every match is automatically recorded at HD quality." },
              { emoji: "🎬", title: "Match Replays",       desc: "Full match replay available to all booked players." },
              { emoji: "👮", title: "Referee Booking",     desc: "Book a certified referee at checkout." },
              { emoji: "🚿", title: "Changing Rooms",      desc: "Secure, modern locker facilities on-site." },
              { emoji: "⚽", title: "Equipment Rental",    desc: "Balls, bibs, cones — available at the reception." },
              { emoji: "📶", title: "Free WiFi",           desc: "Stadium-wide connectivity for all visitors." },
              { emoji: "🏥", title: "First Aid",           desc: "On-site first aid station and trained personnel." },
              { emoji: "🔒", title: "24/7 Security",       desc: "CCTV surveillance and on-site security team." },
            ].map((s) => (
              <StaggerItem key={s.title}>
                <div className="photo-card p-6 h-full">
                  <div className="text-3xl mb-4">{s.emoji}</div>
                  <h3 className="font-black text-[#111] text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — TESTIMONIALS
          ══════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Testimonials</div>
            <h2 className="heading-xl">What Players Say</h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {displayTestimonials.map((t) => (
              <StaggerItem key={t._id}>
                <div className="photo-card p-7 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" className="text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-[#3d3d3d] text-sm leading-relaxed mb-6 flex-1 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                      style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#111] text-sm">{t.name}</div>
                      {(t as any).role && (
                        <div className="text-xs text-[#7a7a7a]">{(t as any).role}</div>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

    </div>
  );
}
