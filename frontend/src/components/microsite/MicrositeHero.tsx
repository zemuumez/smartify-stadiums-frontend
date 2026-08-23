"use client";

import { motion } from "framer-motion";
import { MapPin, Star, Video, Shield, Clock, Users } from "lucide-react";

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
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-gray-900 to-gray-950" />
      {stadium.cover_image && (
        <img
          src={stadium.cover_image}
          alt={stadium.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {stadium.is_verified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium backdrop-blur-sm">
                <Shield size={14} />
                ULS Verified
              </span>
            )}
            {stadium.has_camera && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium backdrop-blur-sm">
                <Video size={14} />
                Camera Active
              </span>
            )}
          </div>

          {/* Name & Location */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            {stadium.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-300 mb-6">
            <MapPin size={18} className="text-green-400" />
            <span>{stadium.address}, {stadium.city}</span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <span className="text-white font-bold">{stadium.rating.toFixed(1)}</span>
              <span className="text-gray-400">({stadium.total_reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Users size={18} />
              <span>{stadium.fields_count} Fields</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={18} />
              <span>Open Now</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
