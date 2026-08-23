"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">Contact Us</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-4 mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              {[
                { icon: <Mail className="text-green-600" size={24} />, title: "Email", value: "hello@playethiopia.com", desc: "We respond within 24 hours" },
                { icon: <Phone className="text-green-600" size={24} />, title: "Phone", value: "+251 911 123 456", desc: "Mon-Fri, 9AM-6PM EAT" },
                { icon: <MapPin className="text-green-600" size={24} />, title: "Office", value: "Bole, Addis Ababa", desc: "Ethiopia" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-slate-700">{item.value}</p>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-12 rounded-3xl bg-green-50 border border-green-200 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500">We&apos;ll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={() => setSubmitted(true)} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input type="email" required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all" placeholder="you@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all">
                      <option>General Inquiry</option>
                      <option>Stadium Registration</option>
                      <option>Technical Support</option>
                      <option>Partnership</option>
                      <option>Billing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <textarea rows={5} required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none" placeholder="How can we help?" />
                  </div>
                  <button type="submit" className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-lg font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
