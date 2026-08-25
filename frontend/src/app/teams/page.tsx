"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users, Trophy, Plus, Search, Shield, ChevronRight,
  TrendingUp, Award, MapPin, ArrowUpRight, ArrowRight
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const DEMO_TEAMS = [
  {
    id: "1",
    name: "Addis Stars FC",
    sport: "Football",
    city: "Addis Ababa",
    division: "Division 1",
    rank: 1,
    played: 12,
    won: 9,
    drawn: 2,
    lost: 1,
    goalsFor: 28,
    goalsAgainst: 9,
    points: 29,
    members: 18,
    captain: "Abebe Kebede",
    color: "#2d6a4f",
    initials: "AS",
  },
  {
    id: "2",
    name: "Bole Lions",
    sport: "Football",
    city: "Addis Ababa",
    division: "Division 1",
    rank: 2,
    played: 12,
    won: 8,
    drawn: 3,
    lost: 1,
    goalsFor: 24,
    goalsAgainst: 11,
    points: 27,
    members: 16,
    captain: "Yonas Tesfaye",
    color: "#1e6091",
    initials: "BL",
  },
  {
    id: "3",
    name: "Kirkos United",
    sport: "Football",
    city: "Addis Ababa",
    division: "Division 1",
    rank: 3,
    played: 12,
    won: 7,
    drawn: 2,
    lost: 3,
    goalsFor: 21,
    goalsAgainst: 14,
    points: 23,
    members: 15,
    captain: "Dawit Alemu",
    color: "#9c4221",
    initials: "KU",
  },
  {
    id: "4",
    name: "Lideta Kings",
    sport: "Futsal",
    city: "Addis Ababa",
    division: "Division 1",
    rank: 4,
    played: 12,
    won: 6,
    drawn: 1,
    lost: 5,
    goalsFor: 19,
    goalsAgainst: 18,
    points: 19,
    members: 12,
    captain: "Elias Haile",
    color: "#582f0e",
    initials: "LK",
  },
  {
    id: "5",
    name: "Unity Ballers",
    sport: "Basketball",
    city: "Addis Ababa",
    division: "Division 1",
    rank: 5,
    played: 10,
    won: 6,
    drawn: 0,
    lost: 4,
    goalsFor: 580,
    goalsAgainst: 520,
    points: 18,
    members: 10,
    captain: "Samuel Tadesse",
    color: "#d97706",
    initials: "UB",
  },
  {
    id: "6",
    name: "Hawassa Lakeside FC",
    sport: "Football",
    city: "Hawassa",
    division: "Division 1",
    rank: 6,
    played: 12,
    won: 5,
    drawn: 2,
    lost: 5,
    goalsFor: 16,
    goalsAgainst: 17,
    points: 17,
    members: 17,
    captain: "Berhanu Bekele",
    color: "#0891b2",
    initials: "HL",
  },
];

const sports = ["All Sports", "Football", "Futsal", "Basketball", "Volleyball"];

