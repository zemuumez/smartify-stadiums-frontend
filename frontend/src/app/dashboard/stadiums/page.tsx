"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Camera,
  Zap,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
import api from "@/lib/api";
import type { Stadium } from "@/lib/api";

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
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
      setStadiums(res.data);
    } catch {
      // Demo data
      setStadiums([
        {
          id: "1",
          owner_id: "u1",
          name: "Bambis Meda Stadium",
          slug: "bambis-meda",
          description: "Premium football facility in the heart of Addis Ababa",
          address: "Bole Road, Bole",
          city: "Addis Ababa",
          status: "active",
          badge: "verified",
          has_camera: true,
          has_online_booking: true,
          has_referee_booking: false,
          field_count: 2,
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          owner_id: "u1",
          name: "St George Arena",
          slug: "st-george-arena",
          description: "Home of the Saints - professional football ground",
          address: "Arat Kilo, Arada",
          city: "Addis Ababa",
          status: "active",
          badge: "verified",
          has_camera: true,
          has_online_booking: true,
          has_referee_booking: true,
          field_count: 2,
          created_at: "2024-02-20T10:00:00Z",
        },
        {
          id: "3",
          owner_id: "u1",
          name: "Hawassa Sports Complex",
          slug: "hawassa-sports",
          description: "Multi-sport complex by Lake Hawassa",
          address: "Lake Road, Hawassa",
          city: "Hawassa",
          status: "pending",
          badge: "pending",
          has_camera: false,
          has_online_booking: true,
          has_referee_booking: false,
          field_count: 3,
          created_at: "2024-03-10T10:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post("/stadiums", newStadium);
      setShowCreateModal(false);
      loadStadiums();
    } catch {
      // Demo: add locally
      setStadiums((prev) => [
        ...prev,
        {
          ...newStadium,
          id: String(prev.length + 1),
          owner_id: "u1",
          slug: newStadium.name.toLowerCase().replace(/\s+/g, "-"),
          status: "draft",
          badge: "pending",
          has_camera: false,
          has_online_booking: false,
          has_referee_booking: false,
          field_count: 0,
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
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ||
      (filter === "active" && s.status === "active") ||
      (filter === "pending" && s.status === "pending") ||
      (filter === "camera" && s.has_camera);
    return matchSearch && matchFilter;
  });

  const statusColors = {
    active: "text-green-400 bg-green-500/10 border-green-500/20",
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    draft: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    suspended: "text-red-400 bg-red-500/10 border-red-500/20",
    deactivated: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Stadiums</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your football facilities</p>
        </div>
        <MagneticButton
          onClick={() => setShowCreateModal(true)}
          icon={<Plus size={18} />}
          variant="primary"
          size="md"
        >
          Add Stadium
        </MagneticButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stadiums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "pending", "camera"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stadiums Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-900/50 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((stadium) => (
            <StaggerItem key={stadium.id}>
              <GlowCard className="h-full">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{stadium.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[stadium.status] || statusColors.draft}`}>
                          {stadium.status === "active" ? <CheckCircle2 size={10} /> : stadium.status === "pending" ? <Clock size={10} /> : <XCircle size={10} />}
                          {stadium.status}
                        </span>
                        {stadium.badge === "verified" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            ✅ ULS Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-white/10 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10">
                        <a href={`/dashboard/stadiums/${stadium.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-t-xl">
                          <Edit3 size={14} /> Edit
                        </a>
                        <a href={`/${stadium.slug}`} target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                          <ExternalLink size={14} /> View Microsite
                        </a>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-b-xl">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={14} className="text-gray-500" />
                    <span>{stadium.address}, {stadium.city}</span>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {stadium.has_camera && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs">
                        <Camera size={12} /> Camera
                      </span>
                    )}
                    {stadium.has_online_booking && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs">
                        <Zap size={12} /> Online Booking
                      </span>
                    )}
                    {stadium.has_referee_booking && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs">
                        ⚖️ Referee
                      </span>
                    )}
                    {stadium.phone && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">
                        <Phone size={12} /> {stadium.phone}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{stadium.field_count || 0} Fields</span>
                      <span>·</span>
                      <span>{new Date(stadium.created_at).toLocaleDateString()}</span>
                    </div>
                    <Link
                      href={`/dashboard/stadiums/${stadium.id}`}
                      className="text-green-400 text-xs font-medium hover:text-green-300 flex items-center gap-1"
                    >
                      Manage <Eye size={12} />
                    </Link>
                  </div>
                </div>
              </GlowCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No stadiums found</h3>
          <p className="text-gray-400 text-sm mb-6">Get started by adding your first stadium</p>
          <MagneticButton onClick={() => setShowCreateModal(true)} icon={<Plus size={18} />} variant="primary">
            Add Your First Stadium
          </MagneticButton>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Add New Stadium</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Stadium Name *</label>
                  <input
                    type="text"
                    value={newStadium.name}
                    onChange={(e) => setNewStadium({ ...newStadium, name: e.target.value })}
                    placeholder="e.g. Bambis Meda Stadium"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                  <input
                    type="text"
                    value={newStadium.address}
                    onChange={(e) => setNewStadium({ ...newStadium, address: e.target.value })}
                    placeholder="Street address"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">City *</label>
                  <select
                    value={newStadium.city}
                    onChange={(e) => setNewStadium({ ...newStadium, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50"
                  >
                    {["Addis Ababa", "Hawassa", "Bahir Dar", "Dire Dawa", "Mekelle", "Jimma", "Adama"].map((c) => (
                      <option key={c} value={c} className="bg-gray-800">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={newStadium.phone}
                    onChange={(e) => setNewStadium({ ...newStadium, phone: e.target.value })}
                    placeholder="+251 9XX XXX XXX"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                  <textarea
                    value={newStadium.description}
                    onChange={(e) => setNewStadium({ ...newStadium, description: e.target.value })}
                    placeholder="Tell people about your stadium..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <MagneticButton
                  onClick={handleCreate}
                  variant="primary"
                  size="md"
                >
                  {creating ? "Creating..." : "Create Stadium"}
                </MagneticButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
