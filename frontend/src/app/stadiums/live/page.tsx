"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Share2, Heart, Bell, Users, Clock,
  Trophy, Target, Zap, Download, Bookmark, Video, Shield
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
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "#f4f3ef" }}>
      {/* ── TOP CONTROL STRIP ── */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/stadiums" className="flex items-center gap-2 text-xs font-bold text-[#5a5a5a] hover:text-[#111] transition-colors">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back to Venues</span>
              </Link>
              <div className="h-5 w-px bg-black/10" />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                <span className="text-xs font-black text-red-600 uppercase tracking-wider">LIVE 4K BROADCAST</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f]">
                <Users size={13} />
                <span>{viewerCount.toLocaleString()} watching</span>
              </div>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isFollowing
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-white text-[#5a5a5a] border border-black/10 hover:bg-[#eae8e1]"
                }`}
              >
                <Heart size={13} fill={isFollowing ? "currentColor" : "none"} />
                <span className="hidden sm:inline">{isFollowing ? "Following" : "Follow Match"}</span>
              </button>
              <button className="p-2 rounded-full bg-white border border-black/10 text-[#5a5a5a] hover:bg-[#eae8e1] transition-colors">
                <Share2 size={14} />
              </button>
              <ClipButton matchId={DEMO_MATCH.id} currentTime={matchTime.minutes} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column — Video Player & Match Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Player Container */}
            <div className="photo-card overflow-hidden">
              <LivePlayer isLive={true} />
            </div>

            {/* Match Header Info */}
            <div className="photo-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white" style={{ background: "#2d6a4f" }}>
                    {DEMO_MATCH.league}
                  </span>
                  <span className="text-xs text-[#8a8a8a]">{DEMO_MATCH.matchday}</span>
                </div>
                <h1 className="text-xl font-black text-[#111]">
                  {DEMO_MATCH.homeTeam} vs {DEMO_MATCH.awayTeam}
                </h1>
                <p className="text-xs text-[#7a7a7a] mt-0.5">
                  🏟️ {DEMO_MATCH.stadium} • {DEMO_MATCH.field}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl bg-[#f4f3ef] text-[#5a5a5a] hover:bg-[#e1dfd8] transition-colors">
                  <Bell size={16} />
                </button>
                <button className="p-2.5 rounded-xl bg-[#f4f3ef] text-[#5a5a5a] hover:bg-[#e1dfd8] transition-colors">
                  <Bookmark size={16} />
                </button>
              </div>
            </div>

            {/* Scoreboard */}
            <div className="photo-card p-6">
              <MatchScoreboard
                homeTeam={DEMO_MATCH.homeTeam}
                awayTeam={DEMO_MATCH.awayTeam}
                homeScore={DEMO_MATCH.homeScore}
                awayScore={DEMO_MATCH.awayScore}
                matchTime={`${matchTime.minutes}:${matchTime.seconds.toString().padStart(2, "0")}`}
                half={DEMO_MATCH.half}
              />
            </div>

            {/* Match Timeline */}
            <div className="photo-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} style={{ color: "#2d6a4f" }} />
                <h3 className="font-black text-sm text-[#111]">Key Match Events</h3>
              </div>
              <MatchTimeline
                events={DEMO_TIMELINE}
                currentMinute={matchTime.minutes}
              />
            </div>
          </div>

          {/* Right Column — Camera Angles & Live Chat */}
          <div className="space-y-6">
            {/* Multi-Camera Angle Selector */}
            <div className="photo-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Video size={16} style={{ color: "#2d6a4f" }} />
                <h3 className="font-black text-sm text-[#111]">AI Camera Angles</h3>
              </div>
              <CameraSelector
                cameras={DEMO_CAMERAS}
                activeCamera={activeCamera}
                onSelect={setActiveCamera}
              />
            </div>

            {/* Live Chat */}
            <div className="photo-card overflow-hidden">
              <LiveChat matchId={DEMO_MATCH.id} />
            </div>

            {/* Match Stats */}
            <div className="photo-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Target size={16} style={{ color: "#2d6a4f" }} />
                <h3 className="font-black text-sm text-[#111]">Match Statistics</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Possession", home: 58, away: 42 },
                  { label: "Total Shots", home: 12, away: 8 },
                  { label: "Shots on Target", home: 6, away: 3 },
                  { label: "Corner Kicks", home: 6, away: 3 },
                  { label: "Fouls Committed", home: 8, away: 11 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-[#111]">
                      <span className="text-[#2d6a4f]">{stat.home}</span>
                      <span className="text-[#8a8a8a] text-[11px] uppercase tracking-wide font-semibold">{stat.label}</span>
                      <span className="text-[#5a5a5a]">{stat.away}</span>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[#eae8e1]">
                      <div className="h-full bg-[#2d6a4f] rounded-full" style={{ width: `${stat.home}%` }} />
                      <div className="h-full bg-[#74c69d] rounded-full" style={{ width: `${stat.away}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
