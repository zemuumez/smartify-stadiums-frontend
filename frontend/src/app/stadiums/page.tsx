"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Star, Video, Shield, ArrowUpRight,
  SlidersHorizontal, ArrowRight, Zap, Calendar,
  ChevronDown, CheckCircle2, Award, Clock, Smartphone,
  Activity, Camera, Lightbulb, Shirt, ShieldCheck,
  Building2, RotateCcw, Flame, Check
} from "lucide-react";
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
  has_referee: boolean;
  has_lighting: boolean;
  has_changing_room: boolean;
  has_equipment: boolean;
  has_instant_pay: boolean;
  is_indoor: boolean;
  fields_count: number;
  price_from: number;
  sport: string;
  sports: string[];
  image: string;
  featured?: boolean;
}

const cities = ["All Cities", "Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle"];

const sports = [
  { id: "All",        label: "All Sports" },
  { id: "Football",   label: "Football" },
  { id: "Basketball", label: "Basketball" },
  { id: "Volleyball", label: "Volleyball" },
  { id: "Badminton",  label: "Badminton" },
  { id: "Tennis",     label: "Tennis" },
  { id: "Futsal",     label: "Futsal" },
];

const featureFilters = [
  { id: "camera",   label: "AI Camera (Veo)",   icon: Video },
  { id: "referee",  label: "Referee Available", icon: Award },
  { id: "verified", label: "ULS Verified",      icon: ShieldCheck },
  { id: "lighting", label: "Night Games",       icon: Lightbulb },
  { id: "changing", label: "Locker & Showers",  icon: Shirt },
  { id: "indoor",   label: "Indoor Arena",      icon: Building2 },
];

