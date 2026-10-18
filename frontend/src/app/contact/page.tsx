"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, MessageSquare, ArrowRight, Send, CheckCircle2, Building2, AlertCircle } from "lucide-react";
import { SlideIn } from "@/components/ui/AnimatedSection";
import { useI18n } from "@/i18n/provider";
import { authService, supportService } from "@/services";
import { useServiceQuery } from "@/lib/use-service-query";
import { Loading, ServiceErrorMessage } from "@/components/service-state";
import type { SupportCaseCategory } from "@/services/contracts";

export default function ContactPage() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", contact: "", subject: "generalEnquiry", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sentCaseNumber, setSentCaseNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authQuery = useServiceQuery(
    useCallback(async (signal: AbortSignal) => {
      try {
        return await authService.current(signal);
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        const code = (err as { code?: string })?.code;
        if (status === 401 || code === 'unauthorized') {
          return null; // Guest visitor is legitimately unauthenticated
        }
        throw err; // Genuine service/network failure, require honest error & retry
      }
    }, [])
  );

  const account = authQuery.data ?? null;

  const subjectOptions = [
    { id: "generalEnquiry", label: t("generalEnquiry"), category: "general" as SupportCaseCategory },
    { id: "stadiumRegistration", label: t("stadiumRegistration"), category: "general" as SupportCaseCategory },
    { id: "partnershipInvestment", label: t("partnershipInvestment"), category: "general" as SupportCaseCategory },
    { id: "technicalSupport", label: t("technicalSupport"), category: "facility_issue" as SupportCaseCategory },
    { id: "cameraInstallation", label: t("cameraInstallation"), category: "facility_issue" as SupportCaseCategory },
    { id: "mediaPress", label: t("mediaPress"), category: "general" as SupportCaseCategory },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!account) {
      setErrorMessage(t("contactAuthRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const selectedSubj = subjectOptions.find((s) => s.id === form.subject);
      const category = selectedSubj?.category || "general";
      const subjectText = selectedSubj?.label || t("generalEnquiry");
      const messageContent = `${form.message}\n\nSender: ${form.name || account.full_name}\nContact: ${form.contact || account.phone}`;

      const res = await supportService.create({
        category,
        subject: subjectText,
        message: messageContent,
      });

      setSentCaseNumber(res.caseNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error.server");
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f3ef" }}>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="pt-40 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-4">{t("contact")}</div>
            <h1
              className="text-[#111] font-black leading-tight mb-5"
              style={{ fontSize: "clamp(2.4rem, 6vw, 3.8rem)", letterSpacing: "-0.025em" }}
            >
              {t("contact")}
            </h1>
            <p className="text-[#7a7a7a] text-xl max-w-lg leading-relaxed">
              {t("contactSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN GRID ─────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Left — Form */}
            <SlideIn direction="left">
              <div className="photo-card p-8">
                <h2 className="text-xl font-black text-[#111] mb-6">{t("sendMessage")}</h2>

                {authQuery.loading ? (
                  <div className="py-12 flex justify-center">
                    <Loading />
                  </div>
                ) : authQuery.error ? (
                  <div className="py-6">
                    <ServiceErrorMessage error={authQuery.error} retry={authQuery.reload} />
                  </div>
                ) : sentCaseNumber ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 size={48} className="text-[#2d6a4f] mx-auto mb-4" />
                    <h3 className="text-xl font-black text-[#111] mb-2">{t("contactSuccessTitle")}</h3>
                    <p className="text-[#7a7a7a] text-sm max-w-md mx-auto">
                      {t("contactSuccessDesc")} <strong className="text-[#2d6a4f] font-mono font-bold">{sentCaseNumber}</strong>. {t("contactSuccessFollowup")}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        href={account?.role === "owner" ? "/dashboard/support" : "/bookings"}
                        className="px-5 py-2.5 rounded-xl text-white font-bold text-xs"
                        style={{ background: "#2d6a4f" }}
                      >
                        {t("viewSupportCases")}
                      </Link>
                      <button
                        onClick={() => {
                          setSentCaseNumber(null);
                          setForm({ name: "", contact: "", subject: "generalEnquiry", message: "" });
                        }}
                        className="text-xs font-bold underline"
                        style={{ color: "#2d6a4f" }}
                      >
                        {t("sendAnother")}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!account && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed mb-2">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-2">{t("contactAuthRequired")}</p>
                            <Link
                              href="/auth/login"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d6a4f] text-white font-bold text-xs"
                            >
                              {t("signIn")} <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                        {errorMessage}
                      </div>
                    )}

                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        {t("name")}
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t("contactNamePlaceholder")}
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-all"
                        style={{
                          borderColor: "rgba(0,0,0,0.1)",
                          background: "#fafafa",
                          fontSize: "0.875rem",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        {t("contactPhoneEmail")}
                      </label>
                      <input
                        id="contact-phone"
                        type="text"
                        required
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                        placeholder={t("contactPhonePlaceholder")}
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-all"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        {t("contactSubject")}
                      </label>
                      <select
                        id="contact-subject"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none appearance-none"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                      >
                        {subjectOptions.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-bold text-[#3d3d3d] mb-2 uppercase tracking-wide">
                        {t("contactMessage")}
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={t("contactMessagePlaceholder")}
                        className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none resize-none"
                        style={{ borderColor: "rgba(0,0,0,0.1)", background: "#fafafa" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2d6a4f")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.1)")}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50"
                      style={{ background: "#2d6a4f", boxShadow: "0 4px 16px rgba(45,106,79,0.3)" }}
                    >
                      <Send size={16} />
                      {submitting ? t("loading") : t("sendMessage")}
                    </button>
                  </form>
                )}
              </div>
            </SlideIn>


            {/* Right — Info Cards */}
            <SlideIn direction="right" className="space-y-5">
              {/* Contact Info */}
              <div className="photo-card p-7">
                <h3 className="font-black text-[#111] mb-2">{t("directContact")}</h3>
                <p className="text-xs text-[#7a7a7a] mb-5">{t("directContactNotice")}</p>
                <div className="space-y-4">
                  {[
                    { icon: <MapPin size={18} />, label: t("address"), value: "Bole Sub-City, Addis Ababa, Ethiopia" },
                    { icon: <Phone size={18} />, label: t("phone"), value: "+251 911 123 456" },
                    { icon: <Mail size={18} />, label: "Email", value: "support@smartify.et" },
                    { icon: <MessageSquare size={18} />, label: "Telegram / WhatsApp", value: "+251 911 123 456" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#f0faf4", color: "#2d6a4f" }}
                      >
                        {c.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#aaa] uppercase tracking-wide">{c.label}</div>
                        <div className="text-sm font-semibold text-[#111] mt-0.5">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="photo-card p-7">
                <h3 className="font-black text-[#111] mb-4">{t("operatingHours")}</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { day: t("monFri"), hours: t("workHoursWeekday") },
                    { day: t("saturday"), hours: t("workHoursSaturday") },
                    { day: t("sunday"), hours: t("closed") },
                  ].map((h) => (
                    <div key={h.day} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <span className="text-[#7a7a7a]">{h.day}</span>
                      <span className="font-semibold text-[#111]">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stadium Owner CTA */}
              <div
                className="rounded-3xl p-7 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)" }}
              >
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10" style={{ background: "#74c69d" }} />
                <div className="relative z-10">
                  <Building2 size={32} className="text-white mb-4" />
                  <h3 className="font-black text-white text-lg mb-2">{t("owner")}</h3>
                  <p className="text-white/65 text-sm leading-relaxed mb-5">
                    {t("pricingDescription")}
                  </p>
                  <Link
                    href="/auth/register/owner"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: "white", color: "#2d6a4f" }}
                  >
                    {t("partner")} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

    </div>
  );
}
