"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, Search, Users, Trophy, Calendar, Shield,
  ArrowRight, Filter, ChevronDown, Star, MapPin
} from "lucide-react";

const DEMO_TEAMS = [
  {
    id: "t1",
    name: "Addis Stars FC",
    city: "Addis Ababa",
    players: 14,
    matches: 28,
    wins: 18,
    draws: 5,
    losses: 5,
    points: 59,
    rank: 1,
    captain: "Abebe Kebede",
    isPublic: true,
    avatar: "⭐",
    color: "#16a34a",
  },
  {
    id: "t2",
    name: "Lion City FC",
    city: "Addis Ababa",
    players: 12,
    matches: 26,
    wins: 15,
    draws: 6,
    losses: 5,
    points: 51,
    rank: 3,
    captain: "Daniel Tadesse",
    isPublic: true,
    avatar: "🦁",
    color: "#2563eb",
  },
  {
    id: "t3",
    name: "Bambis XI",
    city: "Addis Ababa",
    players: 10,
    matches: 20,
    wins: 12,
    draws: 4,
    losses: 4,
    points: 40,
    rank: 5,
    captain: "Yonas Tesfaye",
    isPublic: true,
    avatar: "🏟️",
    color: "#7c3aed",
  },
  {
    id: "t4",
    name: "Holy City FC",
    city: "Bahir Dar",
    players: 16,
    matches: 30,
    wins: 20,
    draws: 3,
    losses: 7,
    points: 63,
    rank: 2,
    captain: "Dawit Mengistu",
    isPublic: true,
    avatar: "⛪",
    color: "#dc2626",
  },
  {
    id: "t5",
    name: "Bole United",
    city: "Addis Ababa",
    players: 11,
    matches: 18,
    wins: 8,
    draws: 5,
    losses: 5,
    points: 29,
    rank: 8,
    captain: "Fatuma Hassan",
    isPublic: true,
    avatar: "🔵",
    color: "#0891b2",
  },
  {
    id: "t6",
    name: "Merkato Tigers",
    city: "Addis Ababa",
    players: 13,
    matches: 22,
    wins: 10,
    draws: 7,
    losses: 5,
    points: 37,
    rank: 6,
    captain: "Meron Bekele",
    isPublic: true,
    avatar: "🐯",
    color: "#ea580c",
  },
];

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "players">("rank");
  const [showMyTeams, setShowMyTeams] = useState(false);

  const filteredTeams = DEMO_TEAMS
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.players - a.players;
    });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">Teams</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4">
              Find or Create a <span className="gradient-text">Team</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Join a team, manage your roster, and track your performance across leagues and tournaments.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <Link
            href="/teams/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} /> Create Team
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowMyTeams(false)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !showMyTeams ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Teams
          </button>
          <button
            onClick={() => setShowMyTeams(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showMyTeams ? "bg-green-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            My Teams
          </button>
          <div className="flex-1" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 focus:border-green-500 outline-none"
          >
            <option value="rank">Rank</option>
            <option value="name">Name</option>
            <option value="players">Players</option>
          </select>
        </div>

        {/* League Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Trophy className="text-green-600" size={18} />
            <h2 className="font-bold text-slate-900">League Standings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Team</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">P</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">W</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">D</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">L</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Pts</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team, i) => (
                  <motion.tr
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${
                        team.rank <= 3 ? "text-green-600" : "text-slate-500"
                      }`}>
                        {team.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/teams/${team.id}`} className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: team.color + "15" }}
                        >
                          {team.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm hover:text-green-600 transition-colors">{team.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={10} /> {team.city}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600 hidden sm:table-cell">{team.matches}</td>
                    <td className="px-4 py-4 text-center text-sm text-green-600 font-medium hidden md:table-cell">{team.wins}</td>
                    <td className="px-4 py-4 text-center text-sm text-yellow-600 font-medium hidden md:table-cell">{team.draws}</td>
                    <td className="px-4 py-4 text-center text-sm text-red-500 font-medium hidden md:table-cell">{team.losses}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-black text-slate-900">{team.points}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/teams/${team.id}`} className="text-slate-400 hover:text-green-600 transition-colors">
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Cards Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Browse Teams</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/teams/${team.id}`} className="block p-6 rounded-2xl bg-white border border-slate-200 hover:border-green-200 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: team.color + "15" }}
                    >
                      {team.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors">{team.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {team.city}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-slate-50 rounded-xl">
                      <div className="text-lg font-black text-slate-900">{team.players}</div>
                      <div className="text-[10px] text-slate-500">Players</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-xl">
                      <div className="text-lg font-black text-green-600">{team.wins}</div>
                      <div className="text-[10px] text-slate-500">Wins</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-xl">
                      <div className="text-lg font-black text-blue-600">{team.points}</div>
                      <div className="text-[10px] text-slate-500">Points</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Captain: {team.captain}</span>
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      View <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
