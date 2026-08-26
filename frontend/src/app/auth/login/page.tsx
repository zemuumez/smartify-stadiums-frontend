"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Phone, KeyRound, ArrowRight, ArrowLeft, Shield, Zap, CheckCircle2, User, Building2, Sparkles, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("0911234567");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { requestOTP, login, setDemoUser } = useAuthStore();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestOTP(phone);
      setStep("otp");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(phone, otp);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: "player" | "owner") => {
    setDemoUser(role);
    router.push(role === "owner" ? "/dashboard" : "/stadiums");
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 relative" style={{ backgroundColor: "#f4f3ef" }}>

      {/* Subtle background ambient elements */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40" style={{ background: "#d8f3dc" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40" style={{ background: "#b7e4c7" }} />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl p-8 sm:p-9 shadow-2xl border border-black/[0.06]"
        >
          {/* Logo & Brand Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <Image
                src="/logo/et-smart-fields-icon.jpg"
                alt="ET Smart Fields"
                width={40}
                height={40}
                className="rounded-xl object-cover"
                priority
              />
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-black text-[#111]">ET</span>
                <span className="text-xl font-black text-[#2d6a4f]">Smart Fields</span>
              </div>
            </Link>

            <h1 className="text-2xl font-black text-[#111] mb-1.5 tracking-tight">
              {step === "phone" ? "Welcome Back" : "Enter Verification Code"}
            </h1>
            <p className="text-xs text-[#7a7a7a]">
              {step === "phone"
                ? "Sign in with your Ethiopian mobile number"
                : `We sent a 6-digit code to ${phone}`}
            </p>
          </div>

          {/* Demo Login Credentials Box */}
          <div className="mb-6 p-4 rounded-2xl bg-[#f0faf4] border border-[#2d6a4f]/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] mb-1.5">
              <Sparkles size={14} /> Demo Login Credentials:
            </div>
            <div className="text-xs text-[#3d3d3d] space-y-0.5 font-mono">
              <div>Phone: <span className="font-bold text-[#111]">0911234567</span></div>
              <div>Password / Code: <span className="font-bold text-[#111]">123456</span></div>
            </div>

            {/* 1-Click Fast Login Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#2d6a4f]/15">
              <button
                type="button"
                onClick={() => handleQuickDemo("player")}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white border border-[#2d6a4f]/30 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#2d6a4f] hover:text-white transition-all shadow-sm"
              >
                <User size={12} /> 1-Click Player
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("owner")}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#2d6a4f] text-white text-[11px] font-bold hover:bg-[#1a4731] transition-all shadow-sm"
              >
                <Building2 size={12} /> 1-Click Owner
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                onSubmit={handleRequestOtp}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-[#111] mb-2 uppercase tracking-wider">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2d6a4f]" size={17} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0911234567"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f4f3ef] border border-black/10 rounded-2xl text-sm font-semibold text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#2d6a4f] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-xs font-semibold">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full py-4 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: "#2d6a4f" }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Login Code
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[#111] uppercase tracking-wider">
                      Verification Code (OTP)
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-xs text-[#2d6a4f] font-bold hover:underline"
                    >
                      Change Number
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2d6a4f]" size={17} />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                      autoFocus
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f4f3ef] border border-black/10 rounded-2xl text-base font-mono font-bold tracking-widest text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#2d6a4f] focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#7a7a7a] mt-1.5">Enter <span className="font-bold text-[#111]">123456</span> for demo access</p>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-xs font-semibold">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || !otp}
                  className="w-full py-4 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: "#2d6a4f" }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify &amp; Sign In
                      <ArrowUpRight size={16} />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-black/[0.06] text-center space-y-2">
            <p className="text-xs text-[#7a7a7a]">
              Don&apos;t have an account yet?{" "}
              <Link href="/auth/register/owner" className="font-bold text-[#2d6a4f] hover:underline">
                Sign up free
              </Link>
            </p>
            <p className="text-xs text-[#7a7a7a]">
              Are you a venue owner?{" "}
              <Link href="/auth/register/owner" className="font-bold text-[#2d6a4f] hover:underline">
                Register your stadium
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
