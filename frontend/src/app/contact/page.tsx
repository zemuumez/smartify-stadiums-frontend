"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, MessageSquare, ArrowRight, Send, CheckCircle2, Building2 } from "lucide-react";
import { FadeUp, SlideIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

const subjects = [
  "General Enquiry",
  "Stadium Registration",
  "Partnership & Investment",
  "Technical Support",
  "Camera Installation",
  "Media & Press",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", contact: "", subject: subjects[0], message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="pt-40 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">Contact</div>
            <h1
              className="text-[#111] font-black leading-tight mb-5"
              style={{ fontSize: "clamp(2.4rem, 6vw, 3.8rem)", letterSpacing: "-0.025em" }}
            >
              Get in Touch
            </h1>
            <p className="text-[#7a7a7a] text-xl max-w-lg leading-relaxed">
              Whether you&apos;re a player, stadium owner, or potential partner — we&apos;re here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN GRID ─────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Left — Form */}
            <SlideIn direction="left">
              <div className="photo-card p-8">
                <h2 className="text-xl font-black text-[#111] mb-6">Send Us a Message</h2>

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 size={48} className="text-[#2d6a4f] mx-auto mb-4" />
                    <h3 className="text-xl font-black text-[#111] mb-2">Message Sent!</h3>
                    <p className="text-[#7a7a7a] text-sm">We&apos;ll get back to you within 24 hours.</p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-6 text-sm font-bold underline"
                      style={{ color: "#2d6a4f" }}
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Abebe Kebede"
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-all"
                        style={{
                          borderColor: "rgba(0,0,0,0.1)",
                          background: "#fafafa",
                          fontSize: "0.875rem",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        Phone or Email
                      </label>
                      <input
                        type="text"
                        required
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                        placeholder="+251 9XX XXX XXX or you@email.com"
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-all"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none appearance-none"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                      >
                        {subjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us what you need..."
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none resize-none"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                      style={{ background: "#2d6a4f", boxShadow: "0 4px 16px rgba(45,106,79,0.3)" }}
                    >
                      <Send size={16} />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </SlideIn>

            {/* Right — Info Cards */}
            <SlideIn direction="right" className="space-y-5">
              {/* Contact Info */}
              <div className="photo-card p-7">
                <h3 className="font-black text-[#111] mb-5">Contact Information</h3>
                <div className="space-y-4">
                  {[
                    { icon: <MapPin size={18} />, label: "Office", value: "Bole Sub-City, Addis Ababa, Ethiopia" },
                    { icon: <Phone size={18} />, label: "Phone", value: "+251 911 123 456" },
                    { icon: <Mail size={18} />, label: "Email", value: "hello@etsmartfields.com" },
                    { icon: <MessageSquare size={18} />, label: "WhatsApp", value: "+251 911 123 456" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#f0faf4", color: "#2d6a4f" }}
                      >
                        {c.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#aaa] uppercase tracking-wide">{c.label}</div>
                        <div className="text-sm font-semibold text-[#111] mt-0.5">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="photo-card p-7">
                <h3 className="font-black text-[#111] mb-4">Office Hours</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
                    { day: "Saturday", hours: "9:00 AM – 3:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map((h) => (
                    <div key={h.day} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <span className="text-[#7a7a7a]">{h.day}</span>
                      <span className="font-semibold text-[#111]">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stadium Owner CTA */}
              <div
                className="rounded-3xl p-7 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)" }}
              >
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10" style={{ background: "#74c69d" }} />
                <div className="relative z-10">
                  <Building2 size={32} className="text-white mb-4" />
                  <h3 className="font-black text-white text-lg mb-2">Stadium Owner?</h3>
                  <p className="text-white/65 text-sm leading-relaxed mb-5">
                    Register your stadium on ET Smart Fields and reach thousands of players in your city.
                  </p>
                  <Link
                    href="/auth/register/owner"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: "white", color: "#2d6a4f" }}
                  >
                    Get Started Free <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

    </div>
  );
}
