"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Users, MapPin, Shield,
  Upload, Globe, Lock, Zap
} from "lucide-react";

const STEPS = ["Team Info", "Details", "Settings", "Review"];

export default function CreateTeamPage() {
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "Addis Ababa",
    description: "",
    maxPlayers: 15,
    isPublic: true,
    allowRequests: true,
    color: "#16a34a",
  });

  const updateForm = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const next = () => {
    if (step === STEPS.length - 1) {
      setCreated(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Team Created!</h1>
          <p className="text-slate-500 mb-8">
            <strong>{form.name}</strong> has been created. Invite players and start booking matches.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/teams/t1" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
              Go to Team
            </Link>
            <Link href="/teams" className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
              All Teams
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="pt-32 pb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/teams" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Teams
          </Link>
          <h1 className="text-3xl font-black text-white">Create a Team</h1>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full transition-colors ${i <= step ? "bg-green-500" : "bg-slate-200"}`} />
              <p className={`text-xs mt-1 font-medium ${i <= step ? "text-green-600" : "text-slate-400"}`}>{s}</p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8"
          >
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Team Information</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Team Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="e.g., Addis Stars FC"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                  <select
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 outline-none"
                  >
                    {["Addis Ababa", "Hawassa", "Bahir Dar", "Dire Dawa", "Mekelle", "Adama", "Jimma", "Dessie"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Tell other players about your team..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Team Color</label>
                  <div className="flex gap-2">
                    {["#16a34a", "#2563eb", "#dc2626", "#7c3aed", "#ea580c", "#0891b2", "#ca8a04", "#0f172a"].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateForm("color", c)}
                        className={`w-10 h-10 rounded-xl transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-green-500 scale-110" : "hover:scale-105"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Team Details</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Players</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={form.maxPlayers}
                      onChange={(e) => updateForm("maxPlayers", Number(e.target.value))}
                      className="flex-1 accent-green-500"
                    />
                    <span className="text-2xl font-black text-green-600 w-12 text-center">{form.maxPlayers}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Team Logo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-green-300 transition-colors cursor-pointer">
                    <Upload className="text-slate-400 mx-auto mb-3" size={32} />
                    <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Team Settings</h2>
                {[
                  { key: "isPublic", icon: <Globe size={20} />, title: "Public Team", desc: "Anyone can find and join your team" },
                  { key: "allowRequests", icon: <Users size={20} />, title: "Allow Join Requests", desc: "Players can request to join your team" },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="text-green-600">{opt.icon}</div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{opt.title}</p>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateForm(opt.key, !form[opt.key as keyof typeof form])}
                      className={`w-12 h-7 rounded-full transition-colors relative ${form[opt.key as keyof typeof form] ? "bg-green-500" : "bg-slate-300"}`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form[opt.key as keyof typeof form] ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Review Your Team</h2>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: form.color + "15" }}>
                      ⚽
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{form.name || "Untitled Team"}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={12} /> {form.city}</p>
                    </div>
                  </div>
                  {form.description && <p className="text-sm text-slate-600">{form.description}</p>}
                  <div className="flex gap-4 text-sm">
                    <span className="text-slate-500">Max Players: <strong className="text-slate-900">{form.maxPlayers}</strong></span>
                    <span className="text-slate-500">Visibility: <strong className="text-slate-900">{form.isPublic ? "Public" : "Private"}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-6 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={step === 0 && !form.name}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {step === STEPS.length - 1 ? "Create Team" : "Continue"}
            {step < STEPS.length - 1 && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
