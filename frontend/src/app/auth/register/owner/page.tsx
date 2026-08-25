"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Phone, KeyRound, Building2, MapPin,
  Camera, Wifi, WifiOff, Zap, Shield, Star, Crown, Globe,
  Plus, Trash2, Clock, Lightbulb, Users, ChevronDown,
  Signal, AlertCircle, CheckCircle2, ExternalLink, Copy,
  CreditCard, Smartphone, Eye, ArrowUpRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CITIES = ["Addis Ababa", "Hawassa", "Bahir Dar", "Dire Dawa", "Mekelle", "Jimma", "Adama", "Gondar"];

const CAMERA_MODELS = [
  { id: "veo3", name: "Veo Cam 3", brand: "Veo", resolution: "4K", fov: "180°", price: "Included", popular: true },
  { id: "sporpin", name: "SporPin X200", brand: "SporPin", resolution: "1080p", fov: "160°", price: "Included", popular: false },
  { id: "hikvision", name: "Hikvision DS-2DE", brand: "Hikvision", resolution: "1080p", fov: "120°", price: "2,500 ETB", popular: false },
  { id: "other", name: "Other / BYO Camera", brand: "Custom", resolution: "Varies", fov: "Varies", price: "BYO", popular: false },
];

const SURFACE_TYPES = ["Natural Grass", "Artificial Turf", "Hybrid", "Clay"];

