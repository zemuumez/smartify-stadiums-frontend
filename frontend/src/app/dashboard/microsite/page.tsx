"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Palette,
  Image,
  FileText,
  Video,
  Save,
  Eye,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Building2,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FadeUp } from "@/components/ui/AnimatedSection";

export default function MicrositePage() {
  const [activeTab, setActiveTab] = useState("general");
  const [site, setSite] = useState({
    name: "Bambis Meda Stadium",
    slug: "bambis-meda",
    tagline: "Premium Football in Addis Ababa",
    description: "Experience world-class football at Bambis Meda Stadium. Featuring 2 FIFA-standard fields with professional camera coverage for every match.",
    primaryColor: "#22c55e",
    accentColor: "#eab308",
    phone: "+251 911 234 567",
    email: "info@bambismeda.etsmartfields.com",
    whatsapp: "+251 911 234 567",
    address: "Bole Road, Addis Ababa",
    socialLinks: {
      facebook: "https://facebook.com/bambismeda",
      instagram: "",
      telegram: "",
    },
    features: ["Camera Coverage", "Online Booking", "Changing Rooms", "Parking", "Floodlights"],
  });

  const [events, setEvents] = useState([
    { id: "1", title: "Sunday League Cup Final", date: "2026-08-30", description: "The biggest match of the season!", image: "" },
    { id: "2", title: "Youth Training Camp", date: "2026-09-05", description: "Professional coaching for ages 8-16", image: "" },
  ]);

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "media", label: "Media", icon: Image },
    { id: "events", label: "Events", icon: FileText },
    { id: "videos", label: "Videos", icon: Video },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Microsite Editor</h2>
          <p className="text-gray-400 text-sm mt-1">Customize your public microsite</p>
        </div>
        <div className="flex gap-3">
          <MagneticButton href={`/${site.slug}`} variant="ghost" size="md" icon={<Eye size={16} />}>
            Preview
          </MagneticButton>
          <MagneticButton variant="primary" size="md" icon={<Save size={16} />}>
            Save Changes
          </MagneticButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <FadeUp>
          <GlowCard>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Stadium Name</label>
                  <input
                    type="text"
                    value={site.name}
                    onChange={(e) => setSite({ ...site, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">URL Slug</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-1">etsmartfields.com/</span>
                    <input
                      type="text"
                      value={site.slug}
                      onChange={(e) => setSite({ ...site, slug: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={site.tagline}
                  onChange={(e) => setSite({ ...site, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Description</label>
                <textarea
                  value={site.description}
                  onChange={(e) => setSite({ ...site, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Phone</label>
                  <input type="tel" value={site.phone} onChange={(e) => setSite({ ...site, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Email</label>
                  <input type="email" value={site.email} onChange={(e) => setSite({ ...site, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">WhatsApp</label>
                  <input type="tel" value={site.whatsapp} onChange={(e) => setSite({ ...site, whatsapp: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Features</label>
                <div className="flex flex-wrap gap-2">
                  {site.features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm border border-green-500/20">
                      {f}
                      <button onClick={() => setSite({ ...site, features: site.features.filter((_, j) => j !== i) })} className="text-green-400/50 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm border border-white/10 hover:bg-white/10">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            </div>
          </GlowCard>
        </FadeUp>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <FadeUp>
          <GlowCard>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Branding & Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-3">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={site.primaryColor}
                      onChange={(e) => setSite({ ...site, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={site.primaryColor}
                      onChange={(e) => setSite({ ...site, primaryColor: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-3">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={site.accentColor}
                      onChange={(e) => setSite({ ...site, accentColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={site.accentColor}
                      onChange={(e) => setSite({ ...site, accentColor: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="p-6 rounded-xl border border-white/10" style={{ background: `linear-gradient(135deg, ${site.primaryColor}20, ${site.accentColor}10)` }}>
                <p className="text-sm text-gray-400 mb-2">Preview</p>
                <h4 className="text-xl font-bold text-white" style={{ color: site.primaryColor }}>{site.name}</h4>
                <p className="text-sm mt-1" style={{ color: site.accentColor }}>{site.tagline}</p>
                <button className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: site.primaryColor }}>
                  Book Now
                </button>
              </div>
            </div>
          </GlowCard>
        </FadeUp>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <FadeUp>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Events & Highlights</h3>
              <MagneticButton variant="primary" size="sm" icon={<Plus size={16} />}>
                Add Event
              </MagneticButton>
            </div>
            {events.map((event) => (
              <GlowCard key={event.id}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                    <GripVertical size={16} />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={event.title}
                      className="bg-transparent text-white font-medium focus:outline-none"
                    />
                    <input
                      type="text"
                      value={event.date}
                      className="bg-transparent text-gray-400 text-sm focus:outline-none"
                    />
                  </div>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlowCard>
            ))}
          </div>
        </FadeUp>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <FadeUp>
          <GlowCard>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Media Library</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-video rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-green-500/50 transition-colors cursor-pointer">
                  <Upload size={24} className="text-gray-500" />
                  <span className="text-xs text-gray-400">Upload Cover</span>
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-video rounded-xl bg-gradient-to-br from-green-500/20 to-yellow-500/10 border border-white/10 flex items-center justify-center">
                    <Building2 size={24} className="text-gray-400" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Max 5MB per image. Supported: JPG, PNG, WebP. Cover image will be displayed on your microsite hero section.</p>
            </div>
          </GlowCard>
        </FadeUp>
      )}

      {/* Videos Tab */}
      {activeTab === "videos" && (
        <FadeUp>
          <GlowCard>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Match Highlights</h3>
                <span className="text-xs text-gray-400">Stadium owners can post up to 10 highlight videos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Bambis vs Lion City - Full Match", "Sunday League Final - Highlights", "Training Session - Youth Cup"].map((v, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="aspect-video rounded-lg bg-gray-800 flex items-center justify-center mb-3">
                      <Video size={32} className="text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-white">{v}</p>
                    <p className="text-xs text-gray-400 mt-1">2:34 · Posted Aug 20</p>
                  </div>
                ))}
                <div className="aspect-video rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-green-500/50 transition-colors cursor-pointer">
                  <Upload size={24} className="text-gray-500" />
                  <span className="text-xs text-gray-400">Upload Video (max 500MB)</span>
                </div>
              </div>
            </div>
          </GlowCard>
        </FadeUp>
      )}
    </div>
  );
}
