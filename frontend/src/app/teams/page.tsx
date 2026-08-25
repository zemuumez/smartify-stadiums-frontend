"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, Search, Users, Trophy, Calendar, Shield,
  ArrowRight, Filter, ChevronDown, Star, MapPin, ArrowUpRight
} from "lucide-react";
import { FadeUp, SlideIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

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
    sport: "Football",
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
    sport: "Football",
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
    sport: "Futsal",
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
    sport: "Football",
  },
  {
    id: "t5",
    name: "Bole Hoops",
    city: "Addis Ababa",
    players: 8,
    matches: 18,
    wins: 14,
    draws: 0,
    losses: 4,
    points: 42,
    rank: 4,
    captain: "Fatuma Hassan",
    isPublic: true,
    avatar: "🏀",
    sport: "Basketball",
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
    sport: "Futsal",
  },
];

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "players">("rank");
  const [showMyTeams, setShowMyTeams] = useState(false);

  const filteredTeams = DEMO_TEAMS
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.city.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.players - a.players;
    });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO WITH PHOTO BACKGROUND ── */}
      <section className="relative min-h-[50vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/venue-card-2.jpg"
            alt="Ethiopian Sports Teams"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 photo-overlay-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">
          <div className="max-w-2xl">
            <span className="trust-badge mb-4 inline-flex">
              🏆 Official League System
            </span>
            <h1
              className="text-white font-black leading-tight mb-4"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)", letterSpacing: "-0.025em" }}
            >
              Teams &amp; League Standings
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-xl">
              Create a team, manage your roster, schedule scrimmages, and track your ranking across Ethiopia&apos;s verified sports venues.
            </p>
          </div>
        </div>
      </section>

      {/* ── ACTION BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
        <div className="photo-card p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team by name or city..."
              className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-[#111] placeholder-[#aaa] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-full text-xs font-bold text-[#111] border border-black/10 bg-white focus:outline-none"
            >
              <option value="rank">Sort by Rank</option>
              <option value="name">Sort by Name</option>
              <option value="players">Sort by Players</option>
            </select>

            <Link
              href="/teams/create"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-bold text-xs whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: "#2d6a4f", boxShadow: "0 4px 14px rgba(45,106,79,0.3)" }}
            >
              <Plus size={15} /> Create Team
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ── LEAGUE TABLE ── */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">Division 1</div>
              <h2 className="heading-xl">Addis Ababa Premier Table</h2>
            </div>
          </div>

          <div className="photo-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(0,0,0,0.06)", background: "#fafafa" }}>
                    <th className="text-left px-6 py-4 text-xs font-bold text-[#7a7a7a] uppercase">#</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-[#7a7a7a] uppercase">Team</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-[#7a7a7a] uppercase hidden sm:table-cell">Played</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-[#7a7a7a] uppercase hidden md:table-cell">W</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-[#7a7a7a] uppercase hidden md:table-cell">D</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-[#7a7a7a] uppercase hidden md:table-cell">L</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-[#7a7a7a] uppercase">Pts</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-[#7a7a7a] uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team, i) => (
                    <motion.tr
                      key={team.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b transition-colors hover:bg-[#fbfbf9]"
                      style={{ borderColor: "rgba(0,0,0,0.04)" }}
                    >
                      <td className="px-6 py-4">
                        <span className={`text-sm font-black ${
                          team.rank <= 3 ? "text-[#2d6a4f]" : "text-[#7a7a7a]"
                        }`}>
                          {team.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/teams/${team.id}`} className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-[#f0faf4]">
                            {team.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-[#111] text-sm group-hover:text-[#2d6a4f] transition-colors">{team.name}</p>
                            <p className="text-xs text-[#7a7a7a] flex items-center gap-1">
                              <MapPin size={10} style={{ color: "#2d6a4f" }} /> {team.city} • <span className="font-semibold">{team.sport}</span>
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-[#5a5a5a] hidden sm:table-cell">{team.matches}</td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-[#2d6a4f] hidden md:table-cell">{team.wins}</td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-[#b45309] hidden md:table-cell">{team.draws}</td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-[#dc2626] hidden md:table-cell">{team.losses}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-base font-black text-[#111]">{team.points}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/teams/${team.id}`} className="inline-flex p-2 rounded-full hover:bg-[#f0faf4] text-[#2d6a4f] transition-colors">
                          <ArrowRight size={15} />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── TEAM CARDS GRID ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">Browse Roster</div>
              <h2 className="heading-xl">Registered Teams</h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/teams/${team.id}`} className="photo-card p-7 block group hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-[#f0faf4]">
                        {team.avatar}
                      </div>
                      <div>
                        <h3 className="font-black text-[#111] text-base group-hover:text-[#2d6a4f] transition-colors">{team.name}</h3>
                        <p className="text-xs text-[#7a7a7a] flex items-center gap-1"><MapPin size={10} /> {team.city}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-[#2d6a4f] bg-[#f0faf4]">
                      Rank #{team.rank}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-xl bg-[#f4f3ef]">
                      <div className="text-base font-black text-[#111]">{team.players}</div>
                      <div className="text-[10px] text-[#7a7a7a]">Players</div>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-[#f0faf4]">
                      <div className="text-base font-black text-[#2d6a4f]">{team.wins}</div>
                      <div className="text-[10px] text-[#2d6a4f]">Wins</div>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-[#f4f3ef]">
                      <div className="text-base font-black text-[#111]">{team.points}</div>
                      <div className="text-[10px] text-[#7a7a7a]">Points</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <span className="text-[#7a7a7a]">Captain: <strong className="text-[#111]">{team.captain}</strong></span>
                    <span className="font-bold text-[#2d6a4f] flex items-center gap-1">
                      Profile <ArrowUpRight size={13} />
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
