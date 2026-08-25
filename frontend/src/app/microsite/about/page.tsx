"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Camera, Star, Calendar, MapPin, Phone, CheckCircle2, ArrowRight, Award } from "lucide-react";
import { useStadium } from "@/lib/sanity/hooks";
import { FadeUp, SlideIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

export default function MicrositeAbout() {
  const { stadium } = useStadium("bambis-meda");

  const stadiumName   = stadium?.name || "Bambis Meda Stadium";
  const stadiumCity   = stadium?.city || "Bole, Addis Ababa";
  const description   = stadium?.description || "One of Addis Ababa's premier multi-sport facilities — with AI-powered cameras, fully resurfaced fields, and a professional booking system.";
  const rating        = stadium?.rating || 4.9;
  const totalBookings = stadium?.totalBookings || 1247;
  const fieldsCount   = stadium?.fields?.length || 4;
  const isVerified    = stadium?.isVerified ?? true;

  return (
    <div style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO ─────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "420px" }}>
        <div className="absolute inset-0">
          <Image src="/venue-card-2.jpg" alt={stadiumName} fill className="object-cover" />
          <div className="absolute inset-0 photo-overlay-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#74c69d" }}>About</div>
            <h1 className="text-white font-black leading-tight mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}>
              {stadiumName}
            </h1>
            <div className="flex flex-wrap gap-3">
              {isVerified && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: "rgba(45,106,79,0.85)" }}>
                  <Shield size={11} /> ULS Verified
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: "rgba(0,0,0,0.4)" }}>
                <Star size={11} fill="#f59e0b" style={{ color: "#f59e0b" }} /> {rating} Rating
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: "rgba(0,0,0,0.4)" }}>
                <MapPin size={11} /> {stadiumCity}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT TEXT + HIGHLIGHTS ─────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <SlideIn direction="left">
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">Our Story</div>
              <h2 className="heading-xl mb-6">Built for the Game,<br />Built for the Community</h2>
              <p className="text-[#7a7a7a] text-lg leading-relaxed mb-5">{description}</p>
              <p className="text-[#7a7a7a] leading-relaxed mb-8">
                Since joining the ET Smart Fields ULS network, Bambis Meda Stadium has digitized operations, attracted players from across Addis through online bookings, and given our community the ability to watch match replays and share highlights. We&apos;re not just a football field — we&apos;re a sports hub.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/bookings/new" className="btn-primary" style={{ background: "#2d6a4f", padding: "0.875rem 1.75rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "8px", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                  <Calendar size={15} /> Book a Field
                </Link>
                <Link href="/microsite/contact" className="btn-outline" style={{ padding: "0.875rem 1.75rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "8px", border: "2px solid #2d6a4f", color: "#2d6a4f", fontWeight: 700, fontSize: "0.875rem" }}>
                  Contact Us <ArrowRight size={14} />
                </Link>
              </div>
            </SlideIn>

            <SlideIn direction="right">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Shield size={22} style={{ color: "#2d6a4f" }} />, title: "ULS Verified",   desc: "Certified quality, technology, and safety standards." },
                  { icon: <Camera size={22} style={{ color: "#2d6a4f" }} />, title: "AI Cameras",    desc: "Automated HD match recording and highlight generation." },
                  { icon: <Star   size={22} style={{ color: "#2d6a4f" }} />, title: `${rating} Stars`, desc: `${totalBookings.toLocaleString()}+ bookings rated.` },
                  { icon: <Calendar size={22} style={{ color: "#2d6a4f" }} />, title: "Open 7 Days", desc: "6:00 AM – 10:00 PM, every day of the week." },
                ].map((item) => (
                  <div key={item.title} className="photo-card p-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: "#f0faf4" }}>
                      {item.icon}
                    </div>
                    <h3 className="font-black text-[#111] text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-[#7a7a7a] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ── FACILITIES STATS ─────────────── */}
      <section className="py-20" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Facilities</div>
            <h2 className="heading-xl">By the Numbers</h2>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { value: fieldsCount, label: "Fields" },
              { value: "2",        label: "AI Cameras" },
              { value: "400",      label: "Capacity" },
              { value: "12",       label: "Changing Rooms" },
              { value: "24/7",     label: "Security" },
              { value: "99%",      label: "Uptime" },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <div className="photo-card p-6 text-center">
                  <div className="text-3xl font-black mb-1" style={{ color: "#2d6a4f" }}>{s.value}</div>
                  <div className="text-xs text-[#7a7a7a] font-medium">{s.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ─────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Why Bambis Meda</div>
            <h2 className="heading-xl">What Sets Us Apart</h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: "📹", title: "AI Camera System",         desc: "Every match is automatically recorded in HD. Players can watch replays the same evening." },
              { emoji: "⚡", title: "Instant Online Booking",   desc: "No more phone calls. Reserve your field, pick your time, and pay — all in under 2 minutes." },
              { emoji: "⚽", title: "Multi-Sport Courts",       desc: "Football, Futsal, Basketball, and Volleyball — all available in one location." },
              { emoji: "👮", title: "Referee Booking",          desc: "Add a certified referee to any booking at checkout. We handle the scheduling." },
              { emoji: "🏟️", title: "Professional Facilities",  desc: "Artificial turf, LED floodlights, changing rooms, and free WiFi across the stadium." },
              { emoji: "✅", title: "ULS Verified Quality",     desc: "ET Smart Fields independently verified our facility for quality, safety, and technology standards." },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="photo-card p-7 h-full flex gap-4">
                  <div className="text-3xl flex-shrink-0">{item.emoji}</div>
                  <div>
                    <h3 className="font-black text-[#111] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#7a7a7a] leading-relaxed">{item.desc}</p>
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
