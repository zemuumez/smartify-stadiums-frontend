"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Globe, Users, Shield, Zap, Target, Heart, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">About Us</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-4 mb-6">
              Building Ethiopia&apos;s<br /><span className="gradient-text">Football Future</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
              ET Smart Fields is on a mission to digitize and elevate football infrastructure across the nation.
              We connect players, stadiums, and technology in one seamless platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Our Mission</span>
              <h2 className="text-4xl font-black text-slate-900 mt-4 mb-6">
                Making Football <span className="gradient-text">Accessible to Everyone</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                We believe every footballer in Ethiopia deserves access to quality facilities, fair pricing,
                and the ability to relive their best moments through technology.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Founded in Addis Ababa, ET Smart Fields is the first integrated football infrastructure
                platform in the country. We provide stadiums with modern booking systems, AI-powered
                camera technology, and professional microsites — all under one roof.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "50+", label: "Stadiums Connected", icon: <Globe className="text-green-600" size={24} /> },
                { value: "10K+", label: "Active Players", icon: <Users className="text-green-600" size={24} /> },
                { value: "5K+", label: "Matches Recorded", icon: <Zap className="text-green-600" size={24} /> },
                { value: "99.9%", label: "Platform Uptime", icon: <Shield className="text-green-600" size={24} /> },
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="mb-3">{stat.icon}</div>
                  <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Our Values</span>
            <h2 className="text-4xl font-black text-slate-900 mt-4">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="text-green-600" size={32} />, title: "Innovation", desc: "We bring cutting-edge AI camera systems and digital tools to Ethiopian football infrastructure." },
              { icon: <Heart className="text-green-600" size={32} />, title: "Community", desc: "Football is about people. We build tools that strengthen the bond between players and stadiums." },
              { icon: <Shield className="text-green-600" size={32} />, title: "Trust", desc: "ULS verification ensures every stadium meets our quality, safety, and technology standards." },
            ].map((value) => (
              <div key={value.title} className="p-8 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Our Team</span>
            <h2 className="text-4xl font-black text-slate-900 mt-4">The People Behind ET Smart Fields</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Unity Link Solutions", role: "Founding Company", desc: "Technology company specializing in sports SaaS and digital infrastructure solutions." },
              { name: "Engineering Team", role: "Product & Engineering", desc: "Building scalable systems with Go, PostgreSQL, and modern web technologies." },
              { name: "Field Operations", role: "Stadium Relations", desc: "Onboarding stadiums, installing camera systems, and ensuring ULS quality standards." },
            ].map((member) => (
              <div key={member.name} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {member.name[0]}
                </div>
                <h3 className="font-bold text-slate-900">{member.name}</h3>
                <p className="text-sm text-green-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-slate-500">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-6">Join the Movement</h2>
          <p className="text-xl text-slate-300 mb-12">Be part of Ethiopia&apos;s football revolution.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-green-500/25">
              Register Your Stadium <ArrowRight size={20} />
            </Link>
            <Link href="/stadiums" className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-dark text-white rounded-2xl text-lg font-bold">
              Find Stadiums
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
