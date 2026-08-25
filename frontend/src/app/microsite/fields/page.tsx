"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar, CheckCircle2, ArrowRight, Zap, Lightbulb,
  Camera, Shirt, Wifi, CreditCard, Activity
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const SPORTS = ["All", "Football", "Futsal", "Basketball", "Volleyball"];

const fields = [
  {
    id: 1, name: "Field 1 - Artificial Turf", sport: "Football",
    surface: "Artificial Turf (FIFA Quality)", size: "7v7", price: "1,200",
    lighting: true, camera: true, changing: true, wifi: true,
    schedule: "Mon-Sun: 6:00 AM - 10:00 PM",
    desc: "Our flagship 7-a-side pitch with FIFA-quality synthetic turf, LED floodlights, and a live AI camera.",
    amenities: ["AI Camera Recording", "LED Floodlights", "Changing Rooms", "Ball Provided", "Free WiFi"],
  },
  {
    id: 2, name: "Field 2 - 5-a-Side Turf", sport: "Football",
    surface: "Artificial Turf (3G)", size: "5v5", price: "900",
    lighting: true, camera: true, changing: true, wifi: true,
    schedule: "Mon-Sun: 6:00 AM - 10:00 PM",
    desc: "Compact and fast. Our 5-a-side pitch is perfect for small squads and futsal-style play.",
    amenities: ["AI Camera Recording", "LED Floodlights", "Shared Changing Rooms", "Free WiFi"],
  },
  {
    id: 3, name: "Futsal Hall - Indoor", sport: "Futsal",
    surface: "Hardwood / Polyurethane", size: "5v5", price: "800",
    lighting: true, camera: true, changing: true, wifi: true,
    schedule: "Mon-Sun: 7:00 AM - 11:00 PM",
    desc: "A professional indoor futsal hall with wooden flooring, regulation markings, and full AI camera coverage.",
    amenities: ["AI Camera Recording", "Indoor Climate Control", "Changing Rooms", "Scoreboards", "Free WiFi"],
  },
  {
    id: 4, name: "Basketball Court", sport: "Basketball",
    surface: "Hardwood (NBA-spec)", size: "5v5", price: "600",
    lighting: true, camera: false, changing: false, wifi: true,
    schedule: "Mon-Sun: 7:00 AM - 9:00 PM",
    desc: "Full-size outdoor basketball court with NBA-specification hardwood surface and adjustable hoops.",
    amenities: ["LED Floodlights", "Adjustable Hoops", "Free WiFi"],
  },
  {
    id: 5, name: "Volleyball Court", sport: "Volleyball",
    surface: "Synthetic Sand / Hardwood", size: "6v6", price: "500",
    lighting: false, camera: false, changing: false, wifi: false,
    schedule: "Mon-Fri: 8:00 AM - 6:00 PM",
    desc: "Outdoor volleyball court available for casual play and competitive matches. Equipment provided.",
    amenities: ["Net & Equipment Provided", "Outdoor Court"],
  },
];

const sportColor: Record<string, string> = {
  Football:   "#2d6a4f",
  Futsal:     "#1e4d7b",
  Basketball: "#b45309",
  Volleyball: "#7c3aed",
};

export default function MicrositeFields() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? fields
    : fields.filter((f) => f.sport === activeFilter);

  return (
    <div style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── PAGE HEADER ── */}
      <section className="pt-16 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Our Fields</div>
            <h1 className="heading-xl mb-4">Book Your Field</h1>
            <p className="text-[#7a7a7a] text-lg max-w-xl">
              {fields.length} fields available at Bambis Meda Stadium. Real-time availability. Instant booking via Telebirr or Chapa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SPORT FILTER ── */}
      <section className="py-8" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveFilter(s)}
                  className={`sport-pill ${activeFilter === s ? "active" : "inactive"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FIELD LISTINGS ── */}
      <section className="pb-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="space-y-5">
            {filtered.map((field) => (
              <StaggerItem key={field.id}>
                <div className="photo-card p-7 flex flex-col lg:flex-row gap-6">

                  {/* Left — Field Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className="text-xs font-black px-3 py-1.5 rounded-full text-white"
                        style={{ background: sportColor[field.sport] || "#2d6a4f" }}
                      >
                        {field.sport}
                      </span>
                      <span className="text-xs text-[#7a7a7a] font-semibold">{field.size} - {field.surface}</span>
                    </div>

                    <h2 className="font-black text-[#111] text-xl mb-2">{field.name}</h2>
                    <p className="text-sm text-[#7a7a7a] leading-relaxed mb-5 max-w-xl">{field.desc}</p>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {field.amenities.map((a) => (
                        <span
                          key={a}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: "#f0faf4", color: "#2d6a4f" }}
                        >
                          <CheckCircle2 size={11} /> {a}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-[#aaa]">
                      {field.schedule}
                    </p>
                  </div>

                  {/* Right — Pricing + CTA */}
                  <div className="flex-shrink-0 flex flex-col items-start lg:items-end justify-between gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-black text-[#111]">{field.price} ETB</div>
                      <div className="text-xs text-[#7a7a7a]">per hour</div>
                    </div>

                    {/* Amenity icons */}
                    <div className="flex gap-3 text-[#2d6a4f]">
                      {field.lighting  && <span title="LED Lighting"><Lightbulb size={18} /></span>}
                      {field.camera    && <span title="AI Camera"><Camera size={18} /></span>}
                      {field.changing  && <span title="Changing Room"><Shirt size={18} /></span>}
                      {field.wifi      && <span title="Free WiFi"><Wifi size={18} /></span>}
                    </div>

                    <Link
                      href="/bookings/new"
                      className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 whitespace-nowrap"
                      style={{ background: "#2d6a4f", boxShadow: "0 4px 14px rgba(45,106,79,0.3)" }}
                    >
                      <Calendar size={15} /> Book This Field
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── BOOKING INFO ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-10">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">How Booking Works</div>
            <h2 className="heading-xl">Easy as 1-2-3</h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { step: "01", icon: <Calendar size={24} style={{ color: "#2d6a4f" }} />, title: "Pick a Field & Time", desc: "Browse fields above and select a date and time slot that suits you." },
              { step: "02", icon: <CreditCard size={24} style={{ color: "#2d6a4f" }} />, title: "Pay Online",          desc: "Complete payment via Telebirr, CBE Birr, or credit card. Instant confirmation." },
              { step: "03", icon: <Activity size={24} style={{ color: "#2d6a4f" }} />, title: "Show Up & Play",      desc: "Arrive at the stadium. We will have your field ready with equipment." },
            ].map((s) => (
              <div key={s.step} className="photo-card p-6 text-center relative">
                <div className="absolute top-4 right-4 font-black text-6xl text-[#f0faf4] select-none">{s.step}</div>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-[#f0faf4]">
                  {s.icon}
                </div>
                <h3 className="font-black text-[#111] mb-2">{s.title}</h3>
                <p className="text-sm text-[#7a7a7a]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
