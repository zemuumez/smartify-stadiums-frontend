"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Star, Video, Shield, Clock, Users, Calendar,
  ArrowLeft, Play, Download, Share2, Phone, Mail, CheckCircle2, Award, Building2
} from "lucide-react";
import { MicrositeHero } from "@/components/microsite/MicrositeHero";
import { FieldCard } from "@/components/microsite/FieldCard";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
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
      const response = await api.get(`/stadiums/${slug}`);
      setStadium(response.data?.stadium || demoStadium);
      setFields(response.data?.fields || demoFields);
      setReplays(response.data?.replays || demoReplays);
    } catch {
      setStadium(demoStadium);
      setFields(demoFields);
      setReplays(demoReplays);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="text-center py-20">
          <Building2 size={40} className="text-[#2d6a4f] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#111] mb-2">Stadium Not Found</h2>
          <p className="text-[#7a7a7a] mb-6">The sports venue you are looking for does not exist or has been relocated.</p>
          <Link href="/stadiums" className="btn-primary inline-flex items-center gap-2" style={{ background: "#2d6a4f" }}>
            Back to All Stadiums
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>
      {/* Hero */}
      <MicrositeHero stadium={stadium} />

      {/* Tabs */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-2">
            {[
              { key: "fields", label: "Fields & Booking", icon: <Calendar size={15} /> },
              { key: "matches", label: "Match Replays & AI Camera", icon: <Video size={15} /> },
              { key: "about", label: "About & Amenities", icon: <MapPin size={15} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                style={
                  activeTab === tab.key
                    ? { background: "#2d6a4f", color: "white" }
                    : { background: "transparent", color: "#6a6a6a" }
                }
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {activeTab === "fields" && (
              <motion.div
                key="fields"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">Available Fields</div>
                    <h2 className="heading-xl">Select a Pitch to Book</h2>
                  </div>
                  <Link
                    href={`/microsite/fields`}
                    className="text-xs font-bold"
                    style={{ color: "#2d6a4f" }}
                  >
                    View Official Field Directory →
                  </Link>
                </div>

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
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <div className="mb-8">
                  <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">AI Camera Archive</div>
                  <h2 className="heading-xl">Recent Replays &amp; Highlights</h2>
                </div>

                {stadium.has_camera ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {replays.map((replay) => (
                      <div key={replay.id} className="photo-card overflow-hidden group">
                        {/* Video Thumbnail */}
                        <div className="relative aspect-video flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d2b1d 0%, #1a4731 100%)" }}>
                          <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/40 transition-transform group-hover:scale-110" style={{ background: "rgba(45,106,79,0.85)" }}>
                            <Play className="text-white ml-1" size={22} fill="currentColor" />
                          </div>
                          <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1 rounded-md text-[11px] font-bold text-white">
                            {replay.duration}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-6">
                          <h3 className="font-black text-[#111] text-base mb-1">{replay.title}</h3>
                          <p className="text-xs text-[#7a7a7a] mb-4">{replay.date}</p>

                          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                            <span className="text-xs text-[#7a7a7a] flex items-center gap-1 font-medium">
                              <Play size={11} style={{ color: "#2d6a4f" }} /> {replay.views} views
                            </span>
                            <div className="flex gap-2">
                              <button className="p-2 rounded-xl text-xs font-semibold" style={{ background: "#f0faf4", color: "#2d6a4f" }}>
                                <Download size={13} />
                              </button>
                              <button className="p-2 rounded-xl text-xs font-semibold" style={{ background: "#f0faf4", color: "#2d6a4f" }}>
                                <Share2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 photo-card p-8">
                    <Video className="mx-auto text-[#aaa] mb-4" size={40} />
                    <h3 className="text-lg font-black text-[#111] mb-2">No Camera System Installed</h3>
                    <p className="text-[#7a7a7a] text-sm max-w-sm mx-auto">
                      This stadium does not have an active AI Camera system yet. Match replays will be available once certified.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="max-w-4xl"
              >
                <div className="mb-8">
                  <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">Stadium Info</div>
                  <h2 className="heading-xl">About {stadium.name}</h2>
                </div>

                <div className="photo-card p-8 mb-6">
                  <p className="text-[#3d3d3d] text-base leading-relaxed">
                    {stadium.description || `${stadium.name} is a premier sports facility located in ${stadium.city}, Ethiopia. Featuring modern amenities, professional-grade artificial turf pitches, and AI-powered camera systems for automated match recording.`}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="photo-card p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
                      <MapPin size={18} style={{ color: "#2d6a4f" }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#8a8a8a] uppercase">Address</div>
                      <div className="text-sm font-semibold text-[#111] mt-0.5">{stadium.address}, {stadium.city}</div>
                    </div>
                  </div>

                  <div className="photo-card p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
                      <Clock size={18} style={{ color: "#2d6a4f" }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#8a8a8a] uppercase">Operating Hours</div>
                      <div className="text-sm font-semibold text-[#111] mt-0.5">{stadium.operating_hours || "6:00 AM – 10:00 PM"}</div>
                    </div>
                  </div>

                  <div className="photo-card p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
                      <Phone size={18} style={{ color: "#2d6a4f" }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#8a8a8a] uppercase">Phone</div>
                      <div className="text-sm font-semibold text-[#111] mt-0.5">{stadium.phone || "+251 911 234 567"}</div>
                    </div>
                  </div>

                  <div className="photo-card p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
                      <Star size={18} style={{ color: "#2d6a4f" }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#8a8a8a] uppercase">Rating</div>
                      <div className="text-sm font-semibold text-[#111] mt-0.5">{stadium.rating.toFixed(1)} / 5.0 ({stadium.total_reviews} reviews)</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/microsite"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold"
                  style={{ background: "#2d6a4f" }}
                >
                  Visit Full Official Stadium Microsite →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

const demoStadium: Stadium = {
  id: "1",
  name: "Bambis Meda Stadium",
  slug: "bambis-meda",
  address: "Bole Road, Bole",
  fields_count: 3,
  city: "Addis Ababa",
  rating: 4.9,
  total_reviews: 212,
  is_verified: true,
  has_camera: true,
  cover_image: "/venue-card-1.jpg",
  description: "Bambis Meda Stadium is one of Addis Ababa's premier sports facilities. Located in the heart of Bole, it features three professional-grade fields with modern amenities, night lighting, and AI-powered camera systems for automatic match recording.",
  phone: "+251 911 445 678",
  email: "info@bambismeda.com",
  operating_hours: "6:00 AM – 10:00 PM",
};

const demoFields: Field[] = [
  {
    id: "f1",
    field_number: 1,
    surface_type: "artificial_turf",
    has_lighting: true,
    price_per_hour: 1200,
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
    surface_type: "futsal_hardwood",
    has_lighting: true,
    price_per_hour: 800,
    capacity: 10,
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
    surface_type: "basketball_court",
    has_lighting: false,
    price_per_hour: 600,
    capacity: 10,
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
    title: "Bole Lions FC vs Kirkos United",
    date: "Aug 24, 2026",
    duration: "90:00",
    views: 342,
  },
  {
    id: "r2",
    title: "Weekend 3v3 Tournament Final",
    date: "Aug 22, 2026",
    duration: "45:00",
    views: 520,
  },
  {
    id: "r3",
    title: "Friday Night Futsal Cup Highlights",
    date: "Aug 20, 2026",
    duration: "15:00",
    views: 890,
  },
];
