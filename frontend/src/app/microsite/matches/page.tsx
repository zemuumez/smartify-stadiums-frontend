"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Trophy, Calendar, Video, Clock, Filter, Eye, Star, Camera, Zap } from "lucide-react";
import { useStadium, useMatches } from "@/lib/sanity/hooks";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const DEMO_STADIUM_ID = "demo-stadium-1";

const demoMatches = [
  {
    _id: "m1",
    date: "Aug 24, 2026",
    time: "4:00 PM",
    field: "Field 1 - Artificial Turf",
    sport: "Football",
    homeTeam: "Bole Lions FC",
    awayTeam: "Kirkos United",
    homeScore: 3,
    awayScore: 2,
    hasReplay: true,
    views: 342,
    highlightsCount: 5,
    tournament: "Bole Premier League",
  },
  {
    _id: "m2",
    date: "Aug 23, 2026",
    time: "6:00 PM",
    field: "Field 3 - Futsal Hall",
    sport: "Futsal",
    homeTeam: "Addis Strikers",
    awayTeam: "Raya Futsal Club",
    homeScore: 5,
    awayScore: 5,
    hasReplay: true,
    views: 520,
    highlightsCount: 8,
    tournament: "Friday Night Futsal Cup",
  },
  {
    _id: "m3",
    date: "Aug 22, 2026",
    time: "10:00 AM",
    field: "Court 1 - Basketball",
    sport: "Basketball",
    homeTeam: "Ethio Ballers",
    awayTeam: "Unity Dunkers",
    homeScore: 68,
    awayScore: 62,
    hasReplay: true,
    views: 215,
    highlightsCount: 4,
    tournament: "3v3 Weekend League",
  },
  {
    _id: "m4",
    date: "Aug 20, 2026",
    time: "5:00 PM",
    field: "Field 2 - 5-a-Side Turf",
    sport: "Football",
    homeTeam: "Sheger Warriors",
    awayTeam: "Entoto Hawks",
    homeScore: 1,
    awayScore: 4,
    hasReplay: true,
    views: 189,
    highlightsCount: 3,
    tournament: "Friendly Match",
  },
  {
    _id: "m5",
    date: "Aug 18, 2026",
    time: "7:00 PM",
    field: "Field 1 - Artificial Turf",
    sport: "Football",
    homeTeam: "Yeka Stars",
    awayTeam: "Bole Lions FC",
    homeScore: 2,
    awayScore: 2,
    hasReplay: false,
    views: 95,
    highlightsCount: 0,
    tournament: "Bole Premier League",
  },
];

