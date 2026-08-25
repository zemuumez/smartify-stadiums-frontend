"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MapPin,
  Camera,
  Zap,
  MoreVertical,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Building2,
  Shield,
  Award,
  ArrowUpRight,
  X
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
import api from "@/lib/api";
import type { Stadium } from "@/lib/api";

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStadium, setNewStadium] = useState({
    name: "",
    address: "",
    city: "Addis Ababa",
    phone: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadStadiums();
  }, []);

  const loadStadiums = async () => {
    try {
      const res = await api.get("/stadiums");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setStadiums(res.data);
      } else {
        setStadiums(demoStadiumsList);
      }
    } catch {
      setStadiums(demoStadiumsList);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/stadiums", newStadium);
      setShowCreateModal(false);
      loadStadiums();
    } catch {
      // Demo fallback: add locally
      setStadiums((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          owner_id: "u1",
          name: newStadium.name,
          slug: newStadium.name.toLowerCase().replace(/\s+/g, "-"),
          description: newStadium.description || "Modern sports facility in Ethiopia",
          address: newStadium.address,
          city: newStadium.city,
          status: "active",
          badge: "verified",
          has_camera: true,
          has_online_booking: true,
          has_referee_booking: true,
          field_count: 2,
          created_at: new Date().toISOString(),
        },
      ]);
      setShowCreateModal(false);
      setNewStadium({ name: "", address: "", city: "Addis Ababa", phone: "", description: "" });
    } finally {
      setCreating(false);
    }
  };

  const filtered = stadiums.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      filter === "all" ||
      (filter === "active" && s.status === "active") ||
      (filter === "pending" && s.status === "pending") ||
      (filter === "camera" && s.has_camera);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">

      {/* ── HEADER & ADD STADIUM CTA ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111] tracking-tight">Your Stadiums</h2>
          <p className="text-[#7a7a7a] text-xs sm:text-sm mt-0.5">
            Manage your registered sports facilities, fields, and public presence
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs transition-all hover:opacity-90 shadow-md flex-shrink-0"
          style={{ background: "#2d6a4f" }}
        >
          <Plus size={16} /> Add Stadium
        </button>
      </div>

      {/* ── SEARCH & FILTER TABS ── */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-black/[0.05] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
          <input
            type="text"
            placeholder="Search stadiums by name, city, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f4f3ef] text-xs font-semibold text-[#111] placeholder-[#aaa] focus:outline-none focus:bg-white border border-transparent focus:border-black/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Venues" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending" },
            { id: "camera", label: "AI Camera Enabled" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === f.id
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "bg-[#f4f3ef] text-[#5a5a5a] hover:text-[#111]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STADIUMS GRID ── */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((stadium) => (
          <StaggerItem key={stadium.id}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.05] flex flex-col justify-between hover:shadow-md transition-all duration-200 h-full group">
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-[#111] truncate group-hover:text-[#2d6a4f] transition-colors">
                      {stadium.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#7a7a7a] mt-1">
                      <MapPin size={13} className="text-[#2d6a4f] flex-shrink-0" />
                      <span className="truncate">{stadium.address || stadium.city}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      stadium.status === "active"
                        ? "bg-[#f0faf4] text-[#2d6a4f]"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${stadium.status === "active" ? "bg-[#2d6a4f]" : "bg-amber-600"}`} />
                    {stadium.status}
                  </span>
                </div>

                <p className="text-xs text-[#7a7a7a] leading-relaxed mb-4 line-clamp-2">
                  {stadium.description || "Premier multi-sport ground equipped with certified turf and automated player booking sync."}
                </p>

                {/* Features & Specs */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#f4f3ef] mb-4 text-center">
                  <div>
                    <div className="text-[10px] text-[#7a7a7a] font-bold uppercase">Operational Fields</div>
                    <div className="text-sm font-black text-[#111] mt-0.5">{stadium.field_count || 2} Pitches</div>
                  </div>
                  <div className="border-l border-black/[0.06]">
                    <div className="text-[10px] text-[#7a7a7a] font-bold uppercase">Camera Stream</div>
                    <div className="text-sm font-black text-[#2d6a4f] mt-0.5">
                      {stadium.has_camera ? "4K Veo Live" : "Not Linked"}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 pb-4 border-b border-black/[0.06]">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#f0faf4] text-[#2d6a4f]">
                    <Shield size={10} /> ULS Verified
                  </span>
                  {stadium.has_camera && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#f0faf4] text-[#2d6a4f]">
                      <Camera size={10} /> AI Recording
                    </span>
                  )}
                  {stadium.has_referee_booking && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#1e6091]">
                      <Award size={10} /> Referee Booking
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 flex items-center justify-between gap-2">
                <Link
                  href={`/microsite`}
                  target="_blank"
                  className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
                >
                  View Microsite <ArrowUpRight size={12} />
                </Link>

                <Link
                  href={`/dashboard/fields`}
                  className="px-4 py-2 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm"
                  style={{ background: "#2d6a4f" }}
                >
                  Manage Fields
                </Link>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* ── CREATE STADIUM MODAL ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-black/[0.06]"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.06]">
                <div>
                  <h3 className="text-xl font-black text-[#111]">Register New Stadium</h3>
                  <p className="text-xs text-[#7a7a7a]">Add your venue to ET Smart Fields</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl text-[#7a7a7a] hover:text-[#111] hover:bg-[#f4f3ef]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Stadium Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bole Lions Sports Ground"
                    value={newStadium.name}
                    onChange={(e) => setNewStadium({ ...newStadium, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <select
                      value={newStadium.city}
                      onChange={(e) => setNewStadium({ ...newStadium, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    >
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Hawassa">Hawassa</option>
                      <option value="Dire Dawa">Dire Dawa</option>
                      <option value="Bahir Dar">Bahir Dar</option>
                      <option value="Mekelle">Mekelle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="0911234567"
                      value={newStadium.phone}
                      onChange={(e) => setNewStadium({ ...newStadium, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Street Address / Sub-City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bole Road, Near Medhanialem Church"
                    value={newStadium.address}
                    onChange={(e) => setNewStadium({ ...newStadium, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe amenities, artificial turf, floodlights..."
                    value={newStadium.description}
                    onChange={(e) => setNewStadium({ ...newStadium, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-3 rounded-full border border-black/10 text-xs font-bold text-[#5a5a5a] hover:bg-[#f4f3ef]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 rounded-full text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#2d6a4f" }}
                  >
                    {creating ? "Creating..." : "Save Stadium"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const demoStadiumsList: Stadium[] = [
  {
    id: "1",
    owner_id: "u1",
    name: "Bambis Meda Stadium",
    slug: "bambis-meda",
    description: "Premium football & multi-sport facility in the heart of Bole, Addis Ababa",
    address: "Bole Road, Bole",
    city: "Addis Ababa",
    status: "active",
    badge: "verified",
    has_camera: true,
    has_online_booking: true,
    has_referee_booking: true,
    field_count: 4,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    owner_id: "u1",
    name: "Unity Sports Complex",
    slug: "unity-complex",
    description: "Multi-sport ground for basketball, volleyball, and indoor futsal",
    address: "Meskel Square, Kirkos",
    city: "Addis Ababa",
    status: "active",
    badge: "verified",
    has_camera: true,
    has_online_booking: true,
    has_referee_booking: true,
    field_count: 5,
    created_at: "2024-02-20T10:00:00Z",
  },
  {
    id: "3",
    owner_id: "u1",
    name: "Hawassa Lakeside Court",
    slug: "hawassa-lakeside",
    description: "Lakeside recreational sports field with evening floodlighting",
    address: "Lake Hawassa Promenade",
    city: "Hawassa",
    status: "active",
    badge: "verified",
    has_camera: false,
    has_online_booking: true,
    has_referee_booking: false,
    field_count: 3,
    created_at: "2024-03-10T10:00:00Z",
  },
];
