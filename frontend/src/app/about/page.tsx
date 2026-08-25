"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe, Users, Shield, Zap, Target, Heart,
  ArrowRight, Camera, Video, CheckCircle2,
  TrendingUp, Smartphone, Award, Search, Building2,
  Trophy, Film, Activity, ShieldCheck
} from "lucide-react";
import { FadeUp, SlideIn, ScaleIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const stats = [
  { value: "50+",  label: "Stadiums Connected" },
  { value: "10K+", label: "Active Players" },
  { value: "6",    label: "Sports Supported" },
  { value: "5K+",  label: "Matches Recorded" },
];

const values = [
  {
    icon: <Target size={28} style={{ color: "#2d6a4f" }} />,
    title: "Innovation",
    desc: "We bring cutting-edge AI camera systems and digital infrastructure tools to Ethiopian sports, making professional broadcast quality accessible to every stadium.",
  },
  {
    icon: <Heart size={28} style={{ color: "#2d6a4f" }} />,
    title: "Community",
    desc: "Sports are about people. We build tools that strengthen the bond between players, teams, and stadiums across every city and sub-city in Ethiopia.",
  },
  {
    icon: <Shield size={28} style={{ color: "#2d6a4f" }} />,
    title: "Trust",
    desc: "Our ULS verification badge ensures every listed stadium meets rigorous quality, safety, and technology standards before players can book.",
  },
];

const differentiators = [
  { icon: <Activity size={22} style={{ color: "#2d6a4f" }} />, title: "Multi-Sport Support", desc: "Football, Basketball, Volleyball, Badminton, Tennis, and Futsal supported from day one." },
  { icon: <Camera size={22} style={{ color: "#2d6a4f" }} />, title: "AI Camera Integration", desc: "Automatic match recording with AI-powered highlight generation. No manual filming needed." },
  { icon: <Zap size={22} style={{ color: "#2d6a4f" }} />, title: "Zero Double-Booking", desc: "Real-time slot synchronization ensures a field can never be booked twice at the same time." },
  { icon: <Globe size={22} style={{ color: "#2d6a4f" }} />, title: "Stadium Microsites", desc: "Every stadium owner gets a fully customizable public website with events, highlights, and booking links." },
  { icon: <Film size={22} style={{ color: "#2d6a4f" }} />, title: "Video Replay Platform", desc: "Players watch full match replays and share highlight clips from their personal dashboard." },
  { icon: <Smartphone size={22} style={{ color: "#2d6a4f" }} />, title: "Ethiopian Payments", desc: "Native support for Telebirr and CBE Birr, the dominant mobile payment methods in Ethiopia." },
  { icon: <Trophy size={22} style={{ color: "#2d6a4f" }} />, title: "Team & League Management", desc: "Built-in team creation, roster management, league tables, and standings for organized play." },
  { icon: <ShieldCheck size={22} style={{ color: "#2d6a4f" }} />, title: "Verified Stadium Program", desc: "The ULS badge builds trust between players and stadium owners through verified quality guarantees." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "520px" }}>
        <div className="absolute inset-0">
          <Image
            src="/hero-sports-field.jpg"
            alt="Ethiopian sports stadium"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 photo-overlay-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="text-xs font-bold tracking-widest uppercase text-[#74c69d] mb-4">About Us</div>
            <h1
              className="text-white font-black leading-tight mb-6"
              style={{ fontSize: "clamp(2.6rem, 6vw, 4rem)", letterSpacing: "-0.025em" }}
            >
              Building Ethiopia&apos;s
              <br />
              <span style={{ color: "#74c69d" }}>Smart Sports Future</span>
            </h1>
            <p className="text-white/75 text-xl leading-relaxed">
              ET Smart Fields is on a mission to digitize and elevate sports infrastructure across Ethiopia, connecting players, stadiums, and technology in one seamless platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION + STATS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideIn direction="left">
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">Our Mission</div>
              <h2 className="heading-xl mb-6">
                Making Sports Accessible
                <br />to Every Ethiopian
              </h2>
              <p className="text-[#7a7a7a] text-lg leading-relaxed mb-5">
                We believe every athlete in Ethiopia, whether a footballer in Bole, a basketball player in Kirkos, or a volleyball team in Gondar, deserves access to quality facilities, fair pricing, and the ability to relive their best moments through technology.
              </p>
              <p className="text-[#7a7a7a] leading-relaxed mb-8">
                Founded in Addis Ababa by Unity Link Solutions, ET Smart Fields is Ethiopia&apos;s first integrated multi-sport infrastructure platform. We provide stadiums with modern booking systems, AI-powered camera technology, and professional microsites, all under one roof.
              </p>
              <Link href="/auth/register" className="btn-primary btn-primary-lg" style={{ background: "#2d6a4f" }}>
                Register Your Stadium <ArrowRight size={16} />
              </Link>
            </SlideIn>

            <SlideIn direction="right">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="photo-card p-8 text-center"
                  >
                    <div className="text-4xl font-black mb-2" style={{ color: "#2d6a4f" }}>{s.value}</div>
                    <div className="text-sm text-[#7a7a7a] font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Platform</div>
            <h2 className="heading-xl mb-4">What ET Smart Fields Does</h2>
            <p className="text-[#7a7a7a] text-lg max-w-xl mx-auto">Three core pillars power everything we build.</p>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search size={24} style={{ color: "#2d6a4f" }} />,
                title: "Field Discovery & Booking",
                desc: "Players find, compare, and book sports fields across Ethiopia in under 2 minutes by sport, location, date, time, and price. Instant confirmation via Telebirr or Chapa.",
              },
              {
                icon: <Building2 size={24} style={{ color: "#2d6a4f" }} />,
                title: "Smart Stadium Management",
                desc: "Stadium owners manage fields, cameras, bookings, revenue, and their public microsite from a single dashboard. No more WhatsApp chaos or manual scheduling.",
              },
              {
                icon: <Film size={24} style={{ color: "#2d6a4f" }} />,
                title: "Match Intelligence",
                desc: "AI cameras record every match, generate highlights automatically within minutes, and provide full video replays accessible to players and teams.",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="photo-card p-8 h-full">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: "#f0faf4" }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black text-[#111] mb-3">{item.title}</h3>
                  <p className="text-[#7a7a7a] leading-relaxed text-sm">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Values</div>
            <h2 className="heading-xl">What Drives Us</h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="photo-card p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "#f0faf4" }}>
                    {v.icon}
                  </div>
                  <h3 className="text-xl font-black text-[#111] mb-3">{v.title}</h3>
                  <p className="text-[#7a7a7a] leading-relaxed text-sm">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 8 KEY DIFFERENTIATORS ── */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Why ET Smart Fields</div>
            <h2 className="heading-xl max-w-lg">What Makes Us Different</h2>
          </FadeUp>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {differentiators.map((d) => (
              <StaggerItem key={d.title}>
                <div className="photo-card p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "#f0faf4" }}>
                      {d.icon}
                    </div>
                    <h3 className="font-black text-[#111] text-base mb-2">{d.title}</h3>
                    <p className="text-[#7a7a7a] text-sm leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">The Team</div>
            <h2 className="heading-xl">The People Behind ET Smart Fields</h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {[
              {
                letter: "U",
                name: "Unity Link Solutions",
                role: "Founding Company",
                desc: "Ethiopian technology company specializing in sports SaaS platforms, digital infrastructure, and modern web systems.",
              },
              {
                letter: "E",
                name: "Engineering Team",
                role: "Product & Engineering",
                desc: "Building scalable systems with Go, PostgreSQL, Next.js, and Three.js, focused on reliability and performance at scale.",
              },
              {
                letter: "F",
                name: "Field Operations",
                role: "Stadium Relations & Onboarding",
                desc: "Onboarding stadiums across Ethiopia, installing AI camera systems, and enforcing ULS quality and safety standards.",
              },
            ].map((m) => (
              <StaggerItem key={m.name}>
                <div className="photo-card p-8 text-center h-full">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-black"
                    style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}
                  >
                    {m.letter}
                  </div>
                  <h3 className="font-black text-[#111] text-base mb-1">{m.name}</h3>
                  <p className="text-sm font-semibold mb-3" style={{ color: "#2d6a4f" }}>{m.role}</p>
                  <p className="text-sm text-[#7a7a7a] leading-relaxed">{m.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1a10 0%, #1a4731 50%, #0d2b1d 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <Image src="/testimonial-venue.jpg" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <h2
              className="text-white font-black leading-tight mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
            >
              Join the Movement
            </h2>
            <p className="text-white/65 text-xl mb-12 max-w-xl mx-auto">
              Be part of Ethiopia&apos;s sports infrastructure revolution. Register your stadium or find a field near you today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary btn-primary-lg" style={{ background: "#2d6a4f" }}>
                Register Your Stadium <ArrowRight size={16} />
              </Link>
              <Link href="/stadiums" className="btn-ghost-white" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
                Find Stadiums
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