export default function MicrositeMatches() {
  const [selectedSport, setSelectedSport] = useState("All");
  const [activeReplay, setActiveReplay] = useState<string | null>(null);

  const { stadium } = useStadium("bambis-meda");
  const { matches } = useMatches(stadium?._id || DEMO_STADIUM_ID);

  const displayMatches = matches && matches.length > 0 ? matches : demoMatches;
  const sports = ["All", "Football", "Futsal", "Basketball"];

  const filteredMatches = selectedSport === "All"
    ? displayMatches
    : displayMatches.filter((m: any) => m.sport?.includes(selectedSport) || m.field?.toLowerCase().includes(selectedSport.toLowerCase()));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>
      {/* ── HEADER ── */}
      <section className="pt-16 pb-12 bg-white border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">AI Match Replays</div>
            <h1 className="heading-xl mb-4">Scores &amp; Highlights</h1>
            <p className="text-[#7a7a7a] text-lg max-w-2xl leading-relaxed">
              Every match on AI-camera enabled fields is automatically captured. Watch full 90-minute recordings, Goal of the Month clips, and share match replays with your team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`sport-pill ${selectedSport === sport ? "active" : "inactive"}`}
                >
                  {sport}
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-[#7a7a7a]">
              Showing {filteredMatches.length} Matches
            </div>
          </div>
        </div>
      </section>

      {/* ── MATCH CARDS ── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="space-y-4">
            {filteredMatches.map((match: any) => (
              <StaggerItem key={match._id}>
                <div className="photo-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-lg transition-all">
                  {/* Left: Tournament and teams */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-[#2d6a4f]" style={{ background: "#f0faf4" }}>
                        {match.tournament || "Match Session"}
                      </span>
                      <span className="text-xs text-[#8a8a8a] flex items-center gap-1.5 font-medium">
                        <Calendar size={12} /> {match.date}
                      </span>
                      <span className="text-xs text-[#8a8a8a] flex items-center gap-1.5 font-medium">
                        <Clock size={12} /> {match.time || "Full Time"}
                      </span>
                      <span className="text-xs font-semibold text-[#5a5a5a]">
                        - {match.field}
                      </span>
                    </div>

                    {/* Score Board */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-8 my-2">
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-lg md:text-xl font-black text-[#111] truncate">{match.homeTeam}</div>
                        <div className="text-xs text-[#7a7a7a]">Home</div>
                      </div>

                      <div className="px-5 py-2 rounded-2xl flex items-center gap-3 text-2xl md:text-3xl font-black text-[#111]" style={{ background: "#f4f3ef" }}>
                        <span>{match.homeScore ?? 0}</span>
                        <span className="text-sm font-bold text-[#aaa]">-</span>
                        <span>{match.awayScore ?? 0}</span>
                      </div>

                      <div className="flex-1 min-w-[120px] text-right sm:text-left">
                        <div className="text-lg md:text-xl font-black text-[#111] truncate">{match.awayTeam}</div>
                        <div className="text-xs text-[#7a7a7a]">Away</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & stats */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    {match.views && (
                      <div className="text-xs text-[#7a7a7a] flex items-center gap-1.5 font-medium">
                        <Eye size={13} style={{ color: "#2d6a4f" }} /> {match.views} views
                      </div>
                    )}

                    {match.hasReplay ? (
                      <button
                        onClick={() => setActiveReplay(activeReplay === match._id ? null : match._id)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                        style={{ background: "#2d6a4f", boxShadow: "0 4px 14px rgba(45,106,79,0.25)" }}
                      >
                        <Play size={14} fill="currentColor" /> Watch Replay
                      </button>
                    ) : (
                      <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#8a8a8a]" style={{ background: "#eae8e1" }}>
                        No Replay Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Video Simulation */}
                {activeReplay === match._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 photo-card p-6 overflow-hidden"
                    style={{ background: "#0d2b1d" }}
                  >
                    <div className="aspect-video w-full rounded-2xl relative overflow-hidden flex flex-col items-center justify-center text-center p-6" style={{ background: "linear-gradient(135deg, #071911 0%, #1a4731 100%)" }}>
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2 border-white/40 cursor-pointer transition-transform hover:scale-110" style={{ background: "rgba(45,106,79,0.85)", backdropFilter: "blur(8px)" }}>
                        <Play size={32} className="text-white ml-1" fill="currentColor" />
                      </div>
                      <h4 className="text-white font-black text-xl mb-1">{match.homeTeam} vs {match.awayTeam}</h4>
                      <p className="text-white/60 text-sm max-w-md">Full 90-Minute AI Camera Recording with 4K Tracking &amp; Key Highlights</p>
                      <div className="mt-4 flex gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1" style={{ background: "rgba(255,255,255,0.15)" }}>
                          <Clock size={11} /> 90:00 Recorded
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1" style={{ background: "rgba(255,255,255,0.15)" }}>
                          <Camera size={11} /> AI Veo Cam 3
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: "#74c69d", color: "#0d2b1d" }}>
                          <Zap size={11} /> 1080p HD
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 bg-white border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f]">
              <Camera size={24} />
            </div>
            <h3 className="text-2xl font-black text-[#111] mb-3">Want Your Match Recorded?</h3>
            <p className="text-[#7a7a7a] text-sm leading-relaxed mb-6 max-w-lg mx-auto">
              Book any field with an AI Camera badge. Replays and automated highlights will appear automatically on your player dashboard after the game.
            </p>
            <Link
              href="/bookings/new"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "#2d6a4f", boxShadow: "0 4px 16px rgba(45,106,79,0.3)" }}
            >
              Book a Camera Field
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
