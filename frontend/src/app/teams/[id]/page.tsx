"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, Calendar, MapPin, UserPlus, Crown, Star, TrendingUp, MoreVertical, Trash2 } from "lucide-react";

const TEAM = { id: "t1", name: "Addis Stars FC", city: "Addis Ababa", description: "Competitive 7-a-side team based in Addis Ababa.", players: 14, maxPlayers: 18, matches: 28, wins: 18, draws: 5, losses: 5, goalsFor: 62, goalsAgainst: 28, points: 59, rank: 1, captain: "Abebe Kebede", color: "#16a34a", initials: "AS", created: "Jan 2026" };

const ROSTER = [
  { id: "p1", name: "Abebe Kebede", position: "Forward", goals: 18, assists: 7, rating: 4.8, isCaptain: true, status: "active", joined: "Jan 2026" },
  { id: "p2", name: "Daniel Tadesse", position: "Midfielder", goals: 8, assists: 12, rating: 4.6, isCaptain: false, status: "active", joined: "Jan 2026" },
  { id: "p3", name: "Yonas Tesfaye", position: "Defender", goals: 3, assists: 5, rating: 4.4, isCaptain: false, status: "active", joined: "Feb 2026" },
  { id: "p4", name: "Dawit Mengistu", position: "Goalkeeper", goals: 0, assists: 0, rating: 4.5, isCaptain: false, status: "active", joined: "Jan 2026" },
  { id: "p5", name: "Meron Bekele", position: "Midfielder", goals: 6, assists: 9, rating: 4.3, isCaptain: false, status: "active", joined: "Mar 2026" },
  { id: "p6", name: "Fatuma Hassan", position: "Forward", goals: 12, assists: 4, rating: 4.7, isCaptain: false, status: "active", joined: "Feb 2026" },
  { id: "p7", name: "Liul Alemayehu", position: "Defender", goals: 2, assists: 3, rating: 4.2, isCaptain: false, status: "injured", joined: "Jan 2026" },
  { id: "p8", name: "Kidist Tesfaye", position: "Midfielder", goals: 5, assists: 8, rating: 4.4, isCaptain: false, status: "active", joined: "Apr 2026" },
];

const MATCH_HISTORY = [
  { id: "m1", opponent: "Lion City FC", score: "3-2", result: "win", date: "Aug 20, 2026", competition: "League" },
  { id: "m2", opponent: "Bole United", score: "2-0", result: "win", date: "Aug 15, 2026", competition: "League" },
  { id: "m3", opponent: "Holy City FC", score: "1-1", result: "draw", date: "Aug 10, 2026", competition: "League" },
  { id: "m4", opponent: "Merkato Tigers", score: "4-1", result: "win", date: "Aug 5, 2026", competition: "Cup" },
  { id: "m5", opponent: "Bambis XI", score: "2-3", result: "loss", date: "Jul 30, 2026", competition: "League" },
];

export default function TeamDetailPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "roster" | "matches" | "settings">("overview");
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "roster" as const, label: "Roster" },
    { id: "matches" as const, label: "Matches" },
    { id: "settings" as const, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="pt-24 pb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/teams" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"><ArrowLeft size={16} /> All Teams</Link>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white" style={{ backgroundColor: TEAM.color }}>{TEAM.initials}</div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white">{TEAM.name}</h1>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">#{TEAM.rank}</span>
              </div>
              <p className="text-slate-400 flex items-center gap-2 mt-1">
                <MapPin size={14} /> {TEAM.city} • <Users size={14} /> {TEAM.players}/{TEAM.maxPlayers} players
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[{ label: "Matches", value: TEAM.matches, icon: <Calendar size={20} className="text-blue-600" />, bg: "bg-blue-50" },
                { label: "Wins", value: TEAM.wins, icon: <Trophy size={20} className="text-green-600" />, bg: "bg-green-50" },
                { label: "Goals For", value: TEAM.goalsFor, icon: <Star size={20} className="text-yellow-600" />, bg: "bg-yellow-50" },
                { label: "Points", value: TEAM.points, icon: <TrendingUp size={20} className="text-purple-600" />, bg: "bg-purple-50" }
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>{s.icon}</div>
                  <div className="text-2xl font-black text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">About</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{TEAM.description}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">Top Performers</h3>
                <div className="space-y-3">
                  {ROSTER.sort((a, b) => b.goals - a.goals).slice(0, 4).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold">{p.name[0]}</div>
                      <div className="flex-1"><p className="text-sm font-medium text-slate-900">{p.name}</p><p className="text-xs text-slate-500">{p.position}</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-slate-900">{p.goals} goals</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "roster" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Squad ({ROSTER.length}/{TEAM.maxPlayers})</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700"><UserPlus size={16} /> Add Player</button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Player</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Position</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Goals</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Assists</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr></thead>
                <tbody>
                  {ROSTER.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-4"><div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold">{p.name[0]}</div>
                        <div><p className="font-medium text-slate-900 text-sm flex items-center gap-1">{p.name} {p.isCaptain && <Crown size={12} className="text-yellow-500" />}</p><p className="text-xs text-slate-500">Since {p.joined}</p></div>
                      </div></td>
                      <td className="px-4 py-4 hidden sm:table-cell text-sm text-slate-600">{p.position}</td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-slate-900 hidden md:table-cell">{p.goals}</td>
                      <td className="px-4 py-4 text-center text-sm text-slate-600 hidden md:table-cell">{p.assists}</td>
                      <td className="px-4 py-4 text-center hidden lg:table-cell"><span className="inline-flex items-center gap-1 text-sm font-bold text-yellow-600"><Star size={12} fill="currentColor" /> {p.rating}</span></td>
                      <td className="px-4 py-4"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Match History</h2>
            {MATCH_HISTORY.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm ${m.result === "win" ? "bg-green-500" : m.result === "draw" ? "bg-yellow-500" : "bg-red-500"}`}>
                    {m.result === "win" ? "W" : m.result === "draw" ? "D" : "L"}
                  </div>
                  <div><p className="font-bold text-slate-900">vs {m.opponent}</p><p className="text-sm text-slate-500">{m.date} • {m.competition}</p></div>
                </div>
                <span className={`text-2xl font-black ${m.result === "win" ? "text-green-600" : m.result === "draw" ? "text-yellow-600" : "text-red-500"}`}>{m.score}</span>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Team Settings</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Team Name</label><input defaultValue={TEAM.name} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Description</label><textarea defaultValue={TEAM.description} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 outline-none resize-none" /></div>
              <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">Save Changes</button>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 p-6">
              <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-500 mb-4">Disbanding the team will remove all players and delete all data.</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700"><Trash2 size={16} /> Disband Team</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
