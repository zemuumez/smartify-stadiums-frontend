"use client";

import { motion } from "framer-motion";
import { Camera, Video, Users, Trophy, Wifi, Shield, Lightbulb, Shirt } from "lucide-react";

export default function MicrositeServices() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Services</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2">Our Services</h1>
          <p className="text-slate-500 mt-2">Everything we offer to make your football experience exceptional.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Camera className="text-green-600" size={28} />, title: "AI Match Recording", desc: "Automated camera system records every match with AI-powered key moment detection." },
            { icon: <Video className="text-green-600" size={28} />, title: "Match Replays", desc: "Watch full match replays or auto-generated highlights. Available within minutes." },
            { icon: <Trophy className="text-green-600" size={28} />, title: "Tournament Hosting", desc: "We organize and host tournaments, leagues, and corporate events." },
            { icon: <Users className="text-green-600" size={28} />, title: "Team Registration", desc: "Register your team, manage rosters, and track your league performance." },
            { icon: <Shield className="text-green-600" size={28} />, title: "Certified Referees", desc: "Professional referees available for league matches and tournaments." },
            { icon: <Wifi className="text-green-600" size={28} />, title: "Free WiFi", desc: "High-speed WiFi available throughout the facility for players and spectators." },
          ].map((service, i) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center mb-4">{service.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
