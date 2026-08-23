"use client";

import { motion } from "framer-motion";
import { Play, Trophy } from "lucide-react";
import { useStadium, useMatches } from "@/lib/sanity/hooks";

const DEMO_STADIUM_ID = "demo-stadium-1";

export default function MicrositeMatches() {
  const { stadium } = useStadium("bambis-meda");
  const { matches } = useMatches(stadium?._id || DEMO_STADIUM_ID);

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Matches</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2">Recent Matches</h1>
          <p className="text-slate-500 mt-2">Watch replays and highlights from matches played at our stadium.</p>
        </div>
        <div className="space-y-4">
          {matches.map((match, i) => (
            <motion.div key={match._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="text-green-600" size={18} />
                    <span className="text-sm text-slate-500">{match.date} • {match.field}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">{match.homeTeam}</span>
                    <span className="text-2xl font-black text-green-600">{match.homeScore} - {match.awayScore}</span>
                    <span className="font-bold text-slate-900">{match.awayTeam}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {match.hasReplay ? (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">
                      <Play size={14} /> Watch Replay
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-slate-200 text-slate-500 rounded-xl text-sm font-medium">No Replay</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
