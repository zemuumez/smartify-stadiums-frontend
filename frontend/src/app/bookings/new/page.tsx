"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  Zap,
  CreditCard,
  CheckCircle2,
  Video,
  Users,
  Shield,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Building2,
  Lock,
  Share2,
  Download,
  Ticket,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FadeUp } from "@/components/ui/AnimatedSection";

// ─── Demo Data ────────────────────────────────────────────────────────────────

const demoStadium = {
  id: "1",
  name: "Bambis Meda Stadium",
  slug: "bambis-meda",
  address: "Bole Road, Addis Ababa",
  fields: [
    { id: "f1", name: "Field 1", surface: "Artificial Turf", hourlyRate: 2500, hasLighting: true },
    { id: "f2", name: "Field 2", surface: "Natural Grass", hourlyRate: 1800, hasLighting: true },
    { id: "f3", name: "Field 3 (Small)", surface: "Artificial Turf", hourlyRate: 1200, hasLighting: false },
  ],
};

const extras = [
  { id: "video", label: "Full Match Video", desc: "AI-captured full match recording", price: 500, icon: Video, popular: true },
  { id: "highlights", label: "Auto Highlights", desc: "AI-generated 5-min highlight reel", price: 300, icon: Star, popular: false },
  { id: "referee", label: "Certified Referee", desc: "Licensed referee for your match", price: 800, icon: Shield, popular: true },
  { id: "drone", label: "Drone Aerial View", desc: "Overhead drone footage", price: 1200, icon: Zap, popular: false },
];

const paymentMethods = [
  { id: "telebirr", label: "Telebirr", icon: "📱", desc: "Pay with Telebirr mobile wallet", color: "from-green-500 to-emerald-600" },
  { id: "cbe", label: "CBE Birr", icon: "🏦", desc: "Commercial Bank of Ethiopia", color: "from-blue-500 to-cyan-600" },
  { id: "card", label: "Credit/Debit Card", icon: "💳", desc: "Visa, Mastercard, Amex", color: "from-purple-500 to-pink-600" },
  { id: "cash", label: "Pay at Stadium", icon: "💵", desc: "Pay when you arrive", color: "from-yellow-500 to-orange-500" },
];

// ─── Helper: generate calendar days ───────────────────────────────────────────

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: { day: number; date: Date; isToday: boolean; isPast: boolean }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fill leading empty slots
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: 0, date: new Date(), isToday: false, isPast: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    days.push({
      day: d,
      date,
      isToday: date.getTime() === today.getTime(),
      isPast: date < today,
    });
  }

  return days;
}

