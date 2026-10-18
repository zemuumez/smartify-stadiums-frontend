"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin, Rocket, GraduationCap, Globe } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/i18n/provider";

const teamColors: Record<string, string> = {
  Engineering: "#2d6a4f",
  Operations: "#1e6091",
  Growth: "#9c4221",
  Design: "#6b21a8",
};

export default function CareersPage() {
  const { t } = useI18n();

  const openings = [
    {
      title: t("roleBackendTitle"),
      teamKey: "Engineering",
      team: t("teamEngineering"),
      type: t("fullTime"),
      location: t("addisAbaba"),
      tags: ["Go", "PostgreSQL", "REST API"],
      desc: t("roleBackendDesc"),
    },
    {
      title: t("roleFrontendTitle"),
      teamKey: "Engineering",
      team: t("teamEngineering"),
      type: t("fullTime"),
      location: t("addisAbaba"),
      tags: ["Next.js", "TypeScript", "Modern CSS"],
      desc: t("roleFrontendDesc"),
    },
    {
      title: t("roleOpsTitle"),
      teamKey: "Operations",
      team: t("teamOperations"),
      type: t("fullTime"),
      location: t("addisAbaba"),
      tags: ["Camera Install", "Stadium Relations", "Field QA"],
      desc: t("roleOpsDesc"),
    },
    {
      title: t("roleSalesTitle"),
      teamKey: "Growth",
      team: t("teamGrowth"),
      type: t("fullTime"),
      location: t("addisAbaba"),
      tags: ["B2B Sales", "Partnerships", "Stadium Outreach"],
      desc: t("roleSalesDesc"),
    },
    {
      title: t("roleTechTitle"),
      teamKey: "Operations",
      team: t("teamOperations"),
      type: t("fullTime"),
      location: t("ethiopiaField"),
      tags: ["RTMP", "Camera Hardware", "Networking"],
      desc: t("roleTechDesc"),
    },
    {
      title: t("roleDesignTitle"),
      teamKey: "Design",
      team: t("teamDesign"),
      type: t("fullTime"),
      location: t("addisRemote"),
      tags: ["Figma", "UX Research", "Design Systems"],
      desc: t("roleDesignDesc"),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO ── */}
      <section className="pt-40 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">{t("careersTitle")}</div>
            <h1
              className="text-[#111] font-black leading-tight mb-6"
              style={{ fontSize: "clamp(2.4rem, 6vw, 3.8rem)", letterSpacing: "-0.025em" }}
            >
              {t("careersHeroTitle")}
            </h1>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed mb-6 max-w-2xl">
              {t("careersNotice")}
            </div>
            <p className="text-[#7a7a7a] text-xl max-w-lg leading-relaxed">
              {t("careersHeroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHY JOIN ── */}
      <section className="py-20" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">{t("whyJoinTitle")}</div>
            <h2 className="heading-xl">{t("whyJoinHeading")}</h2>
          </FadeUp>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <MapPin size={24} style={{ color: "#2d6a4f" }} />, title: t("realImpact"), desc: t("realImpactDesc") },
              { icon: <Rocket size={24} style={{ color: "#2d6a4f" }} />, title: t("earlyStage"), desc: t("earlyStageDesc") },
              { icon: <GraduationCap size={24} style={{ color: "#2d6a4f" }} />, title: t("growFast"), desc: t("growFastDesc") },
              { icon: <Globe size={24} style={{ color: "#2d6a4f" }} />, title: t("missionDriven"), desc: t("missionDrivenDesc") },
            ].map((c) => (
              <StaggerItem key={c.title}>
                <div className="photo-card p-7 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#f0faf4" }}>
                      {c.icon}
                    </div>
                    <h3 className="font-black text-[#111] text-base mb-2">{c.title}</h3>
                    <p className="text-sm text-[#7a7a7a] leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── OPEN ROLES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">{t("openPositions")}</div>
            <h2 className="heading-xl">{t("weAreHiring")}</h2>
          </FadeUp>

          <StaggerChildren className="space-y-4">
            {openings.map((role) => (
              <StaggerItem key={role.title}>
                <div className="photo-card p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:-translate-y-0.5 transition-all">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                        style={{ background: teamColors[role.teamKey] || "#2d6a4f" }}
                      >
                        {role.team}
                      </span>
                      <span className="text-xs text-[#7a7a7a] font-medium">{role.type} - {role.location}</span>
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
                    aria-label={`${t("applyForRole")}: ${role.title}`}
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1a10 0%, #1a4731 50%, #0d2b1d 100%)" }}
      >
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-white font-black text-4xl mb-4">{t("dontSeeRole")}</h2>
            <p className="text-white/65 text-lg mb-10 max-w-md mx-auto">
              {t("dontSeeRoleDesc")}
            </p>
            <Link href="/contact" className="btn-primary btn-primary-lg" style={{ background: "#2d6a4f" }}>
              {t("sendOpenApplication")} <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
