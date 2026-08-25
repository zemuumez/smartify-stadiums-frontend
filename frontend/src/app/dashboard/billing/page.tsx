"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  Download,
  Receipt,
  Zap,
  Star,
  Crown,
  Check,
  Building2
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("professional");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "2,500",
      period: "month",
      icon: Zap,
      features: [
        "1 Stadium",
        "2 Fields",
        "1 Camera",
        "500 GB Cloud Storage",
        "Basic Analytics",
        "Public Microsite",
      ],
      current: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: "7,500",
      period: "month",
      icon: Star,
      features: [
        "3 Stadiums",
        "10 Fields",
        "5 AI Cameras",
        "2 TB Cloud Storage",
        "Advanced Telemetry & Analytics",
        "Custom Microsite Themes",
        "Priority Support",
      ],
      current: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "20,000",
      period: "month",
      icon: Crown,
      features: [
        "Unlimited Stadiums",
        "Unlimited Fields",
        "Unlimited Cameras",
        "10 TB Storage",
        "Real-time Streaming",
        "White-label Custom Domains",
        "Dedicated Account Manager",
      ],
      current: false,
    },
  ];

  const invoices = [
    { id: "INV-2026-08", date: "01 Aug 2026", amount: "7,500 ETB", status: "paid", plan: "Professional Plan" },
    { id: "INV-2026-07", date: "01 Jul 2026", amount: "7,500 ETB", status: "paid", plan: "Professional Plan" },
    { id: "INV-2026-06", date: "01 Jun 2026", amount: "7,500 ETB", status: "paid", plan: "Professional Plan" },
    { id: "INV-2026-05", date: "01 May 2026", amount: "2,500 ETB", status: "paid", plan: "Starter Plan" },
  ];

  const usage = [
    { label: "Stadiums", used: 2, limit: 3, unit: "" },
    { label: "Operational Fields", used: 4, limit: 10, unit: "" },
    { label: "Linked AI Cameras", used: 2, limit: 5, unit: "" },
    { label: "Cloud Video Storage", used: 423, limit: 2000, unit: "GB" },
  ];

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111] tracking-tight">Subscription &amp; Invoices</h2>
          <p className="text-[#7a7a7a] text-xs sm:text-sm mt-0.5">
            Manage your stadium software plan, storage limits, and receipt history
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
          style={{ background: "#2d6a4f" }}
        >
          <CreditCard size={14} /> Update Payment Method
        </button>
      </div>

      {/* ── ACTIVE PLAN & USAGE CARD ── */}
      <div className="bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#2d6a4f] bg-[#f0faf4] mb-2">
              <CheckCircle2 size={12} /> Active Subscription
            </div>
            <h3 className="text-xl font-black text-[#111]">Professional Stadium Plan</h3>
            <p className="text-xs text-[#7a7a7a]">Renews automatically on Sep 1, 2026 via Telebirr Auto-Debit</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-[#111]">7,500 ETB <span className="text-xs font-normal text-[#7a7a7a]">/ month</span></div>
          </div>
        </div>

        {/* Quota Progress */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {usage.map((u) => {
            const percent = Math.round((u.used / u.limit) * 100);
            return (
              <div key={u.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#7a7a7a] font-semibold">{u.label}</span>
                  <span className="font-bold text-[#111]">{u.used} / {u.limit} {u.unit}</span>
                </div>
                <div className="h-2 rounded-full bg-[#f4f3ef] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2d6a4f]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PLAN OPTIONS ── */}
      <div>
        <h3 className="text-lg font-black text-[#111] mb-4">Available Software Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-7 shadow-sm border flex flex-col justify-between ${
                plan.current ? "border-[#2d6a4f] ring-2 ring-[#2d6a4f]/20 shadow-md" : "border-black/[0.05]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-black text-[#111]">{plan.name}</h4>
                  {plan.current && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-[#2d6a4f] bg-[#f0faf4]">
                      Current Plan
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-[#111] mb-6">
                  {plan.price} ETB <span className="text-xs font-normal text-[#7a7a7a]">/ month</span>
                </div>

                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-[#3d3d3d]">
                      <Check size={13} className="text-[#2d6a4f] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={plan.current}
                className={`w-full py-3 rounded-full text-xs font-bold transition-all ${
                  plan.current
                    ? "bg-[#f0faf4] text-[#2d6a4f] cursor-default"
                    : "bg-white border border-black/15 text-[#111] hover:bg-[#f4f3ef]"
                }`}
              >
                {plan.current ? "Current Active Plan" : "Switch to " + plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVOICE HISTORY ── */}
      <div className="bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05]">
        <h3 className="text-lg font-black text-[#111] mb-4">Billing History &amp; Receipts</h3>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f4f3ef] hover:bg-[#eae8e1] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-[#2d6a4f] shadow-sm">
                  <Receipt size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111]">{inv.id} — {inv.plan}</div>
                  <div className="text-[11px] text-[#7a7a7a]">{inv.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-[#111]">{inv.amount}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f0faf4] text-[#2d6a4f] uppercase">
                  {inv.status}
                </span>
                <button className="text-[#8a8a8a] hover:text-[#111] p-1">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
