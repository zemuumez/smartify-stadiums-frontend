"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Filter, Star, Video, Shield, ChevronRight, SlidersHorizontal } from "lucide-react";
import { GlassCard, GlowCard } from "@/components/ui/GlassCard";
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
  fields_count: number;
  distance_km?: number;
}

const cities = ["All Cities", "Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle"];

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const response = await api.get("/stadiums");
      setStadiums(response.data?.stadiums || demoStadiums);
    } catch {
      setStadiums(demoStadiums);
    } finally {
      setLoading(false);
    }
  };

  const filteredStadiums = stadiums.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === "All Cities" || s.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Find <span className="gradient-text">Stadiums</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Discover football fields near you across Ethiopia
            </p>
          </FadeUp>

          {/* Search & Filters */}
          <FadeUp delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stadiums..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white hover:border-green-500/50 transition-colors"
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>
            </div>

            {/* City Filter */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCity === city
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gray-800/50 text-gray-400 border border-gray-700/30 hover:text-white"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </motion.div>
            )}
          </FadeUp>
        </div>
      </section>

      {/* Stadium Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStadiums.map((stadium) => (
                <StaggerItem key={stadium.id}>
                  <Link href={`/stadiums/${stadium.slug}`}>
                    <GlowCard className="h-full cursor-pointer">
                      {/* Stadium Image Placeholder */}
                      <div className="h-48 bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl mb-4 flex items-center justify-center">
                        <span className="text-6xl">🏟️</span>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 mb-3">
                        {stadium.is_verified && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                            <Shield size={12} />
                            ULS
                          </span>
                        )}
                        {stadium.has_camera && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                            <Video size={12} />
                            Camera
                          </span>
                        )}
                      </div>

                      {/* Name & Location */}
                      <h3 className="text-xl font-bold text-white mb-1">{stadium.name}</h3>
                      <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                        <MapPin size={14} />
                        <span>{stadium.address}, {stadium.city}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />
                          <span className="text-white font-medium">{stadium.rating.toFixed(1)}</span>
                          <span className="text-gray-500 text-sm">({stadium.total_reviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          {stadium.fields_count} fields
                          <ChevronRight size={14} />
                        </div>
                      </div>

                      {stadium.distance_km !== undefined && (
                        <div className="mt-2 text-sm text-green-400">
                          📍 {stadium.distance_km.toFixed(1)} km away
                        </div>
                      )}
                    </GlowCard>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}

          {!loading && filteredStadiums.length === 0 && (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-white mb-2">No stadiums found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Demo data for when API is not available
const demoStadiums: Stadium[] = [
  {
    id: "1",
    name: "Bambis Meda Stadium",
    slug: "bambis-meda",
    address: "Bole Road, Bole",
    city: "Addis Ababa",
    rating: 4.8,
    total_reviews: 124,
    is_verified: true,
    has_camera: true,
    fields_count: 3,
  },
  {
    id: "2",
    name: "St George Stadium",
    slug: "st-george",
    address: "Arat Kilo",
    city: "Addis Ababa",
    rating: 4.9,
    total_reviews: 256,
    is_verified: true,
    has_camera: true,
    fields_count: 2,
  },
  {
    id: "3",
    name: "Hawassa Football Park",
    slug: "hawassa-fc-park",
    address: "Lake Hawassa Road",
    city: "Hawassa",
    rating: 4.5,
    total_reviews: 67,
    is_verified: true,
    has_camera: false,
    fields_count: 2,
  },
  {
    id: "4",
    name: "Bahir Dar Stadium",
    slug: "bahir-dar",
    address: "Lake Tana Road",
    city: "Bahir Dar",
    rating: 4.6,
    total_reviews: 89,
    is_verified: false,
    has_camera: false,
    fields_count: 1,
  },
  {
    id: "5",
    name: "Dire Dawa Sports Complex",
    slug: "dire-dawa",
    address: "owntown Dire Dawa",
    city: "Dire Dawa",
    rating: 4.3,
    total_reviews: 45,
    is_verified: true,
    has_camera: true,
    fields_count: 2,
  },
  {
    id: "6",
    name: "Mekelle Arena",
    slug: "mekelle-arena",
    address: "Axumite Road",
    city: "Mekelle",
    rating: 4.4,
    total_reviews: 38,
    is_verified: false,
    has_camera: false,
    fields_count: 1,
  },
];
