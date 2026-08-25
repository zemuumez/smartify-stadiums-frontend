"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Key,
  Phone,
  Mail,
  Building2,
  Save,
  CheckCircle2,
  Lock,
  Smartphone
} from "lucide-react";
import { FadeUp } from "@/components/ui/AnimatedSection";
import { useAuthStore } from "@/lib/auth-store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile & Business", icon: User },
    { id: "notifications", label: "SMS & Notifications", icon: Bell },
    { id: "security", label: "Security & Passwords", icon: Shield },
    { id: "integrations", label: "Telebirr & API Gateways", icon: Key },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div>
        <h2 className="text-2xl font-black text-[#111] tracking-tight">Account &amp; Stadium Settings</h2>
        <p className="text-[#7a7a7a] text-xs sm:text-sm mt-0.5">
          Configure business details, notification webhooks, and manager permissions
        </p>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "bg-white text-[#5a5a5a] border border-black/[0.06] hover:text-[#111]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <FadeUp>
          <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-black/[0.05] space-y-6">
            <h3 className="text-lg font-black text-[#111]">Stadium Owner Profile</h3>

            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-sm"
                style={{ background: "#2d6a4f" }}
              >
                {user?.full_name ? user.full_name[0] : "A"}
              </div>
              <div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#f4f3ef] text-[#111] font-bold text-xs hover:bg-[#eae8e1] transition-colors"
                >
                  Change Avatar
                </button>
                <p className="text-[11px] text-[#8a8a8a] mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.full_name || "Abebe Kebede"}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Phone Number (Login ID)
                  </label>
                  <input
                    type="tel"
                    defaultValue={user?.phone || "0911234567"}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || "owner@bambismeda.com"}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                    Registered Business Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Bambis Meda Sports PLC"
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              {saved && (
                <div className="p-3 rounded-xl bg-[#f0faf4] text-xs font-bold text-[#2d6a4f] flex items-center gap-2">
                  <CheckCircle2 size={14} /> Profile changes saved successfully!
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                  style={{ background: "#2d6a4f" }}
                >
                  <Save size={14} /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </FadeUp>
      )}

      {/* ── INTEGRATIONS TAB ── */}
      {activeTab === "integrations" && (
        <FadeUp>
          <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-black/[0.05] space-y-5">
            <h3 className="text-lg font-black text-[#111]">Payment &amp; Hardware Gateways</h3>
            <div className="space-y-3">
              {[
                { name: "Telebirr Merchant Gateway", status: "Connected", desc: "Instant mobile QR & in-app checkout sync", active: true },
                { name: "CBE Birr Integration", status: "Connected", desc: "Direct commercial bank of Ethiopia settlement", active: true },
                { name: "Veo Cam 3 Cloud Sync", status: "Active (2 Cameras)", desc: "Autonomous AI match video pipeline", active: true },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f3ef]">
                  <div>
                    <div className="text-xs font-bold text-[#111]">{item.name}</div>
                    <div className="text-[11px] text-[#7a7a7a]">{item.desc}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-[#2d6a4f] bg-[#f0faf4]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      )}

    </div>
  );
}
