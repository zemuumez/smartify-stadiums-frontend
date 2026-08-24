"use client";

import { Suspense, lazy, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin, Star, ArrowUpRight, ArrowRight, ArrowLeft,
  CheckCircle2, ChevronDown, Play, Shield, Camera,
  TrendingUp, Users, Globe, Zap, Video, Calendar,
  Smartphone, Award
} from "lucide-react";
import { FadeUp, SlideIn, ScaleIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const ParticleField = lazy(() => import("@/components/three/ParticleField"));

function ThreeFallback() {
  return <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d2b1d 0%, #1a4731 60%, #0a1a10 100%)" }} />;
}

/* ─────────────────────────────────────────────
   Sport category data
───────────────────────────────────────────── */
const sports = [
  { id: "football",   emoji: "⚽", label: "Football" },
  { id: "basketball", emoji: "🏀", label: "Basketball" },
  { id: "volleyball", emoji: "🏐", label: "Volleyball" },
  { id: "badminton",  emoji: "🏸", label: "Badminton" },
  { id: "tennis",     emoji: "🎾", label: "Tennis" },
  { id: "futsal",     emoji: "⚽", label: "Futsal" },
];

/* ─────────────────────────────────────────────
   Venue card data
───────────────────────────────────────────── */
const venues = [
  {
    id: 1,
    location: "Bole, Addis Ababa",
    name: "Bambis Meda Stadium",
    desc: "A premium football facility in the heart of Bole, Addis Ababa",
    rating: 4.8,
    reviews: 212,
    sport: "Football",
    image: "/venue-card-1.jpg",
  },
  {
    id: 2,
    location: "Kirkos, Addis Ababa",
    name: "Unity Sports Complex",
    desc: "Multi-sport complex with basketball, volleyball and indoor courts",
    rating: 4.6,
    reviews: 134,
    sport: "Basketball",
    image: "/venue-card-2.jpg",
  },
  {
    id: 3,
    location: "Lideta, Addis Ababa",
    name: "Lideta Futsal Arena",
    desc: "Ethiopia's premier indoor futsal facility with AI camera system",
    rating: 4.9,
    reviews: 89,
    sport: "Futsal",
    image: "/venue-card-1.jpg",
  },
];

/* ─────────────────────────────────────────────
   Testimonials
───────────────────────────────────────────── */
const testimonials = [
  {
    name: "Abebe Kebede",
    role: "Football Player",
    venue: "Bambis Meda Stadium",
    text: "Booking our regular slot used to mean making three confusing calls. Now it's done in 30 seconds. The instant confirmation feature is a lifesaver for busy team captains.",
    rating: 5.0,
    image: "/testimonial-venue.jpg",
  },
  {
    name: "Fatima Hassan",
    role: "Stadium Owner",
    venue: "Unity Sports Complex",
    text: "Since joining ET Smart Fields, our bookings increased 40%. The microsite looks professional and our players love being able to watch their match replays online.",
    rating: 5.0,
    image: "/venue-card-2.jpg",
  },
  {
    name: "Daniel Tadesse",
    role: "Team Captain",
    venue: "Lideta Futsal Arena",
    text: "The AI highlights are incredible. We can share our best goals on social media directly from the platform. It feels like having a professional broadcast team.",
    rating: 5.0,
    image: "/venue-card-1.jpg",
  },
];

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function HomePage() {
  const [activeSport, setActiveSport] = useState("football");
  const [activeVenue, setActiveVenue] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO (Full-Bleed Photo)
          ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Background photo */}
        <div className="absolute inset-0">
          <Image
            src="/hero-sports-field.jpg"
            alt="Ethiopian football stadium aerial view at golden hour"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 photo-overlay-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </div>

        {/* 3D Particle overlay (low opacity) */}
        <Suspense fallback={<ThreeFallback />}>
          <ParticleField className="opacity-20" />
        </Suspense>

        {/* Content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left — Text */}
              <div className="max-w-xl">
                {/* Trust badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-6"
                >
                  <span className="trust-badge">
                    <MapPin size={12} className="text-[#74c69d]" />
                    Trusted Across Ethiopia 🇪🇹
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-white font-black leading-[1.02] mb-6"
                  style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", letterSpacing: "-0.025em" }}
                >
                  Book Ethiopia&apos;s
                  <br />
                  <span style={{ color: "#74c69d" }}>Smart Sports</span>
                  <br />
                  Fields
                </motion.h1>

                {/* Sub-copy */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-white/75 text-lg leading-relaxed mb-10 max-w-md"
                >
                  Find, reserve, and pay for your favorite fields across Ethiopia in under 2 minutes.
                </motion.p>

                {/* CTA Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link
                    href="/stadiums"
                    className="btn-primary btn-primary-lg"
                    style={{ background: "#2d6a4f" }}
                  >
                    Explore All Fields
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowUpRight size={13} />
                    </span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-ghost-white"
                    style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
                  >
                    Register Your Stadium
                  </Link>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="mt-14 flex flex-wrap gap-8"
                >
                  {[
                    { value: "50+", label: "Stadiums" },
                    { value: "10K+", label: "Players" },
                    { value: "6", label: "Sports" },
                    { value: "24/7", label: "Booking" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl font-black text-white">{s.value}</div>
                      <div className="text-sm text-white/55 mt-0.5 font-medium">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right — Floating Info Card (SpotNow style) */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:block"
              >
                <div className="glass-hero rounded-3xl p-6 max-w-sm ml-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2d6a4f" }}>
                      <span className="text-white text-base">⚽</span>
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#111]">50+ Fields</div>
                      <div className="text-xs text-[#7a7a7a] font-medium">Active &amp; Growing</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-[#111] font-bold text-base mb-1">Book Instantly</div>
                    <div className="text-sm text-[#7a7a7a] leading-relaxed">
                      Only verified, high-rated fields with AI camera systems and real-time availability.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { icon: "✅", label: "ULS Verified" },
                      { icon: "📹", label: "AI Camera" },
                      { icon: "⚡", label: "Instant Book" },
                      { icon: "📱", label: "Telebirr Pay" },
                    ].map((f) => (
                      <div
                        key={f.label}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#3d3d3d] px-2.5 py-2 rounded-xl"
                        style={{ background: "#f4f3ef" }}
                      >
                        <span>{f.icon}</span> {f.label}
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/stadiums"
                    className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: "#2d6a4f" }}
                  >
                    Explore All Fields
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowUpRight size={12} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative z-10 pb-8 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-[#74c69d] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — FLOATING SEARCH BAR
          ══════════════════════════════════════════ */}
      <section className="relative z-20 -mt-8 pb-16" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div
              className="search-bar-float flex flex-col lg:flex-row items-stretch lg:items-center"
              style={{ padding: "6px" }}
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row flex-1 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06]">
                {[
                  { icon: <MapPin size={12} />, label: "Location", value: "Addis Ababa" },
                  { icon: <Calendar size={12} />, label: "Date", value: "Pick a Date" },
                  { icon: <span className="text-xs">🕐</span>, label: "Time", value: "00:00" },
                  { icon: <span className="text-xs">⏱</span>, label: "Duration", value: "1 Hour" },
                  { icon: <span className="text-xs">⚽</span>, label: "Sport", value: "Football" },
                ].map((filter) => (
                  <button
                    key={filter.label}
                    className="search-filter-chip flex-1 justify-start text-left"
                  >
                    <span className="search-filter-icon">
                      {filter.icon}
                    </span>
                    <div>
                      <div className="text-[10px] text-[#aaaaaa] font-medium">{filter.label}</div>
                      <div className="text-[#111] text-sm font-semibold truncate">{filter.value}</div>
                    </div>
                    <ChevronDown size={14} className="text-[#aaaaaa] ml-auto flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* Submit */}
              <div className="p-1.5 flex-shrink-0">
                <Link
                  href="/stadiums"
                  className="flex items-center gap-2 px-6 py-4 rounded-full text-white font-bold text-sm whitespace-nowrap transition-all hover:opacity-90"
                  style={{ background: "#2d6a4f", boxShadow: "0 4px 16px rgba(45,106,79,0.35)" }}
                >
                  Check Availability
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowUpRight size={11} />
                  </span>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — SPORT CATEGORY SELECTOR
          ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#f4f3ef", paddingBottom: "80px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-8">
            <div className="text-xs font-bold tracking-widest uppercase text-[#7a7a7a] mb-3">Sports Available</div>
            <h2 className="heading-xl">Find Your Game</h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="flex flex-wrap gap-3">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => setActiveSport(sport.id)}
                  className={`sport-pill ${activeSport === sport.id ? "active" : "inactive"}`}
                >
                  <span>{sport.emoji}</span>
                  {sport.label}
                </button>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — STADIUM SELECTION CAROUSEL
          ══════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left — Heading */}
            <SlideIn direction="left" className="lg:sticky lg:top-32">
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">
                Premium Venues
              </div>
              <h2 className="heading-xl mb-6">
                The Ultimate Stadium Selection Is Here
              </h2>
              <p className="text-[#7a7a7a] text-lg leading-relaxed mb-10 max-w-md">
                We hand-pick the best venues in Ethiopia based on facility quality, AI camera systems, and real player ratings.
              </p>

              {/* Prev / Next */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveVenue((v) => Math.max(0, v - 1))}
                  className="btn-arrow-outline"
                  disabled={activeVenue === 0}
                  style={{ opacity: activeVenue === 0 ? 0.4 : 1 }}
                  aria-label="Previous venue"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveVenue((v) => Math.min(venues.length - 1, v + 1))}
                  className="btn-arrow"
                  disabled={activeVenue === venues.length - 1}
                  style={{ opacity: activeVenue === venues.length - 1 ? 0.6 : 1, background: "#2d6a4f" }}
                  aria-label="Next venue"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Dots */}
              <div className="flex gap-2 mt-5">
                {venues.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVenue(i)}
                    className="transition-all rounded-full"
                    style={{
                      width: i === activeVenue ? "28px" : "8px",
                      height: "8px",
                      background: i === activeVenue ? "#2d6a4f" : "#ddd",
                    }}
                    aria-label={`Go to venue ${i + 1}`}
                  />
                ))}
              </div>
            </SlideIn>

            {/* Right — Venue Card */}
            <SlideIn direction="right">
              <motion.div
                key={activeVenue}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="photo-card"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={venues[activeVenue].image}
                    alt={venues[activeVenue].name}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Location tag overlay */}
                  <div className="absolute top-4 left-4">
                    <span className="venue-tag">
                      <MapPin size={10} style={{ color: "#2d6a4f" }} />
                      {venues[activeVenue].location}
                    </span>
                  </div>
                  {/* Sport badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className="text-white text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(26,71,49,0.85)", backdropFilter: "blur(8px)" }}
                    >
                      {venues[activeVenue].sport}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#111] mb-1">{venues[activeVenue].name}</h3>
                  <p className="text-[#7a7a7a] text-sm leading-relaxed mb-4">{venues[activeVenue].desc}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          fill={i < Math.floor(venues[activeVenue].rating) ? "#f59e0b" : "none"}
                          className={i < Math.floor(venues[activeVenue].rating) ? "text-yellow-400" : "text-gray-200"}
                        />
                      ))}
                      <span className="text-sm font-bold text-[#111] ml-1">{venues[activeVenue].rating}</span>
                      <span className="text-xs text-[#7a7a7a]">({venues[activeVenue].reviews} reviews)</span>
                    </div>
                    <Link
                      href={`/stadiums`}
                      className="btn-arrow"
                      style={{ background: "#2d6a4f" }}
                      aria-label="Book this venue"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — BOOK PERFECT FIELD
          ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Real-Time Booking</div>
                <h2 className="heading-xl">
                  Book Perfect Field,
                  <br />
                  Guaranteed Real-Time
                </h2>
              </div>
              <p className="text-[#7a7a7a] text-base max-w-xs leading-relaxed">
                Zero double-bookings. Our real-time sync ensures your reserved time is 100% guaranteed. No last-minute cancellations.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 — Photo with text overlay */}
            <ScaleIn>
              <div className="photo-card relative overflow-hidden" style={{ minHeight: "360px" }}>
                <Image
                  src="/venue-card-1.jpg"
                  alt="Ethiopia's widest stadium selection"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 photo-overlay-dark" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs text-white/60 font-semibold mb-1 uppercase tracking-wider">
                    Verified Network
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Ethiopia&apos;s Widest Stadium Selection
                  </h3>
                  <Link href="/stadiums" className="inline-flex items-center gap-1.5 mt-4 text-[#74c69d] text-sm font-bold hover:gap-2.5 transition-all">
                    Browse All Venues <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </ScaleIn>

            {/* Card 2 — White card with text */}
            <ScaleIn delay={0.1}>
              <div className="photo-card p-8 flex flex-col justify-between" style={{ minHeight: "360px" }}>
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "#f0faf4" }}
                >
                  <Zap size={26} style={{ color: "#2d6a4f" }} />
                </div>

                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">
                    Instant Booking Confirmation
                  </div>
                  <h3 className="text-2xl font-black text-[#111] mb-4">
                    Zero Double-Booking Risk
                  </h3>
                  <p className="text-[#7a7a7a] leading-relaxed mb-6">
                    Our real-time syncing ensures your reserved time is 100% guaranteed. No last-minute surprises. Book with confidence through Telebirr or Chapa.
                  </p>
                  <Link href="/stadiums" className="inline-flex items-center gap-2 text-[#2d6a4f] font-bold text-sm hover:gap-3 transition-all">
                    Learn More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — CORE SERVICE (Premium Game Day)
          ══════════════════════════════════════════ */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3 text-center">
            Core Service
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Left — Large photo with stat badge */}
            <SlideIn direction="left">
              <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: "500px" }}>
                <Image
                  src="/venue-card-2.jpg"
                  alt="Premium game day comfort at ET Smart Fields"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,26,16,0.8) 0%, transparent 50%)" }} />

                {/* Stat badge */}
                <div className="absolute bottom-6 left-6">
                  <div className="stat-badge">
                    <span className="text-2xl font-black">94%</span>
                    <div>
                      <div className="text-xs opacity-75 leading-tight">Venue Quality</div>
                      <div className="text-xs opacity-75 leading-tight">Satisfaction Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </SlideIn>

            {/* Right — Two cards */}
            <SlideIn direction="right" className="flex flex-col gap-6">
              {/* Card A */}
              <div className="photo-card p-8 flex-1">
                <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Premium Service</div>
                <h3 className="text-2xl font-black text-[#111] mb-4">
                  We Offer Full Premium Game Day Comfort
                </h3>
                <div className="space-y-3">
                  {[
                    "AI-powered camera recording on every field",
                    "Smart locker rooms and modern changing facilities",
                    "Real-time scoreboard and match analytics",
                    "Referee booking and equipment rental",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-3 text-sm text-[#3d3d3d]">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#2d6a4f" }} />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card B */}
              <div
                className="photo-card p-8 flex-1 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)" }}
              >
                {/* Sport icon pills */}
                <div className="flex gap-2 mb-5 flex-wrap">
                  {["⚽", "🏀", "🏐", "🏸", "🎾"].map((emoji) => (
                    <span
                      key={emoji}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: "rgba(255,255,255,0.12)" }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-black text-white mb-2">
                  Play Seamlessly — Everything You Need Is Here
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  The platform provides everything from booking to broadcast. One app for every sport in Ethiopia.
                </p>
                {/* Decorative circle */}
                <div
                  className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10"
                  style={{ background: "#74c69d" }}
                />
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — HOW IT WORKS
          ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">How It Works</div>
            <h2 className="heading-xl mb-4">Three Steps to Play</h2>
            <p className="text-[#7a7a7a] text-lg max-w-xl mx-auto">
              From discovery to watching your highlights — we've made the whole journey effortless.
            </p>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                emoji: "🔍",
                title: "Find & Choose",
                desc: "Search for stadiums near you. See real-time availability, prices, camera status, and sport type in one view.",
              },
              {
                step: "02",
                emoji: "📅",
                title: "Book & Pay",
                desc: "Select your time slot, choose extras like AI video capture or a referee, and pay instantly with Telebirr or Chapa.",
              },
              {
                step: "03",
                emoji: "🎮",
                title: "Play & Watch",
                desc: "Play your match, then watch the AI-generated replay or highlight reel on your personal dashboard.",
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="photo-card p-8 h-full relative group">
                  {/* Step number (background) */}
                  <div
                    className="absolute top-4 right-6 font-black text-7xl select-none pointer-events-none"
                    style={{ color: "#f0faf4" }}
                  >
                    {item.step}
                  </div>

                  {/* Emoji icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                    style={{ background: "#f0faf4" }}
                  >
                    {item.emoji}
                  </div>

                  <h3 className="text-xl font-black text-[#111] mb-3">{item.title}</h3>
                  <p className="text-[#7a7a7a] leading-relaxed text-sm">{item.desc}</p>

                  <div className="mt-6">
                    <ArrowRight
                      size={20}
                      style={{ color: "#2d6a4f" }}
                      className="group-hover:translate-x-2 transition-transform duration-300"
                    />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — TESTIMONIALS
          ══════════════════════════════════════════ */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left — Heading */}
            <FadeUp className="lg:sticky lg:top-32">
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">Testimonials</div>
              <h2 className="heading-xl mb-6">
                The ET Smart Fields Experience In Their Own Words
              </h2>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-full border transition-all hover:-translate-y-0.5"
                style={{ borderColor: "#2d6a4f", color: "#2d6a4f" }}
              >
                Learn More <ArrowRight size={14} />
              </Link>

              {/* Carousel controls */}
              <div className="flex gap-3 mt-10">
                <button
                  onClick={() => setActiveTestimonial((t) => Math.max(0, t - 1))}
                  className="btn-arrow-outline"
                  disabled={activeTestimonial === 0}
                  style={{ opacity: activeTestimonial === 0 ? 0.4 : 1 }}
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => setActiveTestimonial((t) => Math.min(testimonials.length - 1, t + 1))}
                  className="btn-arrow"
                  disabled={activeTestimonial === testimonials.length - 1}
                  style={{ opacity: activeTestimonial === testimonials.length - 1 ? 0.6 : 1, background: "#2d6a4f" }}
                  aria-label="Next testimonial"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </FadeUp>

            {/* Right — Testimonial Card */}
            <div>
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="photo-card overflow-hidden"
              >
                {/* Venue photo */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].venue}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 photo-overlay-dark" />
                  <div className="absolute bottom-4 left-4">
                    <span className="venue-tag">
                      <MapPin size={9} style={{ color: "#2d6a4f" }} />
                      {testimonials[activeTestimonial].venue}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <div className="p-7">
                  <p className="text-[#3d3d3d] text-base leading-relaxed mb-6 italic">
                    &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-lg"
                        style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}
                      >
                        {testimonials[activeTestimonial].name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[#111] text-sm">{testimonials[activeTestimonial].name}</div>
                        <div className="text-xs text-[#7a7a7a]">{testimonials[activeTestimonial].role}</div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-black text-[#111]">{testimonials[activeTestimonial].rating}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill="#f59e0b" className="text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dots */}
              <div className="flex gap-2 mt-5 justify-center">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className="transition-all rounded-full"
                    style={{
                      width: i === activeTestimonial ? "28px" : "8px",
                      height: "8px",
                      background: i === activeTestimonial ? "#2d6a4f" : "#ddd",
                    }}
                    aria-label={`View testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 9 — PARTNER / INVESTOR
          ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Partner info */}
            <FadeUp>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">Partnership</div>
              <h2 className="heading-xl mb-6">
                Partner with Us to Build
                <br />
                Next Elite Fields
              </h2>
              <p className="text-[#7a7a7a] text-base leading-relaxed mb-8 max-w-md">
                Our infrastructure solutions are designed to maximize ROI and simplify field management for investors and stadium operators across Ethiopia.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: <TrendingUp size={18} />, label: "Optimized ROI Architecture" },
                  { icon: <Calendar size={18} />, label: "Profitable Field Management System" },
                  { icon: <Shield size={18} />, label: "Access Skilled ICT Field Technicians" },
                  { icon: <Globe size={18} />, label: "Seamless Network Integration Across Ethiopia" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-[#3d3d3d] text-sm font-medium">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "white", color: "#2d6a4f", boxShadow: "var(--shadow-card)" }}
                    >
                      {item.icon}
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className="btn-primary btn-primary-lg"
                style={{ background: "#2d6a4f" }}
              >
                Become a Partner
                <ArrowUpRight size={16} />
              </Link>
            </FadeUp>

            {/* Right — Investment CTA card */}
            <ScaleIn delay={0.15}>
              <div
                className="rounded-3xl p-10 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0d2b1d 0%, #1a4731 60%, #2d6a4f 100%)" }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10" style={{ background: "#74c69d" }} />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: "#74c69d" }} />

                <div className="relative z-10">
                  <div className="text-4xl mb-6">🏟️</div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#74c69d] mb-3">Investment</div>
                  <h3 className="text-2xl font-black text-white mb-4 leading-tight">
                    Interested in Investing in the Future of Play?
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    Join Ethiopia&apos;s growing sports infrastructure revolution. Earn consistent returns while building the communities of tomorrow.
                  </p>

                  {/* Mini stats */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { value: "40%", label: "Avg. Booking Increase" },
                      { value: "50+", label: "Active Venues" },
                      { value: "10K+", label: "Registered Players" },
                      { value: "6", label: "Sports Supported" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="text-xl font-black text-white">{s.value}</div>
                        <div className="text-xs text-white/50">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/contact"
                    className="flex items-center justify-between w-full px-5 py-4 rounded-2xl text-[#1a4731] font-bold transition-all hover:opacity-90"
                    style={{ background: "white" }}
                  >
                    Learn More
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "#2d6a4f", color: "white" }}
                    >
                      <ArrowUpRight size={14} />
                    </span>
                  </Link>
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 10 — CTA DARK BANNER
          ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: "linear-gradient(135deg, #0a1a10 0%, #1a4731 50%, #0d2b1d 100%)" }}
      >
        {/* Background field photo overlay */}
        <div className="absolute inset-0">
          <Image
            src="/testimonial-venue.jpg"
            alt=""
            fill
            className="object-cover object-top opacity-15"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — App visual */}
            <FadeUp>
              <div
                className="rounded-3xl p-8 max-w-sm relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "#2d6a4f" }}
                  >
                    <span className="text-2xl">⚽</span>
                  </div>
                  <div>
                    <div className="text-white font-black">ET Smart Fields</div>
                    <div className="text-white/50 text-xs">Addis Ababa, Ethiopia</div>
                  </div>
                </div>

                {/* Toggle / status */}
                <div className="mb-6">
                  <div className="text-white/60 text-xs mb-2 uppercase tracking-wider font-semibold">Field Availability</div>
                  <div className="flex gap-3 flex-wrap">
                    {["Bole Arena", "Kirkos FC", "Lideta Futsal", "Unity Court"].map((name, i) => (
                      <span
                        key={name}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: i === 0 ? "#2d6a4f" : "rgba(255,255,255,0.1)",
                          color: i === 0 ? "white" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[#74c69d] text-xs font-bold uppercase tracking-wider mb-2">
                  ● 12 Slots Available Now
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: "72%", background: "linear-gradient(90deg, #2d6a4f, #74c69d)" }} />
                </div>
                <div className="text-white/40 text-xs mt-1.5">72% of today&apos;s slots already booked</div>
              </div>
            </FadeUp>

            {/* Right — Text */}
            <FadeUp delay={0.1}>
              <div className="text-xs font-bold tracking-widest uppercase text-[#74c69d] mb-4">
                Book Instantly
              </div>
              <h2
                className="text-white font-black leading-tight mb-6"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.02em" }}
              >
                Avoid Confusion —
                <br />
                Book Available Slot Instantly
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md">
                Join thousands of players and stadium owners across Ethiopia. Your next match is just a tap away — no calls, no WhatsApp chains.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/register"
                  className="btn-primary btn-primary-lg"
                  style={{ background: "#2d6a4f" }}
                >
                  <Zap size={18} />
                  Sign Up Free
                </Link>
                <Link
                  href="/stadiums"
                  className="btn-ghost-white"
                  style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
                >
                  <MapPin size={16} />
                  Browse Stadiums
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════ */}
      <footer className="bg-white border-t" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/logo/et-smart-fields-icon.jpg"
                  alt="ET Smart Fields"
                  width={36}
                  height={36}
                  className="rounded-xl object-cover"
                />
                <div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-black text-[#111]">ET</span>
                    <span className="text-base font-black" style={{ color: "#2d6a4f" }}>Smart Fields</span>
                  </div>
                  <div className="text-[10px] text-[#aaa] font-medium">Your Field, Your Time</div>
                </div>
              </div>
              <p className="text-sm text-[#7a7a7a] leading-relaxed mb-5">
                Ethiopia&apos;s integrated smart sports infrastructure platform.
              </p>
              {/* Social icons */}
              <div className="flex gap-3">
                {["𝕏", "📘", "📸", "📺"].map((icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full border flex items-center justify-center text-sm transition-all hover:-translate-y-0.5"
                    style={{ borderColor: "rgba(0,0,0,0.1)", color: "#7a7a7a" }}
                    aria-label={`Social link ${i + 1}`}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Core Services */}
            <div>
              <h4 className="font-bold text-[#111] text-sm mb-5">Core Services</h4>
              <ul className="space-y-3 text-sm text-[#7a7a7a]">
                <li><Link href="/stadiums" className="hover:text-[#2d6a4f] transition-colors">Find Stadiums</Link></li>
                <li><Link href="/bookings" className="hover:text-[#2d6a4f] transition-colors">My Bookings</Link></li>
                <li><Link href="/stadiums/live" className="hover:text-[#2d6a4f] transition-colors">Live Matches</Link></li>
                <li><Link href="/pricing" className="hover:text-[#2d6a4f] transition-colors">Request Consultation</Link></li>
                <li><Link href="/contact" className="hover:text-[#2d6a4f] transition-colors">Customer Service</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-[#111] text-sm mb-5">Company</h4>
              <ul className="space-y-3 text-sm text-[#7a7a7a]">
                <li><Link href="/about" className="hover:text-[#2d6a4f] transition-colors">About Us</Link></li>
                <li><Link href="/auth/register" className="hover:text-[#2d6a4f] transition-colors">Join as Owner (ETSF)</Link></li>
                <li><Link href="/contact" className="hover:text-[#2d6a4f] transition-colors">Partner with Us</Link></li>
                <li><Link href="/careers" className="hover:text-[#2d6a4f] transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-[#111] text-sm mb-5">Legal</h4>
              <ul className="space-y-3 text-sm text-[#7a7a7a]">
                <li><Link href="/terms" className="hover:text-[#2d6a4f] transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-[#2d6a4f] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/contact" className="hover:text-[#2d6a4f] transition-colors">Cookie Preferences</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
          >
            <p className="text-xs text-[#aaa]">© 2026 ET Smart Fields. All Rights Reserved.</p>
            <div className="flex gap-5 text-xs text-[#aaa]">
              <Link href="/privacy" className="hover:text-[#2d6a4f] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#2d6a4f] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
