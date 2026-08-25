"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Plus,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  HardDrive,
  Activity,
  ShieldCheck,
  Building2,
  Video
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
import api from "@/lib/api";

interface CameraDevice {
  id: string;
  device_name: string;
  device_model: string;
  stadium_name: string;
  field_name: string;
  status: "pending" | "certified" | "active" | "offline" | "revoked";
  certification_passed: boolean;
  last_heartbeat: string;
  stream_url?: string;
  storage_used_gb: number;
  storage_limit_gb: number;
  uptime_percent: number;
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState<CameraDevice[]>([
    {
      id: "cam_001",
      device_name: "Main Camera — Field 1",
      device_model: "Veo Cam 3",
      stadium_name: "Bambis Meda Stadium",
      field_name: "Pitch A",
      status: "active",
      certification_passed: true,
      last_heartbeat: "Just now",
      stream_url: "rtmp://stream.etsmartfields.com/live/cam_001",
      storage_used_gb: 128,
      storage_limit_gb: 500,
      uptime_percent: 99.4,
    },
    {
      id: "cam_002",
      device_name: "Main Camera — Field 2",
      device_model: "SporPin X200",
      stadium_name: "Bambis Meda Stadium",
      field_name: "Pitch B",
      status: "active",
      certification_passed: true,
      last_heartbeat: "2 mins ago",
      storage_used_gb: 85,
      storage_limit_gb: 500,
      uptime_percent: 98.1,
    },
    {
      id: "cam_003",
      device_name: "Court Camera 1",
      device_model: "Veo Cam 3",
      stadium_name: "Unity Sports Complex",
      field_name: "Indoor Court",
      status: "active",
      certification_passed: true,
      last_heartbeat: "Just now",
      storage_used_gb: 160,
      storage_limit_gb: 500,
      uptime_percent: 99.8,
    },
  ]);

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111] tracking-tight">AI Camera Fleet</h2>
          <p className="text-[#7a7a7a] text-xs sm:text-sm mt-0.5">
            Monitor autonomous 4K match recording devices, stream health, and storage limits
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex-shrink-0"
          style={{ background: "#2d6a4f" }}
        >
          <Plus size={16} /> Link Camera
        </button>
      </div>

      {/* ── CAMERAS LIST ── */}
      <StaggerChildren className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cameras.map((cam) => (
          <StaggerItem key={cam.id}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.05] flex flex-col justify-between hover:shadow-md transition-all duration-200 h-full">
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f]">
                      <Camera size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#111]">{cam.device_name}</h3>
                      <div className="text-xs text-[#7a7a7a]">{cam.device_model}</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f]">
                    <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-pulse" />
                    Online
                  </span>
                </div>

                {/* Stadium & Field info */}
                <div className="p-3.5 rounded-2xl bg-[#f4f3ef] mb-4 space-y-1.5 text-xs text-[#5a5a5a]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a8a8a]">Stadium:</span>
                    <span className="font-bold text-[#111]">{cam.stadium_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a8a8a]">Assigned Pitch:</span>
                    <span className="font-bold text-[#111]">{cam.field_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a8a8a]">Uptime:</span>
                    <span className="font-bold text-[#2d6a4f]">{cam.uptime_percent}%</span>
                  </div>
                </div>

                {/* Storage Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7a7a7a] font-semibold">Cloud Storage</span>
                    <span className="font-bold text-[#111]">{cam.storage_used_gb} / {cam.storage_limit_gb} GB</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f4f3ef] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2d6a4f]"
                      style={{ width: `${(cam.storage_used_gb / cam.storage_limit_gb) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-[#8a8a8a] flex items-center gap-1">
                  <Clock size={11} /> Sync: {cam.last_heartbeat}
                </span>
                <button className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1">
                  <Video size={12} /> Test Feed
                </button>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

    </div>
  );
}
