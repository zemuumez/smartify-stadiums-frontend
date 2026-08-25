"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Share2, Heart, Users, Clock,
  Trophy, Target, Zap, Download, Bookmark, Video, Shield, Building2,
  ArrowUpRight, Bell, Sparkles, Radio
} from "lucide-react";
import LivePlayer from "@/components/live/LivePlayer";
import MatchScoreboard from "@/components/live/MatchScoreboard";
import CameraSelector from "@/components/live/CameraSelector";
import MatchTimeline from "@/components/live/MatchTimeline";
import LiveChat from "@/components/live/LiveChat";
import ClipButton from "@/components/live/ClipButton";

const DEMO_MATCH = {
  id: "match-live-1",
  homeTeam: "Bole Lions FC",
  awayTeam: "Kirkos United",
  homeScore: 2,
  awayScore: 1,
  matchTime: "67:23",
  half: 2,
  stadium: "Bambis Meda Stadium",
  field: "Field 1 — Artificial Turf",
  league: "Addis Ababa Premier League",
  matchday: "Matchday 12",
};

const DEMO_CAMERAS = [
  { id: "cam-1", name: "Main Camera", angle: "Center / 4K Panoramic", status: "online" as const, isPrimary: true },
  { id: "cam-2", name: "Goal Cam North", angle: "Behind Goal", status: "online" as const },
  { id: "cam-3", name: "Sideline Cam", angle: "Touchline West", status: "online" as const },
  { id: "cam-4", name: "Tactical Aerial", angle: "High Angle View", status: "offline" as const },
];

const DEMO_TIMELINE = [
  { id: "t1", type: "goal" as const, minute: 12, description: "Yonas T. — Long-range strike", team: "home" as const },
  { id: "t2", type: "yellow-card" as const, minute: 23, description: "Dawit M. — Tactical foul", team: "away" as const },
  { id: "t3", type: "goal" as const, minute: 34, description: "Abebe K. — Header from corner", team: "home" as const },
  { id: "t4", type: "substitution" as const, minute: 45, description: "Fatuma A. ↔ Meron B.", team: "home" as const },
  { id: "t5", type: "goal" as const, minute: 58, description: "Liul A. — Penalty kick", team: "away" as const },
  { id: "t6", type: "chance" as const, minute: 62, description: "Yonas T. — Shot saved by keeper", team: "home" as const },
];

export default function LiveMatchPage() {
  const [activeCamera, setActiveCamera] = useState("cam-1");
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerCount, setViewerCount] = useState(1420);
  const [matchTime, setMatchTime] = useState({ minutes: 67, seconds: 23 });
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchTime((t) => {
        if (t.seconds >= 59) {
          return { minutes: t.minutes + 1, seconds: 0 };
        }
        return { ...t, seconds: t.seconds + 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((c) => c + Math.floor(Math.random() * 8) - 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-20 relative" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── COMING SOON BLURRED FROSTED OVERLAY ── */}
      <div className="fixed inset-x-0 bottom-0 top-20 z-40 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/95 rounded-3xl p-8 sm:p-10 max-w-xl w-full shadow-2xl border border-white/60 text-center relative overflow-hidden my-auto"
        >
          {/* Accent glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#2d6a4f]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#74c69d]/20 rounded-full blur-3xl" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg shadow-[#2d6a4f]/25 relative z-10" style={{ background: "#2d6a4f" }}>
            <Radio size={28} className="animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#2d6a4f] bg-[#f0faf4] border border-[#2d6a4f]/15 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live AI Streaming
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#111] mb-3 tracking-tight">
            Coming Soon
          </h2>

          <p className="text-sm sm:text-base text-[#6a6a6a] leading-relaxed mb-8 max-w-md mx-auto">
            We are integrating autonomous 4K Veo Cam 3 hardware with stadium partners across Addis Ababa, Hawassa, and Dire Dawa. Live multi-angle camera feeds, automatic goal replays, and real-time match telemetry will launch soon.
          </p>

          {/* Email notify form */}
          {!emailSubscribed ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (notifyEmail) setEmailSubscribed(true);
              }}
              className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto mb-6"
            >
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Enter your email for early access"
                required
                className="flex-1 px-4 py-3 rounded-full border border-black/10 bg-white text-xs font-semibold text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#2d6a4f]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap"
                style={{ background: "#2d6a4f" }}
              >
                <Bell size={13} />
                Notify Me
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-[#f0faf4] text-xs font-bold text-[#2d6a4f] mb-6 flex items-center justify-center gap-2">
              <Sparkles size={16} />
              You&apos;re on the early access list! We&apos;ll notify you when live broadcast opens.
            </div>
          )}

          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-center gap-4">
            <Link
              href="/stadiums"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 shadow-md"
              style={{ background: "#2d6a4f" }}
            >
              Explore Verified Venues <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── BACKGROUND LIVE PAGE PREVIEW (Blurred underneath) ── */}
      <div className="pointer-events-none filter blur-sm select-none opacity-80">
        {/* Top control strip */}
        <div className="bg-white border-b shadow-sm" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="spotnow-container">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5a5a5a]">
                  <ArrowLeft size={16} />
                  <span>Back to Venues</span>
                </div>
                <div className="h-5 w-px bg-black/10" />
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                  <span className="text-xs font-black text-red-600 uppercase tracking-wider">LIVE 4K BROADCAST</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f]">
                  <Users size={13} />
                  <span>1,420 watching</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="spotnow-container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="photo-card overflow-hidden">
                <LivePlayer isLive={true} />
              </div>
              <div className="photo-card p-6 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-[#111]">
                    {DEMO_MATCH.homeTeam} vs {DEMO_MATCH.awayTeam}
                  </h1>
                  <p className="text-[#7a7a7a] text-xs mt-0.5 flex items-center gap-1.5">
                    <Building2 size={13} style={{ color: "#2d6a4f" }} /> {DEMO_MATCH.stadium} - {DEMO_MATCH.field}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <CameraSelector
                cameras={DEMO_CAMERAS}
                activeCamera={activeCamera}
                onSelect={setActiveCamera}
              />
              <LiveChat matchId={DEMO_MATCH.id} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
