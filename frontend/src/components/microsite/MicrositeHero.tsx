"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Video, Shield, Clock, Users, Calendar } from "lucide-react";
import Link from "next/link";

interface MicrositeHeroProps {
  stadium: {
    name: string;
    address: string;
    city: string;
    rating: number;
    total_reviews: number;
    is_verified: boolean;
    has_camera: boolean;
    fields_count: number;
    cover_image?: string;
  };
}

export function MicrositeHero({ stadium }: MicrositeHeroProps) {
  return (
    <section className="relative min-h-[60vh] flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={stadium.cover_image || "/hero-sports-field.jpg"}
          alt={stadium.name}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 photo-overlay-hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {stadium.is_verified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold" style={{ background: "rgba(45,106,79,0.85)", backdropFilter: "blur(8px)" }}>
                <Shield size={12} />
                ULS Verified
              </span>
            )}
            {stadium.has_camera && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold" style={{ background: "rgba(13,43,29,0.85)", backdropFilter: "blur(8px)" }}>
                <Video size={12} style={{ color: "#74c69d" }} />
                AI Camera Live
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
              📍 {stadium.city}
            </span>
          </div>

          {/* Name & Location */}
          <h1
            className="text-white font-black leading-tight mb-3"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", letterSpacing: "-0.025em" }}
          >
            {stadium.name}
          </h1>

          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <MapPin size={16} style={{ color: "#74c69d" }} />
            <span>{stadium.address}, {stadium.city}</span>
          </div>

          {/* Stats & CTA Row */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/15">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star size={16} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                <span className="text-white font-bold">{stadium.rating.toFixed(1)}</span>
                <span className="text-white/60 text-xs">({stadium.total_reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <Users size={16} />
                <span>{stadium.fields_count} Fields</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <Clock size={16} />
                <span>Open 6 AM – 10 PM</span>
              </div>
            </div>

            <Link
              href="/bookings/new"
              className="px-6 py-3 rounded-full text-white text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: "#2d6a4f", boxShadow: "0 4px 16px rgba(45,106,79,0.4)" }}
            >
              <Calendar size={14} /> Book Slot Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
