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
  Camera,
  Globe,
  CreditCard,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FadeUp } from "@/components/ui/AnimatedSection";
import { useAuthStore } from "@/lib/auth-store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Key },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <FadeUp>
          <GlowCard>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center text-2xl font-bold text-white">
                  {user?.full_name?.[0] || "U"}
                </div>
                <div>
                  <button className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors">Change Photo</button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
                  <input type="text" defaultValue={user?.full_name || ""} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Email</label>
                  <input type="email" defaultValue={user?.email || ""} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Phone</label>
                  <input type="tel" defaultValue={user?.phone || ""} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Business Name</label>
                  <input type="text" defaultValue={user?.business_name || ""} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
              </div>
              <div className="flex justify-end">
                <MagneticButton variant="primary" size="md" icon={<Save size={16} />}>Save Changes</MagneticButton>
              </div>
            </div>
          </GlowCard>
        </FadeUp>
      )}

      {activeTab === "notifications" && (
        <FadeUp>
          <GlowCard>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
              {[
                { label: "New Booking", desc: "When someone books a field", default: true },
                { label: "Booking Cancellation", desc: "When a booking is cancelled", default: true },
                { label: "Payment Received", desc: "When payment is confirmed", default: true },
                { label: "Camera Offline", desc: "When a camera goes offline", default: true },
                { label: "Weekly Report", desc: "Summary of your analytics", default: false },
                { label: "Marketing Updates", desc: "New features and promotions", default: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                  </label>
                </div>
              ))}
            </div>
          </GlowCard>
        </FadeUp>
      )}

      {activeTab === "security" && (
        <FadeUp>
          <div className="space-y-4">
            <GlowCard>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Change Password</h3>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Current Password</label>
                  <input type="password" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">New Password</label>
                  <input type="password" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Confirm New Password</label>
                  <input type="password" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50" />
                </div>
                <MagneticButton variant="primary" size="md" icon={<Save size={16} />}>Update Password</MagneticButton>
              </div>
            </GlowCard>
            <GlowCard>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                <MagneticButton variant="outline" size="md" icon={<Shield size={16} />}>Enable 2FA</MagneticButton>
              </div>
            </GlowCard>
            <GlowCard>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                <MagneticButton variant="outline" size="md">Delete Account</MagneticButton>
              </div>
            </GlowCard>
          </div>
        </FadeUp>
      )}

      {activeTab === "integrations" && (
        <FadeUp>
          <GlowCard>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Connected Services</h3>
              {[
                { name: "Chapa Payments", desc: "Accept online payments", connected: true, icon: CreditCard },
                { name: "SMS Provider", desc: "Send OTP and notifications", connected: true, icon: Phone },
                { name: "WhatsApp Business", desc: "Send booking confirmations", connected: false, icon: Mail },
              ].map((service, i) => {
                const Icon = service.icon;
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Icon size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{service.name}</p>
                        <p className="text-xs text-gray-400">{service.desc}</p>
                      </div>
                    </div>
                    <MagneticButton variant={service.connected ? "ghost" : "primary"} size="sm">
                      {service.connected ? "Connected" : "Connect"}
                    </MagneticButton>
                  </div>
                );
              })}
            </div>
          </GlowCard>
        </FadeUp>
      )}
    </div>
  );
}
