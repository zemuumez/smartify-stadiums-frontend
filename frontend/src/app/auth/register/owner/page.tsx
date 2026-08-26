"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Globe,
  Plus,
  Trash2,
  Lightbulb,
  Users,
  CheckCircle2,
  CreditCard,
  ArrowUpRight,
  Radio,
  Signal,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

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
  const router = useRouter();
  const { register, setDemoUser } = useAuthStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0: Account
  const [phone, setPhone] = useState("0911234567");
  const [otp, setOtp] = useState("123456");
  const [otpSent, setOtpSent] = useState(true);
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
      name: "Pitch 1 (FIFA Artificial Turf)",
      surface: "Artificial Turf (FIFA Certified)",
      hourlyRate: 2500,
      hasLighting: true,
      hasChangingRoom: true,
      schedule: DAYS.map(() => ({ open: "06:00", close: "22:00", available: true })),
    },
    {
      name: "Pitch 2 (7v7 Grass Pitch)",
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
    await new Promise((r) => setTimeout(r, 400));
    setOtpSent(true);
    setOtp("123456");
    setLoading(false);
  };

  const handleVerifyOtpAndAdvance = async () => {
    setLoading(true);
    try {
      await register(phone, otp || "123456", fullName, "owner");
    } catch {
      setDemoUser("owner");
    }
    setLoading(false);
    setStep(1);
  };

  const handleTestCamera = async () => {
    setCameraCertStatus("testing");
    await new Promise((r) => setTimeout(r, 1000));
    setCameraCertStatus("passed");
  };

  const handleLaunch = async () => {
    setLoading(true);
    // Persist stadium registry data in browser
    if (typeof window !== "undefined") {
      const stadiumData = {
        name: stadiumName,
        city: stadiumCity,
        address: stadiumAddress,
        phone: stadiumPhone,
        description: stadiumDesc,
        fields,
        cameraModel,
        plan: selectedPlan,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem("registered_stadium", JSON.stringify(stadiumData));
    }
    setDemoUser("owner");
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep(6);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        name: `Pitch ${fields.length + 1} (${surfaceTypeLabel(fields.length)})`,
        surface: "Artificial Turf (FIFA Certified)",
        hourlyRate: 2000,
        hasLighting: true,
        hasChangingRoom: true,
        schedule: DAYS.map(() => ({ open: "06:00", close: "22:00", available: true })),
      },
    ]);
  };

  const surfaceTypeLabel = (index: number) => {
    if (index === 2) return "5v5 Hardwood Court";
    if (index === 3) return "Volleyball Sand Pitch";
    return "Turf Field";
  };

  const removeField = (idx: number) => {
    if (fields.length > 1) setFields(fields.filter((_, i) => i !== idx));
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
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-black text-[#111]">ET</span>
                <span className="text-base font-black text-[#2d6a4f]">Smart Fields</span>
              </div>
              <div className="text-[10px] text-[#7a7a7a] font-bold uppercase tracking-wider">
                Stadium Registry Wizard
              </div>
            </div>
          </Link>

          <Link
            href="/auth/login"
            className="text-xs font-bold text-[#2d6a4f] hover:underline"
          >
            Existing Stadium Owner? Sign In ↗
          </Link>
        </div>

        {/* ── PROGRESS STEPPER ── */}
        {step < 6 && (
          <div className="mb-8 bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-black/[0.05]">
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isCurrent = step === idx;
                const isPassed = step > idx;
                return (
                  <button
                    key={s.label}
                    onClick={() => {
                      if (step > idx) setStep(idx);
                    }}
                    disabled={step < idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                      isCurrent
                        ? "bg-[#2d6a4f] text-white shadow-sm"
                        : isPassed
                        ? "bg-[#f0faf4] text-[#2d6a4f] hover:bg-[#e0f5ea]"
                        : "text-[#8a8a8a] opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isPassed ? (
                      <Check size={14} className="stroke-[3]" />
                    ) : (
                      <Icon size={14} />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
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
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      6-Digit SMS Verification Code *
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
                    <div className="mt-1.5 text-[11px] text-[#2d6a4f] font-semibold">
                      ✓ Instant verification enabled (Demo Code: 123456)
                    </div>
                  </div>

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
                    onClick={handleVerifyOtpAndAdvance}
                    disabled={loading || !phone}
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
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                        Venue Phone Hotline *
                      </label>
                      <input
                        type="tel"
                        value={stadiumPhone}
                        onChange={(e) => setStadiumPhone(e.target.value)}
                        placeholder="0911234567"
                        className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Physical Street Address / Landmarks *
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                      <input
                        type="text"
                        value={stadiumAddress}
                        onChange={(e) => setStadiumAddress(e.target.value)}
                        placeholder="e.g. Bole Road, Near Medhanialem Cathedral"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
                      Stadium Description &amp; Highlights
                    </label>
                    <textarea
                      rows={3}
                      value={stadiumDesc}
                      onChange={(e) => setStadiumDesc(e.target.value)}
                      placeholder="Describe your facilities, floodlights, turf quality, and match amenities..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f] resize-none"
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
                    disabled={!stadiumName || !stadiumAddress}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ background: "#2d6a4f" }}
                  >
                    Continue to Fields Setup <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Pitch & Court Setup ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 3 of 6</div>
                    <h2 className="text-2xl font-black text-[#111] tracking-tight">Configure Pitches &amp; Courts</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addField}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f] hover:bg-[#2d6a4f] hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={14} /> Add Pitch
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((f, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#f4f3ef] border border-black/[0.06] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#111] uppercase tracking-wider">
                          Pitch #{i + 1}
                        </span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(i)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove Pitch"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#7a7a7a] mb-1">Pitch Name</label>
                          <input
                            type="text"
                            value={f.name}
                            onChange={(e) => {
                              const updated = [...fields];
                              updated[i].name = e.target.value;
                              setFields(updated);
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#7a7a7a] mb-1">Hourly Rate (ETB)</label>
                          <input
                            type="number"
                            value={f.hourlyRate}
                            onChange={(e) => {
                              const updated = [...fields];
                              updated[i].hourlyRate = Number(e.target.value);
                              setFields(updated);
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111]">
                          <input
                            type="checkbox"
                            checked={f.hasLighting}
                            onChange={(e) => {
                              const updated = [...fields];
                              updated[i].hasLighting = e.target.checked;
                              setFields(updated);
                            }}
                            className="rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                          />
                          <Lightbulb size={13} className="text-amber-600" /> Night Game Floodlights
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111]">
                          <input
                            type="checkbox"
                            checked={f.hasChangingRoom}
                            onChange={(e) => {
                              const updated = [...fields];
                              updated[i].hasChangingRoom = e.target.checked;
                              setFields(updated);
                            }}
                            className="rounded text-[#2d6a4f] focus:ring-[#2d6a4f]"
                          />
                          <Users size={13} className="text-[#2d6a4f]" /> Locker &amp; Changing Rooms
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
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

          {/* ── Step 3: Camera & Streaming Setup ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 4 of 6</div>
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">AI Camera &amp; Live Recording</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    Connect your AI recording units for automatic match clipping and player highlights.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CAMERA_MODELS.map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => setCameraModel(cam.id)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        cameraModel === cam.id
                          ? "border-[#2d6a4f] bg-[#f0faf4] shadow-sm"
                          : "border-black/10 bg-white hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[#111]">{cam.name}</span>
                        {cam.popular && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2d6a4f] text-white">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7a7a7a]">{cam.resolution} • {cam.fov}</div>
                    </button>
                  ))}
                </div>

                {/* Camera Test Box */}
                <div className="p-4 rounded-2xl bg-[#f4f3ef] border border-black/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        cameraCertStatus === "passed"
                          ? "bg-[#2d6a4f] text-white"
                          : "bg-black/10 text-[#7a7a7a]"
                      }`}
                    >
                      <Radio size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#111]">Stream Telemetry Verification</div>
                      <div className="text-[10px] text-[#7a7a7a]">
                        {cameraCertStatus === "passed" ? "✓ 4K Signal Calibrated (180° Field Coverage)" : "Ready to test RTMP handshake"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestCamera}
                    disabled={cameraCertStatus === "testing"}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-black/10 text-[#111] hover:bg-[#f0faf4] shadow-sm"
                  >
                    {cameraCertStatus === "testing" ? "Testing..." : cameraCertStatus === "passed" ? "Re-Test" : "Run Test"}
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
                    Continue to Subscription Plan <ArrowRight size={16} />
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
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">Select Stadium Plan</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    14-day free trial included on all plans. Zero upfront credit card required.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p.id)}
                      className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                        selectedPlan === p.id
                          ? "border-[#2d6a4f] bg-[#f0faf4] shadow-md ring-2 ring-[#2d6a4f]"
                          : "border-black/10 bg-white hover:border-black/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black text-[#111]">{p.name}</span>
                          {p.recommended && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#2d6a4f] text-white">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-black text-[#111] mb-3">
                          {p.price} <span className="text-[10px] text-[#7a7a7a] font-normal">ETB/mo</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-[#5a5a5a] mb-4">
                          {p.features.map((feat) => (
                            <li key={feat} className="flex items-center gap-1.5">
                              <Check size={12} className="text-[#2d6a4f] flex-shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div
                        className={`w-full py-2 rounded-xl text-center text-xs font-bold ${
                          selectedPlan === p.id ? "bg-[#2d6a4f] text-white" : "bg-[#f4f3ef] text-[#111]"
                        }`}
                      >
                        {selectedPlan === p.id ? "Selected Plan" : "Choose Plan"}
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
                    Continue to Review <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Terms & Final Launch ── */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-black/[0.05] space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">Step 6 of 6</div>
                  <h2 className="text-2xl font-black text-[#111] tracking-tight">Review &amp; Go Live</h2>
                  <p className="text-xs sm:text-sm text-[#7a7a7a]">
                    Confirm your venue details and launch your official stadium presence.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: "Administrator", val: `${fullName} (${phone})` },
                    { label: "Venue Profile", val: `${stadiumName} • ${stadiumCity}` },
                    { label: "Fields & Rates", val: `${fields.length} operational pitch(es) configured` },
                    { label: "Camera Hardware", val: `${cameraModel.toUpperCase()} (Stream Verified)` },
                    { label: "Software Subscription", val: `${selectedPlan.toUpperCase()} (14-Day Free Trial)` },
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
                  <span className="text-xs text-[#2d6a4f] leading-relaxed font-medium">
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
                    href="/microsite"
                    className="px-6 py-3.5 rounded-full bg-[#f4f3ef] text-[#111] font-bold text-xs hover:bg-[#eae8e1] transition-colors"
                  >
                    View Official Microsite
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
