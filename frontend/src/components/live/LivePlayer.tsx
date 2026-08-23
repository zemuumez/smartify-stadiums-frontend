"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Radio, Wifi
} from "lucide-react";

interface LivePlayerProps {
  streamUrl?: string;
  isLive?: boolean;
  onFullscreen?: () => void;
}

export default function LivePlayer({ streamUrl, isLive = true, onFullscreen }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [quality, setQuality] = useState("1080p");
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout>(null);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying, resetControlsTimeout]);

  // Simulated time progression for demo
  useEffect(() => {
    if (!isLive || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive, isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
    onFullscreen?.();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden group aspect-video"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
        poster="/api/placeholder/1920/1080"
      />

      {/* Demo overlay when no real stream */}
      {!streamUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-green-900/30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-green-500/30 animate-pulse">
              <Radio className="text-green-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Live Feed Active</h3>
            <p className="text-slate-400">Camera streaming from Field A</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-medium">LIVE</span>
              <span className="text-slate-500 text-sm">•</span>
              <Wifi className="text-green-400" size={14} />
              <span className="text-green-400 text-sm">Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/90 backdrop-blur-sm rounded-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-bold">LIVE</span>
          </div>
        </div>
      )}

      {/* Quality Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white">
          {quality}
        </div>
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/40"
          >
            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="text-white" size={28} />
                ) : (
                  <Play className="text-white ml-1" size={28} />
                )}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-3 group/progress">
                <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group-hover/progress:h-2 transition-all">
                  <div
                    className="absolute h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${isLive ? 100 : (currentTime / Math.max(duration, 1)) * 100}%` }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-green-500 rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `${isLive ? 100 : (currentTime / Math.max(duration, 1)) * 100}%`, transform: "translate(-50%, -50%)" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <button onClick={togglePlay} className="text-white hover:text-green-400 transition-colors">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>

                  {/* Skip */}
                  <button className="text-white/60 hover:text-white transition-colors hidden sm:block">
                    <SkipBack size={18} />
                  </button>
                  <button className="text-white/60 hover:text-white transition-colors hidden sm:block">
                    <SkipForward size={18} />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2 group/vol">
                    <button onClick={toggleMute} className="text-white hover:text-green-400 transition-colors">
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                      className="w-0 group-hover/vol:w-20 transition-all accent-green-500"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white/80 text-sm font-mono">
                    {isLive ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      `${formatTime(currentTime)} / ${formatTime(duration)}`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Settings */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 p-3 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 min-w-[160px]"
                        >
                          <p className="text-xs text-slate-400 mb-2">Quality</p>
                          {["1080p", "720p", "480p", "360p"].map((q) => (
                            <button
                              key={q}
                              onClick={() => { setQuality(q); setShowSettings(false); }}
                              className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                quality === q ? "bg-green-500/20 text-green-400" : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-colors">
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
