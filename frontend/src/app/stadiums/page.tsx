"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, MapPin, Star, Video, Shield, ArrowUpRight,
  Filter, SlidersHorizontal, ArrowRight, Zap, Calendar,
  ChevronDown, CheckCircle2, Award, Clock, Smartphone, Activity, Camera
} from "lucide-react";
import { FadeUp, SlideIn, StaggerChildren, StaggerItem, ScaleIn } from "@/components/ui/AnimatedSection";
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

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedSport, setSelectedSport] = useState("All");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyCamera, setOnlyCamera] = useState(false);

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
    const matchesSport = selectedSport === "All" || s.sport === selectedSport;
    const matchesVerified = !onlyVerified || s.is_verified;
    const matchesCamera = !onlyCamera || s.has_camera;
    return matchesSearch && matchesCity && matchesSport && matchesVerified && matchesCamera;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO WITH FULL-BLEED PHOTO ── */}
      <section className="relative min-h-[65vh] flex flex-col justify-end overflow-hidden">
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

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <span className="trust-badge">
                <Shield size={12} className="text-[#74c69d]" />
                50+ Verified Sports Venues in Ethiopia
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white font-black leading-[1.05] mb-5"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)", letterSpacing: "-0.025em" }}
            >
              Find &amp; Book <br />
              <span style={{ color: "#74c69d" }}>Sports Fields</span> in Ethiopia
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/80 text-lg leading-relaxed mb-6 max-w-xl"
            >
              Real-time availability, certified AI camera tracking, and instant payment via Telebirr or Chapa. Zero double-bookings guaranteed.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── FLOATING SEARCH & FILTER BAR ── */}
      <section className="relative z-20 -mt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="search-bar-float flex flex-col lg:flex-row items-stretch lg:items-center p-2">
              {/* Search text input */}
              <div className="flex-1 flex items-center px-4 py-2 border-b lg:border-b-0 lg:border-r border-black/[0.06]">
                <Search size={18} className="text-[#8a8a8a] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stadium name, Bole, Kirkos, Hawassa..."
                  className="w-full text-sm font-semibold text-[#111] placeholder-[#aaa] bg-transparent focus:outline-none"
                />
              </div>

              {/* City selector */}
              <div className="flex-1 flex items-center px-4 py-2 border-b lg:border-b-0 lg:border-r border-black/[0.06]">
                <MapPin size={16} className="text-[#2d6a4f] mr-2 flex-shrink-0" />
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
              <div className="flex-1 flex items-center px-4 py-2 border-b lg:border-b-0 lg:border-r border-black/[0.06]">
                <Activity size={16} className="text-[#2d6a4f] mr-2 flex-shrink-0" />
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
                  className="flex items-center justify-center gap-2 w-full lg:w-auto px-7 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: "#2d6a4f", boxShadow: "0 4px 14px rgba(45,106,79,0.3)" }}
                >
                  Find Venues
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── SPORT PILLS & QUICK FILTERS ── */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Sport Pills */}
            <div className="flex flex-wrap gap-2.5">
              {sports.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSport(sp.id)}
                  className={`sport-pill ${selectedSport === sp.id ? "active" : "inactive"}`}
                >
                  {sp.label}
                </button>
              ))}
            </div>

            {/* Toggle badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setOnlyVerified(!onlyVerified)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  onlyVerified
                    ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                    : "bg-white text-[#5a5a5a] border-black/10 hover:border-black/20"
                }`}
              >
                ULS Verified Only
              </button>
              <button
                onClick={() => setOnlyCamera(!onlyCamera)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  onlyCamera
                    ? "bg-[#2d6a4f] text-white border-[#2d6a4f]"
                    : "bg-white text-[#5a5a5a] border-black/10 hover:border-black/20"
                }`}
              >
                AI Camera Only
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── VENUE LISTINGS GRID ── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">
                {selectedCity} • {selectedSport === "All" ? "All Sports" : selectedSport}
              </div>
              <h2 className="heading-xl">Available Sports Venues</h2>
            </div>
            <div className="text-xs font-bold text-[#7a7a7a]">
              Showing <span className="text-[#111] font-black">{filteredStadiums.length}</span> venues
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
              {filteredStadiums.map((stadium) => (
                <StaggerItem key={stadium.id}>
                  <div className="photo-card h-full flex flex-col justify-between group overflow-hidden hover:shadow-xl transition-all duration-300">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
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
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ background: "rgba(26,71,49,0.85)", backdropFilter: "blur(8px)" }}
                          >
                            {stadium.sport || "Football"}
                          </span>
                        </div>

                        {/* Price Overlay */}
                        <div className="absolute bottom-3 left-4 text-white">
                          <div className="text-xs text-white/70 font-semibold">Starting from</div>
                          <div className="text-xl font-black">{stadium.price_from} ETB <span className="text-xs font-normal text-white/75">/ hour</span></div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star size={14} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                            <span className="text-xs font-black text-[#111]">{stadium.rating.toFixed(1)}</span>
                            <span className="text-xs text-[#8a8a8a]">({stadium.total_reviews} reviews)</span>
                          </div>
                          <span className="text-xs font-bold text-[#2d6a4f]">{stadium.fields_count} Available Fields</span>
                        </div>

                        <h3 className="text-xl font-black text-[#111] mb-1 group-hover:text-[#2d6a4f] transition-colors">
                          {stadium.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-[#7a7a7a] mb-5">
                          <MapPin size={13} style={{ color: "#2d6a4f" }} className="flex-shrink-0" />
                          <span className="truncate">{stadium.address}, {stadium.city}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#5a5a5a] pt-4 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                          <span className="flex items-center gap-1.5">
                            <Zap size={12} style={{ color: "#2d6a4f" }} /> Instant Booking
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Smartphone size={12} style={{ color: "#2d6a4f" }} /> Telebirr / Chapa
                          </span>
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
                        Official Microsite <ArrowRight size={12} />
                      </Link>

                      <Link
                        href={`/bookings/new?stadium=${stadium.slug}`}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                        style={{ background: "#2d6a4f", boxShadow: "0 4px 12px rgba(45,106,79,0.25)" }}
                      >
                        Book Pitch <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}

          {!loading && filteredStadiums.length === 0 && (
            <div className="text-center py-24 photo-card p-12 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f]">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-black text-[#111] mb-2">No Stadiums Match Your Filters</h3>
              <p className="text-[#7a7a7a] text-sm mb-6">
                Try resetting your city or sport filters to see all available sports venues in Ethiopia.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCity("All Cities");
                  setSelectedSport("All");
                  setOnlyVerified(false);
                  setOnlyCamera(false);
                }}
                className="px-7 py-3 rounded-full text-white text-xs font-bold transition-all"
                style={{ background: "#2d6a4f" }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── GUARANTEE / QUALITY SECTION ── */}
      <section className="py-20 bg-white border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    fields_count: 4,
    price_from: 800,
    sport: "Football",
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
    fields_count: 5,
    price_from: 600,
    sport: "Basketball",
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
    fields_count: 2,
    price_from: 900,
    sport: "Futsal",
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
    fields_count: 3,
    price_from: 500,
    sport: "Volleyball",
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
    fields_count: 2,
    price_from: 700,
    sport: "Tennis",
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
    fields_count: 2,
    price_from: 650,
    sport: "Football",
    image: "/venue-card-2.jpg",
    featured: false,
  },
];
