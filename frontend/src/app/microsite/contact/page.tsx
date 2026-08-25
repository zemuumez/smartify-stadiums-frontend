"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { FadeUp, SlideIn } from "@/components/ui/AnimatedSection";

export default function MicrositeContact() {
  const [form, setForm] = useState({ name: "", phone: "", subject: "Field Booking Enquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>
      {/* ── HEADER ── */}
      <section className="pt-16 pb-12 bg-white border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Reach Us</div>
            <h1 className="heading-xl mb-4">Contact Stadium Office</h1>
            <p className="text-[#7a7a7a] text-lg max-w-2xl leading-relaxed">
              Have questions about field reservations, league entries, or AI recording services? Reach out directly to the Bambis Meda Stadium management team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Contact Information Cards */}
            <SlideIn direction="left" className="space-y-6">
              <div className="photo-card p-8">
                <h3 className="font-black text-xl text-[#111] mb-6">Facility Details</h3>
                <div className="space-y-5">
                  {[
                    { icon: <MapPin size={20} style={{ color: "#2d6a4f" }} />, label: "Location", value: "Bole Road, Near Bambis Supermarket, Bole Sub-City, Addis Ababa" },
                    { icon: <Phone size={20} style={{ color: "#2d6a4f" }} />, label: "Direct Phone", value: "+251 911 445 678 / +251 922 789 012" },
                    { icon: <MessageCircle size={20} style={{ color: "#2d6a4f" }} />, label: "WhatsApp Desk", value: "+251 911 445 678 (Fast Response)" },
                    { icon: <Mail size={20} style={{ color: "#2d6a4f" }} />, label: "Official Email", value: "bambismeda@etsmartfields.com" },
                    { icon: <Clock size={20} style={{ color: "#2d6a4f" }} />, label: "Operating Hours", value: "Monday – Sunday: 6:00 AM – 10:00 PM" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#f0faf4" }}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">{item.label}</div>
                        <div className="text-sm font-semibold text-[#111] mt-0.5 leading-relaxed">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Booking Callout */}
              <div className="photo-card p-7 rounded-3xl" style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)", color: "white" }}>
                <h4 className="font-black text-lg mb-2">Need a Field Right Now?</h4>
                <p className="text-white/70 text-xs leading-relaxed mb-4">
                  Skip the phone queues. Check real-time slot availability and reserve with Telebirr in under 2 minutes.
                </p>
                <Link
                  href="/bookings/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all hover:opacity-90"
                  style={{ background: "white", color: "#1a4731" }}
                >
                  <Calendar size={13} /> Check Live Slot Calendar
                </Link>
              </div>
            </SlideIn>

            {/* Right: Message Form */}
            <SlideIn direction="right">
              <div className="photo-card p-8">
                <h3 className="font-black text-xl text-[#111] mb-2">Send an Enquiry</h3>
                <p className="text-xs text-[#7a7a7a] mb-6">Our front desk team monitors messages throughout operating hours.</p>

                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white" style={{ background: "#2d6a4f" }}>
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="font-black text-xl text-[#111] mb-2">Enquiry Received!</h4>
                    <p className="text-sm text-[#7a7a7a] max-w-sm mx-auto mb-6">
                      Thank you for contacting Bambis Meda Stadium. A stadium manager will respond to your phone or email shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold underline"
                      style={{ color: "#2d6a4f" }}
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] uppercase tracking-wider mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Yonas Tadesse"
                        className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] uppercase tracking-wider mb-1.5">
                        Phone Number or Email
                      </label>
                      <input
                        type="text"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+251 9XX XXX XXX"
                        className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] uppercase tracking-wider mb-1.5">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none appearance-none"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                      >
                        <option value="Field Booking Enquiry">Field Booking Enquiry</option>
                        <option value="Tournament Entry / League Entry">Tournament Entry / League Entry</option>
                        <option value="AI Camera Footage Request">AI Camera Footage Request</option>
                        <option value="Equipment & Locker Rental">Equipment &amp; Locker Rental</option>
                        <option value="Corporate Event Booking">Corporate Event Booking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3d3d3d] uppercase tracking-wider mb-1.5">
                        Message Details
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Please include field preference, preferred dates, or specific match questions..."
                        className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none resize-none"
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
                      <Send size={15} /> Send Stadium Message
                    </button>
                  </form>
                )}
              </div>
            </SlideIn>
          </div>
        </div>
      </section>
    </div>
  );
}
