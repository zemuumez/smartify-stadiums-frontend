"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function MicrositeContact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Contact</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2">Get in Touch</h1>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[
              { icon: <MapPin className="text-green-600" size={20} />, label: "Address", value: "Bole Road, Bole Sub City, Addis Ababa, Ethiopia" },
              { icon: <Phone className="text-green-600" size={20} />, label: "Phone", value: "+251 911 234 567" },
              { icon: <Mail className="text-green-600" size={20} />, label: "Email", value: "info@bambismeda.etsmartfields.com" },
              { icon: <Clock className="text-green-600" size={20} />, label: "Hours", value: "Mon-Sun: 6:00 AM - 10:00 PM" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div><p className="font-medium text-slate-900 text-sm">{item.label}</p><p className="text-slate-600">{item.value}</p></div>
              </div>
            ))}
          </div>
          <div>
            {submitted ? (
              <div className="p-12 rounded-2xl bg-green-50 border border-green-200 text-center">
                <Send className="text-green-600 mx-auto mb-4" size={32} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500">We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={() => setSubmitted(true)} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <input type="text" required placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none" />
                <input type="email" required placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none" />
                <textarea rows={4} required placeholder="Message" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none resize-none" />
                <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
