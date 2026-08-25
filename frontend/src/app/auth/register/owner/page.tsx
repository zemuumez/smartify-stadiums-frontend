"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Phone,
  KeyRound,
  Building2,
  MapPin,
  Camera,
  Zap,
  Shield,
  Star,
  Crown,
  Globe,
  Plus,
  Trash2,
  Lightbulb,
  Users,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  ArrowUpRight,
  Radio,
  Signal,
  AlertCircle
} from "lucide-react";
import { FadeUp } from "@/components/ui/AnimatedSection";

// ─── Constants ────────────────────────────────────────────────────────────────

const CITIES = ["Addis Ababa", "Hawassa", "Bahir Dar", "Dire Dawa", "Mekelle", "Jimma", "Adama", "Gondar"];

const CAMERA_MODELS = [
  { id: "veo3", name: "Veo Cam 3", brand: "Veo AI", resolution: "4K 30fps", fov: "180° Panoramic", price: "Included in Pro", popular: true },
  { id: "sporpin", name: "SporPin X200", brand: "SporPin", resolution: "1080p 60fps", fov: "160° Wide", price: "Included in Starter", popular: false },
  { id: "hikvision", name: "Hikvision Pro AI", brand: "Hikvision", resolution: "4K Ultra HD", fov: "120° PTZ", price: "2,500 ETB Setup", popular: false },
  { id: "byo", name: "Bring Your Own RTMP", brand: "Custom Hardware", resolution: "Adaptive", fov: "Custom", price: "Free Integration", popular: false },
];

