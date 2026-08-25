"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const openings = [
  {
    title: "Backend Engineer",
    team: "Engineering",
    type: "Full-time",
    location: "Addis Ababa",
    tags: ["Go", "PostgreSQL", "REST API"],
    desc: "Build and scale the ET Smart Fields booking engine, camera pipeline, and analytics backend using Go and PostgreSQL.",
  },
  {
    title: "Frontend Engineer",
    team: "Engineering",
    type: "Full-time",
    location: "Addis Ababa",
    tags: ["Next.js", "TypeScript", "Framer Motion"],
    desc: "Build stunning, performant web experiences for players and stadium owners using Next.js, TypeScript, and Tailwind CSS.",
  },
  {
    title: "Field Operations Manager",
    team: "Operations",
    type: "Full-time",
    location: "Addis Ababa",
    tags: ["Camera Install", "Stadium Relations", "Field QA"],
    desc: "Onboard new stadiums, manage AI camera installations, and ensure ULS verification standards are met across all partner venues.",
  },
  {
    title: "Sales & Partnerships Lead",
    team: "Growth",
    type: "Full-time",
    location: "Addis Ababa",
    tags: ["B2B Sales", "Partnerships", "Stadium Outreach"],
    desc: "Grow our stadium network by building relationships with venue owners across Addis Ababa, Dire Dawa, and beyond.",
  },
  {
    title: "AI Camera Technician",
    team: "Operations",
    type: "Full-time",
    location: "Field-based, Ethiopia",
    tags: ["RTMP", "Camera Hardware", "Networking"],
    desc: "Install, configure, and maintain AI camera systems (Veo Cam, SporPin X200, Hikvision) at ET Smart Fields partner stadiums.",
  },
  {
    title: "Product Designer (UI/UX)",
    team: "Design",
    type: "Full-time",
    location: "Addis Ababa / Remote",
    tags: ["Figma", "UX Research", "Design Systems"],
    desc: "Design beautiful, intuitive experiences for our player app, stadium dashboard, and microsite editor across web and mobile.",
  },
];

const teamColors: Record<string, string> = {
  Engineering: "#2d6a4f",
  Operations: "#1e6091",
  Growth: "#9c4221",
  Design: "#6b21a8",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="pt-40 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">Careers</div>
            <h1
              className="text-[#111] font-black leading-tight mb-6"
              style={{ fontSize: "clamp(2.4rem, 6vw, 3.8rem)", letterSpacing: "-0.025em" }}
            >
              Build Ethiopia&apos;s
              <br />
              <span style={{ color: "#2d6a4f" }}>Sports Future</span>
              <br />
              With Us
            </h1>
            <p className="text-[#7a7a7a] text-xl max-w-lg leading-relaxed">
              We&apos;re a small, driven team building the infrastructure that will power sports in Ethiopia for a generation. Come help us do it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHY JOIN ────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Why ET Smart Fields</div>
            <h2 className="heading-xl">Work That Matters</h2>
          </FadeUp>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: "🇪🇹", title: "Real Impact", desc: "Your work directly enables thousands of Ethiopian athletes to play, record, and share their sport." },
              { emoji: "🚀", title: "Early Stage", desc: "Join early and have real ownership over product decisions, architecture, and team culture." },
              { emoji: "🎓", title: "Grow Fast", desc: "We invest in your growth — conferences, courses, and a learning budget for every team member." },
              { emoji: "🌍", title: "Mission-Driven", desc: "We're building something that has never existed in Ethiopia. That's a rare opportunity." },
            ].map((c) => (
              <StaggerItem key={c.title}>
                <div className="photo-card p-7 h-full">
                  <div className="text-3xl mb-4">{c.emoji}</div>
                  <h3 className="font-black text-[#111] text-base mb-2">{c.title}</h3>
                  <p className="text-sm text-[#7a7a7a] leading-relaxed">{c.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── OPEN ROLES ──────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Open Positions</div>
            <h2 className="heading-xl">We&apos;re Hiring</h2>
          </FadeUp>

          <StaggerChildren className="space-y-4">
            {openings.map((role) => (
              <StaggerItem key={role.title}>
                <div className="photo-card p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:-translate-y-0.5 transition-all">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                        style={{ background: teamColors[role.team] || "#2d6a4f" }}
                      >
                        {role.team}
                      </span>
                      <span className="text-xs text-[#7a7a7a] font-medium">{role.type} · {role.location}</span>
                    </div>
                    <h3 className="font-black text-[#111] text-xl mb-2">{role.title}</h3>
                    <p className="text-sm text-[#7a7a7a] leading-relaxed mb-3 max-w-xl">{role.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {role.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ background: "#f0faf4", color: "#2d6a4f" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="btn-arrow flex-shrink-0"
                    style={{ background: "#2d6a4f" }}
                    aria-label={`Apply for ${role.title}`}
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1a10 0%, #1a4731 50%, #0d2b1d 100%)" }}
      >
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-white font-black text-4xl mb-4">Don&apos;t See Your Role?</h2>
            <p className="text-white/65 text-lg mb-10 max-w-md mx-auto">
              We&apos;re always looking for exceptional people. Send us your CV and tell us how you&apos;d contribute.
            </p>
            <Link href="/contact" className="btn-primary btn-primary-lg" style={{ background: "#2d6a4f" }}>
              Send an Open Application <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
