"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, Star, Play, ArrowRight, Clock, Users, Trophy, Shield, ChevronRight, Zap, MapPin } from "lucide-react";
import { useStadium, useEvents, useHighlights, useTestimonials } from "@/lib/sanity/hooks";

const DEMO_STADIUM_ID = "demo-stadium-1";

export default function MicrositeHome() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const { stadium } = useStadium("bambis-meda");
  const { events } = useEvents(stadium?._id || DEMO_STADIUM_ID);
  const { highlights } = useHighlights(stadium?._id || DEMO_STADIUM_ID);
  const { testimonials } = useTestimonials(stadium?._id || DEMO_STADIUM_ID);

  // Use CMS data with fallbacks
  const stadiumName = stadium?.name || "Bambis Meda Stadium";
  const stadiumCity = stadium?.city || "Addis Ababa";
  const stadiumRating = stadium?.rating || 4.9;
  const totalBookings = stadium?.totalBookings || 1247;
  const fieldsCount = stadium?.fields?.length || 4;
  const playersCount = 3200;

  return (
    <div>
      {/* Hero with parallax */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 mesh-gradient opacity-30" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </motion.div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-2 mb-6">
              {stadium?.isVerified && (
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                  <Shield size={12} className="inline mr-1" /> ULS Verified
                </span>
              )}
              <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm border border-white/10">
                ⭐ {stadiumRating}
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-white leading-[0.9] mb-6">
              {stadiumName.split(" ")[0]}<br/>
              <span className="gradient-text">{stadiumName.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-xl">
              {stadium?.description || `Premium football experience in the heart of ${stadiumCity}. ${fieldsCount} fields, AI cameras, and world-class facilities.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/bookings/new" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5">
                <Calendar size={20} /> Book a Field
              </Link>
              <Link href="/microsite/fields" className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-dark text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all">
                View Fields <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: totalBookings.toLocaleString(), label: "Total Bookings", icon: <Calendar size={18} className="text-green-400" /> },
              { value: fieldsCount, label: "Fields", icon: <Zap size={18} className="text-green-400" /> },
              { value: playersCount.toLocaleString(), label: "Players", icon: <Users size={18} className="text-green-400" /> },
              { value: "24/7", label: "Camera Live", icon: <Play size={18} className="text-green-400" /> },
            ].map((stat) => (
              <div key={stat.label} className="glass-dark rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events - from CMS */}
      {events.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Upcoming</span>
                <h2 className="text-4xl font-black text-slate-900 mt-2">Events & Tournaments</h2>
              </div>
              <Link href="/microsite/services" className="hidden sm:flex items-center gap-1 text-green-600 font-medium hover:text-green-700">View All <ChevronRight size={16} /></Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <motion.div key={event._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                    <Trophy className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={14} />{event.startDate}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{event.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">{event.spotsLeft} spots left</span>
                    <Link href="/bookings/new" className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1">Register <ArrowRight size={14} /></Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Highlights - from CMS */}
      {highlights.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Highlights</span>
              <h2 className="text-4xl font-black text-slate-900 mt-2">Goal of the Month</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {highlights.map((h, i) => (
                <motion.div key={h._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center backdrop-blur-sm border border-green-500/30">
                      <Play className="text-white ml-1" size={28} />
                    </div>
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-lg text-xs font-bold">{h.title}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 mb-1">{h.title}</h3>
                    <p className="text-sm text-slate-500 mb-3">{h.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">by <strong>{h.player}</strong></span>
                      <span className="text-sm text-green-600 font-medium">❤️ {h.votes} votes</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials - from CMS */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Testimonials</span>
              <h2 className="text-4xl font-black text-slate-900 mt-2">What Players Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={t._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="text-yellow-400" size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold">{t.name[0]}</div>
                    <div>
                      <span className="text-sm font-medium text-slate-900">{t.name}</span>
                      {t.role && <span className="text-xs text-slate-500 ml-1">• {t.role}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">Ready to Play?</h2>
          <p className="text-xl text-green-100 mb-8">Book your field now and experience the future of football.</p>
          <Link href="/bookings/new" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-700 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
            <Calendar size={20} /> Book Now
          </Link>
        </div>
      </section>
    </div>
  );
}