export default function TeamsPage() {
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [search, setSearch] = useState("");

  const filteredTeams = DEMO_TEAMS.filter((team) => {
    const matchesSport = selectedSport === "All Sports" || team.sport === selectedSport;
    const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) ||
                          team.city.toLowerCase().includes(search.toLowerCase()) ||
                          team.captain.toLowerCase().includes(search.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO WITH PHOTO BACKGROUND ── */}
      <section className="relative min-h-[50vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-sports-field.jpg"
            alt="Ethiopian sports teams and tournaments"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 photo-overlay-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-4">
              <span className="trust-badge">
                <Trophy size={12} className="text-[#74c69d]" />
                Official League System
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white font-black leading-tight mb-4"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
            >
              Teams &amp; <span style={{ color: "#74c69d" }}>Standings</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/80 text-lg leading-relaxed max-w-xl"
            >
              Discover active community sports teams across Ethiopia, track league tables, view rosters, and challenge rivals.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── ACTION BAR ── */}
      <section className="relative z-20 -mt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="search-bar-float flex flex-col md:flex-row items-stretch md:items-center justify-between p-3 gap-4">
              {/* Search */}
              <div className="flex-1 flex items-center px-3">
                <Search size={18} className="text-[#8a8a8a] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search team name, captain, city..."
                  className="w-full text-sm font-semibold text-[#111] placeholder-[#aaa] bg-transparent focus:outline-none"
                />
              </div>

              {/* Sport pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {sports.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSelectedSport(sp)}
                    className={`sport-pill ${selectedSport === sp ? "active" : "inactive"}`}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {sp}
                  </button>
                ))}
              </div>

              {/* Create Team CTA */}
              <Link
                href="/teams/create"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-bold text-sm flex-shrink-0 transition-all hover:opacity-90"
                style={{ background: "#2d6a4f", boxShadow: "0 4px 14px rgba(45,106,79,0.3)" }}
              >
                <Plus size={16} /> Create Team
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── LEAGUE TABLE ── */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">Addis Ababa Division 1</div>
              <h2 className="heading-xl">League Standings</h2>
            </div>
            <span className="text-xs font-bold text-[#7a7a7a]">Season 2026</span>
          </div>

          <div className="photo-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-bold text-[#8a8a8a] uppercase" style={{ borderColor: "rgba(0,0,0,0.06)", background: "#faf9f6" }}>
                    <th className="py-4 px-6">Pos</th>
                    <th className="py-4 px-6">Team</th>
                    <th className="py-4 px-4 text-center">P</th>
                    <th className="py-4 px-4 text-center">W</th>
                    <th className="py-4 px-4 text-center">D</th>
                    <th className="py-4 px-4 text-center">L</th>
                    <th className="py-4 px-4 text-center">GF</th>
                    <th className="py-4 px-4 text-center">GA</th>
                    <th className="py-4 px-4 text-center">GD</th>
                    <th className="py-4 px-6 text-center font-black text-[#111]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filteredTeams.map((team, idx) => (
                    <tr key={team.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="py-4 px-6 font-black text-sm text-[#111]">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? "bg-[#2d6a4f] text-white" : idx < 3 ? "bg-[#f0faf4] text-[#2d6a4f]" : "text-[#8a8a8a]"
                        }`}>
                          {team.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                            style={{ background: team.color }}
                          >
                            {team.initials}
                          </div>
                          <div>
                            <div className="font-black text-[#111]">{team.name}</div>
                            <div className="text-xs text-[#8a8a8a] flex items-center gap-1">
                              <MapPin size={10} style={{ color: "#2d6a4f" }} /> {team.city} - <span className="font-semibold">{team.sport}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-[#5a5a5a]">{team.played}</td>
                      <td className="py-4 px-4 text-center font-semibold text-[#2d6a4f]">{team.won}</td>
                      <td className="py-4 px-4 text-center font-semibold text-[#8a8a8a]">{team.drawn}</td>
                      <td className="py-4 px-4 text-center font-semibold text-rose-500">{team.lost}</td>
                      <td className="py-4 px-4 text-center text-[#7a7a7a]">{team.goalsFor}</td>
                      <td className="py-4 px-4 text-center text-[#7a7a7a]">{team.goalsAgainst}</td>
                      <td className="py-4 px-4 text-center font-bold text-[#111]">
                        {team.goalsFor - team.goalsAgainst > 0 ? `+${team.goalsFor - team.goalsAgainst}` : team.goalsFor - team.goalsAgainst}
                      </td>
                      <td className="py-4 px-6 text-center font-black text-base text-[#2d6a4f]">
                        {team.points}
                      </td>
                    </tr>
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
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">Rosters &amp; Squads</div>
              <h2 className="heading-xl">Explore Teams</h2>
            </div>
          </div>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <StaggerItem key={team.id}>
                <div className="photo-card p-6 h-full flex flex-col justify-between hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm"
                        style={{ background: team.color }}
                      >
                        {team.initials}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-[#2d6a4f]" style={{ background: "#f0faf4" }}>
                        {team.sport}
                      </span>
                    </div>

                    <h3 className="font-black text-[#111] text-xl mb-1">{team.name}</h3>
                    <p className="text-xs text-[#7a7a7a] mb-4 flex items-center gap-1">
                      <MapPin size={12} style={{ color: "#2d6a4f" }} /> {team.city}, Ethiopia
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y mb-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                      <div>
                        <span className="text-[#8a8a8a]">Captain:</span>
                        <div className="font-bold text-[#111] truncate">{team.captain}</div>
                      </div>
                      <div>
                        <span className="text-[#8a8a8a]">Squad Size:</span>
                        <div className="font-bold text-[#111]">{team.members} Players</div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/teams/${team.id}`}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-full text-xs font-bold transition-all hover:opacity-90"
                    style={{ background: "#f4f3ef", color: "#111" }}
                  >
                    View Team Profile
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>

    </div>
  );
}
