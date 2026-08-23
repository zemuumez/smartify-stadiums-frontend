"use client";

import { motion } from "framer-motion";
import { Circle, CircleDot, AlertTriangle, TrendingUp, Star } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "goal" | "yellow-card" | "red-card" | "substitution" | "chance" | "highlight";
  minute: number;
  description: string;
  team: "home" | "away";
}

interface MatchTimelineProps {
  events: TimelineEvent[];
  currentMinute: number;
}

const eventIcons: Record<string, any> = {
  goal: <Star size={12} className="text-green-600" fill="currentColor" />,
  "yellow-card": <AlertTriangle size={12} className="text-yellow-500" />,
  "red-card": <AlertTriangle size={12} className="text-red-500" />,
  substitution: <TrendingUp size={12} className="text-blue-500" />,
  chance: <CircleDot size={12} className="text-orange-500" />,
  highlight: <Star size={12} className="text-purple-500" />,
};

export default function MatchTimeline({ events, currentMinute }: MatchTimelineProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Match Timeline</h3>
      </div>
      <div className="p-4">
        {/* Timeline bar */}
        <div className="relative mb-6">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentMinute / 90) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {/* Event markers */}
          <div className="absolute inset-0">
            {events.map((event) => (
              <div
                key={event.id}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-green-500 -ml-1.5"
                style={{ left: `${(event.minute / 90) * 100}%` }}
                title={`${event.minute}' - ${event.description}`}
              />
            ))}
          </div>
          {/* Minute labels */}
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">0'</span>
            <span className="text-[10px] text-slate-400">45'</span>
            <span className="text-[10px] text-slate-400">90'</span>
          </div>
        </div>

        {/* Event list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-4">No events yet</p>
          ) : (
            [...events].reverse().map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  event.team === "home" ? "bg-green-50/50" : "bg-blue-50/50"
                }`}
              >
                <span className="text-xs font-bold text-slate-500 w-8">{event.minute}&apos;</span>
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-100">
                  {eventIcons[event.type]}
                </div>
                <p className="text-xs text-slate-700 flex-1">{event.description}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
