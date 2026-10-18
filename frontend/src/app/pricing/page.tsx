"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ShieldCheck,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { FadeUp, ScaleIn } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/i18n/provider";

export default function PricingPage() {
  const { t } = useI18n();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: t("planStarterName"),
      tagline: t("planStarterTagline"),
      desc: t("planStarterDesc"),
      etb: "2,500",
      annualEtb: "2,000",
      popular: false,
      fields: t("singleFieldSpec"),
      cameras: t("singleCameraSpec"),
      storage: t("starterStorageSpec"),
      features: [
        t("featStadiumSite"),
        t("featTelebirrCbe"),
        t("featCalendarEngine"),
        t("featSmsConfirmations"),
        t("featUlsCompliance"),
        t("featStandardSupport"),
      ],
    },
    {
      name: t("planProfessionalName"),
      tagline: t("planProfessionalTagline"),
      desc: t("planProfessionalDesc"),
      etb: "7,500",
      annualEtb: "6,000",
      popular: true,
      badge: t("mostPopularChoice"),
      fields: t("multiFieldsSpec"),
      cameras: t("multiCamerasSpec"),
      storage: t("proStorageSpec"),
      features: [
        t("featStarterIncluded"),
        t("featAiRecording"),
        t("featHighlightReel"),
        t("featRevenueAnalytics"),
        t("featMultiFieldCoord"),
        t("featTournamentBracket"),
        t("featPrioritySupport"),
      ],
    },
    {
      name: t("planEnterpriseName"),
      tagline: t("planEnterpriseTagline"),
      desc: t("planEnterpriseDesc"),
      etb: "20,000",
      annualEtb: "16,000",
      popular: false,
      fields: t("unlimitedFieldsSpec"),
      cameras: t("unlimitedCamerasSpec"),
      storage: t("enterpriseStorageSpec"),
      features: [
        t("featProIncluded"),
        t("featBroadcastStreaming"),
        t("featCustomDomain"),
        t("featAccountManager"),
        t("featOnsiteAudit"),
        t("featUptimeSla"),
        t("featApiIntegrations"),
        t("featEnterpriseResponse"),
      ],
    },
  ];

  const faqs = [
    { q: t("faqTrialQ"), a: t("faqTrialA") },
    { q: t("faqCommissionQ"), a: t("faqCommissionA") },
    { q: t("faqUpgradeQ"), a: t("faqUpgradeA") },
    { q: t("faqPaymentsQ"), a: t("faqPaymentsA") },
    { q: t("faqHardwareQ"), a: t("faqHardwareA") },
    { q: t("faqCancelQ"), a: t("faqCancelA") },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HEADER / INTRO ─────────────────────────── */}
      <section className="py-12">
        <div className="spotnow-container text-center max-w-3xl mx-auto">
          <FadeUp>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#2d6a4f] bg-[#f0faf4] border border-[#2d6a4f]/15 mb-4">
              <ShieldCheck size={13} /> {t("pricingTitle")}
            </div>

            <h1
              className="text-[#111] font-black leading-tight mb-4 tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
            >
              {t("pricingTitle")}
            </h1>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed mb-6 max-w-2xl mx-auto">
              {t("pricingProvisionalNotice")}
            </div>

            <p className="text-[#6a6a6a] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto font-medium">
              {t("pricingDescription")}
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  !annual ? "bg-[#2d6a4f] text-white shadow-sm" : "text-[#5a5a5a] hover:text-[#111]"
                }`}
              >
                {t("monthlyBilling")}
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  annual ? "bg-[#2d6a4f] text-white shadow-sm" : "text-[#5a5a5a] hover:text-[#111]"
                }`}
              >
                {t("annualBilling")}
                <span className="px-2 py-0.5 rounded-full bg-[#f0faf4] text-[#2d6a4f] text-[10px] font-black">
                  {t("save20")}
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
                          <Star size={11} className="fill-[#1a4731]" /> {t("mostPopularChoice")}
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
                          {t("etbPerMonth")}
                        </span>
                      </div>
                      <div className={`text-[11px] mt-1 ${plan.popular ? "text-white/60" : "text-[#8a8a8a]"}`}>
                        {annual ? t("billedAnnuallySave20") : t("billedMonthlyCancelAnytime")}
                      </div>
                      <div className={`text-[10px] mt-1 italic ${plan.popular ? "text-white/50" : "text-[#9a9a9a]"}`}>
                        {t("planProvisionalRateNotice")}
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
                          {t("fieldsCountLabel")}
                        </div>
                        <div className={`text-xs font-black mt-0.5 ${plan.popular ? "text-[#74c69d]" : "text-[#2d6a4f]"}`}>
                          {plan.fields}
                        </div>
                      </div>
                      <div className={`border-x ${plan.popular ? "border-white/15" : "border-black/10"}`}>
                        <div className={`text-[9px] font-bold uppercase ${plan.popular ? "text-white/60" : "text-[#7a7a7a]"}`}>
                          {t("camerasCountLabel")}
                        </div>
                        <div className={`text-xs font-black mt-0.5 ${plan.popular ? "text-[#74c69d]" : "text-[#2d6a4f]"}`}>
                          {plan.cameras}
                        </div>
                      </div>
                      <div>
                        <div className={`text-[9px] font-bold uppercase ${plan.popular ? "text-white/60" : "text-[#7a7a7a]"}`}>
                          {t("storageCapacityLabel")}
                        </div>
                        <div className={`text-xs font-black mt-0.5 ${plan.popular ? "text-[#74c69d]" : "text-[#2d6a4f]"}`}>
                          {plan.storage}
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <div className={`text-[11px] font-bold uppercase tracking-wider ${plan.popular ? "text-white/80" : "text-[#111]"}`}>
                        {t("includedFeatures")}:
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
                    {t("partner")}
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
              {t("faqTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-[#7a7a7a]">
              {t("faqSubtitle")}
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
