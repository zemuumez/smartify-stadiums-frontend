"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin, Video, Calendar, Shield, ChevronRight, Play, Star,
  Zap, Globe, Smartphone, TrendingUp, Users, ArrowRight,
  Camera, Award, Clock, CheckCircle2, ChevronDown, ArrowUpRight
} from "lucide-react";
import { GlassCard, GlowCard } from "@/components/ui/GlassCard";
import { FadeUp, SlideIn, ScaleIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";

const ParticleField = lazy(() => import("@/components/three/ParticleField"));
const Scene3D = lazy(() => import("@/components/three/Scene3D"));

function ThreeFallback() {
  return <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />;
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with 3D - Dark */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        {/* 3D Background */}
        <Suspense fallback={<ThreeFallback />}>
          <ParticleField className="opacity-40" />
        </Suspense>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/80" />
        <div className="absolute inset-0 mesh-gradient opacity-20" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-300 font-medium">Ethiopia&apos;s #1 Football Platform</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.9] mb-8"
            >
              <span className="block text-white">ET</span>
              <span className="block gradient-text">Smart Fields</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed"
            >
              Book football fields, watch AI-powered match replays,
              and connect with every stadium in Ethiopia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/stadiums"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
              >
                <MapPin size={20} />
                Find Stadiums
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-dark text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all"
              >
                <Shield size={20} />
                Register Your Stadium
              </Link>
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
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
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
            <div className="w-1 h-2 bg-green-400 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Live Replay Interactive Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Experience</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-4 mb-6 text-slate-900">
              Watch Every Match in <span className="gradient-text">Stunning Detail</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              AI-powered camera systems capture every moment. Watch full replays or auto-generated highlights.
            </p>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <SlideIn direction="left">
              {/* Interactive replay demo */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 bg-slate-900 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-green-500/30">
                      <Play className="text-white ml-1" size={32} />
                    </div>
                    <p className="text-white/60 text-sm">AI Match Replay</p>
                  </div>
                </div>
                {/* Overlay stats */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  {["Full Match", "Highlights", "Goals", "Skills"].map((tab, i) => (
                    <div
                      key={tab}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm ${
                        i === 0
                          ? "bg-green-500/30 text-green-300 border border-green-500/30"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div className="h-full w-1/3 bg-green-500 rounded-r-full" />
                </div>
              </div>
            </SlideIn>

            <SlideIn direction="right">
              <div className="space-y-6">
                {[
                  { icon: <Camera className="text-green-600" size={24} />, title: "AI Camera System", desc: "Automated recording with smart detection of goals, fouls, and key moments" },
                  { icon: <Zap className="text-green-600" size={24} />, title: "Instant Highlights", desc: "Auto-generated highlight reels within minutes of match completion" },
                  { icon: <Download className="text-green-600" size={24} />, title: "Download & Share", desc: "Save your best moments and share them on social media" },
                  { icon: <Award className="text-green-600" size={24} />, title: "Goal of the Month", desc: "Community-voted best goals featured on stadium microsites" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 relative">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Features</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-4 mb-6 text-slate-900">
              Everything You Need to <span className="gradient-text">Play</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              From booking to watching replays, we&apos;ve got every aspect of your football experience covered.
            </p>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MapPin className="text-green-600" size={28} />,
                title: "Smart Discovery",
                desc: "Find nearby stadiums with GPS-powered proximity search. See real-time availability.",
              },
              {
                icon: <Calendar className="text-green-600" size={28} />,
                title: "Instant Booking",
                desc: "Book your preferred time slot in seconds. Pay with Telebirr, Chapa, or card.",
              },
              {
                icon: <Video className="text-green-600" size={28} />,
                title: "AI Match Replays",
                desc: "Watch full matches or AI-generated highlights. Camera systems on every ULS stadium.",
              },
              {
                icon: <Shield className="text-green-600" size={28} />,
                title: "ULS Verified",
                desc: "Look for the ULS badge. Guaranteed quality, security, and modern facilities.",
              },
              {
                icon: <Globe className="text-green-600" size={28} />,
                title: "Stadium Microsites",
                desc: "Every registered stadium gets its own branded website with CMS and analytics.",
              },
              {
                icon: <Smartphone className="text-green-600" size={28} />,
                title: "Mobile First",
                desc: "Book, pay, and watch from anywhere. Optimized for every device and connection.",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="h-full p-6 rounded-2xl bg-white border border-slate-200 hover:border-green-200 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 3D Stadium Showcase */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideIn direction="left">
              <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">3D Experience</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-4 mb-6 text-slate-900">
                See Stadiums in <span className="gradient-text">3D</span>
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
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
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="text-green-600" size={14} />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/stadiums"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
              >
                <Play size={20} />
                Explore Stadiums
              </Link>
            </SlideIn>

            <SlideIn direction="right">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10">
                  <Suspense fallback={<ThreeFallback />}>
                    <Scene3D />
                  </Suspense>
                </div>
                {/* Floating UI elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 left-10 glass rounded-xl p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-slate-700">Live Camera</span>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-10 right-10 glass rounded-xl p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={16} fill="currentColor" />
                    <span className="text-sm font-medium text-slate-700">4.9 Rating</span>
                  </div>
                </motion.div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* For Stadium Owners */}
      <section className="py-24 bg-slate-50 relative">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScaleIn>
              <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">For Owners</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-4 mb-6 text-slate-900">
                Transform Your <span className="gradient-text">Stadium</span>
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Join ET Smart Fields and give your stadium its own branded microsite. Manage bookings,
                showcase match replays, and attract more players with modern technology.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Globe size={20} />, title: "Your Microsite", desc: "stadium.etsmartfields.com" },
                  { icon: <Camera size={20} />, title: "Camera System", desc: "AI-powered recording" },
                  { icon: <TrendingUp size={20} />, title: "Analytics", desc: "Player insights" },
                  { icon: <Users size={20} />, title: "Community", desc: "Build your audience" },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-green-600">{item.icon}</div>
                      <span className="font-bold text-slate-900">{item.title}</span>
                    </div>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
              >
                <Zap size={20} />
                Get Started Free
              </Link>
            </ScaleIn>

            <ScaleIn delay={0.2}>
              <div className="relative">
                <div className="rounded-3xl p-8 bg-white border border-slate-200 shadow-xl shadow-slate-900/5">
                  {/* Mock Dashboard */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                      <span className="text-xl">🏟️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Bambis Meda Stadium</h3>
                      <p className="text-sm text-slate-500">Bole, Addis Ababa</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-green-600">127</div>
                      <div className="text-xs text-slate-500">Bookings</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-yellow-600">4.9★</div>
                      <div className="text-xs text-slate-500">Rating</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-blue-600">2</div>
                      <div className="text-xs text-slate-500">Fields</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-purple-600">📹</div>
                      <div className="text-xs text-slate-500">Camera Active</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      ✅ ULS Verified
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      📹 Camera Active
                    </span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "78%" }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">78% monthly booking capacity</p>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-6 -right-6 w-24 h-24 border border-green-200 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-8 -left-8 w-32 h-32 border border-yellow-200 rounded-full"
                />
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">How It Works</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-4 mb-6 text-slate-900">
              Three Steps to <span className="gradient-text">Play</span>
            </h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Find & Choose",
                desc: "Search for stadiums near you. See real-time availability, prices, and camera status.",
                icon: <MapPin className="text-green-600" size={32} />,
              },
              {
                step: "02",
                title: "Book & Pay",
                desc: "Select your time slot, choose extras like video capture or referee, and pay with Telebirr.",
                icon: <Calendar className="text-green-600" size={32} />,
              },
              {
                step: "03",
                title: "Play & Watch",
                desc: "Play your match, then watch the AI-generated replay or highlights on your dashboard.",
                icon: <Video className="text-green-600" size={32} />,
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="relative p-8 rounded-2xl bg-white border border-slate-200 hover:border-green-200 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 group h-full">
                  <div className="text-7xl font-black text-slate-100 absolute top-4 right-4">{item.step}</div>
                  <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                  <ArrowRight className="text-green-500 mt-4 group-hover:translate-x-2 transition-transform" size={20} />
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 relative">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Testimonials</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-4 mb-6 text-slate-900">
              Loved by <span className="gradient-text">Players & Owners</span>
            </h2>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Abebe Kebede",
                role: "Football Player",
                text: "ET Smart Fields changed how we book fields. No more calling around — just open the app and book in seconds. The match replays are incredible!",
                rating: 5,
              },
              {
                name: "Fatima Hassan",
                role: "Stadium Owner",
                text: "Since joining ET Smart Fields, our bookings increased 40%. The microsite looks professional and our players love being able to watch their matches online.",
                rating: 5,
              },
              {
                name: "Daniel Tadesse",
                role: "Team Captain",
                text: "The AI highlights are amazing. We can share our best goals on social media directly from the platform. It feels like having a professional broadcast.",
                rating: 5,
              },
            ].map((testimonial) => (
              <StaggerItem key={testimonial.name}>
                <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="text-yellow-400" size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 text-white">
              Ready to <span className="gradient-text">Play</span>?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Join thousands of players and stadium owners across Ethiopia.
              Your next match is just a tap away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
              >
                <Zap size={20} />
                Sign Up Free
              </Link>
              <Link
                href="/stadiums"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-dark text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all"
              >
                <MapPin size={20} />
                Browse Stadiums
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <span className="text-white text-lg">⚽</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-lg font-bold text-slate-900">ET</span>
                  <span className="text-lg font-bold text-green-600 ml-0.5">Smart Fields</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Ethiopia&apos;s integrated football infrastructure platform.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/stadiums" className="hover:text-green-600 transition-colors">Find Stadiums</Link></li>
                <li><Link href="/bookings" className="hover:text-green-600 transition-colors">My Bookings</Link></li>
                <li><Link href="/stadiums/live" className="hover:text-green-600 transition-colors">Live Matches</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">For Owners</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/auth/register" className="hover:text-green-600 transition-colors">Register Stadium</Link></li>
                <li><Link href="/dashboard" className="hover:text-green-600 transition-colors">Owner Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-green-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/about" className="hover:text-green-600 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-green-600 transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-green-600 transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="section-divider mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© 2026 ET Smart Fields. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-green-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-green-600 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Download(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
