"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Video, Shield, ArrowUpRight, Filter, SlidersHorizontal, ArrowRight, Zap } from "lucide-react";
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
  price_from: number;
  sport: string;
  image: string;
}

const cities = ["All Cities", "Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle"];
const sports = ["All Sports", "Football", "Basketball", "Volleyball", "Badminton", "Tennis", "Futsal"];

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedSport, setSelectedSport] = useState("All Sports");

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
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === "All Cities" || s.city === selectedCity;
    const matchesSport = selectedSport === "All Sports" || s.sport === selectedSport;
    return matchesSearch && matchesCity && matchesSport;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>
      {/* ── HERO ── */}
      <section className="pt-40 pb-16 bg-white border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Ethiopia Sports Network</div>
            <h1 className="heading-xl mb-4">Discover &amp; Book Stadiums</h1>
            <p className="text-[#7a7a7a] text-lg max-w-2xl leading-relaxed mb-8">
              Find verified sports facilities across Addis Ababa and beyond. Real-time availability, AI cameras, and instant booking via Telebirr or Chapa.
            </p>

            {/* Search Bar Float */}
            <div className="photo-card p-3 max-w-3xl flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by stadium name, neighborhood, or city..."
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-[#111] placeholder-[#aaa] focus:outline-none"
                />
              </div>
              <button
                className="w-full sm:w-auto px-7 py-3 rounded-full text-white text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: "#2d6a4f" }}
              >
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER PILLS ── */}
      <section className="py-8 border-b" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Sports Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] flex-shrink-0">Sports:</span>
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`sport-pill flex-shrink-0 ${selectedSport === sport ? "active" : "inactive"}`}
              >
                {sport === "Football" && "⚽ "}
                {sport === "Basketball" && "🏀 "}
                {sport === "Volleyball" && "🏐 "}
                {sport === "Badminton" && "🏸 "}
                {sport === "Tennis" && "🎾 "}
                {sport === "Futsal" && "⚡ "}
                {sport}
              </button>
            ))}
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] flex-shrink-0">Cities:</span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
                style={
                  selectedCity === city
                    ? { background: "#1a4731", color: "white" }
                    : { background: "white", color: "#5a5a5a", border: "1px solid rgba(0,0,0,0.08)" }
                }
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STADIUM GRID ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-sm font-bold text-[#111]">
              Showing <span className="text-[#2d6a4f]">{filteredStadiums.length}</span> Verified Stadiums
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="photo-card p-6 animate-pulse">
                  <div className="h-48 bg-[#eae8e1] rounded-2xl mb-4" />
                  <div className="h-5 bg-[#eae8e1] rounded w-3/4 mb-3" />
                  <div className="h-4 bg-[#eae8e1] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStadiums.map((stadium) => (
                <StaggerItem key={stadium.id}>
                  <div className="photo-card h-full flex flex-col justify-between group overflow-hidden">
                    <div>
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={stadium.image || "/venue-card-1.jpg"}
                          alt={stadium.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {stadium.is_verified && (
                            <span className="venue-tag">
                              <Shield size={10} style={{ color: "#2d6a4f" }} /> ULS Verified
                            </span>
                          )}
                          {stadium.has_camera && (
                            <span className="venue-tag" style={{ background: "rgba(13,43,29,0.9)", color: "white" }}>
                              <Video size={10} style={{ color: "#74c69d" }} /> AI Camera
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
                            {stadium.sport || "Football"}
                          </span>
                        </div>

                        {/* Price Overlay */}
                        <div className="absolute bottom-3 left-3 text-white">
                          <span className="text-lg font-black">{stadium.price_from} ETB</span>
                          <span className="text-xs text-white/70"> / hr</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Star size={13} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                          <span className="text-xs font-bold text-[#111]">{stadium.rating.toFixed(1)}</span>
                          <span className="text-xs text-[#8a8a8a]">({stadium.total_reviews} reviews)</span>
                        </div>

                        <h3 className="text-lg font-black text-[#111] mb-1 group-hover:text-[#2d6a4f] transition-colors">
                          {stadium.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-[#7a7a7a] mb-4">
                          <MapPin size={13} style={{ color: "#2d6a4f" }} className="flex-shrink-0" />
                          <span className="truncate">{stadium.address}, {stadium.city}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#5a5a5a] pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                          <span className="font-semibold">{stadium.fields_count} Available Fields</span>
                          <span>•</span>
                          <span>Instant Confirmation</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA bar */}
                    <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
                      <Link
                        href={`/microsite`}
                        className="text-xs font-bold transition-colors hover:underline"
                        style={{ color: "#2d6a4f" }}
                      >
                        View Official Site →
                      </Link>

                      <Link
                        href={`/bookings/new?stadium=${stadium.slug}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                        style={{ background: "#2d6a4f" }}
                      >
                        Book Now <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}

          {!loading && filteredStadiums.length === 0 && (
            <div className="text-center py-24 photo-card p-12 max-w-xl mx-auto">
              <span className="text-5xl mb-4 block">🏟️</span>
              <h3 className="text-xl font-black text-[#111] mb-2">No Stadiums Found</h3>
              <p className="text-[#7a7a7a] text-sm mb-6">
                Try clearing your search query or selecting &quot;All Cities&quot; and &quot;All Sports&quot;.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCity("All Cities");
                  setSelectedSport("All Sports");
                }}
                className="px-6 py-2.5 rounded-full text-white text-xs font-bold"
                style={{ background: "#2d6a4f" }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const demoStadiums: Stadium[] = [
  {
    id: "1",
    name: "Bambis Meda Stadium",
    slug: "bambis-meda",
    address: "Bole Road, Bole",
    city: "Addis Ababa",
    rating: 4.9,
    total_reviews: 212,
    is_verified: true,
    has_camera: true,
    fields_count: 4,
    price_from: 800,
    sport: "Football",
    image: "/venue-card-1.jpg",
  },
  {
    id: "2",
    name: "Unity Sports Complex",
    slug: "unity-complex",
    address: "Meskel Square, Kirkos",
    city: "Addis Ababa",
    rating: 4.7,
    total_reviews: 134,
    is_verified: true,
    has_camera: true,
    fields_count: 5,
    price_from: 600,
    sport: "Basketball",
    image: "/venue-card-2.jpg",
  },
  {
    id: "3",
    name: "Lideta Futsal Arena",
    slug: "lideta-futsal",
    address: "Lideta Sub-City",
    city: "Addis Ababa",
    rating: 4.8,
    total_reviews: 89,
    is_verified: true,
    has_camera: true,
    fields_count: 2,
    price_from: 900,
    sport: "Futsal",
    image: "/testimonial-venue.jpg",
  },
  {
    id: "4",
    name: "Hawassa Lakeside Court",
    slug: "hawassa-lakeside",
    address: "Lake Hawassa Promenade",
    city: "Hawassa",
    rating: 4.6,
    total_reviews: 67,
    is_verified: true,
    has_camera: false,
    fields_count: 3,
    price_from: 500,
    sport: "Volleyball",
    image: "/hero-sports-field.jpg",
  },
  {
    id: "5",
    name: "Bahir Dar Palm Sports",
    slug: "bahir-dar-palm",
    address: "Lake Tana Shore",
    city: "Bahir Dar",
    rating: 4.5,
    total_reviews: 74,
    is_verified: false,
    has_camera: true,
    fields_count: 2,
    price_from: 700,
    sport: "Tennis",
    image: "/venue-card-1.jpg",
  },
  {
    id: "6",
    name: "Dire Dawa Central Arena",
    slug: "dire-dawa-central",
    address: "Downtown Dire Dawa",
    city: "Dire Dawa",
    rating: 4.4,
    total_reviews: 51,
    is_verified: true,
    has_camera: false,
    fields_count: 2,
    price_from: 650,
    sport: "Football",
    image: "/venue-card-2.jpg",
  },
];
