"use client";

import { motion } from "framer-motion";
import { Shield, Shirt } from "lucide-react";

interface MatchScoreboardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  matchTime: string;
  half: number;
  homeColor?: string;
  awayColor?: string;
}

export default function MatchScoreboard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  matchTime,
  half,
  homeColor = "#16a34a",
  awayColor = "#2563eb",
}: MatchScoreboardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Match Header */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Premier League • Matchday 12</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-red-600">LIVE</span>
        </div>
      </div>

      {/* Score */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: homeColor + "15" }}>
              <Shield size={32} style={{ color: homeColor }} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{homeTeam}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Home</p>
          </div>

          {/* Score */}
          <div className="px-8">
            <div className="flex items-center gap-4">
              <motion.span
                key={homeScore}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-5xl font-black text-slate-900"
              >
                {homeScore}
              </motion.span>
              <span className="text-2xl font-light text-slate-300">-</span>
              <motion.span
                key={awayScore}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-5xl font-black text-slate-900"
              >
                {awayScore}
              </motion.span>
            </div>
            <div className="text-center mt-2">
              <span className="text-sm font-bold text-green-600">{matchTime}</span>
              <span className="text-xs text-slate-400 ml-2">• Half {half}</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: awayColor + "15" }}>
              <Shield size={32} style={{ color: awayColor }} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{awayTeam}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Away</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-4 grid grid-cols-3 gap-4">
        {[
          { label: "Possession", home: "58%", away: "42%" },
          { label: "Shots", home: "12", away: "8" },
          { label: "Corners", home: "6", away: "3" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700">{stat.home}</span>
              <span className="text-[10px] text-slate-400">{stat.label}</span>
              <span className="text-xs font-bold text-slate-700">{stat.away}</span>
            </div>
            <div className="flex gap-0.5 h-1">
              <div className="flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${parseInt(stat.home)}%` }} />
              </div>
              <div className="flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${parseInt(stat.away)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
