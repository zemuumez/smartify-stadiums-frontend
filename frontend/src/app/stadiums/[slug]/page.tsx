"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Star, Video, Shield, Clock, Users, Calendar,
  ArrowLeft, ChevronRight, Play, Download, Share2, Heart
} from "lucide-react";
import { GlassCard, GlowCard } from "@/components/ui/GlassCard";
import { FadeUp, SlideIn } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MicrositeHero } from "@/components/microsite/MicrositeHero";
import { MicrositeLayout } from "@/components/microsite/MicrositeLayout";
import { FieldCard } from "@/components/microsite/FieldCard";
import api from "@/lib/api";

interface Stadium {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  has_camera: boolean;
  description?: string;
  phone?: string;
  email?: string;
  operating_hours?: string;
  logo?: string;
  cover_image?: string;
  fields_count: number;
}

interface Field {
  id: string;
  field_number: number;
  surface_type: string;
  has_lighting: boolean;
  price_per_hour: number;
  capacity?: number;
  schedule?: {
    day_of_week: number;
    open_time: string;
    close_time: string;
  }[];
}

interface MatchReplay {
  id: string;
  title: string;
  date: string;
  duration: string;
  thumbnail?: string;
  views: number;
}

export default function StadiumDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [replays, setReplays] = useState<MatchReplay[]>([]);
  const [activeTab, setActiveTab] = useState<"fields" | "matches" | "about">("fields");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStadiumData();
  }, [slug]);

  const fetchStadiumData = async () => {
    try {
      setLoading(true);
      // Try fetching from API
      const response = await api.get(`/stadiums/${slug}`);
      setStadium(response.data?.stadium || demoStadium);
      setFields(response.data?.fields || demoFields);
      setReplays(response.data?.replays || demoReplays);
    } catch {
      // Use demo data
      setStadium(demoStadium);
      setFields(demoFields);
      setReplays(demoReplays);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🏟️</span>
          <h2 className="text-2xl font-bold text-white mb-2">Stadium Not Found</h2>
          <Link href="/stadiums" className="text-green-400 hover:text-green-300">
            ← Back to Stadiums
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MicrositeLayout stadium={stadium}>
      {/* Hero */}
      <MicrositeHero stadium={stadium} />

      {/* Tabs */}
      <section className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: "fields", label: "Fields & Booking", icon: <Calendar size={16} /> },
              { key: "matches", label: "Match Replays", icon: <Video size={16} /> },
              { key: "about", label: "About", icon: <MapPin size={16} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "text-green-400 border-b-2 border-green-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {activeTab === "fields" && (
              <motion.div
                key="fields"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Available Fields</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fields.map((field) => (
                    <FieldCard key={field.id} field={field} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "matches" && (
              <motion.div
                key="matches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Match Replays</h2>
                {stadium.has_camera ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {replays.map((replay) => (
                      <GlowCard key={replay.id}>
                        {/* Thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 flex items-center justify-center group cursor-pointer">
                          {replay.thumbnail ? (
                            <img src={replay.thumbnail} alt={replay.title} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-5xl">⚽</span>
                          )}
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <Play className="text-white ml-1" size={24} />
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white">
                            {replay.duration}
                          </div>
                        </div>

                        {/* Info */}
                        <h3 className="font-bold text-white mb-1">{replay.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{replay.date}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Play size={12} />
                              {replay.views} views
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                              <Download size={14} className="text-gray-400" />
                            </button>
                            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                              <Share2 size={14} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 glass rounded-2xl">
                    <Video className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">No Camera System</h3>
                    <p className="text-gray-400">
                      This stadium doesn&apos;t have a camera system yet. Match replays will be available soon.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">About {stadium.name}</h2>

                <GlassCard className="p-6 mb-6">
                  <p className="text-gray-300 leading-relaxed">
                    {stadium.description || `${stadium.name} is a premium football facility located in ${stadium.city}, Ethiopia. Featuring modern amenities and professional-grade fields, it's the perfect place for your next match.`}
                  </p>
                </GlassCard>

                <div className="grid sm:grid-cols-2 gap-4">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="text-green-400" size={20} />
                      <span className="font-bold text-white">Location</span>
                    </div>
                    <p className="text-gray-400">{stadium.address}, {stadium.city}</p>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="text-green-400" size={20} />
                      <span className="font-bold text-white">Hours</span>
                    </div>
                    <p className="text-gray-400">{stadium.operating_hours || "6:00 AM - 10:00 PM"}</p>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="text-green-400" size={20} />
                      <span className="font-bold text-white">Capacity</span>
                    </div>
                    <p className="text-gray-400">{fields.length} Fields Available</p>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="text-yellow-400" size={20} />
                      <span className="font-bold text-white">Rating</span>
                    </div>
                    <p className="text-gray-400">{stadium.rating.toFixed(1)} / 5.0 ({stadium.total_reviews} reviews)</p>
                  </GlassCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </MicrositeLayout>
  );
}

// Demo data
const demoStadium: Stadium = {
  id: "1",
  name: "Bambis Meda Stadium",
  slug: "bambis-meda",
  address: "Bole Road, Bole",
  fields_count: 3,
  city: "Addis Ababa",
  rating: 4.8,
  total_reviews: 124,
  is_verified: true,
  has_camera: true,
  description: "Bambis Meda Stadium is one of Addis Ababa's premier football facilities. Located in the heart of Bole, it features three professional-grade fields with modern amenities, night lighting, and AI-powered camera systems for automatic match recording.",
  phone: "+251 911 234 567",
  email: "info@bambismeda.com",
  operating_hours: "6:00 AM - 10:00 PM",
};

const demoFields: Field[] = [
  {
    id: "f1",
    field_number: 1,
    surface_type: "artificial_turf",
    has_lighting: true,
    price_per_hour: 800,
    capacity: 22,
    schedule: [
      { day_of_week: 1, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 2, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 3, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 4, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 5, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 6, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 0, open_time: "08:00", close_time: "20:00" },
    ],
  },
  {
    id: "f2",
    field_number: 2,
    surface_type: "natural_grass",
    has_lighting: true,
    price_per_hour: 600,
    capacity: 22,
    schedule: [
      { day_of_week: 1, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 2, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 3, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 4, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 5, open_time: "06:00", close_time: "22:00" },
      { day_of_week: 6, open_time: "08:00", close_time: "20:00" },
      { day_of_week: 0, open_time: "08:00", close_time: "18:00" },
    ],
  },
  {
    id: "f3",
    field_number: 3,
    surface_type: "artificial_turf",
    has_lighting: false,
    price_per_hour: 400,
    capacity: 14,
    schedule: [
      { day_of_week: 1, open_time: "06:00", close_time: "18:00" },
      { day_of_week: 2, open_time: "06:00", close_time: "18:00" },
      { day_of_week: 3, open_time: "06:00", close_time: "18:00" },
      { day_of_week: 4, open_time: "06:00", close_time: "18:00" },
      { day_of_week: 5, open_time: "06:00", close_time: "18:00" },
      { day_of_week: 6, open_time: "08:00", close_time: "16:00" },
      { day_of_week: 0, open_time: "08:00", close_time: "14:00" },
    ],
  },
];

const demoReplays: MatchReplay[] = [
  {
    id: "r1",
    title: "Addis Stars vs Lion City FC",
    date: "August 15, 2026",
    duration: "90:00",
    views: 1243,
  },
  {
    id: "r2",
    title: "Weekend Tournament Final",
    date: "August 10, 2026",
    duration: "45:00",
    views: 856,
  },
  {
    id: "r3",
    title: "Training Session Highlights",
    date: "August 5, 2026",
    duration: "15:00",
    views: 2341,
  },
];
