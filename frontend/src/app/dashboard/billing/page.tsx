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
  Building2,
  Clock,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
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
      color: "from-blue-500 to-cyan-500",
      features: [
        "1 Stadium",
        "2 Fields",
        "1 Camera",
        "500 GB Storage",
        "Basic Analytics",
        "Microsite",
        "Email Support",
      ],
      current: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: "7,500",
      period: "month",
      icon: Star,
      color: "from-green-500 to-emerald-500",
      features: [
        "3 Stadiums",
        "10 Fields",
        "5 Cameras",
        "2 TB Storage",
        "Advanced Analytics",
        "Custom Microsite",
        "Priority Support",
        "API Access",
      ],
      current: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "20,000",
      period: "month",
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      features: [
        "Unlimited Stadiums",
        "Unlimited Fields",
        "Unlimited Cameras",
        "10 TB Storage",
        "Real-time Analytics",
        "White-label Microsite",
        "24/7 Support",
        "Custom Integrations",
        "Dedicated Account Manager",
      ],
      current: false,
    },
  ];

  const invoices = [
    { id: "INV-001", date: "Aug 2026", amount: "7,500 ETB", status: "paid", plan: "Professional" },
    { id: "INV-002", date: "Jul 2026", amount: "7,500 ETB", status: "paid", plan: "Professional" },
    { id: "INV-003", date: "Jun 2026", amount: "7,500 ETB", status: "paid", plan: "Professional" },
    { id: "INV-004", date: "May 2026", amount: "2,500 ETB", status: "paid", plan: "Starter" },
    { id: "INV-005", date: "Apr 2026", amount: "2,500 ETB", status: "paid", plan: "Starter" },
  ];

  const usage = [
    { label: "Stadiums", used: 2, limit: 3, unit: "" },
    { label: "Fields", used: 4, limit: 10, unit: "" },
    { label: "Cameras", used: 2, limit: 5, unit: "" },
    { label: "Storage", used: 423, limit: 2000, unit: "GB" },
    { label: "API Calls", used: 12400, limit: 50000, unit: "" },
  ];

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <FadeUp>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/20 via-gray-900 to-yellow-600/20 border border-white/10 p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={20} className="text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Current Plan</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Professional</h2>
              <p className="text-gray-400 text-sm mt-1">7,500 ETB/month · Next billing: Sep 15, 2026</p>
            </div>
            <div className="flex gap-3">
              <MagneticButton variant="outline" size="md" icon={<CreditCard size={16} />}>
                Update Payment
              </MagneticButton>
              <MagneticButton variant="ghost" size="md" icon={<Receipt size={16} />}>
                View Invoices
              </MagneticButton>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Usage */}
      <FadeUp>
        <GlowCard>
          <h3 className="text-lg font-semibold text-white mb-4">Current Usage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {usage.map((u) => {
              const percent = (u.used / u.limit) * 100;
              return (
                <div key={u.label} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{u.label}</span>
                    <span className="text-gray-300">{u.used.toLocaleString()}/{u.limit.toLocaleString()}{u.unit}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${percent > 80 ? "bg-red-500" : percent > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>
      </FadeUp>

      {/* Plans */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Plans</h3>
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <StaggerItem key={plan.id}>
                <GlowCard className={`h-full ${plan.current ? "ring-2 ring-green-500/50" : ""}`}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                        {plan.current && (
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Current</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 text-sm ml-1">ETB/{plan.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton
                      variant={plan.current ? "ghost" : "primary"}
                      size="md"
                      className="w-full"
                    >
                      {plan.current ? "Current Plan" : "Upgrade"}
                    </MagneticButton>
                  </div>
                </GlowCard>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>

      {/* Invoices */}
      <FadeUp>
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Invoices</h3>
            <MagneticButton variant="ghost" size="sm" icon={<Download size={14} />}>
              Export All
            </MagneticButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">Invoice</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">Date</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">Plan</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">Amount</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3">Status</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-sm text-white font-mono">{inv.id}</td>
                    <td className="py-3 text-sm text-gray-300">{inv.date}</td>
                    <td className="py-3 text-sm text-gray-300">{inv.plan}</td>
                    <td className="py-3 text-sm text-white font-medium">{inv.amount}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 size={10} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-gray-400 hover:text-white">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
