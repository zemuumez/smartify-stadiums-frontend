"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  Building2,
  Shield,
  ShieldCheck,
  PhoneCall,
  ArrowUpRight,
  Star,
  Camera,
  Layers,
  HelpCircle
} from "lucide-react";
import { FadeUp, ScaleIn } from "@/components/ui/AnimatedSection";

const plans = [
  {
    name: "Starter",
    tagline: "Single Pitch Entry",
    desc: "Perfect for a single community pitch getting started with digital bookings and verified listings.",
    etb: "2,500",
    annualEtb: "2,000",
    popular: false,
    fields: "1 Field",
    cameras: "1 Camera Compatible",
    storage: "100 GB Cloud",
    features: [
      "Dedicated official stadium site",
      "Telebirr & CBE automated payments",
      "Real-time calendar & conflict engine",
      "SMS booking confirmations to players",
      "ULS quality compliance verification",
      "Standard platform support",
    ],
  },
  {
    name: "Professional",
    tagline: "High-Traffic Venues",
    desc: "Designed for growing sports centers with multiple pitches, night floodlights, and 4K AI cameras.",
    etb: "7,500",
    annualEtb: "6,000",
    popular: true,
    badge: "Most Popular Choice",
    fields: "Up to 5 Fields",
    cameras: "Up to 4 AI Veo Cameras",
    storage: "1 TB Match Storage",
    features: [
      "Everything in Starter included",
      "Automated 4K Veo AI match recording",
      "Player highlight reel & goal clipping",
      "Weekly revenue analytics & payouts",
      "Multi-field schedule coordination",
      "Custom tournament bracket manager",
      "Priority WhatsApp & phone hotline",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Sports Complexes & Academies",
    desc: "Comprehensive solution for large sports complexes, municipal grounds, and academy chains.",
    etb: "20,000",
    annualEtb: "16,000",
    popular: false,
    fields: "Unlimited Fields",
    cameras: "Unlimited Cameras",
    storage: "10 TB Archive",
    features: [
      "Everything in Professional included",
      "Autonomous 24/7 live match broadcast",
      "Custom domain & full white-labeling",
      "Dedicated stadium account manager",
      "On-site camera installation & audit",
      "99.9% uptime SLA guarantee",
      "Direct API integrations & reporting",
      "24/7 dedicated enterprise response",
    ],
  },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes — every stadium plan comes with a 14-day free trial. You can test the microsite, calendar sync, and booking system with zero risk." },
  { q: "What is the 5% platform commission?", a: "On bookings processed via Telebirr or CBE Birr, a small 5% platform fee applies to cover instant gateway synchronization, automated SMS dispatch, and server operations." },
  { q: "Can I change or upgrade my plan later?", a: "Absolutely. You can upgrade, downgrade, or switch between monthly and annual billing at any time directly from your Stadium Owner Dashboard." },
  { q: "What payment methods are supported for subscriptions?", a: "We support Telebirr, CBE Birr, Chapa, Mastercard/Visa, and direct bank invoices for annual plans." },
  { q: "Is AI camera hardware included?", a: "AI recording software and cloud processing pipelines are included in Professional and Enterprise tiers. Hardware mounting and calibration are handled by certified local partners." },
  { q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription at any time with no lock-in contracts." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-28 pb-24" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HEADER / INTRO ─────────────────────────── */}
      <section className="py-12">
        <div className="spotnow-container text-center max-w-3xl mx-auto">
          <FadeUp>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#2d6a4f] bg-[#f0faf4] border border-[#2d6a4f]/15 mb-4">
              <ShieldCheck size={13} /> Transparent Venue Plans
            </div>

            <h1
              className="text-[#111] font-black leading-tight mb-4 tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
            >
              Simple, Predictable Plans
            </h1>

            <p className="text-[#6a6a6a] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto font-medium">
              Choose the plan that matches your stadium facility. All plans include ULS quality certification, an official microsite, and automated Telebirr booking sync.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  !annual ? "bg-[#2d6a4f] text-white shadow-sm" : "text-[#5a5a5a] hover:text-[#111]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  annual ? "bg-[#2d6a4f] text-white shadow-sm" : "text-[#5a5a5a] hover:text-[#111]"
                }`}
              >
                Annual Billing
                <span className="px-2 py-0.5 rounded-full bg-[#f0faf4] text-[#2d6a4f] text-[10px] font-black">
                  Save 20%
                </span>
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING CARDS ──────────────────────────── */}
      <section className="py-6">
        <div className="spotnow-container">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <ScaleIn key={plan.name} delay={i * 0.1}>
                <div
                  className={`rounded-3xl p-8 h-full flex flex-col justify-between transition-all duration-300 ${
                    plan.popular
                      ? "text-white shadow-2xl md:-translate-y-2 border-2 border-[#2d6a4f]"
                      : "bg-white text-[#111] shadow-lg border border-black/[0.08] hover:shadow-xl"
                  }`}
                  style={plan.popular ? { background: "#1a4731" } : undefined}
                >
                  <div>
                    {/* Badge / Tagline */}
                    <div className="flex items-center justify-between mb-4">
                      {plan.popular ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#74c69d] text-[#1a4731] shadow-sm">
                          <Star size={11} className="fill-[#1a4731]" /> Most Popular
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider">
                          {plan.tagline}
                        </span>
                      )}
                    </div>

                    {/* Plan Name & Tagline */}
                    <h3 className={`text-2xl font-black mb-2 ${plan.popular ? "text-white" : "text-[#111]"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs leading-relaxed mb-6 ${plan.popular ? "text-white/75" : "text-[#7a7a7a]"}`}>
                      {plan.desc}
                    </p>

                    {/* Pricing */}
                    <div className={`mb-6 pb-6 border-b ${plan.popular ? "border-white/15" : "border-black/[0.06]"}`}>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black">
                          {annual ? plan.annualEtb : plan.etb}
                        </span>
                        <span className={`text-xs font-semibold ${plan.popular ? "text-white/70" : "text-[#7a7a7a]"}`}>
                          ETB / month
                        </span>
                      </div>
                      <div className={`text-[11px] mt-1 ${plan.popular ? "text-white/60" : "text-[#8a8a8a]"}`}>
                        {annual ? "Billed annually (Save 20%)" : "Billed monthly, cancel anytime"}
                      </div>
                    </div>

                    {/* Specs Box */}
                    <div
                      className={`grid grid-cols-3 gap-2 rounded-2xl p-3.5 mb-6 text-center ${
                        plan.popular ? "bg-white/10 text-white" : "bg-[#f4f3ef] text-[#111]"
                      }`}
                    >
                      <div>
                        <div className={`text-[9px] font-bold uppercase ${plan.popular ? "text-white/60" : "text-[#7a7a7a]"}`}>
                          Fields
                        </div>
                        <div className={`text-xs font-black mt-0.5 ${plan.popular ? "text-[#74c69d]" : "text-[#2d6a4f]"}`}>
                          {plan.fields}
                        </div>
                      </div>
                      <div className={`border-x ${plan.popular ? "border-white/15" : "border-black/10"}`}>
                        <div className={`text-[9px] font-bold uppercase ${plan.popular ? "text-white/60" : "text-[#7a7a7a]"}`}>
                          Cameras
                        </div>
                        <div className={`text-xs font-black mt-0.5 ${plan.popular ? "text-[#74c69d]" : "text-[#2d6a4f]"}`}>
                          {plan.cameras}
                        </div>
                      </div>
                      <div>
                        <div className={`text-[9px] font-bold uppercase ${plan.popular ? "text-white/60" : "text-[#7a7a7a]"}`}>
                          Storage
                        </div>
                        <div className={`text-xs font-black mt-0.5 ${plan.popular ? "text-[#74c69d]" : "text-[#2d6a4f]"}`}>
                          {plan.storage}
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <div className={`text-[11px] font-bold uppercase tracking-wider ${plan.popular ? "text-white/80" : "text-[#111]"}`}>
                        Included Features:
                      </div>
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs font-medium leading-relaxed">
                          <Check
                            size={14}
                            className={`flex-shrink-0 mt-0.5 ${plan.popular ? "text-[#74c69d]" : "text-[#2d6a4f]"}`}
                            strokeWidth={3}
                          />
                          <span className={plan.popular ? "text-white/90" : "text-[#3d3d3d]"}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/auth/register/owner"
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-full text-xs font-bold transition-all shadow-md ${
                      plan.popular
                        ? "bg-white text-[#111] hover:bg-[#f4f3ef] hover:scale-[1.02]"
                        : "bg-[#2d6a4f] text-white hover:bg-[#1a4731]"
                    }`}
                  >
                    Start 14-Day Free Trial
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ────────────────────────────── */}
      <section className="py-20">
        <div className="spotnow-container max-w-3xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111] mb-2 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#7a7a7a]">
              Have questions about stadium onboarding and platform fees? We&apos;ve got answers.
            </p>
          </FadeUp>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white rounded-3xl p-6 cursor-pointer transition-all border border-black/[0.06] shadow-sm hover:shadow-md"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-[#111]">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-7 h-7 rounded-full bg-[#f4f3ef] flex items-center justify-center flex-shrink-0 text-[#2d6a4f]"
                    >
                      <ChevronDown size={15} />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-[#6a6a6a] leading-relaxed pt-3 mt-3 border-t border-black/[0.06]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
