"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera, Video, Trophy, Users, Shield, Wifi,
  Lightbulb, Shirt, Calendar, ArrowRight, CheckCircle2,
  Sparkles, Clock, MapPin, Zap
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const services = [
  {
    icon: <Camera size={26} style={{ color: "#2d6a4f" }} />,
    tag: "AI Tech",
    title: "AI Match Recording",
    desc: "Autonomous smart camera tracking system that follows the action in 4K without requiring a cameraman. Automatic goal detection and continuous panoramic capture.",
    features: ["4K panoramic tracking", "Instant cloud upload", "Multi-angle replay generation"],
  },
  {
    icon: <Video size={26} style={{ color: "#2d6a4f" }} />,
    tag: "Highlights",
    title: "Instant Video Replays",
    desc: "Full 90-minute recordings and auto-generated highlight reels accessible on player dashboards within 15 minutes after full-time. Download and share to social media.",
    features: ["Goal of the Month voting", "Shareable 15s clips", "Private team download links"],
  },
  {
    icon: <Shield size={26} style={{ color: "#2d6a4f" }} />,
    tag: "Staff",
    title: "Certified Referees",
    desc: "Book licensed, experienced referees for competitive tournaments, friendly matches, or league fixtures right at the time of field checkout.",
    features: ["Licensed FA officials", "Fair-play monitoring", "Instant booking integration"],
  },
  {
    icon: <Trophy size={26} style={{ color: "#2d6a4f" }} />,
    tag: "Competitions",
    title: "Tournament Hosting",
    desc: "Full end-to-end tournament support: automated round-robin and knockout brackets, real-time leaderboard display, and trophy presentation support.",
    features: ["Custom tournament brackets", "Digital live scoreboard", "Prize ceremony support"],
  },
  {
    icon: <Shirt size={26} style={{ color: "#2d6a4f" }} />,
    tag: "Equipment",
    title: "Gear & Equipment Rental",
    desc: "Premium quality FIFA-approved match balls, colored bibs for team scrimmage, training cones, agility ladders, and goalie gloves available at reception.",
    features: ["Match balls & bib sets", "Electronic scorekeeping", "First aid & medical kits"],
  },
  {
    icon: <Users size={26} style={{ color: "#2d6a4f" }} />,
    tag: "Community",
    title: "Locker Rooms & Amenities",
    desc: "Clean, well-maintained changing rooms with hot-water showers, secure personal lockers, free high-speed stadium WiFi, and spectator seating areas.",
    features: ["Secure keycard lockers", "Hot showers & hygiene packs", "Stadium-wide high speed WiFi"],
  },
];

export default function MicrositeServices() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>
      {/* ── HEADER ── */}
      <section className="pt-16 pb-12 bg-white border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Facility Amenities</div>
            <h1 className="heading-xl mb-4">Stadium Services</h1>
            <p className="text-[#7a7a7a] text-lg max-w-2xl leading-relaxed">
              Every detail at Bambis Meda Stadium is built for peak performance. From AI camera tracking to locker rooms and professional referee booking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <StaggerItem key={s.title}>
                <div className="photo-card p-8 h-full flex flex-col justify-between hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-13 h-13 rounded-2xl flex items-center justify-center p-3" style={{ background: "#f0faf4" }}>
                        {s.icon}
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full text-[#2d6a4f]" style={{ background: "#f0faf4" }}>
                        {s.tag}
                      </span>
                    </div>

                    <h3 className="font-black text-[#111] text-xl mb-2">{s.title}</h3>
                    <p className="text-sm text-[#7a7a7a] leading-relaxed mb-6">{s.desc}</p>
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <ul className="space-y-2">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs font-semibold text-[#3d3d3d]">
                          <CheckCircle2 size={13} style={{ color: "#2d6a4f" }} className="flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── EXPERIENCE SECTION ── */}
      <section className="py-20 bg-white border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">The Player Experience</div>
              <h2 className="heading-xl mb-6">World-Class Standards In Every Session</h2>
              <p className="text-[#7a7a7a] leading-relaxed mb-6">
                We believe grassroots sports deserve elite infrastructure. Whether you are running a casual 5-a-side after work or competing in the Bole Premier League, our facility is prepped and maintained to the highest safety and performance standards.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Sanitized and floodlit fields tested every week",
                  "Secure digital booking with 0% risk of double-booking",
                  "Direct link to player accounts for match footage and stats",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3 text-sm font-semibold text-[#111]">
                    <CheckCircle2 size={18} style={{ color: "#2d6a4f" }} className="flex-shrink-0" />
                    {point}
                  </div>
                ))}
              </div>

              <Link
                href="/bookings/new"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: "#2d6a4f", boxShadow: "0 4px 16px rgba(45,106,79,0.3)" }}
              >
                <Calendar size={16} /> Book a Match Slot
              </Link>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="photo-card p-8 rounded-3xl" style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)", color: "white" }}>
                <Trophy size={32} className="text-white mb-4" />
                <h3 className="text-2xl font-black mb-3">Host a Tournament</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Planning a corporate cup, youth league, or community championship? We provide multi-field bookings, camera packages, referee coordination, and catering support.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                  <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="font-bold text-white">Up to 4 Fields</div>
                    <div className="text-white/60">Simultaneous Play</div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="font-bold text-white">Full Video Hub</div>
                    <div className="text-white/60">AI Broadcast</div>
                  </div>
                </div>
                <Link
                  href="/microsite/contact"
                  className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: "white", color: "#1a4731" }}
                >
                  Contact Tournament Team <ArrowRight size={14} />
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}