const SURFACE_TYPES = ["Natural Grass", "Artificial Turf (FIFA Certified)", "Indoor Hardwood", "Clay / Sand"];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "2,500",
    features: ["1 Stadium Venue", "2 Fields / Courts", "1 AI Camera Feed", "500 GB Cloud Video", "Basic Telemetry", "Public Microsite"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "7,500",
    features: ["3 Stadium Venues", "10 Fields / Courts", "5 AI Camera Feeds", "2 TB Cloud Video", "Advanced Analytics", "Custom Microsite", "Telebirr Auto-Payout"],
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "20,000",
    features: ["Unlimited Venues", "Unlimited Fields", "Unlimited AI Feeds", "10 TB Cloud Video", "Custom White-Label Domain", "Dedicated Manager", "24/7 Priority Support"],
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OwnerRegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0: Account
  const [phone, setPhone] = useState("0911234567");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState("Abebe Kebede");
  const [businessName, setBusinessName] = useState("Bambis Meda Sports PLC");
  const [email, setEmail] = useState("owner@bambismeda.com");

  // Step 1: Stadium
  const [stadiumName, setStadiumName] = useState("Bambis Meda Stadium");
  const [stadiumAddress, setStadiumAddress] = useState("Bole Road, Near Medhanialem");
  const [stadiumCity, setStadiumCity] = useState("Addis Ababa");
  const [stadiumPhone, setStadiumPhone] = useState("0911234567");
  const [stadiumDesc, setStadiumDesc] = useState("Premier football and multi-sport ground equipped with artificial turf and AI match tracking.");

  // Step 2: Fields
  const [fields, setFields] = useState([
    {
      name: "Pitch A (Main 11v11)",
      surface: "Artificial Turf (FIFA Certified)",
      hourlyRate: 2500,
      hasLighting: true,
      hasChangingRoom: true,
      schedule: DAYS.map(() => ({ open: "06:00", close: "22:00", available: true })),
    },
    {
      name: "Pitch B (7v7 Grass)",
      surface: "Natural Grass",
      hourlyRate: 1800,
      hasLighting: true,
      hasChangingRoom: false,
      schedule: DAYS.map(() => ({ open: "06:00", close: "22:00", available: true })),
    },
  ]);

  // Step 3: Camera
  const [cameraModel, setCameraModel] = useState("veo3");
  const [deviceKey, setDeviceKey] = useState("PE-BAMBIS-01");
  const [streamKey, setStreamKey] = useState("live_88492048591");
  const [cameraCertStatus, setCameraCertStatus] = useState<"idle" | "testing" | "passed" | "failed">("idle");

  // Step 4: Plan
  const [selectedPlan, setSelectedPlan] = useState("professional");

  // Step 5: Terms
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const steps = [
    { label: "Account", icon: Phone },
    { label: "Stadium", icon: Building2 },
    { label: "Fields", icon: Zap },
    { label: "Camera", icon: Camera },
    { label: "Plan", icon: CreditCard },
    { label: "Go Live", icon: Globe },
  ];

  const handleSendOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setOtpSent(true);
    setOtp("123456");
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setStep(1);
  };

  const handleTestCamera = async () => {
    setCameraCertStatus("testing");
    await new Promise((r) => setTimeout(r, 1200));
    setCameraCertStatus("passed");
  };

  const handleLaunch = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep(6);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        name: `Pitch ${String.fromCharCode(65 + fields.length)}`,
        surface: "Artificial Turf (FIFA Certified)",
        hourlyRate: 2000,
        hasLighting: true,
        hasChangingRoom: true,
        schedule: DAYS.map(() => ({ open: "06:00", close: "22:00", available: true })),
      },
    ]);
  };

  const removeField = (idx: number) => {
    if (fields.length > 1) setFields(fields.filter((_, i) => i !== idx));
  };

  const generateDeviceKey = () => {
    const key = "PE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setDeviceKey(key);
    const stream = "live_" + Math.random().toString(36).substring(2, 14);
    setStreamKey(stream);
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#111] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* ── TOP HEADER / BRAND ── */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/[0.06]">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo/et-smart-fields-icon.jpg"
              alt="ET Smart Fields"
              width={40}
              height={40}
              className="rounded-xl object-cover flex-shrink-0"
              priority
            />
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-[#111]">ET</span>
              <span className="text-xl font-black text-[#2d6a4f]">Smart Fields</span>
            </div>
          </Link>

          <Link
            href="/auth/login"
            className="text-xs font-bold text-[#5a5a5a] hover:text-[#111] px-4 py-2 rounded-full border border-black/10 hover:bg-white transition-colors"
          >
            Already registered? Sign In ↗
          </Link>
        </div>

        {/* ── STEP PROGRESS PILL BAR ── */}
        {step < 6 && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-black/[0.05] mb-8 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px] gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isCompleted = i < step;

                return (
                  <div key={s.label} className="flex-1 flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all flex-shrink-0 ${
                        isActive
                          ? "bg-[#2d6a4f] text-white shadow-md shadow-[#2d6a4f]/20 scale-105"
                          : isCompleted
                          ? "bg-[#f0faf4] text-[#2d6a4f] border border-[#2d6a4f]/20"
                          : "bg-[#f4f3ef] text-[#8a8a8a]"
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isActive ? "text-[#111]" : isCompleted ? "text-[#2d6a4f]" : "text-[#8a8a8a]"}`}>
                        {s.label}
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-[#2d6a4f]" : "bg-black/[0.06]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP CONTENT PANELS ── */}
        <AnimatePresence mode="wait">

          {/* ── Step 0: Account Setup ── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 1 of 6</div>
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">Owner Verification &amp; Account</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    Verify your mobile number to create your stadium administrator portal.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Ethiopian Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0911234567"
                        disabled={otpSent}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f] disabled:opacity-60"
                      />
                    </div>
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!phone || loading}
                        className="mt-2.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#f0faf4] text-[#2d6a4f] hover:bg-[#2d6a4f] hover:text-white transition-all disabled:opacity-50"
                      >
                        {loading ? "Sending Code..." : "Send Verification SMS"}
                      </button>
                    ) : (
                      <div className="mt-2 text-xs text-[#2d6a4f] font-semibold flex items-center justify-between">
                        <span>✓ Code sent to {phone} (Demo Code: 123456)</span>
                        <button onClick={() => { setOtpSent(false); setOtp(""); }} className="text-[#7a7a7a] hover:text-[#111] underline">
                          Change number
                        </button>
                      </div>
                    )}
                  </div>

                  {otpSent && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        6-Digit Verification Code *
                      </label>
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-center font-mono text-base font-bold tracking-widest text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Abebe Kebede"
                        className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        Business / Company Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Bambis Meda Sports PLC"
                        className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Email Address (for Invoices &amp; Notifications)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@stadium.com"
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex justify-end">
                  <button
                    type="button"
                    onClick={() => (otpSent ? handleVerifyOtp() : handleSendOtp())}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ background: "#2d6a4f" }}
                  >
                    {loading ? "Verifying..." : "Continue to Stadium Info"} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Stadium Details ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 2 of 6</div>
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">Stadium Venue Information</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    Provide physical address and branding for your public venue profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Stadium Name *
                    </label>
                    <input
                      type="text"
                      value={stadiumName}
                      onChange={(e) => setStadiumName(e.target.value)}
                      placeholder="e.g. Bambis Meda Stadium"
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        City / Region *
                      </label>
                      <select
                        value={stadiumCity}
                        onChange={(e) => setStadiumCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        Street Address / District *
                      </label>
                      <input
                        type="text"
                        value={stadiumAddress}
                        onChange={(e) => setStadiumAddress(e.target.value)}
                        placeholder="Bole Road, Near Medhanialem"
                        className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Public Booking Slug URL
                    </label>
                    <div className="flex items-center">
                      <span className="px-4 py-3 rounded-l-2xl bg-[#eae8e1] text-xs font-bold text-[#7a7a7a] border border-r-0 border-black/10">
                        etsmartfields.com/
                      </span>
                      <input
                        type="text"
                        readOnly
                        value={stadiumName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
                        className="w-full px-4 py-3 rounded-r-2xl bg-[#f4f3ef] border border-black/10 text-xs font-mono font-bold text-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Venue Description &amp; Highlights
                    </label>
                    <textarea
                      rows={3}
                      value={stadiumDesc}
                      onChange={(e) => setStadiumDesc(e.target.value)}
                      placeholder="Describe playing surface quality, parking, lighting, and locker facilities..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7a7a7a] hover:text-[#111]"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!stadiumName}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ background: "#2d6a4f" }}
                  >
                    Continue to Fields <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Pitch & Field Setup ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 3 of 6</div>
                    <h2 className="text-2xl font-black text-[#111] tracking-tight">Pitches &amp; Field Pricing</h2>
                    <p className="text-xs sm:text-sm text-[#7a7a7a]">
                      Define playing surfaces, hourly rates, and night match capabilities.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addField}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-[#2d6a4f] bg-white border border-[#2d6a4f]/20 hover:bg-[#f0faf4] shadow-sm flex-shrink-0"
                  >
                    <Plus size={14} /> Add Another Pitch
                  </button>
                </div>

                {fields.map((field, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/[0.05] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs"
                          style={{ background: "#2d6a4f" }}
                        >
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const f = [...fields];
                            f[idx].name = e.target.value;
                            setFields(f);
                          }}
                          className="font-black text-base text-[#111] bg-transparent border-b border-black/10 focus:border-[#2d6a4f] focus:outline-none"
                        />
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(idx)}
                          className="p-2 text-[#8a8a8a] hover:text-red-600 rounded-xl hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#7a7a7a] uppercase mb-1">
                          Surface Type
                        </label>
                        <select
                          value={field.surface}
                          onChange={(e) => {
                            const f = [...fields];
                            f[idx].surface = e.target.value;
                            setFields(f);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                        >
                          {SURFACE_TYPES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#7a7a7a] uppercase mb-1">
                          Hourly Rate (ETB)
                        </label>
                        <input
                          type="number"
                          value={field.hourlyRate}
                          onChange={(e) => {
                            const f = [...fields];
                            f[idx].hourlyRate = Number(e.target.value);
                            setFields(f);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                        />
                      </div>

                      <div className="flex items-end gap-3 pb-1">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.hasLighting}
                            onChange={(e) => {
                              const f = [...fields];
                              f[idx].hasLighting = e.target.checked;
                              setFields(f);
                            }}
                            className="w-4 h-4 rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                          />
                          <Lightbulb size={13} className="text-amber-600" /> Night Games
                        </label>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.hasChangingRoom}
                            onChange={(e) => {
                              const f = [...fields];
                              f[idx].hasChangingRoom = e.target.checked;
                              setFields(f);
                            }}
                            className="w-4 h-4 rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                          />
                          <Users size={13} className="text-blue-600" /> Lockers
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.05] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7a7a7a] hover:text-[#111]"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                    style={{ background: "#2d6a4f" }}
                  >
                    Continue to Camera Setup <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: AI Camera Connection ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 4 of 6</div>
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">AI Camera Fleet &amp; Live Stream</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    Pair autonomous match recording hardware to enable automatic highlight clips for players.
                  </p>
                </div>

                {/* Camera Model Cards */}
                <div>
                  <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-2.5">
                    1. Select Camera Hardware Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAMERA_MODELS.map((cam) => (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => setCameraModel(cam.id)}
                        className={`relative p-4 rounded-2xl border text-left transition-all ${
                          cameraModel === cam.id
                            ? "bg-[#f0faf4] border-[#2d6a4f] ring-1 ring-[#2d6a4f]/30"
                            : "bg-[#f4f3ef] border-black/[0.06] hover:bg-[#eae8e1]"
                        }`}
                      >
                        {cam.popular && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#2d6a4f] text-white text-[9px] font-black uppercase rounded-full">
                            Recommended
                          </span>
                        )}
                        <div className="font-black text-sm text-[#111]">{cam.name}</div>
                        <div className="text-xs text-[#7a7a7a] mt-0.5">{cam.brand} • {cam.resolution} • {cam.fov}</div>
                        <div className="text-xs font-bold text-[#2d6a4f] mt-1.5">{cam.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Keys */}
                <div className="p-5 rounded-2xl bg-[#f4f3ef] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111] uppercase tracking-wider">
                      2. Device Pairing &amp; RTMP Credentials
                    </label>
                    <button
                      type="button"
                      onClick={generateDeviceKey}
                      className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
                    >
                      <Zap size={13} /> Auto-Generate Keys
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-[#7a7a7a] mb-1">Device Key</div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-black/10">
                        <span className="font-mono font-bold text-xs text-[#111] flex-1">{deviceKey}</span>
                        <button onClick={() => navigator.clipboard.writeText(deviceKey)} className="text-[#8a8a8a] hover:text-[#111]">
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-[#7a7a7a] mb-1">RTMP Stream Key</div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-black/10">
                        <span className="font-mono font-bold text-xs text-[#111] flex-1">{streamKey}</span>
                        <button onClick={() => navigator.clipboard.writeText(streamKey)} className="text-[#8a8a8a] hover:text-[#111]">
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certification Test */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f0faf4] border border-[#2d6a4f]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#2d6a4f] text-white">
                      <Signal size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#111]">Camera Live Certification</div>
                      <div className="text-[11px] text-[#2d6a4f]">
                        {cameraCertStatus === "passed"
                          ? "✓ 4K Stream Verified (8 Mbps, 180° FOV)"
                          : "Test autonomous feed communication before launching"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestCamera}
                    disabled={cameraCertStatus === "testing"}
                    className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#2d6a4f] hover:bg-[#1a4731] transition-all disabled:opacity-50"
                  >
                    {cameraCertStatus === "testing" ? "Testing Feed..." : cameraCertStatus === "passed" ? "Re-Test Stream" : "Run Test"}
                  </button>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7a7a7a] hover:text-[#111]"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                    style={{ background: "#2d6a4f" }}
                  >
                    Continue to Plan Selection <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Plan Selection ── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 5 of 6</div>
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">Select Software Subscription</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    Choose the plan that matches your stadium capacity and camera streaming volume.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-6 rounded-3xl border text-left transition-all flex flex-col justify-between ${
                        selectedPlan === plan.id
                          ? "bg-[#f0faf4] border-[#2d6a4f] ring-2 ring-[#2d6a4f]/20 shadow-md"
                          : "bg-white border-black/[0.06] hover:bg-[#f4f3ef]"
                      }`}
                    >
                      {plan.recommended && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2d6a4f] text-white text-[9px] font-black uppercase rounded-full">
                          Most Popular
                        </span>
                      )}
                      <div>
                        <h4 className="text-base font-black text-[#111] mb-1">{plan.name}</h4>
                        <div className="text-2xl font-black text-[#111] mb-4">
                          {plan.price} ETB <span className="text-xs font-normal text-[#7a7a7a]">/ mo</span>
                        </div>

                        <div className="space-y-2 mb-6">
                          {plan.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-xs text-[#3d3d3d]">
                              <Check size={13} className="text-[#2d6a4f] flex-shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`w-full py-2.5 rounded-full text-center text-xs font-bold transition-all ${
                          selectedPlan === plan.id
                            ? "bg-[#2d6a4f] text-white"
                            : "bg-[#f4f3ef] text-[#5a5a5a]"
                        }`}
                      >
                        {selectedPlan === plan.id ? "Selected Plan" : "Choose Plan"}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7a7a7a] hover:text-[#111]"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                    style={{ background: "#2d6a4f" }}
                  >
                    Continue to Go Live <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Terms & Final Review ── */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 6 of 6</div>
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">Review &amp; Go Live</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    Double-check your setup details before publishing your venue live.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Administrator", val: `${fullName} (${phone})` },
                    { label: "Venue Profile", val: `${stadiumName} • ${stadiumCity}` },
                    { label: "Fields & Rates", val: `${fields.length} operational pitch(es) configured` },
                    { label: "Camera Hardware", val: `${cameraModel.toUpperCase()} (Stream Verified)` },
                    { label: "Software Subscription", val: `${selectedPlan.toUpperCase()} Plan` },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f4f3ef]">
                      <span className="text-xs font-bold text-[#7a7a7a]">{row.label}</span>
                      <span className="text-xs font-black text-[#111]">{row.val}</span>
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#f0faf4] border border-[#2d6a4f]/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                  />
                  <span className="text-xs text-[#2d6a4f] leading-relaxed">
                    I agree to the <strong>ET Smart Fields Stadium Partnership Terms</strong>, Telebirr automated payout processing guidelines, and Camera Live Streaming terms.
                  </span>
                </label>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7a7a7a] hover:text-[#111]"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunch}
                    disabled={!agreedToTerms || loading}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ background: "#2d6a4f" }}
                  >
                    {loading ? "Publishing Venue..." : "Launch Stadium Online"} <Globe size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 6: Launch Success Celebration ── */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-black/[0.05] text-center space-y-6">
                <div
                  className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white shadow-xl shadow-[#2d6a4f]/25"
                  style={{ background: "#2d6a4f" }}
                >
                  <CheckCircle2 size={44} />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#111] tracking-tight">
                    Your Stadium is Live on ET Smart Fields!
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a] max-w-md mx-auto mt-2">
                    Players can now discover your venue, book hourly slots with Telebirr, and enjoy AI match highlights.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f4f3ef] max-w-md mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f]">
                    <Globe size={16} />
                    <span>etsmartfields.com/{stadiumName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}</span>
                  </div>
                  <Link href="/microsite" target="_blank" className="text-xs font-bold text-[#111] hover:underline">
                    Visit ↗
                  </Link>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                    style={{ background: "#2d6a4f" }}
                  >
                    Go to Owner Dashboard <ArrowUpRight size={16} />
                  </Link>
                  <Link
                    href="/dashboard/microsite"
                    className="px-6 py-3.5 rounded-full bg-[#f4f3ef] text-[#111] font-bold text-xs hover:bg-[#eae8e1] transition-colors"
                  >
                    Customize Microsite
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
