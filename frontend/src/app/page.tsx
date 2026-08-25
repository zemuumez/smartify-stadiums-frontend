"use client";

import { Suspense, lazy, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin, Star, ArrowUpRight, ArrowRight, ArrowLeft,
  Shield, Calendar, Clock, Timer, Activity, Zap, Check,
  Smartphone, Globe, ChevronDown
} from "lucide-react";
import { FadeUp, SlideIn, ScaleIn } from "@/components/ui/AnimatedSection";

const SpotNowHero3D = lazy(() => import("@/components/three/SpotNowHero3D"));
const SmartPitch3D = lazy(() => import("@/components/three/SmartPitch3D"));

/* ─────────────────────────────────────────────
   Venue Card Data
───────────────────────────────────────────── */
const venues = [
  {
    id: 1,
    location: "Bole, Addis Ababa",
    name: "Bambis Meda Stadium",
    desc: "A premier football & multi-sport facility in the heart of Bole, Addis Ababa",
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
    image: "/testimonial-venue.jpg",
  },
];

/* ─────────────────────────────────────────────
   Testimonials
───────────────────────────────────────────── */
const testimonials = [
  {
    name: "Abebe Kebede",
    role: "Captain, Addis Stars FC",
    venue: "Bambis Meda Stadium",
    text: "Booking our regular slot used to take three confusing WhatsApp messages. Now it's done in 30 seconds. The instant confirmation feature is a lifesaver for busy team captains.",
    rating: 5.0,
    image: "/testimonial-venue.jpg",
  },
  {
    name: "Fatima Hassan",
    role: "Stadium Owner, Unity Complex",
    venue: "Unity Sports Complex",
    text: "Since joining ET Smart Fields, our bookings increased 40%. The microsite looks professional and our players love being able to watch their match replays online.",
    rating: 5.0,
    image: "/venue-card-2.jpg",
  },
  {
    name: "Daniel Tadesse",
    role: "Team Captain, Bole Futsal",
    venue: "Lideta Futsal Arena",
    text: "The AI highlights are incredible. We can share our best goals on social media directly from the platform. It feels like having a professional broadcast team.",
    rating: 5.0,
    image: "/venue-card-1.jpg",
  },
];

