"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Share2, Heart, Bell, Users, Clock,
  Trophy, Target, Zap, Download, Bookmark
} from "lucide-react";
import LivePlayer from "@/components/live/LivePlayer";
import MatchScoreboard from "@/components/live/MatchScoreboard";
import CameraSelector from "@/components/live/CameraSelector";
import MatchTimeline from "@/components/live/MatchTimeline";
import LiveChat from "@/components/live/LiveChat";
import ClipButton from "@/components/live/ClipButton";

// Demo data
const DEMO_MATCH = {
  id: "match-live-1",
  homeTeam: "Addis Stars",
  awayTeam: "Lion City FC",
  homeScore: 2,
  awayScore: 1,
  matchTime: "67:23",
  half: 2,
  stadium: "Bambis Meda Stadium",
  field: "Field A",
  league: "Addis Ababa Premier League",
  matchday: "Matchday 12",
};

const DEMO_CAMERAS = [
  { id: "cam-1", name: "Main Camera", angle: "Center / Wide", status: "online" as const, isPrimary: true },
  { id: "cam-2", name: "Goal Cam", angle: "Behind Goal", status: "online" as const },
  { id: "cam-3", name: "Sideline", angle: "Touchline Left", status: "online" as const },
  { id: "cam-4", name: "Aerial View", angle: "Drone / Overhead", status: "offline" as const },
];

const DEMO_TIMELINE = [
  { id: "t1", type: "goal" as const, minute: 12, description: "Abebe K. — Long-range strike", team: "home" as const },
  { id: "t2", type: "yellow-card" as const, minute: 23, description: "Dawit M. — Tactical foul", team: "away" as const },
  { id: "t3", type: "goal" as const, minute: 34, description: "Yonas T. — Header from corner", team: "home" as const },
  { id: "t4", type: "substitution" as const, minute: 45, description: "Fatuma A. ↔ Meron B.", team: "home" as const },
  { id: "t5", type: "goal" as const, minute: 58, description: "Liul A. — Penalty kick", team: "away" as const },
  { id: "t6", type: "chance" as const, minute: 62, description: "Abebe K. — Shot saved by keeper", team: "home" as const },
];

export default function LiveMatchPage() {
  const [activeCamera, setActiveCamera] = useState("cam-1");
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerCount, setViewerCount] = useState(1247);
  const [matchTime, setMatchTime] = useState({ minutes: 67, seconds: 23 });

  // Simulate match time
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

  // Simulate viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((c) => c + Math.floor(Math.random() * 10) - 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/stadiums" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft size={18} />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-red-600">LIVE</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                <Users size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-600">{viewerCount.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isFollowing
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
                }`}
              >
                <Heart size={14} fill={isFollowing ? "currentColor" : "none"} />
                <span className="hidden sm:inline">{isFollowing ? "Following" : "Follow"}</span>
              </button>
              <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                <Share2 size={16} />
              </button>
              <ClipButton matchId={DEMO_MATCH.id} currentTime={matchTime.minutes} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video & Score */}
          <div className="lg:col-span-2 space-y-4">
            {/* Live Player */}
            <LivePlayer isLive={true} />

            {/* Match Info Bar */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {DEMO_MATCH.homeTeam} vs {DEMO_MATCH.awayTeam}
                </h1>
                <p className="text-sm text-slate-500">
                  {DEMO_MATCH.stadium} • {DEMO_MATCH.field} • {DEMO_MATCH.league}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
                  <Bell size={16} />
                </button>
                <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
                  <Bookmark size={16} />
                </button>
              </div>
            </div>

            {/* Scoreboard */}
            <MatchScoreboard
              homeTeam={DEMO_MATCH.homeTeam}
              awayTeam={DEMO_MATCH.awayTeam}
              homeScore={DEMO_MATCH.homeScore}
              awayScore={DEMO_MATCH.awayScore}
              matchTime={`${matchTime.minutes}:${matchTime.seconds.toString().padStart(2, "0")}`}
              half={DEMO_MATCH.half}
            />

            {/* Timeline */}
            <MatchTimeline
              events={DEMO_TIMELINE}
              currentMinute={matchTime.minutes}
            />
          </div>

          {/* Right Column - Camera & Chat */}
          <div className="space-y-4">
            {/* Camera Selector */}
            <CameraSelector
              cameras={DEMO_CAMERAS}
              activeCamera={activeCamera}
              onSelect={setActiveCamera}
            />

            {/* Match Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Target size={16} className="text-green-600" />
                <h3 className="text-sm font-bold text-slate-900">Match Stats</h3>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { label: "Possession", home: 58, away: 42 },
                  { label: "Shots", home: 12, away: 8 },
                  { label: "Shots on Target", home: 6, away: 3 },
                  { label: "Corners", home: 6, away: 3 },
                  { label: "Fouls", home: 8, away: 11 },
                  { label: "Offsides", home: 2, away: 1 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-700">{stat.home}</span>
                      <span className="text-xs text-slate-400">{stat.label}</span>
                      <span className="text-sm font-bold text-slate-700">{stat.away}</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="flex-1 bg-slate-100 rounded-full overflow-hidden flex justify-end">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${stat.home}%` }} />
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stat.away}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat */}
            <LiveChat matchId={DEMO_MATCH.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
