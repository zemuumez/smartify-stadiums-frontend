"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Radio, Eye, Layers } from "lucide-react";

interface Camera {
  id: string;
  name: string;
  angle: string;
  status: "online" | "offline";
  isPrimary?: boolean;
}

interface CameraSelectorProps {
  cameras: Camera[];
  activeCamera: string;
  onSelect: (id: string) => void;
}

export default function CameraSelector({ cameras, activeCamera, onSelect }: CameraSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Camera size={16} className="text-green-600" />
        <h3 className="text-sm font-bold text-slate-900">Camera Angles</h3>
        <span className="text-xs text-slate-400 ml-auto">{cameras.filter((c) => c.status === "online").length} online</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {cameras.map((camera) => (
          <button
            key={camera.id}
            onClick={() => camera.status === "online" && onSelect(camera.id)}
            disabled={camera.status === "offline"}
            className={`relative p-3 rounded-xl text-left transition-all ${
              activeCamera === camera.id
                ? "bg-green-50 border-2 border-green-500 shadow-sm"
                : camera.status === "offline"
                ? "bg-slate-50 border-2 border-transparent opacity-50"
                : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
            }`}
          >
            {/* Camera preview placeholder */}
            <div className={`aspect-video rounded-lg mb-2 flex items-center justify-center ${
              activeCamera === camera.id ? "bg-green-100" : "bg-slate-100"
            }`}>
              <Camera size={20} className={activeCamera === camera.id ? "text-green-600" : "text-slate-400"} />
            </div>
            <p className="text-xs font-bold text-slate-900">{camera.name}</p>
            <p className="text-[10px] text-slate-500">{camera.angle}</p>
            {/* Status indicator */}
            <div className="absolute top-2 right-2">
              <span className={`w-2 h-2 rounded-full block ${
                camera.status === "online" ? "bg-green-500" : "bg-red-400"
              }`} />
            </div>
            {/* Active indicator */}
            {activeCamera === camera.id && (
              <motion.div
                layoutId="camera-active"
                className="absolute inset-0 rounded-xl border-2 border-green-500"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
