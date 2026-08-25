"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, Building2, ArrowRight, ArrowUpRight, ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem, ScaleIn } from "@/components/ui/AnimatedSection";

const plans = [
  {
    name: "Starter",
    etb: "2,500",
    annualEtb: "2,000",
    icon: <Zap size={22} style={{ color: "#2d6a4f" }} />,
    desc: "Perfect for a single field getting started online.",
    popular: false,
    fields: "1–2 Fields",
    cameras: "1 Camera",
    storage: "500 GB",
    features: [
      "Online booking calendar",
      "Real-time slot availability",
      "Official stadium microsite",
      "Telebirr & CBE Birr payments",
      "Basic revenue analytics",
      "Player ratings & reviews",
      "Email support",
    ],
  },
  {
    name: "Professional",
    etb: "7,500",
    annualEtb: "6,000",
    icon: <Crown size={22} style={{ color: "#2d6a4f" }} />,
    desc: "For growing stadiums with multiple fields and AI cameras.",
    popular: true,
    fields: "Up to 10 Fields",
    cameras: "5 Cameras",
    storage: "2 TB",
    features: [
      "Everything in Starter",
      "AI camera integration",
      "AI highlight generation",
      "Full match video replays",
      "Advanced analytics (revenue, trends)",
      "Custom microsite branding",
      "Event & tournament management",
      "Priority phone support",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    etb: "20,000",
    annualEtb: "16,000",
    icon: <Building2 size={22} style={{ color: "#2d6a4f" }} />,
    desc: "For large sports complexes and multi-venue operators.",
    popular: false,
    fields: "Unlimited Fields",
    cameras: "Unlimited Cameras",
    storage: "10 TB",
    features: [
      "Everything in Professional",
      "Real-time live streaming",
      "White-label custom domain options",
      "Dedicated account manager",
      "On-site installation & training",
      "99.9% uptime SLA guarantee",
      "Platform admin API",
      "24/7 dedicated support",
    ],
  },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes — every plan comes with a 14-day free trial. No credit card required to get started." },
  { q: "What is the 5% platform fee?", a: "On bookings processed via Telebirr or CBE Birr, a small 5% platform fee applies to cover instant payment gateway sync and SMS notifications." },
  { q: "Can I change or upgrade my plan later?", a: "Absolutely. You can upgrade, downgrade, or pause your subscription anytime directly from your Owner Dashboard." },
  { q: "What payment methods are supported for subscriptions?", a: "We support Telebirr, CBE Birr, Chapa, credit/debit cards, and direct bank transfers for annual plans." },
  { q: "Is AI camera hardware included?", a: "AI integration software and automated recording pipelines are included in Professional and Enterprise plans. Hardware installation is provided by certified partners." },
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
              <ShieldCheck size={13} /> Transparent Pricing
            </div>

            <h1
              className="text-[#111] font-black leading-tight mb-4 tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
            >
              Simple, Predictable Plans
            </h1>

            <p className="text-[#6a6a6a] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Choose the plan that fits your stadium. All plans include ULS quality verification, a public microsite, and real-time booking syncing.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm">
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
          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <ScaleIn key={plan.name} delay={i * 0.1}>
                <div
                  className={`photo-card p-8 h-full flex flex-col justify-between relative ${
                    plan.popular ? "border-2 border-[#2d6a4f] shadow-2xl" : "shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-md"
                      style={{ background: "#2d6a4f" }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f0faf4]">
                        {plan.icon}
                      </div>
                      <h3 className="text-xl font-black text-[#111]">{plan.name}</h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#7a7a7a] leading-relaxed mb-6">
                      {plan.desc}
                    </p>

                    {/* Pricing */}
                    <div className="mb-6 pb-6 border-b border-black/[0.06]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-[#111]">
                          {annual ? plan.annualEtb : plan.etb}
                        </span>
                        <span className="text-xs font-semibold text-[#7a7a7a]">ETB / month</span>
                      </div>
                      <div className="text-[11px] text-[#8a8a8a] mt-1">
                        {annual ? "Billed annually" : "Billed monthly, cancel anytime"}
                      </div>
                    </div>

                    {/* Specs Box */}
                    <div className="grid grid-cols-3 gap-2 rounded-2xl p-3.5 mb-6 bg-[#f0faf4] text-center">
                      <div>
                        <div className="text-[10px] text-[#7a7a7a] font-bold uppercase">Fields</div>
                        <div className="text-xs font-black text-[#2d6a4f] mt-0.5">{plan.fields}</div>
                      </div>
                      <div className="border-x border-[#2d6a4f]/15">
                        <div className="text-[10px] text-[#7a7a7a] font-bold uppercase">Cameras</div>
                        <div className="text-xs font-black text-[#2d6a4f] mt-0.5">{plan.cameras}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#7a7a7a] font-bold uppercase">Storage</div>
                        <div className="text-xs font-black text-[#2d6a4f] mt-0.5">{plan.storage}</div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#111]">Included Features:</div>
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-[#3d3d3d] font-medium leading-relaxed">
                          <Check size={14} className="text-[#2d6a4f] flex-shrink-0 mt-0.5" strokeWidth={3} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/auth/register/owner"
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-xs font-bold transition-all shadow-md ${
                      plan.popular
                        ? "bg-[#2d6a4f] text-white hover:bg-[#1a4731]"
                        : "bg-white border border-black/15 text-[#111] hover:bg-[#f0faf4] hover:border-[#2d6a4f]"
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
                  className="photo-card p-5 cursor-pointer transition-all hover:border-black/20"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-bold text-[#111]">{faq.q}</h3>
                    <ChevronDown
                      size={16}
                      className={`text-[#7a7a7a] transition-transform duration-300 ${isOpen ? "rotate-180 text-[#2d6a4f]" : ""}`}
                    />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-[#6a6a6a] leading-relaxed mt-3 pt-3 border-t border-black/[0.06]"
                      >
                        {faq.a}
                      </motion.p>
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
