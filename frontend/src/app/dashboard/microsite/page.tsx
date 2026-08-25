"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  Palette,
  Image as ImageIcon,
  FileText,
  Video,
  Save,
  Eye,
  ExternalLink,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import { FadeUp } from "@/components/ui/AnimatedSection";

export default function MicrositePage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [site, setSite] = useState({
    name: "Bambis Meda Stadium",
    slug: "bambis-meda",
    tagline: "Premier Multi-Sport Arena in Addis Ababa",
    description: "Experience world-class football, basketball, and futsal at Bambis Meda Stadium. Featuring FIFA-certified artificial turf, automated 4K Veo live streaming, and floodlit night matches.",
    phone: "+251 911 234 567",
    email: "info@bambismeda.com",
    address: "Bole Road, Near Medhanialem, Addis Ababa",
    features: ["4K AI Camera Coverage", "Instant Online Booking", "Changing Rooms & Showers", "Dedicated Parking", "Night Floodlights"],
  });

  const [events, setEvents] = useState([
    { id: "1", title: "Addis Corporate League Final", date: "2026-08-30", description: "The premier amateur tournament final of the season!" },
    { id: "2", title: "Weekend 7v7 Open Cup", date: "2026-09-05", description: "Knockout tournament for community teams with cash prizes." },
  ]);

  const tabs = [
    { id: "general", label: "General & Bio", icon: Globe },
    { id: "media", label: "Photos & Banners", icon: ImageIcon },
    { id: "events", label: "Tournaments & Events", icon: FileText },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">

      {/* ── HEADER & CTA ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111] tracking-tight">Public Microsite Editor</h2>
          <p className="text-[#7a7a7a] text-xs sm:text-sm mt-0.5">
            Customize your stadium&apos;s public website, photos, bio, and upcoming tournaments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/microsite"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-black/15 text-xs font-bold text-[#111] hover:bg-[#f4f3ef] transition-colors"
          >
            <Eye size={14} /> Preview Live <ArrowUpRight size={12} />
          </Link>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
            style={{ background: "#2d6a4f" }}
          >
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "bg-white text-[#5a5a5a] border border-black/[0.06] hover:text-[#111]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-[#f0faf4] text-xs font-bold text-[#2d6a4f] flex items-center gap-2">
          <CheckCircle2 size={16} /> Microsite settings updated successfully!
        </div>
      )}

      {/* ── GENERAL TAB ── */}
      {activeTab === "general" && (
        <FadeUp>
          <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-black/[0.05] space-y-6">
            <h3 className="text-lg font-black text-[#111]">General Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                  Microsite Title
                </label>
                <input
                  type="text"
                  value={site.name}
                  onChange={(e) => setSite({ ...site, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                  Custom Subdomain Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3.5 py-3 rounded-l-2xl bg-[#eae8e1] text-xs font-bold text-[#7a7a7a] border border-r-0 border-black/10">
                    etsmartfields.com/
                  </span>
                  <input
                    type="text"
                    value={site.slug}
                    onChange={(e) => setSite({ ...site, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-r-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                  Tagline / Hero Hook
                </label>
                <input
                  type="text"
                  value={site.tagline}
                  onChange={(e) => setSite({ ...site, tagline: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                  About the Facility &amp; Pitch Specifications
                </label>
                <textarea
                  rows={4}
                  value={site.description}
                  onChange={(e) => setSite({ ...site, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>
            </div>
          </div>
        </FadeUp>
      )}

      {/* ── MEDIA TAB ── */}
      {activeTab === "media" && (
        <FadeUp>
          <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-black/[0.05] space-y-6">
            <h3 className="text-lg font-black text-[#111]">Gallery &amp; Pitch Photos</h3>
            <p className="text-xs text-[#7a7a7a]">High-resolution photos displayed on your public booking page</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video rounded-2xl bg-[#f4f3ef] border border-black/10 flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:bg-[#eae8e1] transition-colors">
                  <ImageIcon size={28} className="text-[#8a8a8a] group-hover:text-[#2d6a4f] mb-2" />
                  <span className="text-xs font-bold text-[#5a5a5a]">Field Photo #{i}</span>
                  <span className="text-[10px] text-[#8a8a8a]">Click to replace</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      )}

      {/* ── EVENTS TAB ── */}
      {activeTab === "events" && (
        <FadeUp>
          <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-black/[0.05] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#111]">Tournaments &amp; League Cups</h3>
                <p className="text-xs text-[#7a7a7a]">Promote tournaments hosted at your venue</p>
              </div>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm"
                style={{ background: "#2d6a4f" }}
              >
                <Plus size={14} /> Add Event
              </button>
            </div>

            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 rounded-2xl bg-[#f4f3ef] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-[#111]">{ev.title}</div>
                    <div className="text-[11px] text-[#7a7a7a] mt-0.5">{ev.date} • {ev.description}</div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      )}

    </div>
  );
}
