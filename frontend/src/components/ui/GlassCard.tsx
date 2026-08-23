"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({ children, className, hover = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -8, scale: 1.02 } : undefined}
      className={clsx(
        "relative rounded-2xl backdrop-blur-xl",
        "bg-white/80 dark:bg-gray-900/80",
        "border border-white/20 dark:border-gray-700/30",
        "shadow-xl shadow-black/5",
        "hover:shadow-2xl hover:shadow-green-500/10",
        "transition-all duration-500",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function GlowCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className={clsx(
        "relative group rounded-2xl p-[1px]",
        "bg-gradient-to-br from-green-500/30 via-transparent to-yellow-500/30",
        className
      )}
    >
      <div className="relative rounded-2xl bg-gray-950/90 backdrop-blur-xl p-6 h-full">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 via-transparent to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}
