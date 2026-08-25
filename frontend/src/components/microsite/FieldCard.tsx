"use client";

import { motion } from "framer-motion";
import { Clock, Users, Zap, Check, Calendar } from "lucide-react";
import Link from "next/link";

interface FieldCardProps {
  field: {
    id: string;
    field_number: number;
    surface_type: string;
    has_lighting: boolean;
    price_per_hour: number;
    capacity?: number;
    schedule?: {
      day_of_week: number;
      open_time: string;
      close_time: string;
    }[];
  };
  selectedSlot?: string;
  onSelectSlot?: (fieldId: string, slot: string) => void;
}

export function FieldCard({ field }: FieldCardProps) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="photo-card p-6 flex flex-col justify-between hover:shadow-lg transition-all"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-[#2d6a4f]" style={{ background: "#f0faf4" }}>
              Field #{field.field_number}
            </span>
            <h3 className="text-lg font-black text-[#111] mt-2 capitalize">{field.surface_type.replace("_", " ")} Pitch</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#111]">{field.price_per_hour}</div>
            <div className="text-[11px] text-[#7a7a7a]">ETB / hour</div>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {field.has_lighting && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#fffbeb", color: "#b45309" }}>
              <Zap size={11} /> Night Lighting
            </span>
          )}
          {field.capacity && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#2d6a4f]" style={{ background: "#f0faf4" }}>
              <Users size={11} /> {field.capacity} players
            </span>
          )}
        </div>

        {/* Schedule */}
        {field.schedule && field.schedule.length > 0 && (
          <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={12} className="text-[#8a8a8a]" />
              <span className="text-xs text-[#8a8a8a] font-medium">Daily Schedule</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {field.schedule.map((s) => (
                <div key={s.day_of_week} className="text-center p-1 rounded-lg" style={{ background: "#f4f3ef" }}>
                  <div className="text-[10px] text-[#7a7a7a] font-semibold">{dayNames[s.day_of_week]}</div>
                  <div className="text-[10px] font-bold text-[#111]">
                    {s.open_time?.slice(0, 5) || "6:00"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Button */}
      <Link
        href="/bookings/new"
        className="w-full mt-6 py-3 rounded-full text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all hover:opacity-90 hover:-translate-y-0.5"
        style={{ background: "#2d6a4f", boxShadow: "0 4px 12px rgba(45,106,79,0.25)" }}
      >
        <Calendar size={13} /> Book This Field
      </Link>
    </motion.div>
  );
}
