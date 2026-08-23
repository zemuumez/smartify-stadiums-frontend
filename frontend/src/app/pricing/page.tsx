"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap, Crown, Building2, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">Pricing</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-4 mb-6">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Choose the plan that fits your stadium. All plans include ULS verification, microsite, and basic analytics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-slate-50 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "2,500",
                period: "ETB/month",
                icon: <Zap className="text-green-600" size={24} />,
                desc: "Perfect for small stadiums getting started",
                popular: false,
                features: [
                  "1 field",
                  "Basic booking system",
                  "Microsite with CMS",
                  "5GB video storage",
                  "Basic analytics",
                  "Email support",
                  "Telebirr & Chapa payments",
                ],
              },
              {
                name: "Professional",
                price: "7,500",
                period: "ETB/month",
                icon: <Crown className="text-green-600" size={24} />,
                desc: "For growing stadiums with camera systems",
                popular: true,
                features: [
                  "Up to 5 fields",
                  "Advanced booking & scheduling",
                  "AI camera integration",
                  "50GB video storage",
                  "AI highlights generation",
                  "Advanced analytics dashboard",
                  "Priority support",
                  "Custom microsite themes",
                  "Event management",
                ],
              },
              {
                name: "Enterprise",
                price: "20,000",
                period: "ETB/month",
                icon: <Building2 className="text-green-600" size={24} />,
                desc: "For large complexes and multi-venue operations",
                popular: false,
                features: [
                  "Unlimited fields",
                  "Full API access",
                  "Multi-camera setup",
                  "500GB video storage",
                  "Real-time streaming",
                  "White-label options",
                  "Dedicated account manager",
                  "Custom integrations",
                  "SLA guarantee",
                  "On-site training",
                ],
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-3xl ${
                  plan.popular
                    ? "bg-white border-2 border-green-500 shadow-xl shadow-green-500/10 scale-105"
                    : "bg-white border border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                      <span className="text-slate-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`block w-full text-center px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/25"
                      : "bg-slate-100 text-slate-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">FAQ</span>
            <h2 className="text-4xl font-black text-slate-900 mt-4">Common Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              { q: "Is there a free trial?", a: "Yes! Every plan comes with a 14-day free trial. No credit card required to start." },
              { q: "Can I change plans later?", a: "Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately with prorated billing." },
              { q: "What payment methods do you accept?", a: "We accept Telebirr, CBE Birr, credit/debit cards, and bank transfers for annual plans." },
              { q: "Is the camera system included?", a: "Camera hardware is provided by our partner at additional cost. The software integration is included in Professional and Enterprise plans." },
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period." },
            ].map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
