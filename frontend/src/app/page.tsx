"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Video, Calendar, Shield, ChevronRight, Play, Star,
  Zap, Globe, Smartphone, TrendingUp, Users, ArrowRight
} from "lucide-react";
import { GlassCard, GlowCard } from "@/components/ui/GlassCard";
import { FadeUp, SlideIn, ScaleIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";

const ParticleField = lazy(() => import("@/components/three/ParticleField"));
const Scene3D = lazy(() => import("@/components/three/Scene3D"));

function ThreeFallback() {
  return <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section with 3D */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* 3D Background */}
        <Suspense fallback={<ThreeFallback />}>
          <ParticleField className="opacity-60" />
        </Suspense>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-transparent to-gray-950" />
        <div className="absolute inset-0 mesh-gradient opacity-30" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400 font-medium">Ethiopia&apos;s #1 Football Platform</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[0.95] mb-8"
            >
              <span className="block text-white">Play</span>
              <span className="block gradient-text">Ethiopia</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed"
            >
              Book football fields, watch match replays powered by AI cameras,
              and connect with every stadium in Ethiopia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <MagneticButton href="/stadiums" variant="primary" size="lg" icon={<MapPin size={20} />}>
                Find Stadiums
              </MagneticButton>
              <MagneticButton href="/auth/register" variant="outline" size="lg" icon={<Shield size={20} />}>
                Register Your Stadium
              </MagneticButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 flex flex-wrap gap-8"
            >
              {[
                { value: "50+", label: "Stadiums" },
                { value: "10K+", label: "Players" },
                { value: "5K+", label: "Matches" },
                { value: "24/7", label: "Live" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-green-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-20">
            <span className="text-green-400 font-medium tracking-wider uppercase text-sm">Features</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Everything You Need to <span className="gradient-text">Play</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From booking to watching replays, we&apos;ve got every aspect of your football experience covered.
            </p>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MapPin className="text-green-400" size={28} />,
                title: "Smart Discovery",
                desc: "Find nearby stadiums with GPS-powered proximity search. See real-time availability.",
                color: "green",
              },
              {
                icon: <Calendar className="text-yellow-400" size={28} />,
                title: "Instant Booking",
                desc: "Book your preferred time slot in seconds. Pay with Telebirr, Chapa, or card.",
                color: "yellow",
              },
              {
                icon: <Video className="text-green-400" size={28} />,
                title: "AI Match Replays",
                desc: "Watch full matches or AI-generated highlights. Camera systems on every ULS stadium.",
                color: "green",
              },
              {
                icon: <Shield className="text-yellow-400" size={28} />,
                title: "ULS Verified",
                desc: "Look for the ULS badge. Guaranteed quality, security, and modern facilities.",
                color: "yellow",
              },
              {
                icon: <Globe className="text-green-400" size={28} />,
                title: "Stadium Microsites",
                desc: "Every registered stadium gets its own branded website with CMS and analytics.",
                color: "green",
              },
              {
                icon: <Smartphone className="text-yellow-400" size={28} />,
                title: "Mobile First",
                desc: "Book, pay, and watch from anywhere. Optimized for every device and connection.",
                color: "yellow",
              },
            ].map((feature, i) => (
              <StaggerItem key={feature.title}>
                <GlowCard className="h-full">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    feature.color === "green" ? "bg-green-500/10" : "bg-yellow-500/10"
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </GlowCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 3D Stadium Showcase */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideIn direction="left">
              <span className="text-green-400 font-medium tracking-wider uppercase text-sm">3D Experience</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
                See Stadiums in <span className="gradient-text">3D</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Our immersive 3D visualization lets you explore stadium layouts, field conditions,
                and facilities before you book. Experience football infrastructure like never before.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Interactive 3D stadium models",
                  "Real-time field availability",
                  "Virtual facility tours",
                  "Camera angle previews",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              <MagneticButton href="/stadiums" variant="primary" size="lg" icon={<Play size={20} />}>
                Explore Stadiums
              </MagneticButton>
            </SlideIn>

            <SlideIn direction="right">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <Suspense fallback={<ThreeFallback />}>
                    <Scene3D />
                  </Suspense>
                </div>
                {/* Floating UI elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 left-10 glass rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Live Camera</span>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-10 right-10 glass rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400" size={16} />
                    <span className="text-sm font-medium">4.9 Rating</span>
                  </div>
                </motion.div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* For Stadium Owners */}
      <section className="py-32 relative">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScaleIn>
              <span className="text-yellow-400 font-medium tracking-wider uppercase text-sm">For Owners</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
                Transform Your <span className="gradient-text">Stadium</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Join Play Ethiopia and give your stadium its own branded microsite. Manage bookings,
                showcase match replays, and attract more players with modern technology.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Globe size={20} />, title: "Your Microsite", desc: "stadium.playethiopia.com" },
                  { icon: <Video size={20} />, title: "Camera System", desc: "AI-powered recording" },
                  { icon: <TrendingUp size={20} />, title: "Analytics", desc: "Player insights" },
                  { icon: <Users size={20} />, title: "Community", desc: "Build your audience" },
                ].map((item) => (
                  <div key={item.title} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-green-400">{item.icon}</div>
                      <span className="font-bold text-white">{item.title}</span>
                    </div>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <MagneticButton href="/auth/register" variant="secondary" size="lg" icon={<Zap size={20} />}>
                Get Started Free
              </MagneticButton>
            </ScaleIn>

            <ScaleIn delay={0.2}>
              <div className="relative">
                <div className="glass rounded-3xl p-8 backdrop-blur-xl">
                  {/* Mock Dashboard */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🏟️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Bambis Meda Stadium</h3>
                      <p className="text-sm text-gray-400">Bole, Addis Ababa</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">127</div>
                      <div className="text-xs text-gray-400">Bookings</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">4.9★</div>
                      <div className="text-xs text-gray-400">Rating</div>
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">2</div>
                      <div className="text-xs text-gray-400">Fields</div>
                    </div>
                    <div className="bg-purple-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400">📹</div>
                      <div className="text-xs text-gray-400">Camera Active</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                      ✅ ULS Verified
                    </span>
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                      📹 Camera Active
                    </span>
                  </div>

                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full" style={{ width: "78%" }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">78% monthly booking capacity</p>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-6 -right-6 w-24 h-24 border border-green-500/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-8 -left-8 w-32 h-32 border border-yellow-500/20 rounded-full"
                />
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/30 to-gray-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-20">
            <span className="text-green-400 font-medium tracking-wider uppercase text-sm">How It Works</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Three Steps to <span className="gradient-text">Play</span>
            </h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Find & Choose",
                desc: "Search for stadiums near you. See real-time availability, prices, and camera status.",
                icon: <MapPin className="text-green-400" size={32} />,
              },
              {
                step: "02",
                title: "Book & Pay",
                desc: "Select your time slot, choose extras like video capture or referee, and pay with Telebirr.",
                icon: <Calendar className="text-yellow-400" size={32} />,
              },
              {
                step: "03",
                title: "Play & Watch",
                desc: "Play your match, then watch the AI-generated replay or highlights on your dashboard.",
                icon: <Video className="text-green-400" size={32} />,
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="relative glass rounded-2xl p-8 h-full group hover:border-green-500/30 transition-colors duration-500">
                  <div className="text-7xl font-bold text-white/5 absolute top-4 right-4">{item.step}</div>
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  <ArrowRight className="text-green-500 mt-4 group-hover:translate-x-2 transition-transform" size={20} />
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-gray-950 to-yellow-600/20" />
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Ready to <span className="gradient-text">Play</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of players and stadium owners across Ethiopia.
              Your next match is just a tap away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/auth/register" variant="primary" size="lg" icon={<Zap size={20} />}>
                Sign Up Free
              </MagneticButton>
              <MagneticButton href="/stadiums" variant="outline" size="lg" icon={<MapPin size={20} />}>
                Browse Stadiums
              </MagneticButton>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⚽</span>
                </div>
                <div>
                  <span className="text-lg font-bold">Play</span>
                  <span className="text-lg font-bold text-yellow-400 ml-1">Ethiopia</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ethiopia&apos;s integrated football infrastructure platform.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/stadiums" className="hover:text-green-400 transition-colors">Find Stadiums</Link></li>
                <li><Link href="/bookings" className="hover:text-green-400 transition-colors">My Bookings</Link></li>
                <li><Link href="/stadiums/live" className="hover:text-green-400 transition-colors">Live Matches</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">For Owners</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/auth/register" className="hover:text-green-400 transition-colors">Register Stadium</Link></li>
                <li><Link href="/dashboard" className="hover:text-green-400 transition-colors">Owner Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-green-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-green-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="section-divider mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 Play Ethiopia. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-green-400 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
