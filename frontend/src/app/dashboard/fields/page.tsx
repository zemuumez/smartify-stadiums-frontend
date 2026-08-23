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
  XCircle,
  Lightbulb,
  Droplets,
  Users,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
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
      id: "f1", name: "Field 1", number: 1, sport: "Football 11v11", surface: "Natural Grass",
      hourlyRate: 2500, hasLighting: true, hasChangingRoom: true, stadiumName: "Bambis Meda Stadium", isActive: true,
      schedule: days.map((d) => ({ day: d, open: "06:00", close: "22:00", available: d !== "Sun" })),
    },
    {
      id: "f2", name: "Field 2", number: 2, sport: "Football 7v7", surface: "Artificial Turf",
      hourlyRate: 1800, hasLighting: true, hasChangingRoom: false, stadiumName: "Bambis Meda Stadium", isActive: true,
      schedule: days.map((d) => ({ day: d, open: "07:00", close: "21:00", available: true })),
    },
    {
      id: "f3", name: "Field 1", number: 1, sport: "Football 11v11", surface: "Natural Grass",
      hourlyRate: 3000, hasLighting: true, hasChangingRoom: true, stadiumName: "St George Arena", isActive: true,
      schedule: days.map((d) => ({ day: d, open: "06:00", close: "23:00", available: true })),
    },
  ]);

  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Field Management</h2>
          <p className="text-gray-400 text-sm mt-1">Configure fields, schedules, and pricing</p>
        </div>
        <MagneticButton icon={<Plus size={18} />} variant="primary" size="md">
          Add Field
        </MagneticButton>
      </div>

      {/* Fields List */}
      <StaggerChildren className="space-y-4">
        {fields.map((field) => (
          <StaggerItem key={field.id}>
            <GlowCard>
              <div className="space-y-4">
                {/* Field Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center text-lg font-bold text-white">
                      {field.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{field.stadiumName} — {field.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span>{field.sport}</span>
                        <span>·</span>
                        <span>{field.surface}</span>
                        <span>·</span>
                        <span className="text-green-400 font-medium">{field.hourlyRate.toLocaleString()} ETB/hr</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {field.hasLighting && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs">
                        <Lightbulb size={12} /> Lights
                      </span>
                    )}
                    {field.hasChangingRoom && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs">
                        <Users size={12} /> Changing Room
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${field.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {field.isActive ? "Active" : "Inactive"}
                    </span>
                    <button onClick={() => setEditingField(editingField === field.id ? null : field.id)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>

                {/* Schedule */}
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-7 gap-2 min-w-[500px]">
                    {field.schedule.map((s, i) => (
                      <div key={i} className={`p-2 rounded-lg text-center ${s.available ? "bg-green-500/10 border border-green-500/20" : "bg-white/5 border border-white/10 opacity-50"}`}>
                        <p className="text-xs font-medium text-white mb-1">{s.day}</p>
                        {s.available ? (
                          <p className="text-[10px] text-gray-400">{s.open}-{s.close}</p>
                        ) : (
                          <p className="text-[10px] text-gray-500">Closed</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlowCard>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );
}
