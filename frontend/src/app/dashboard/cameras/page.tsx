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
  Settings,
  Trash2,
  Signal,
  Thermometer,
  HardDrive,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
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
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const res = await api.get("/cameras");
      setCameras(res.data);
    } catch {
      setCameras([
        {
          id: "cam_001",
          device_name: "Main Camera - Field 1",
          device_model: "Veo Cam 3",
          stadium_name: "Bambis Meda Stadium",
          field_name: "Field 1",
          status: "active",
          certification_passed: true,
          last_heartbeat: new Date(Date.now() - 30000).toISOString(),
          stream_url: "rtmp://stream.etsmartfields.com/live/cam_001",
          storage_used_gb: 128,
          storage_limit_gb: 500,
          uptime_percent: 99.2,
        },
        {
          id: "cam_002",
          device_name: "Main Camera - Field 2",
          device_model: "SporPin X200",
          stadium_name: "Bambis Meda Stadium",
          field_name: "Field 2",
          status: "active",
          certification_passed: true,
          last_heartbeat: new Date(Date.now() - 60000).toISOString(),
          storage_used_gb: 85,
          storage_limit_gb: 500,
          uptime_percent: 97.8,
        },
        {
          id: "cam_003",
          device_name: "Main Camera - Field 1",
          device_model: "Veo Cam 3",
          stadium_name: "St George Arena",
          field_name: "Field 1",
          status: "offline",
          certification_passed: true,
          last_heartbeat: new Date(Date.now() - 3600000).toISOString(),
          storage_used_gb: 210,
          storage_limit_gb: 500,
          uptime_percent: 85.4,
        },
        {
          id: "cam_004",
          device_name: "New Camera Unit",
          device_model: "Hikvision DS-2DE",
          stadium_name: "Hawassa Sports Complex",
          field_name: "Field 1",
          status: "pending",
          certification_passed: false,
          last_heartbeat: "",
          storage_used_gb: 0,
          storage_limit_gb: 250,
          uptime_percent: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    active: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2, label: "Streaming" },
    pending: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock, label: "Pending Certification" },
    offline: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: WifiOff, label: "Offline" },
    revoked: { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: AlertCircle, label: "Revoked" },
    certified: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle2, label: "Certified" },
  };

  const activeCount = cameras.filter((c) => c.status === "active").length;
  const offlineCount = cameras.filter((c) => c.status === "offline").length;
  const totalStorage = cameras.reduce((acc, c) => acc + c.storage_used_gb, 0);
  const avgUptime = cameras.filter((c) => c.uptime_percent > 0).reduce((acc, c) => acc + c.uptime_percent, 0) / Math.max(cameras.filter((c) => c.uptime_percent > 0).length, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Camera Management</h2>
          <p className="text-gray-400 text-sm mt-1">Monitor and manage your camera systems</p>
        </div>
        <div className="flex gap-3">
          <MagneticButton onClick={loadCameras} variant="ghost" size="sm" icon={<RefreshCw size={16} />}>
            Refresh
          </MagneticButton>
          <MagneticButton onClick={() => setShowRegister(true)} icon={<Plus size={18} />} variant="primary" size="md">
            Register Camera
          </MagneticButton>
        </div>
      </div>

      {/* Status Overview */}
      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Online", value: activeCount, icon: Wifi, color: "text-green-400" },
          { label: "Offline", value: offlineCount, icon: WifiOff, color: "text-red-400" },
          { label: "Storage Used", value: `${totalStorage} GB`, icon: HardDrive, color: "text-blue-400" },
          { label: "Avg Uptime", value: `${avgUptime.toFixed(1)}%`, icon: Signal, color: "text-yellow-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.label}>
              <GlowCard>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </GlowCard>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      {/* Camera List */}
      <StaggerChildren className="space-y-4">
        {cameras.map((cam) => {
          const config = statusConfig[cam.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const storagePercent = cam.storage_limit_gb > 0 ? (cam.storage_used_gb / cam.storage_limit_gb) * 100 : 0;
          const lastSeen = cam.last_heartbeat ? getTimeAgo(cam.last_heartbeat) : "Never";

          return (
            <StaggerItem key={cam.id}>
              <GlowCard>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Camera Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
                      <Camera size={24} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{cam.device_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
                          <StatusIcon size={10} />
                          {config.label}
                        </span>
                        {cam.certification_passed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle2 size={10} /> Certified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{cam.stadium_name} · {cam.field_name} · {cam.device_model}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Last heartbeat: {lastSeen}</p>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="w-full lg:w-48">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Storage</span>
                      <span className="text-gray-300">{cam.storage_used_gb}/{cam.storage_limit_gb} GB</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${storagePercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${storagePercent > 80 ? "bg-red-500" : storagePercent > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                      />
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="hidden md:block w-24 text-center">
                    <p className="text-xs text-gray-400">Uptime</p>
                    <p className={`text-lg font-bold ${cam.uptime_percent >= 99 ? "text-green-400" : cam.uptime_percent >= 90 ? "text-yellow-400" : "text-red-400"}`}>
                      {cam.uptime_percent > 0 ? `${cam.uptime_percent}%` : "—"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {cam.stream_url && cam.status === "active" && (
                      <button className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors flex items-center gap-1">
                        <Signal size={12} /> Live
                      </button>
                    )}
                    <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                      <Settings size={16} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </GlowCard>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      {/* Register Camera Modal */}
      {showRegister && (
        <FadeUp>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRegister(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Register New Camera</h3>
                <p className="text-gray-400 text-sm mt-1">Add a camera system to your stadium</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Stadium</label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50">
                    <option className="bg-gray-800">Bambis Meda Stadium</option>
                    <option className="bg-gray-800">St George Arena</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Field</label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50">
                    <option className="bg-gray-800">Field 1</option>
                    <option className="bg-gray-800">Field 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Camera Model</label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50">
                    <option className="bg-gray-800">Veo Cam 3</option>
                    <option className="bg-gray-800">SporPin X200</option>
                    <option className="bg-gray-800">Hikvision DS-2DE</option>
                    <option className="bg-gray-800">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Device Key</label>
                  <input
                    type="text"
                    placeholder="Enter the device key from your camera"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowRegister(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white">
                  Cancel
                </button>
                <MagneticButton variant="primary" size="md">Register Camera</MagneticButton>
              </div>
            </motion.div>
          </div>
        </FadeUp>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
