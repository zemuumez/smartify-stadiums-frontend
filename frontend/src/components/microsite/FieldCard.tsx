"use client";

import { motion } from "framer-motion";
import { Clock, Users, Zap, Check } from "lucide-react";

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

export function FieldCard({ field, selectedSlot, onSelectSlot }: FieldCardProps) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Field {field.field_number}</h3>
          <p className="text-sm text-gray-400 capitalize">{field.surface_type.replace("_", " ")}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{field.price_per_hour}</div>
          <div className="text-xs text-gray-500">ETB/hour</div>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-4">
        {field.has_lighting && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs">
            <Zap size={12} />
            Night Play
          </span>
        )}
        {field.capacity && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs">
            <Users size={12} />
            {field.capacity} players
          </span>
        )}
      </div>

      {/* Schedule */}
      {field.schedule && field.schedule.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-400">Operating Hours</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {field.schedule.map((s) => (
              <div key={s.day_of_week} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{dayNames[s.day_of_week]}</div>
                <div className="text-xs text-green-400">
                  {s.open_time?.slice(0, 5) || "6:00"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Button */}
      <button className="w-full mt-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all">
        Book This Field
      </button>
    </motion.div>
  );
}
