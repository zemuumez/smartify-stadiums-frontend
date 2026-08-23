"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Download, Share2, Check, X } from "lucide-react";

interface ClipButtonProps {
  matchId: string;
  currentTime: number;
}

export default function ClipButton({ matchId, currentTime }: ClipButtonProps) {
  const [showClipper, setShowClipper] = useState(false);
  const [clipDuration, setClipDuration] = useState(15);
  const [clipped, setClipped] = useState(false);

  const createClip = () => {
    setClipped(true);
    setTimeout(() => {
      setClipped(false);
      setShowClipper(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowClipper(!showClipper)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
      >
        <Scissors size={16} />
        Clip
      </button>

      <AnimatePresence>
        {showClipper && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-xl min-w-[280px] z-30"
          >
            {clipped ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="text-green-600" size={24} />
                </div>
                <p className="font-bold text-slate-900">Clip Created!</p>
                <p className="text-sm text-slate-500 mt-1">Ready to download or share</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-900 text-sm">Create Clip</h4>
                  <button onClick={() => setShowClipper(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-slate-500 mb-2 block">Duration</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 30, 60].map((d) => (
                      <button
                        key={d}
                        onClick={() => setClipDuration(d)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          clipDuration === d
                            ? "bg-green-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">Clipping from</p>
                  <p className="text-sm font-bold text-slate-900">
                    {Math.max(0, currentTime - clipDuration)}&apos; — {currentTime}&apos;
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={createClip}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                  >
                    <Scissors size={14} /> Create Clip
                  </button>
                </div>

                <div className="flex gap-2 mt-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors">
                    <Download size={12} /> Download
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors">
                    <Share2 size={12} /> Share
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