const PLANS = [
  { id: "starter", name: "Starter", price: "2,500", icon: Zap, color: "from-blue-500 to-cyan-500", features: ["1 Stadium", "2 Fields", "1 Camera", "500 GB Storage", "Basic Analytics", "Microsite"] },
  { id: "professional", name: "Professional", price: "7,500", icon: Star, color: "from-green-500 to-emerald-500", features: ["3 Stadiums", "10 Fields", "5 Cameras", "2 TB Storage", "Advanced Analytics", "Custom Microsite", "Priority Support"], recommended: true },
  { id: "enterprise", name: "Enterprise", price: "20,000", icon: Crown, color: "from-yellow-500 to-orange-500", features: ["Unlimited Stadiums", "Unlimited Fields", "Unlimited Cameras", "10 TB Storage", "Real-time Analytics", "White-label", "24/7 Support", "Dedicated Manager"] },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OwnerRegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0: Account
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");

  // Step 1: Stadium
  const [stadiumName, setStadiumName] = useState("");
  const [stadiumAddress, setStadiumAddress] = useState("");
  const [stadiumCity, setStadiumCity] = useState("Addis Ababa");
  const [stadiumPhone, setStadiumPhone] = useState("");
  const [stadiumDesc, setStadiumDesc] = useState("");

  // Step 2: Fields
  const [fields, setFields] = useState([
    { name: "Field 1", surface: "Natural Grass", hourlyRate: 2500, hasLighting: true, hasChangingRoom: true, schedule: DAYS.map(() => ({ open: "06:00", close: "22:00", available: true })) },
  ]);

  // Step 3: Camera
  const [cameraModel, setCameraModel] = useState("veo3");
  const [deviceKey, setDeviceKey] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [cameraCertStatus, setCameraCertStatus] = useState<"idle" | "testing" | "passed" | "failed">("idle");

  // Step 4: Plan
  const [selectedPlan, setSelectedPlan] = useState("professional");

  // Step 5: Go Live
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    await new Promise((r) => setTimeout(r, 1500));
    setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep(1);
  };

  const handleTestCamera = async () => {
    setCameraCertStatus("testing");
    await new Promise((r) => setTimeout(r, 3000));
    setCameraCertStatus(deviceKey.length > 5 ? "passed" : "failed");
  };

  const handleLaunch = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setStep(6);
  };

  const addField = () => {
    setFields([...fields, {
      name: `Field ${fields.length + 1}`,
      surface: "Natural Grass",
      hourlyRate: 2000,
      hasLighting: false,
      hasChangingRoom: false,
      schedule: DAYS.map(() => ({ open: "06:00", close: "22:00", available: true })),
    }]);
  };

  const removeField = (idx: number) => {
    if (fields.length > 1) setFields(fields.filter((_, i) => i !== idx));
  };

  const generateDeviceKey = () => {
    const key = "PE-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    setDeviceKey(key);
    const stream = "live_" + Math.random().toString(36).substring(2, 14);
    setStreamKey(stream);
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-3xl" />

      {/* Back link */}
      <div className="relative z-10 p-4">
        <Link href="/auth/register" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <ArrowLeft size={16} /> Back to registration
        </Link>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 text-white">
              <Building2 size={24} />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Play</span>
              <span className="text-2xl font-bold text-yellow-400 ml-1">Ethiopia</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Stadium Owner Registration</h1>
          <p className="text-gray-400 text-sm mt-1">Set up your stadium on PlayEth in a few steps</p>
        </div>

        {/* Progress */}
        {step < 6 && (
          <div className="mb-8">
            <div className="flex items-center gap-1">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isCompleted = i < step;
                return (
                  <div key={i} className="flex-1 flex items-center gap-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                      isCompleted ? "bg-green-500 text-white" : isActive ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-white/5 text-gray-500"
                    }`}>
                      {isCompleted ? <Check size={14} /> : i + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium hidden sm:block ${isActive ? "text-green-400" : isCompleted ? "text-white" : "text-gray-500"}`}>
                      {s.label}
                    </span>
                    {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-green-500" : "bg-white/10"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── Step 0: Account ──────────────────────────────── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Account Details</h2>
                  <p className="text-gray-400 text-sm">Verify your phone and set up your profile</p>
                </div>

                {/* Phone + OTP */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0911234567" disabled={otpSent}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 disabled:opacity-50" />
                    </div>
                    {!otpSent ? (
                      <button onClick={handleSendOtp} disabled={!phone || loading}
                        className="mt-2 px-4 py-2 bg-green-500/10 text-green-400 text-sm font-medium rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50">
                        {loading ? "Sending..." : "Send Verification Code"}
                      </button>
                    ) : (
                      <button onClick={() => { setOtpSent(false); setOtp(""); }} className="mt-2 text-xs text-gray-400 hover:text-white">Change number</button>
                    )}
                  </div>

                  {otpSent && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-sm text-gray-300 mb-1.5">Verification Code</label>
                      <div className="relative">
                        <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-xl tracking-[0.3em] placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Business Name</label>
                    <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="My Stadium LLC"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Email (for invoices)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@stadium.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
                </div>

                <div className="flex justify-end">
                  <button onClick={() => otpSent ? handleVerifyOtp() : null} disabled={!otpSent || loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 1: Stadium ──────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Stadium Information</h2>
                  <p className="text-gray-400 text-sm">Tell us about your facility</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Stadium Name *</label>
                  <input type="text" value={stadiumName} onChange={(e) => setStadiumName(e.target.value)} placeholder="e.g. Bambis Meda Stadium"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">City *</label>
                    <select value={stadiumCity} onChange={(e) => setStadiumCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50">
                      {CITIES.map((c) => <option key={c} value={c} className="bg-gray-800">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Address</label>
                    <input type="text" value={stadiumAddress} onChange={(e) => setStadiumAddress(e.target.value)} placeholder="Street, Area"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Phone</label>
                    <input type="tel" value={stadiumPhone} onChange={(e) => setStadiumPhone(e.target.value)} placeholder="+251 9XX XXX XXX"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Your URL slug</label>
                    <div className="flex items-center">
                      <span className="text-gray-500 text-xs mr-1">etsmartfields.com/</span>
                      <input type="text" value={stadiumName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")} readOnly
                        className="flex-1 px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-green-400 font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Description</label>
                  <textarea value={stadiumDesc} onChange={(e) => setStadiumDesc(e.target.value)} rows={3} placeholder="Describe your stadium..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 resize-none" />
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(0)} className="px-4 py-2 text-gray-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setStep(2)} disabled={!stadiumName}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center gap-2">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Fields ───────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Field Setup</h2>
                    <p className="text-gray-400 text-sm">Configure your fields, surfaces, and pricing</p>
                  </div>
                  <button onClick={addField} className="px-4 py-2 bg-green-500/10 text-green-400 text-sm font-medium rounded-xl hover:bg-green-500/20 flex items-center gap-1">
                    <Plus size={16} /> Add Field
                  </button>
                </div>

                {fields.map((field, idx) => (
                  <div key={idx} className="glass rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center text-sm font-bold text-white">{idx + 1}</div>
                        <input type="text" value={field.name} onChange={(e) => {
                          const f = [...fields]; f[idx].name = e.target.value; setFields(f);
                        }} className="bg-transparent text-white font-bold focus:outline-none border-b border-transparent focus:border-green-500/50" />
                      </div>
                      {fields.length > 1 && (
                        <button onClick={() => removeField(idx)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Surface</label>
                        <select value={field.surface} onChange={(e) => { const f = [...fields]; f[idx].surface = e.target.value; setFields(f); }}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50">
                          {SURFACE_TYPES.map((s) => <option key={s} value={s} className="bg-gray-800">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Hourly Rate (ETB)</label>
                        <input type="number" value={field.hourlyRate} onChange={(e) => { const f = [...fields]; f[idx].hourlyRate = Number(e.target.value); setFields(f); }}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50" />
                      </div>
                      <div className="flex items-end gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input type="checkbox" checked={field.hasLighting} onChange={(e) => { const f = [...fields]; f[idx].hasLighting = e.target.checked; setFields(f); }}
                            className="w-4 h-4 rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500" />
                          <Lightbulb size={14} /> Lights
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input type="checkbox" checked={field.hasChangingRoom} onChange={(e) => { const f = [...fields]; f[idx].hasChangingRoom = e.target.checked; setFields(f); }}
                            className="w-4 h-4 rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500" />
                          <Users size={14} /> Rooms
                        </label>
                      </div>
                    </div>

                    {/* Mini Schedule */}
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Weekly Schedule</p>
                      <div className="grid grid-cols-7 gap-1">
                        {DAYS.map((day, di) => (
                          <button key={di} onClick={() => {
                            const f = [...fields]; f[idx].schedule[di].available = !f[idx].schedule[di].available; setFields(f);
                          }} className={`p-1.5 rounded-lg text-center text-[10px] transition-all ${
                            field.schedule[di].available ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-gray-600 border border-white/10"
                          }`}>
                            <span className="font-medium">{day}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-2">
                  <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setStep(3)} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all flex items-center gap-2">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Camera Setup Wizard ──────────────────── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Camera Setup Wizard</h2>
                  <p className="text-gray-400 text-sm">Configure your camera system for automatic match recording</p>
                </div>

                {/* Camera Model Selection */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2"><Camera size={18} className="text-green-400" /> 1. Select Camera Model</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAMERA_MODELS.map((cam) => (
                      <button key={cam.id} onClick={() => setCameraModel(cam.id)}
                        className={`relative p-4 rounded-xl border text-left transition-all ${
                          cameraModel === cam.id ? "bg-green-500/10 border-green-500/40 ring-1 ring-green-500/20" : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}>
                        {cam.popular && <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded-full border border-yellow-500/20">Recommended</span>}
                        <p className="font-bold text-white text-sm">{cam.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cam.brand} · {cam.resolution} · {cam.fov}</p>
                        <p className="text-xs text-green-400 mt-1 font-medium">{cam.price === "Included" ? "Included in plan" : cam.price === "BYO" ? "Bring your own" : cam.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Registration */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2"><KeyRound size={18} className="text-green-400" /> 2. Device Registration</h3>
                  <p className="text-sm text-gray-400">Generate a unique device key for your camera or enter it manually.</p>

                  <div className="flex gap-3">
                    <button onClick={generateDeviceKey}
                      className="px-4 py-2 bg-green-500/10 text-green-400 text-sm font-medium rounded-xl hover:bg-green-500/20 flex items-center gap-1">
                      <Zap size={14} /> Auto-Generate Keys
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Device Key</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={deviceKey} onChange={(e) => setDeviceKey(e.target.value)} placeholder="PE-XXXXXXXX"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-green-500/50" />
                        {deviceKey && (
                          <button onClick={() => navigator.clipboard.writeText(deviceKey)} className="p-2 text-gray-400 hover:text-white"><Copy size={14} /></button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Stream Key (RTMP)</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={streamKey} onChange={(e) => setStreamKey(e.target.value)} placeholder="live_xxxxxxxxxxxx"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-green-500/50" />
                        {streamKey && (
                          <button onClick={() => navigator.clipboard.writeText(streamKey)} className="p-2 text-gray-400 hover:text-white"><Copy size={14} /></button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
                    <strong>RTMP URL:</strong> <code className="font-mono text-xs">rtmp://stream.etsmartfields.com/live</code> - Enter this in your camera&apos;s streaming settings along with the stream key above.
                  </div>
                </div>

                {/* Certification Test */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2"><Signal size={18} className="text-green-400" /> 3. Certification Test</h3>
                  <p className="text-sm text-gray-400">We&apos;ll verify your camera is properly connected and streaming.</p>

                  <div className="flex items-center gap-4">
                    <button onClick={handleTestCamera} disabled={!deviceKey || cameraCertStatus === "testing"}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center gap-2">
                      {cameraCertStatus === "testing" ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Testing Connection...</>
                      ) : cameraCertStatus === "passed" ? (
                        <><CheckCircle2 size={18} /> Re-Test</>
                      ) : (
                        <><Signal size={18} /> Run Certification Test</>
                      )}
                    </button>

                    {cameraCertStatus === "passed" && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium flex items-center gap-1"><CheckCircle2 size={14} /> Camera Certified</span>
                      </div>
                    )}
                    {cameraCertStatus === "failed" && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">Connection Failed — check device key</span>
                      </div>
                    )}
                  </div>

                  {cameraCertStatus === "passed" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 space-y-2">
                      <p className="text-sm text-green-400 font-bold">Certification Details</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-gray-400">Resolution</span><p className="text-white font-medium">4K 30fps</p></div>
                        <div><span className="text-gray-400">Latency</span><p className="text-white font-medium">1.2s</p></div>
                        <div><span className="text-gray-400">Bitrate</span><p className="text-white font-medium">8 Mbps</p></div>
                        <div><span className="text-gray-400">Field of View</span><p className="text-white font-medium">180°</p></div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Camera Setup Guide */}
                <div className="glass rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-white flex items-center gap-2"><Eye size={18} className="text-yellow-400" /> Quick Setup Guide</h3>
                  <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                    <li>Mount your camera with clear view of the field (centered, elevated preferred)</li>
                    <li>Connect camera to WiFi or Ethernet (stable connection required)</li>
                    <li>Enter the RTMP URL and Stream Key in your camera&apos;s streaming settings</li>
                    <li>Point camera to cover the full field — use the live preview to adjust</li>
                    <li>Run the certification test above to verify everything works</li>
                  </ol>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="px-4 py-2 text-gray-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setStep(4)} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all flex items-center gap-2">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: Plan Selection ────────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Choose Your Plan</h2>
                  <p className="text-gray-400 text-sm">Select the plan that fits your stadium</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-6 rounded-2xl border text-left transition-all ${
                          selectedPlan === plan.id
                            ? "bg-green-500/10 border-green-500/40 ring-2 ring-green-500/20"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}>
                        {plan.recommended && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">Most Popular</span>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{plan.name}</p>
                            <p className="text-2xl font-bold text-white">{plan.price} <span className="text-xs text-gray-400">ETB/mo</span></p>
                          </div>
                        </div>
                        <ul className="space-y-1.5">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                              <Check size={12} className="text-green-400 flex-shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                        <div className={`mt-4 w-full py-2 rounded-xl text-center text-sm font-bold transition-all ${
                          selectedPlan === plan.id ? "bg-green-500 text-white" : "bg-white/10 text-white"
                        }`}>
                          {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(3)} className="px-4 py-2 text-gray-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setStep(5)} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all flex items-center gap-2">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 5: Go Live ──────────────────────────────── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Go Live Checklist</h2>
                  <p className="text-gray-400 text-sm">Review everything before launching your stadium</p>
                </div>

                <div className="glass rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-white mb-3">Setup Summary</h3>
                  {[
                    { label: "Account", value: fullName || "Not set", done: !!fullName && !!phone },
                    { label: "Stadium", value: stadiumName || "Not set", done: !!stadiumName },
                    { label: "Fields", value: `${fields.length} field(s) configured`, done: fields.length > 0 },
                    { label: "Camera", value: cameraCertStatus === "passed" ? "Certified" : "Not certified", done: cameraCertStatus === "passed" },
                    { label: "Plan", value: PLANS.find((p) => p.id === selectedPlan)?.name || "", done: !!selectedPlan },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? "bg-green-500" : "bg-white/10"}`}>
                          {item.done ? <Check size={12} className="text-white" /> : <span className="text-xs text-gray-500">{i + 1}</span>}
                        </div>
                        <span className="text-sm font-medium text-white">{item.label}</span>
                      </div>
                      <span className={`text-sm ${item.done ? "text-gray-300" : "text-gray-500"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-white/5 border-white/10 text-green-500 focus:ring-green-500" />
                  <span className="text-sm text-gray-300">
                    I agree to the <Link href="#" className="text-green-400 hover:text-green-300">Terms of Service</Link>,{" "}
                    <Link href="#" className="text-green-400 hover:text-green-300">Privacy Policy</Link>, and{" "}
                    <Link href="#" className="text-green-400 hover:text-green-300">Camera Installation Agreement</Link>.
                  </span>
                </label>

                <div className="flex justify-between">
                  <button onClick={() => setStep(4)} className="px-4 py-2 text-gray-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
                  <button onClick={handleLaunch} disabled={!agreedToTerms || loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Globe size={18} />}
                    {loading ? "Launching..." : "Launch My Stadium"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 6: Success ──────────────────────────────── */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-28 h-28 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle2 size={56} className="text-white" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-white">You&apos;re Live!</h2>
                <p className="text-gray-400 mt-2">Your stadium is now on PlayEth</p>
              </div>

              <div className="glass rounded-2xl p-6 max-w-md mx-auto text-left space-y-3">
                <p className="text-sm text-gray-400">Your microsite is live at:</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Globe size={16} className="text-green-400" />
                  <code className="text-green-400 font-mono text-sm flex-1">
                    etsmartfields.com/{stadiumName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
                  </code>
                  <ExternalLink size={14} className="text-green-400" />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all flex items-center gap-2">
                  Go to Dashboard <ArrowUpRight size={16} />
                </Link>
                <Link href="/dashboard/microsite" className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                  Edit Microsite <Globe size={16} />
                </Link>
                <Link href="/dashboard/cameras" className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                  Camera Status <Camera size={16} />
                </Link>
              </div>

              <p className="text-xs text-gray-500">Our team will verify your stadium within 24 hours. You&apos;ll receive an SMS notification once approved.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