export default function HomePage() {
  const [activeVenue, setActiveVenue] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO (SpotNow Aesthetic)
          ══════════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex flex-col justify-between overflow-hidden">
        {/* Background Full-Bleed Photo */}
        <div className="absolute inset-0">
          <Image
            src="/hero-sports-field.jpg"
            alt="Ethiopian sports stadium aerial view at golden hour"
            fill
            className="object-cover object-center"
            priority
            quality={92}
          />
          {/* Subtle natural gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>

        {/* 3D Ambient Wave & Node Mesh */}
        <Suspense fallback={null}>
          <SpotNowHero3D className="opacity-50" />
        </Suspense>

        {/* Top Area: Hero Text + Floating Right Card */}
        <div className="relative z-10 spotnow-container pt-32 lg:pt-36">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">

            {/* Left — Big Typography */}
            <div className="max-w-2xl">
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-black/40 backdrop-blur-md border border-white/20">
                  <Shield size={13} className="text-[#74c69d]" />
                  Trusted in Addis Ababa
                </span>
              </motion.div>

              {/* Display Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-white font-black leading-[1.04] mb-5 tracking-tight"
                style={{ fontSize: "clamp(2.8rem, 6vw, 4.4rem)" }}
              >
                Book Your Smart
                <br />
                Sports Field
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white/90 text-base sm:text-lg leading-relaxed max-w-lg"
              >
                Find, reserve, and pay for your favorite fields across Ethiopia in under 2 minutes.
              </motion.p>
            </div>

            {/* Right — SpotNow Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block w-full max-w-sm"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 shadow-2xl border border-white/40">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-8 h-8 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    <Activity size={16} />
                  </span>
                  <span className="text-xs font-black text-[#111] uppercase tracking-wider">
                    50+ Fields
                  </span>
                </div>

                <h2 className="text-[#111] font-black text-xl leading-snug mb-5">
                  Book Instantly Only Verified High-Rated Fields
                </h2>

                <Link
                  href="/stadiums"
                  className="flex items-center justify-between w-full px-5 py-3.5 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 shadow-md"
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

        {/* Bottom Area: SpotNow Floating Search Bar Overlaid on Hero Grass */}
        <div className="relative z-20 spotnow-container pb-10 mt-12">
          <FadeUp>
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/[0.04]">
              <div className="text-xs font-black uppercase tracking-wider text-[#111] mb-4">
                Find Your Slot Fast
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Location Chip */}
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#f4f3ef]">
                  <MapPin size={17} className="text-[#2d6a4f] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#8a8a8a] font-bold uppercase">Location</div>
                    <div className="text-xs font-bold text-[#111] truncate">Bole, Addis Ababa</div>
                  </div>
                </div>

                {/* Date Chip */}
                <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#f4f3ef]">
                  <div className="flex items-center gap-3 min-w-0">
                    <Calendar size={17} className="text-[#2d6a4f] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#8a8a8a] font-bold uppercase">Date</div>
                      <div className="text-xs font-bold text-[#111] truncate">Today, 25 Aug</div>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-[#8a8a8a]" />
                </div>

                {/* Time Chip */}
                <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#f4f3ef]">
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock size={17} className="text-[#2d6a4f] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#8a8a8a] font-bold uppercase">Time</div>
                      <div className="text-xs font-bold text-[#111] truncate">17:00</div>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-[#8a8a8a]" />
                </div>

                {/* Duration Chip */}
                <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#f4f3ef]">
                  <div className="flex items-center gap-3 min-w-0">
                    <Timer size={17} className="text-[#2d6a4f] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#8a8a8a] font-bold uppercase">Duration</div>
                      <div className="text-xs font-bold text-[#111] truncate">1 Hour</div>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-[#8a8a8a]" />
                </div>

                {/* Submit Pill Button */}
                <Link
                  href="/stadiums"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md"
                  style={{ background: "#2d6a4f" }}
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
          SECTION 2 — THE ULTIMATE FIELD SELECTION
          ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="spotnow-container">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left — Heading & Description & Controls */}
            <div className="lg:col-span-5">
              <SlideIn direction="left">
                <h2 className="text-[#111] font-black text-3xl sm:text-4xl lg:text-[40px] leading-tight mb-4 tracking-tight">
                  The Ultimate Field
                  <br />
                  Selection Is Here
                </h2>
                <p className="text-[#7a7a7a] text-base leading-relaxed mb-8 max-w-sm">
                  We hand-pick the best venues in Ethiopia based on facility quality and player ratings.
                </p>

                {/* Carousel Arrow Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveVenue((v) => Math.max(0, v - 1))}
                    disabled={activeVenue === 0}
                    className="w-12 h-12 rounded-full border border-black/15 bg-white text-[#111] flex items-center justify-center transition-all hover:border-black/30 disabled:opacity-35"
                    aria-label="Previous venue"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveVenue((v) => Math.min(venues.length - 1, v + 1))}
                    disabled={activeVenue === venues.length - 1}
                    className="w-12 h-12 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center transition-all hover:bg-[#1a4731] disabled:opacity-50"
                    aria-label="Next venue"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </SlideIn>
            </div>

            {/* Right — SpotNow Horizontal Split Venue Card */}
            <div className="lg:col-span-7">
              <SlideIn direction="right">
                <motion.div
                  key={activeVenue}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row gap-6 lg:gap-8 items-center"
                >
                  {/* Left Half — Square Photo */}
                  <div className="relative w-full sm:w-72 aspect-square rounded-2xl overflow-hidden flex-shrink-0">
                    <Image
                      src={venues[activeVenue].image}
                      alt={venues[activeVenue].name}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 300px"
                    />
                  </div>

                  {/* Right Half — Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                    <div>
                      <div className="text-xs text-[#7a7a7a] font-bold flex items-center gap-1.5 mb-2.5">
                        <MapPin size={13} className="text-[#2d6a4f]" />
                        {venues[activeVenue].location}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#111] mb-2 leading-snug">
                        {venues[activeVenue].name}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#7a7a7a] leading-relaxed mb-6">
                        {venues[activeVenue].desc}
                      </p>
                    </div>

                    <div className="flex items-end justify-between pt-5 border-t border-black/[0.06]">
                      <div>
                        <div className="text-2xl sm:text-3xl font-black text-[#111] mb-1">
                          {venues[activeVenue].rating}
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={i < Math.floor(venues[activeVenue].rating) ? "#f59e0b" : "none"}
                              className={i < Math.floor(venues[activeVenue].rating) ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-[#8a8a8a] font-medium">
                          {venues[activeVenue].reviews} Reviews
                        </div>
                      </div>

                      <Link
                        href="/stadiums"
                        className="w-12 h-12 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center transition-all hover:scale-105 hover:bg-[#1a4731] shadow-md"
                        aria-label="Book venue"
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </SlideIn>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — BOOK PERFECT FIELD GUARANTEED
          ══════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="spotnow-container">
          {/* Header Row with Title on Left, Note on Right */}
          <FadeUp className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-[#111] font-black text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight">
                  Book Perfect Field
                  <br />
                  Guaranteed Real-Time
                </h2>
              </div>
              <div className="max-w-sm text-left md:text-right">
                <p className="text-[#7a7a7a] text-xs sm:text-sm leading-relaxed mb-3">
                  Book instantly with zero-risk guaranteed only on our trusted verified platform.
                </p>
                <Link
                  href="/stadiums"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm"
                  style={{ background: "#2d6a4f" }}
                >
                  Learn More <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </FadeUp>

          {/* 3-Card Grid matching SpotNow */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

            {/* Card 1 — Photo Card with Soccer Ball */}
            <ScaleIn>
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-lg group">
                <Image
                  src="/venue-card-1.jpg"
                  alt="Ethiopia's Widest Field Selection"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wider mb-1">
                    Verified Infrastructure
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Ethiopia&apos;s Widest Selection
                  </h3>
                </div>
              </div>
            </ScaleIn>

            {/* Card 2 — Green Turf Overlay Card */}
            <ScaleIn delay={0.1}>
              <div
                className="relative rounded-3xl p-8 aspect-[4/5] shadow-lg flex flex-col justify-between text-white overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)" }}
              >
                <div className="flex justify-end">
                  <span className="text-xs font-bold text-[#74c69d] flex items-center gap-1 hover:underline cursor-pointer">
                    Learn More <ArrowUpRight size={12} />
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-snug">
                    Zero Double-Booking Risk
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Our real-time syncing ensures your reserved time is 100% guaranteed. No last-minute cancellations.
                  </p>
                </div>
              </div>
            </ScaleIn>

            {/* Card 3 — Clean White Card */}
            <ScaleIn delay={0.2}>
              <div className="bg-[#f4f3ef] rounded-3xl p-8 aspect-[4/5] shadow-sm border border-black/[0.04] flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#2d6a4f] shadow-sm">
                  <Zap size={24} />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111] mb-3 leading-snug">
                    Instant Booking Confirmation
                  </h3>
                  <p className="text-[#7a7a7a] text-xs sm:text-sm leading-relaxed mb-6">
                    Secure your slot in seconds with our dedicated 24/7 system. No more waiting for manual chat replies.
                  </p>
                  <Link
                    href="/stadiums"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:gap-2 transition-all"
                  >
                    Learn More <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            </ScaleIn>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — PREMIUM GAME DAY COMFORT (Interactive 3D)
          ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="spotnow-container">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

            {/* Left — Big Photo Backdrop with Stat Pill */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden min-h-[480px] shadow-xl">
              <Image
                src="/venue-card-2.jpg"
                alt="We Offer Full Premium Game Day Comfort"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

              <div className="relative z-10 p-8 sm:p-10 h-full flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#74c69d] mb-3 flex items-center gap-1.5">
                    <Shield size={13} /> Core Service
                  </div>
                  <h2 className="text-white font-black text-3xl sm:text-4xl leading-tight max-w-md">
                    We Offer Full Premium Game Day Comfort
                  </h2>
                </div>

                {/* Bottom Floating Stat Badge */}
                <div>
                  <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md text-[#111] shadow-lg">
                    <span className="text-2xl sm:text-3xl font-black text-[#2d6a4f]">94%</span>
                    <div className="text-[11px] font-bold text-[#5a5a5a] leading-tight">
                      Venue Quality<br />Satisfaction Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Floating White Card with 3D Smart Pitch & Sports Icons */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-8 sm:p-9 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#111] mb-5 leading-tight">
                  Play Seamlessly
                  <br />
                  Everything You Need Is Here
                </h3>

                {/* Multi-sport icon pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Football", "Basketball", "Volleyball", "Badminton", "Tennis", "Futsal"].map((sport) => (
                    <span
                      key={sport}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2d6a4f] bg-[#f0faf4] border border-[#2d6a4f]/15"
                    >
                      {sport}
                    </span>
                  ))}
                </div>

                {/* 3D Smart Pitch Live View */}
                <div className="h-48 rounded-2xl bg-[#0d2b1d] overflow-hidden relative mb-6 shadow-inner">
                  <Suspense fallback={<div className="h-full w-full bg-[#1a4731]" />}>
                    <SmartPitch3D />
                  </Suspense>
                  <div className="absolute top-2.5 left-3 text-[10px] font-bold text-[#74c69d] uppercase tracking-wider">
                    AI Veo Cam 3D Radar
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#7a7a7a] leading-relaxed">
                  Our partner stadiums provide on-site amenities like gear rental, referee booking, and AI camera capture for a hassle-free game day.
                </p>
              </div>

              <div className="pt-6 border-t border-black/[0.06] flex justify-end">
                <Link
                  href="/stadiums"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm"
                  style={{ background: "#2d6a4f" }}
                >
                  See More <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — TESTIMONIALS (In Their Own Words)
          ══════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="spotnow-container">
          {/* Header Row */}
          <FadeUp className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-[#111] font-black text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight">
                  The ET Smart Fields Experience
                  <br />
                  In Their Own Words
                </h2>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white self-start sm:self-auto shadow-sm"
                style={{ background: "#2d6a4f" }}
              >
                Learn More <ArrowUpRight size={12} />
              </Link>
            </div>
          </FadeUp>

          {/* Testimonial Layout */}
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left — Goal Photo with Arrow */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg">
              <Image
                src={testimonials[activeTestimonial].image}
                alt="Venue"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="w-11 h-11 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center shadow-lg">
                  <ArrowUpRight size={17} />
                </span>
              </div>
            </div>

            {/* Right — Quote & Author & Rating */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-[#2d2d2d] text-lg sm:text-2xl font-medium leading-relaxed mb-8 italic">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base"
                      style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}
                    >
                      {testimonials[activeTestimonial].name[0]}
                    </div>
                    <div>
                      <div className="font-black text-[#111] text-base">
                        {testimonials[activeTestimonial].name}
                      </div>
                      <div className="text-xs text-[#7a7a7a] font-medium">
                        {testimonials[activeTestimonial].role}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-[#111] leading-none mb-1">
                      {testimonials[activeTestimonial].rating.toFixed(1)}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} fill="#f59e0b" className="text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setActiveTestimonial((t) => Math.max(0, t - 1))}
                  disabled={activeTestimonial === 0}
                  className="w-11 h-11 rounded-full border border-black/15 text-[#111] flex items-center justify-center transition-all hover:border-black/30 disabled:opacity-30"
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => setActiveTestimonial((t) => Math.min(testimonials.length - 1, t + 1))}
                  disabled={activeTestimonial === testimonials.length - 1}
                  className="w-11 h-11 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center transition-all hover:bg-[#1a4731] disabled:opacity-40 shadow-sm"
                  aria-label="Next testimonial"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — PARTNER WITH US TO BUILD NEXT ELITE FIELDS
          ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="spotnow-container">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left — Value Props with Check Circles */}
            <div className="lg:col-span-6">
              <FadeUp>
                <h2 className="text-[#111] font-black text-3xl sm:text-4xl lg:text-[40px] leading-tight mb-4 tracking-tight">
                  Partner with Us to
                  <br />
                  Build Next Elite Fields
                </h2>
                <p className="text-[#7a7a7a] text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
                  Our infrastructure construction services are designed to maximize ROI and seamless project management, transforming areas into profitable venues.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Optimized ROI Planning",
                    "Full End-to-End Project Management",
                    "Access to Verified AI Camera Tech",
                    "Seamless Network Integration Across Ethiopia",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm font-bold text-[#111]">
                      <div className="w-6 h-6 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center flex-shrink-0">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* Right — Field Photo with Floating Investment Box */}
            <div className="lg:col-span-6">
              <ScaleIn>
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                  <Image
                    src="/hero-sports-field.jpg"
                    alt="Partner field infrastructure"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />

                  {/* Floating Box */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 shadow-xl">
                    <h3 className="text-base sm:text-xl font-black text-[#111] mb-3">
                      Interested in Investing in the Future of Play?
                    </h3>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm"
                      style={{ background: "#2d6a4f" }}
                    >
                      Learn More <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </ScaleIn>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — AVOID CONFUSION — INSTANT ACCESS
          ══════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="spotnow-container">
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden min-h-[440px] shadow-2xl">
              <Image
                src="/testimonial-venue.jpg"
                alt="Book Available Slot Instantly"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

              <div className="relative z-10 p-8 sm:p-12 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-white font-black text-2xl sm:text-4xl lg:text-5xl leading-tight max-w-lg">
                    Avoid Confusion
                    <br />
                    Book Available Slot
                    <br />
                    Instantly
                  </h2>
                </div>

                {/* Floating Bottom Card */}
                <div className="bg-white rounded-2xl p-6 max-w-xs shadow-xl mt-12">
                  <div className="text-[10px] text-[#8a8a8a] font-bold uppercase mb-1">Instant Access</div>
                  <div className="text-lg font-black text-[#111] mb-3.5">Book Your Field</div>
                  <Link
                    href="/stadiums"
                    className="flex items-center justify-between w-full px-5 py-3 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 shadow-md"
                    style={{ background: "#2d6a4f" }}
                  >
                    Book Now
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER (SpotNow Clean Aesthetic)
          ══════════════════════════════════════════ */}
      <footer className="bg-white border-t border-black/[0.06]">
        <div className="spotnow-container py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-xs">
                  <Activity size={16} />
                </div>
                <span className="text-lg font-black text-[#111]">ET Smart Fields</span>
              </div>
              <p className="text-xs text-[#7a7a7a] leading-relaxed mb-6">
                Your Field. Your Time. Now.
              </p>
              <div className="flex gap-3 text-[#7a7a7a]">
                <Globe size={16} className="hover:text-[#2d6a4f] cursor-pointer" />
                <Smartphone size={16} className="hover:text-[#2d6a4f] cursor-pointer" />
              </div>
            </div>

            {/* Core Services */}
            <div>
              <h4 className="font-bold text-[#111] text-xs uppercase tracking-wider mb-4">Core Services</h4>
              <ul className="space-y-2.5 text-xs text-[#7a7a7a]">
                <li><Link href="/stadiums" className="hover:text-[#2d6a4f] transition-colors">Find Fields Near You</Link></li>
                <li><Link href="/bookings" className="hover:text-[#2d6a4f] transition-colors">Venue Amenities</Link></li>
                <li><Link href="/pricing" className="hover:text-[#2d6a4f] transition-colors">Request Consultation</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-[#111] text-xs uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs text-[#7a7a7a]">
                <li><Link href="/about" className="hover:text-[#2d6a4f] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#2d6a4f] transition-colors">Help Center (FAQ)</Link></li>
                <li><Link href="/careers" className="hover:text-[#2d6a4f] transition-colors">Blog &amp; Insights</Link></li>
                <li><Link href="/contact" className="hover:text-[#2d6a4f] transition-colors">Customer Service</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-[#111] text-xs uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5 text-xs text-[#7a7a7a]">
                <li><Link href="/terms" className="hover:text-[#2d6a4f] transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-[#2d6a4f] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/contact" className="hover:text-[#2d6a4f] transition-colors">Cookie Preferences</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="pt-8 border-t border-black/[0.06] text-xs text-[#aaa]">
            &copy; 2026 Copyright ET Smart Fields. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
