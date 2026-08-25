"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2, ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem, ScaleIn } from "@/components/ui/AnimatedSection";

const plans = [
  {
    name: "Starter",
    etb: "2,500",
    icon: <Zap size={22} style={{ color: "#2d6a4f" }} />,
    desc: "Perfect for a single field getting online.",
    popular: false,
    fields: "1–2 Fields",
    cameras: "1 Camera",
    storage: "500 GB",
    features: [
      "Online booking system",
      "Real-time availability",
      "Stadium microsite (CMS)",
      "Telebirr & Chapa payments",
      "Basic analytics dashboard",
      "Player rating & reviews",
      "Email support",
    ],
  },
  {
    name: "Professional",
    etb: "7,500",
    icon: <Crown size={22} style={{ color: "#2d6a4f" }} />,
    desc: "For growing stadiums with multiple fields and cameras.",
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
      "Custom microsite themes",
      "Event & tournament management",
      "Priority support",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    etb: "20,000",
    icon: <Building2 size={22} style={{ color: "#2d6a4f" }} />,
    desc: "For large complexes, multi-venue operations, and partners.",
    popular: false,
    fields: "Unlimited Fields",
    cameras: "Unlimited Cameras",
    storage: "10 TB",
    features: [
      "Everything in Professional",
      "Real-time streaming",
      "White-label microsite options",
      "Dedicated account manager",
      "Custom integrations",
      "On-site installation & training",
      "SLA guarantee (99.9% uptime)",
      "Platform admin API",
      "24/7 support",
    ],
  },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes — every plan comes with a 14-day free trial. No credit card required to get started." },
  { q: "What is the 5% platform fee?", a: "On every booking made through your stadium, ET Smart Fields deducts a 5% platform fee. This is how we keep subscription prices affordable while investing in new features." },
  { q: "Can I change my plan later?", a: "Absolutely. Upgrade or downgrade anytime. Changes take effect immediately with prorated billing." },
  { q: "What payment methods do you accept for subscriptions?", a: "We accept Telebirr, CBE Birr, credit/debit cards, and bank transfers for annual plans." },
  { q: "Is the camera system included in the price?", a: "Camera hardware is provided by our partner at additional cost. AI integration software is included in Professional and Enterprise plans." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription at any time — access continues until the end of your current billing period." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="pt-40 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">Pricing</div>
            <h1
              className="text-[#111] font-black leading-tight mb-5"
              style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", letterSpacing: "-0.025em" }}
            >
              Simple, Transparent Pricing
            </h1>
            <p className="text-[#7a7a7a] text-xl max-w-xl mx-auto leading-relaxed">
              Choose the plan that fits your stadium. All plans include ULS verification, a public microsite, and basic analytics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PLAN CARDS ─────────────────────────────── */}
      <section className="pb-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto -mt-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`photo-card p-8 relative ${plan.popular ? "border-2 border-[#2d6a4f]" : ""}`}
                style={plan.popular ? { boxShadow: "0 12px 36px rgba(45,106,79,0.12)" } : {}}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 text-white text-xs font-black rounded-full whitespace-nowrap"
                    style={{ background: "#2d6a4f" }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Icon + Plan name */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
                    {plan.icon}
                  </div>
                  <h3 className="font-black text-[#111] text-xl">{plan.name}</h3>
                </div>
                <p className="text-sm text-[#7a7a7a] mb-6">{plan.desc}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#111]">{plan.etb}</span>
                    <span className="text-[#7a7a7a] text-sm">ETB / month</span>
                  </div>
                </div>

                {/* Specs */}
                <div
                  className="grid grid-cols-3 gap-2 rounded-2xl p-3 mb-6"
                  style={{ background: "#f0faf4" }}
                >
                  {[
                    { label: "Fields", value: plan.fields },
                    { label: "Cameras", value: plan.cameras },
                    { label: "Storage", value: plan.storage },
                  ].map((spec) => (
                    <div key={spec.label} className="text-center">
                      <div className="text-[10px] text-[#7a7a7a] font-semibold uppercase tracking-wide">{spec.label}</div>
                      <div className="text-xs font-black text-[#111] mt-0.5">{spec.value}</div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#3d3d3d]">
                      <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#2d6a4f" }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/auth/register"
                  className={`flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 ${
                    plan.popular
                      ? "text-white"
                      : "border text-[#2d6a4f] hover:opacity-90"
                  }`}
                  style={
                    plan.popular
                      ? { background: "#2d6a4f", boxShadow: "0 4px 16px rgba(45,106,79,0.3)" }
                      : { borderColor: "#2d6a4f", backgroundColor: "transparent" }
                  }
                >
                  Get Started <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEE CALLOUT ─────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div
              className="rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
              style={{ background: "linear-gradient(135deg, #f0faf4 0%, #e8f5ee 100%)", border: "1.5px solid #b7e4c7" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{ background: "white" }}
              >
                💰
              </div>
              <div className="flex-1">
                <h3 className="font-black text-[#111] text-xl mb-2">5% Platform Fee on Bookings</h3>
                <p className="text-[#7a7a7a] text-sm leading-relaxed">
                  In addition to your monthly plan, ET Smart Fields charges a 5% fee on every booking payment processed through the platform. This covers payment processing, real-time sync infrastructure, and customer support for your players.
                  <strong className="text-[#2d6a4f]"> Your net revenue appears in real-time on your analytics dashboard.</strong>
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ─────────────── */}
      <section className="py-24" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">Compare</div>
            <h2 className="heading-xl">Full Feature Comparison</h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="photo-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                      <th className="text-left p-5 text-sm font-bold text-[#7a7a7a]">Feature</th>
                      {plans.map((p) => (
                        <th key={p.name} className="p-5 text-center text-sm font-black text-[#111]">
                          {p.name}
                          {p.popular && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full text-white" style={{ background: "#2d6a4f" }}>Popular</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Fields", values: ["1–2", "Up to 10", "Unlimited"] },
                      { feature: "AI Cameras", values: ["1", "5", "Unlimited"] },
                      { feature: "Video Storage", values: ["500 GB", "2 TB", "10 TB"] },
                      { feature: "Online Booking", values: [true, true, true] },
                      { feature: "Stadium Microsite", values: [true, true, true] },
                      { feature: "AI Camera Integration", values: [false, true, true] },
                      { feature: "AI Highlight Generation", values: [false, true, true] },
                      { feature: "Match Replays", values: [false, true, true] },
                      { feature: "Advanced Analytics", values: [false, true, true] },
                      { feature: "Event Management", values: [false, true, true] },
                      { feature: "Live Streaming", values: [false, false, true] },
                      { feature: "White-Label Options", values: [false, false, true] },
                      { feature: "API Access", values: [false, true, true] },
                      { feature: "Dedicated Account Manager", values: [false, false, true] },
                      { feature: "Support", values: ["Email", "Priority", "24/7"] },
                    ].map((row, i) => (
                      <tr
                        key={row.feature}
                        style={{
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                          background: i % 2 === 0 ? "white" : "#fbfbf9",
                        }}
                      >
                        <td className="p-5 text-sm text-[#3d3d3d] font-medium">{row.feature}</td>
                        {row.values.map((v, vi) => (
                          <td key={vi} className="p-5 text-center text-sm">
                            {typeof v === "boolean" ? (
                              v ? (
                                <Check size={16} className="mx-auto" style={{ color: "#2d6a4f" }} />
                              ) : (
                                <span className="text-[#ccc] text-lg leading-none">—</span>
                              )
                            ) : (
                              <span className="font-semibold text-[#111]">{v}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-3">FAQ</div>
            <h2 className="heading-xl">Common Questions</h2>
          </FadeUp>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="photo-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-bold text-[#111] text-sm">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className="flex-shrink-0 transition-transform duration-200 text-[#aaa]"
                    style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm text-[#7a7a7a] leading-relaxed -mt-2">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1a10 0%, #1a4731 50%, #0d2b1d 100%)" }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-white font-black text-4xl mb-4">Still Have Questions?</h2>
            <p className="text-white/65 text-lg mb-10 max-w-md mx-auto">
              Talk to our team. We&apos;ll help you find the right plan and guide you through onboarding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary btn-primary-lg" style={{ background: "#2d6a4f" }}>
                Talk to Sales <ArrowUpRight size={16} />
              </Link>
              <Link href="/auth/register" className="btn-ghost-white" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
                Start Free Trial
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
