"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Shield, KeyRound, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function SuperAdminLoginPage() {
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setDemoUser } = useAuthStore();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // SuperAdmin Passkey or quick PIN
    if (adminKey.trim() === "etsf-admin" || adminKey.trim() === "123456" || adminKey.trim() === "admin") {
      setDemoUser("admin");
      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } else {
      setTimeout(() => {
        setError("Invalid SuperAdmin Key. Access is restricted to platform operators.");
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#111] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-black/[0.06]">

        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
            style={{ background: "#1a4731" }}
          >
            <Shield size={28} className="text-[#74c69d]" />
          </div>
          <div className="flex items-baseline justify-center gap-0.5 mb-1">
            <span className="text-xl font-black text-[#111]">ET</span>
            <span className="text-xl font-black text-[#2d6a4f]">Smart Fields</span>
          </div>
          <h1 className="text-lg font-black text-[#111]">SuperAdmin Control Gateway</h1>
          <p className="text-xs text-[#7a7a7a] mt-1">
            Restricted portal for nationwide stadium &amp; field registry governance
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111] uppercase tracking-wider mb-1.5">
              SuperAdmin Security Key / Master PIN
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter master key (e.g. 123456)"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f3ef] border border-black/10 text-xs font-semibold text-[#111] focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            style={{ background: "#1a4731" }}
          >
            {loading ? "Authenticating..." : "Access Platform Console"} <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-black/[0.06] text-center">
          <div className="text-[11px] text-[#8a8a8a]">
            Default Demo Master Key: <code className="font-mono font-bold text-[#2d6a4f]">123456</code> or <code className="font-mono font-bold text-[#2d6a4f]">admin</code>
          </div>
        </div>

      </div>
    </div>
  );
}
