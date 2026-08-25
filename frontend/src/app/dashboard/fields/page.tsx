"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Plus,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  Lightbulb,
  Users,
  Building2,
  Check
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface FieldSchedule {
  day: string;
  open: string;
  close: string;
  available: boolean;
}

interface Field {
  id: string;
  name: string;
  number: number;
  sport: string;
  surface: string;
  hourlyRate: number;
  hasLighting: boolean;
  hasChangingRoom: boolean;
  stadiumName: string;
  isActive: boolean;
  schedule: FieldSchedule[];
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([
    {
      id: "f1", name: "Pitch A — Main 11v11", number: 1, sport: "Football 11v11", surface: "Natural Grass",
      hourlyRate: 2500, hasLighting: true, hasChangingRoom: true, stadiumName: "Bambis Meda Stadium", isActive: true,
      schedule: days.map((d) => ({ day: d, open: "06:00", close: "22:00", available: d !== "Sun" })),
    },
    {
      id: "f2", name: "Pitch B — 7v7 Artificial", number: 2, sport: "Football 7v7", surface: "Artificial Turf",
      hourlyRate: 1800, hasLighting: true, hasChangingRoom: false, stadiumName: "Bambis Meda Stadium", isActive: true,
      schedule: days.map((d) => ({ day: d, open: "07:00", close: "21:00", available: true })),
    },
    {
      id: "f3", name: "Court 1 — Indoor Basketball", number: 3, sport: "Basketball", surface: "Hardwood",
      hourlyRate: 1500, hasLighting: true, hasChangingRoom: true, stadiumName: "Unity Sports Complex", isActive: true,
      schedule: days.map((d) => ({ day: d, open: "06:00", close: "23:00", available: true })),
    },
  ]);

  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111] tracking-tight">Field Management</h2>
          <p className="text-[#7a7a7a] text-xs sm:text-sm mt-0.5">
            Configure hourly rates, playing surfaces, weekly schedules, and amenities
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex-shrink-0"
          style={{ background: "#2d6a4f" }}
        >
          <Plus size={16} /> Add Field
        </button>
      </div>

      {/* ── FIELDS LIST ── */}
      <StaggerChildren className="space-y-4">
        {fields.map((field) => (
          <StaggerItem key={field.id}>
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/[0.05] hover:shadow-md transition-all duration-200">
              <div className="space-y-5">

                {/* Top Row: Title + Specs + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0 shadow-sm"
                      style={{ background: "#2d6a4f" }}
                    >
                      {field.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#111]">
                        {field.stadiumName} — {field.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#7a7a7a] mt-0.5">
                        <span className="font-semibold text-[#111]">{field.sport}</span>
                        <span>•</span>
                        <span>{field.surface}</span>
                        <span>•</span>
                        <span className="text-[#2d6a4f] font-bold">{field.hourlyRate.toLocaleString()} ETB / hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {field.hasLighting && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                        <Lightbulb size={12} /> Night Game
                      </span>
                    )}
                    {field.hasChangingRoom && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-[#1e6091] text-xs font-bold">
                        <Users size={12} /> Lockers
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${field.isActive ? "bg-[#f0faf4] text-[#2d6a4f]" : "bg-red-50 text-red-600"}`}>
                      {field.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                      className="p-2 rounded-xl text-[#7a7a7a] hover:text-[#111] hover:bg-[#f4f3ef] transition-colors"
                      title="Edit field"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>

                {/* Schedule Day Pills */}
                <div className="pt-4 border-t border-black/[0.06]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-2.5">
                    Weekly Availability Hours
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {field.schedule.map((s) => (
                      <div
                        key={s.day}
                        className={`p-2.5 rounded-2xl text-center text-xs transition-colors ${
                          s.available
                            ? "bg-[#f4f3ef] border border-black/[0.04]"
                            : "bg-red-50/60 border border-red-100 text-red-400"
                        }`}
                      >
                        <div className="font-bold text-[#111] mb-0.5">{s.day}</div>
                        <div className="text-[11px] text-[#7a7a7a]">
                          {s.available ? `${s.open} - ${s.close}` : "Closed"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

    </div>
  );
}