function generateTimeSlots(startTime: string, endTime: string, bookedSlots: string[]) {
  const slots: string[] = [];
  let [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  while (sh < eh || (sh === eh && sm < em)) {
    slots.push(`${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`);
    sm += 60;
    if (sm >= 60) { sh++; sm -= 60; }
  }
  return slots;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewBookingPage() {
  const [step, setStep] = useState(0);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const calendarDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);

  const selectedFieldData = demoStadium.fields.find((f) => f.id === selectedField);

  const bookedSlots = ["10:00", "14:00", "16:00"]; // demo
  const timeSlots = selectedFieldData
    ? generateTimeSlots("06:00", selectedFieldData.hasLighting ? "22:00" : "18:00", bookedSlots)
    : [];

  const calculateTotal = () => {
    const fieldCost = selectedFieldData ? selectedFieldData.hourlyRate : 0;
    const extrasCost = extras.filter((e) => selectedExtras.includes(e.id)).reduce((sum, e) => sum + e.price, 0);
    return fieldCost + extrasCost;
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const handleBook = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    setBookingId("BK-" + Math.random().toString(36).substring(2, 10).toUpperCase());
    setIsBooked(true);
    setIsProcessing(false);
    setStep(4);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const steps = [
    { label: "Field & Date", icon: Calendar },
    { label: "Time Slot", icon: Clock },
    { label: "Extras", icon: Zap },
    { label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/stadiums" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Book a Field</h1>
            <p className="text-xs text-gray-400">{demoStadium.name}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <div key={i} className="flex-1 flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    isCompleted ? "bg-green-500 text-white" : isActive ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-white/5 text-gray-500"
                  }`}>
                    {isCompleted ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-green-400" : isCompleted ? "text-white" : "text-gray-500"}`}>
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-green-500" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* ─── Step 0: Field & Date ──────────────────────────────── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
              {/* Field Selection */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Select Field</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {demoStadium.fields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedField(f.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedField === f.id
                          ? "bg-green-500/10 border-green-500/40 ring-1 ring-green-500/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <p className="font-bold text-white">{f.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{f.surface} · {f.hasLighting ? "🌙 Lights" : "☀️ Day"}</p>
                      <p className="text-lg font-bold text-green-400 mt-2">{f.hourlyRate.toLocaleString()} <span className="text-xs text-gray-400">ETB/hr</span></p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Select Date</h2>
                <GlowCard className="!p-0 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                    <h3 className="font-bold text-white">{monthNames[calMonth]} {calYear}</h3>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames.map((d) => (
                        <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((d, i) => {
                        if (d.day === 0) return <div key={`empty-${i}`} />;
                        const isSelected = selectedDate && d.date.getTime() === selectedDate.getTime();
                        return (
                          <button
                            key={i}
                            onClick={() => !d.isPast && setSelectedDate(d.date)}
                            disabled={d.isPast}
                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                              d.isPast ? "text-gray-700 cursor-not-allowed" :
                              isSelected ? "bg-green-500 text-white shadow-lg shadow-green-500/30" :
                              d.isToday ? "bg-green-500/20 text-green-400" :
                              "text-white hover:bg-white/10"
                            }`}
                          >
                            {d.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </GlowCard>
              </div>

              <div className="flex justify-end">
                <MagneticButton
                  onClick={() => setStep(1)}
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                >
                  Continue
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {/* ─── Step 1: Time Slot ────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Select Time Slot</h2>
                <p className="text-gray-400 text-sm">
                  {selectedFieldData?.name} · {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedSlot === slot;
                  const hour = parseInt(slot.split(":")[0]);
                  const isNight = hour >= 18;
                  return (
                    <button
                      key={slot}
                      onClick={() => !isBooked && setSelectedSlot(slot)}
                      disabled={isBooked}
                      className={`relative p-3 rounded-xl text-center transition-all ${
                        isBooked ? "bg-white/5 text-gray-600 cursor-not-allowed line-through" :
                        isSelected ? "bg-green-500 text-white shadow-lg shadow-green-500/30" :
                        "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <span className="text-sm font-bold">{slot}</span>
                      {isNight && selectedFieldData?.hasLighting && !isBooked && (
                        <span className="absolute top-1 right-1 text-[8px]">🌙</span>
                      )}
                      {isBooked && <span className="text-[10px] block text-gray-600 mt-0.5">Booked</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white/5 border border-white/10" /> Available</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Selected</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white/5 line-through" /> Booked</span>
              </div>

              <div className="flex justify-between">
                <MagneticButton onClick={() => setStep(0)} variant="ghost" size="md" icon={<ArrowLeft size={16} />}>Back</MagneticButton>
                <MagneticButton onClick={() => setStep(2)} variant="primary" size="lg" icon={<ArrowRight size={18} />}>Continue</MagneticButton>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Extras ───────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Add Extras</h2>
                <p className="text-gray-400 text-sm">Enhance your booking with additional services</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extras.map((extra) => {
                  const Icon = extra.icon;
                  const isSelected = selectedExtras.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra.id)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-green-500/10 border-green-500/40 ring-1 ring-green-500/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {extra.popular && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded-full border border-yellow-500/20">Popular</span>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-green-500/20" : "bg-white/5"}`}>
                          <Icon size={20} className={isSelected ? "text-green-400" : "text-gray-400"} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white">{extra.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{extra.desc}</p>
                          <p className="text-sm font-bold text-green-400 mt-2">+{extra.price.toLocaleString()} ETB</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "bg-green-500 border-green-500" : "border-gray-600"
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <MagneticButton onClick={() => setStep(1)} variant="ghost" size="md" icon={<ArrowLeft size={16} />}>Back</MagneticButton>
                <MagneticButton onClick={() => setStep(3)} variant="primary" size="lg" icon={<ArrowRight size={18} />}>Continue</MagneticButton>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Payment ──────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
              {/* Booking Summary */}
              <GlowCard>
                <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stadium</span>
                    <span className="text-white font-medium">{demoStadium.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Field</span>
                    <span className="text-white font-medium">{selectedFieldData?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white font-medium">{selectedDate?.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white font-medium">{selectedSlot} - {(() => {
                      if (!selectedSlot) return "";
                      const [h, m] = selectedSlot.split(":").map(Number);
                      return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                    })()}</span>
                  </div>
                  {selectedExtras.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-2">Extras</p>
                      {extras.filter((e) => selectedExtras.includes(e.id)).map((e) => (
                        <div key={e.id} className="flex justify-between text-sm">
                          <span className="text-gray-400">{e.label}</span>
                          <span className="text-white">+{e.price.toLocaleString()} ETB</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-2xl font-bold text-green-400">{calculateTotal().toLocaleString()} <span className="text-sm text-gray-400">ETB</span></span>
                  </div>
                </div>
              </GlowCard>

              {/* Payment Methods */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === pm.id
                          ? "bg-green-500/10 border-green-500/40 ring-1 ring-green-500/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-2xl">{pm.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white">{pm.label}</p>
                        <p className="text-xs text-gray-400">{pm.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === pm.id ? "bg-green-500 border-green-500" : "border-gray-600"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock size={12} />
                <span>Payments are encrypted and processed securely by Chapa</span>
              </div>

              <div className="flex justify-between">
                <MagneticButton onClick={() => setStep(2)} variant="ghost" size="md" icon={<ArrowLeft size={16} />}>Back</MagneticButton>
                <MagneticButton
                  onClick={handleBook}
                  variant="primary"
                  size="lg"
                  icon={isProcessing ? undefined : <Check size={18} />}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Confirm & Pay"
                  )}
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: Confirmation ─────────────────────────────── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <CheckCircle2 size={48} className="text-white" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-white">Booking Confirmed! 🎉</h2>
                <p className="text-gray-400 mt-2">Your field has been booked successfully</p>
              </div>

              <GlowCard className="max-w-md mx-auto text-left">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Booking ID</span>
                    <span className="text-white font-mono font-bold">{bookingId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Field</span>
                    <span className="text-white">{selectedFieldData?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white">{selectedDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Extras</span>
                    <span className="text-white">{selectedExtras.length > 0 ? extras.filter((e) => selectedExtras.includes(e.id)).map((e) => e.label).join(", ") : "None"}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between">
                    <span className="text-white font-bold">Paid</span>
                    <span className="text-green-400 font-bold">{calculateTotal().toLocaleString()} ETB</span>
                  </div>
                </div>
              </GlowCard>

              <div className="flex flex-wrap justify-center gap-3">
                <MagneticButton variant="primary" size="md" icon={<Ticket size={16} />}>
                  View My Bookings
                </MagneticButton>
                <MagneticButton variant="outline" size="md" icon={<Share2 size={16} />}>
                  Share
                </MagneticButton>
                <MagneticButton variant="ghost" size="md" icon={<Download size={16} />}>
                  Download Receipt
                </MagneticButton>
              </div>

              <Link href="/stadiums" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Back to Stadiums
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