type SortOption = "recommended" | "rating_desc" | "price_asc" | "price_desc" | "reviews_desc" | "fields_desc";

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const response = await api.get("/stadiums");
      const list = response.data?.stadiums || demoStadiums;
      // Normalize data with reliable defaults
      const normalized = list.map((s: any, idx: number) => ({
        ...demoStadiums[idx % demoStadiums.length],
        ...s,
        rating: Number(s.rating) || demoStadiums[idx % demoStadiums.length]?.rating || 4.5,
        total_reviews: Number(s.total_reviews) || demoStadiums[idx % demoStadiums.length]?.total_reviews || 50,
        price_from: Number(s.price_from) || demoStadiums[idx % demoStadiums.length]?.price_from || 600,
        fields_count: Number(s.fields_count) || demoStadiums[idx % demoStadiums.length]?.fields_count || 2,
        sports: s.sports || [s.sport || "Football"],
      }));
      setStadiums(normalized);
    } catch {
      setStadiums(demoStadiums);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCity("All Cities");
    setSelectedSport("All");
    setSelectedFeatures([]);
    setSortBy("recommended");
  };

  // Comprehensive multi-criteria filtering and sorting algorithm
  const filteredAndSortedStadiums = useMemo(() => {
    const query = search.trim().toLowerCase();

    // 1. FILTERING
    const filtered = stadiums.filter((s) => {
      // Search matching (name, address, city, sport, supported sports)
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query) ||
        s.sport.toLowerCase().includes(query) ||
        s.sports?.some((sp) => sp.toLowerCase().includes(query));

      // City filter
      const matchesCity = selectedCity === "All Cities" || s.city.toLowerCase() === selectedCity.toLowerCase();

      // Sport filter (primary sport or multi-sport array)
      const matchesSport =
        selectedSport === "All" ||
        s.sport.toLowerCase() === selectedSport.toLowerCase() ||
        s.sports?.some((sp) => sp.toLowerCase() === selectedSport.toLowerCase());

      // Feature filters
      if (selectedFeatures.includes("camera") && !s.has_camera) return false;
      if (selectedFeatures.includes("referee") && !s.has_referee) return false;
      if (selectedFeatures.includes("verified") && !s.is_verified) return false;
      if (selectedFeatures.includes("lighting") && !s.has_lighting) return false;
      if (selectedFeatures.includes("changing") && !s.has_changing_room) return false;
      if (selectedFeatures.includes("indoor") && !s.is_indoor) return false;

      return matchesSearch && matchesCity && matchesSport;
    });

    // 2. SORTING ALGORITHM
    const sorted = [...filtered].sort((a, b) => {
      const priceA = Number(a.price_from) || 0;
      const priceB = Number(b.price_from) || 0;
      const ratingA = Number(a.rating) || 0;
      const ratingB = Number(b.rating) || 0;
      const reviewsA = Number(a.total_reviews) || 0;
      const reviewsB = Number(b.total_reviews) || 0;
      const fieldsA = Number(a.fields_count) || 0;
      const fieldsB = Number(b.fields_count) || 0;

      switch (sortBy) {
        case "recommended": {
          const scoreA =
            (a.featured ? 1000 : 0) +
            (a.is_verified ? 500 : 0) +
            (a.has_camera ? 200 : 0) +
            ratingA * 50 +
            reviewsA;
          const scoreB =
            (b.featured ? 1000 : 0) +
            (b.is_verified ? 500 : 0) +
            (b.has_camera ? 200 : 0) +
            ratingB * 50 +
            reviewsB;
          return scoreB - scoreA;
        }
        case "rating_desc":
          if (ratingB !== ratingA) return ratingB - ratingA;
          return reviewsB - reviewsA;
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "reviews_desc":
          return reviewsB - reviewsA;
        case "fields_desc":
          return fieldsB - fieldsA;
        default:
          return 0;
      }
    });

    return sorted;
  }, [stadiums, search, selectedCity, selectedSport, selectedFeatures, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCity !== "All Cities" ||
    selectedSport !== "All" ||
    selectedFeatures.length > 0 ||
    sortBy !== "recommended";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO WITH FULL-BLEED PHOTO ── */}
      <section className="relative min-h-[60vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-sports-field.jpg"
            alt="Ethiopia Stadiums and Sports Fields"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 photo-overlay-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 spotnow-container pt-36 pb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <span className="trust-badge">
                <Shield size={12} className="text-[#74c69d]" />
                50+ Verified Sports Venues in Ethiopia
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-white font-black leading-[1.05] mb-5 tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)" }}
            >
              Find &amp; Book <br />
              <span style={{ color: "#74c69d" }}>Sports Fields</span> in Ethiopia
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/85 text-base sm:text-lg leading-relaxed max-w-xl"
            >
              Real-time slot synchronization, certified AI camera tracking, and instant mobile payment via Telebirr or CBE Birr.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── FLOATING SEARCH & FILTER BAR ── */}
      <section className="relative z-20 -mt-8 pb-4">
        <div className="spotnow-container">
          <FadeUp>
            <div className="search-bar-float flex flex-col lg:flex-row items-stretch lg:items-center p-2 shadow-2xl">
              {/* Search text input */}
              <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-black/[0.06]">
                <Search size={18} className="text-[#8a8a8a] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stadium name, Bole, Kirkos, Hawassa..."
                  className="w-full text-sm font-semibold text-[#111] placeholder-[#aaa] bg-transparent focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs text-[#8a8a8a] hover:text-[#111] font-bold px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* City selector */}
              <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-black/[0.06]">
                <MapPin size={16} className="text-[#2d6a4f] mr-2.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-[#aaa] font-bold uppercase">City</div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full text-sm font-bold text-[#111] bg-transparent focus:outline-none cursor-pointer"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sport selector */}
              <div className="flex-1 flex items-center px-4 py-3 border-b lg:border-b-0 lg:border-r border-black/[0.06]">
                <Activity size={16} className="text-[#2d6a4f] mr-2.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-[#aaa] font-bold uppercase">Sport</div>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full text-sm font-bold text-[#111] bg-transparent focus:outline-none cursor-pointer"
                  >
                    {sports.map((sp) => (
                      <option key={sp.id} value={sp.id}>{sp.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="p-1 flex-shrink-0">
                <button
                  onClick={() => {}}
                  className="flex items-center justify-center gap-2 w-full lg:w-auto px-7 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 shadow-md"
                  style={{ background: "#2d6a4f" }}
                >
                  Find Venues
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── SPORT CATEGORY SELECTOR & ADVANCED FEATURE FILTER BAR ── */}
      <section className="py-6">
        <div className="spotnow-container space-y-4">

          {/* Row 1: Sport Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sports.map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSport(sp.id)}
                className={`sport-pill flex-shrink-0 ${selectedSport === sp.id ? "active" : "inactive"}`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Row 2: Feature Filters & Amenities (System Concept Features) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] mr-1 flex items-center gap-1">
                <SlidersHorizontal size={13} /> Features:
              </span>

              {featureFilters.map((feat) => {
                const active = selectedFeatures.includes(feat.id);
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => toggleFeature(feat.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      active
                        ? "bg-[#2d6a4f] text-white border-[#2d6a4f] shadow-sm"
                        : "bg-[#f4f3ef] text-[#4a4a4a] border-transparent hover:bg-[#e8e6df]"
                    }`}
                  >
                    <Icon size={12} className={active ? "text-white" : "text-[#2d6a4f]"} />
                    {feat.label}
                  </button>
                );
              })}
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-all self-start md:self-auto flex-shrink-0"
              >
                <RotateCcw size={12} /> Reset Filters
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ── VENUE LISTINGS GRID WITH SORTING HEADER ── */}
      <section className="py-8">
        <div className="spotnow-container">

          {/* Sorting & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-black/[0.06]">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">
                {selectedCity} • {selectedSport === "All" ? "All Sports" : selectedSport}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111] tracking-tight">
                Available Sports Venues
              </h2>
            </div>

            {/* Sorting Dropdown & Counter */}
            <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
              <div className="text-xs font-semibold text-[#7a7a7a]">
                Showing <span className="text-[#111] font-black">{filteredAndSortedStadiums.length}</span> venues
              </div>

              {/* Sort selector */}
              <div className="relative flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-black/10 shadow-sm">
                <span className="text-[11px] text-[#7a7a7a] font-bold uppercase tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs font-black text-[#111] bg-transparent focus:outline-none cursor-pointer pr-6 appearance-none"
                >
                  <option value="recommended" className="bg-white text-[#111] py-1">Recommended (Best Match)</option>
                  <option value="rating_desc" className="bg-white text-[#111] py-1">Highest Rated (5.0 → 1.0)</option>
                  <option value="price_asc" className="bg-white text-[#111] py-1">Price: Low to High</option>
                  <option value="price_desc" className="bg-white text-[#111] py-1">Price: High to Low</option>
                  <option value="reviews_desc" className="bg-white text-[#111] py-1">Most Popular (Reviews)</option>
                  <option value="fields_desc" className="bg-white text-[#111] py-1">Most Available Fields</option>
                </select>
                <ChevronDown size={14} className="text-[#2d6a4f] absolute right-3 pointer-events-none" />
              </div>
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
            <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredAndSortedStadiums.map((stadium) => (
                <StaggerItem key={stadium.id}>
                  <div className="photo-card h-full flex flex-col justify-between group overflow-hidden hover:shadow-2xl transition-all duration-300">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {stadium.is_verified && (
                            <span className="venue-tag">
                              <Shield size={11} style={{ color: "#2d6a4f" }} /> ULS Verified
                            </span>
                          )}
                          {stadium.has_camera && (
                            <span className="venue-tag" style={{ background: "rgba(13,43,29,0.9)", color: "white" }}>
                              <Video size={11} style={{ color: "#74c69d" }} /> AI Camera
                            </span>
                          )}
                        </div>

                        {/* Sport Pill Overlay */}
                        <div className="absolute top-3 right-3">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                            style={{ background: "rgba(26,71,49,0.85)", backdropFilter: "blur(8px)" }}
                          >
                            {stadium.sport || "Football"}
                          </span>
                        </div>

                        {/* Price Overlay */}
                        <div className="absolute bottom-3 left-4 text-white">
                          <div className="text-[11px] text-white/70 font-semibold">Starting from</div>
                          <div className="text-xl font-black">{stadium.price_from} ETB <span className="text-xs font-normal text-white/75">/ hour</span></div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Star size={14} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                            <span className="text-xs font-black text-[#111]">{stadium.rating.toFixed(1)}</span>
                            <span className="text-xs text-[#8a8a8a]">({stadium.total_reviews} reviews)</span>
                          </div>
                          <span className="text-xs font-bold text-[#2d6a4f] bg-[#f0faf4] px-2.5 py-0.5 rounded-full">
                            {stadium.fields_count} Available Fields
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-[#111] mb-1 group-hover:text-[#2d6a4f] transition-colors">
                          {stadium.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-[#7a7a7a] mb-4">
                          <MapPin size={13} style={{ color: "#2d6a4f" }} className="flex-shrink-0" />
                          <span className="truncate">{stadium.address}, {stadium.city}</span>
                        </div>

                        {/* Dynamic Feature Chips directly on Card */}
                        <div className="flex flex-wrap gap-1.5 pt-3 pb-3 border-t border-black/[0.06]">
                          {stadium.has_camera && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d6a4f] bg-[#f0faf4] px-2.5 py-1 rounded-lg">
                              <Camera size={11} /> AI Replay
                            </span>
                          )}
                          {stadium.has_referee && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e6091] bg-blue-50 px-2.5 py-1 rounded-lg">
                              <Award size={11} /> Referee
                            </span>
                          )}
                          {stadium.has_lighting && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                              <Lightbulb size={11} /> Floodlights
                            </span>
                          )}
                          {stadium.has_changing_room && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3d3d3d] bg-gray-100 px-2.5 py-1 rounded-lg">
                              <Shirt size={11} /> Lockers
                            </span>
                          )}
                          {stadium.has_instant_pay && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d6a4f] bg-[#f0faf4] px-2.5 py-1 rounded-lg">
                              <Smartphone size={11} /> Telebirr
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
                      <Link
                        href={`/microsite`}
                        className="text-xs font-bold transition-colors hover:underline flex items-center gap-1"
                        style={{ color: "#2d6a4f" }}
                      >
                        Visit Official Site <ArrowRight size={12} />
                      </Link>

                      <Link
                        href={`/bookings/new?stadium=${stadium.slug}`}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
                        style={{ background: "#2d6a4f" }}
                      >
                        Book Pitch <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}

          {!loading && filteredAndSortedStadiums.length === 0 && (
            <div className="text-center py-20 photo-card p-12 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f]">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-black text-[#111] mb-2">No Stadiums Match Your Filter Criteria</h3>
              <p className="text-[#7a7a7a] text-sm mb-6 leading-relaxed">
                We couldn&apos;t find any venues matching your selected sport, city, and feature combinations. Try resetting filters to see all available fields.
              </p>
              <button
                onClick={resetFilters}
                className="px-7 py-3 rounded-full text-white text-xs font-bold transition-all shadow-sm"
                style={{ background: "#2d6a4f" }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── GUARANTEE / QUALITY SECTION ── */}
      <section className="py-20 bg-white border-t border-black/[0.06]">
        <div className="spotnow-container">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield size={24} style={{ color: "#2d6a4f" }} />,
                title: "100% Guaranteed Slot Sync",
                desc: "Our real-time database locks your booked time slot the millisecond payment is confirmed. Zero double-booking risk.",
              },
              {
                icon: <Camera size={24} style={{ color: "#2d6a4f" }} />,
                title: "Certified AI Cameras",
                desc: "Look for the camera badge on stadiums equipped with 4K autonomous match tracking and automatic highlight reels.",
              },
              {
                icon: <Smartphone size={24} style={{ color: "#2d6a4f" }} />,
                title: "Native Ethiopian Payments",
                desc: "Pay instantly with Telebirr, CBE Birr, or Chapa. Automated digital receipts sent via SMS and WhatsApp.",
              },
            ].map((feature) => (
              <div key={feature.title} className="photo-card p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "#f0faf4" }}>
                    {feature.icon}
                  </div>
                  <h3 className="font-black text-[#111] text-lg mb-2">{feature.title}</h3>
                  <p className="text-[#7a7a7a] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1a10 0%, #1a4731 50%, #0d2b1d 100%)" }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-white font-black text-3xl sm:text-4xl mb-4">
              Are You a Stadium or Field Owner?
            </h2>
            <p className="text-white/65 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Join Ethiopia&apos;s smart sports infrastructure network. Increase your bookings by 40% with real-time scheduling and an official microsite.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/auth/register"
                className="btn-primary btn-primary-lg"
                style={{ background: "#2d6a4f" }}
              >
                Register Your Stadium Free <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="btn-ghost-white"
                style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
              >
                View Owner Plans
              </Link>
            </div>
          </FadeUp>
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
    has_referee: true,
    has_lighting: true,
    has_changing_room: true,
    has_equipment: true,
    has_instant_pay: true,
    is_indoor: false,
    fields_count: 4,
    price_from: 800,
    sport: "Football",
    sports: ["Football", "Futsal"],
    image: "/venue-card-1.jpg",
    featured: true,
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
    has_referee: true,
    has_lighting: true,
    has_changing_room: true,
    has_equipment: true,
    has_instant_pay: true,
    is_indoor: true,
    fields_count: 5,
    price_from: 600,
    sport: "Basketball",
    sports: ["Basketball", "Volleyball", "Badminton"],
    image: "/venue-card-2.jpg",
    featured: true,
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
    has_referee: false,
    has_lighting: true,
    has_changing_room: true,
    has_equipment: false,
    has_instant_pay: true,
    is_indoor: true,
    fields_count: 2,
    price_from: 900,
    sport: "Futsal",
    sports: ["Futsal", "Football"],
    image: "/testimonial-venue.jpg",
    featured: false,
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
    has_referee: true,
    has_lighting: false,
    has_changing_room: false,
    has_equipment: true,
    has_instant_pay: true,
    is_indoor: false,
    fields_count: 3,
    price_from: 500,
    sport: "Volleyball",
    sports: ["Volleyball", "Tennis"],
    image: "/hero-sports-field.jpg",
    featured: false,
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
    has_referee: false,
    has_lighting: true,
    has_changing_room: true,
    has_equipment: true,
    has_instant_pay: true,
    is_indoor: false,
    fields_count: 2,
    price_from: 700,
    sport: "Tennis",
    sports: ["Tennis", "Badminton"],
    image: "/venue-card-1.jpg",
    featured: false,
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
    has_referee: true,
    has_lighting: true,
    has_changing_room: false,
    has_equipment: false,
    has_instant_pay: true,
    is_indoor: false,
    fields_count: 2,
    price_from: 650,
    sport: "Football",
    sports: ["Football"],
    image: "/venue-card-2.jpg",
    featured: false,
  },
];
