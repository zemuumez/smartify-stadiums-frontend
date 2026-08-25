"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api, { Booking } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import {
  Calendar, Clock, Loader2, CheckCircle2, XCircle,
  AlertCircle, ChevronLeft, CreditCard, ArrowRight,
  Shield, MapPin, Zap
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/ui/AnimatedSection";

function BookingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data.data || []);
    } catch (error) {
      // Demo data
      setBookings([
        {
          id: "500",
          field_id: "Field 1 — FIFA Artificial Turf",
          stadium_id: "Bambis Meda Stadium",
          player_id: user?.id || "p1",
          booking_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          start_time: new Date(Date.now() + 86400000 + 36000000).toISOString(),
          end_time: new Date(Date.now() + 86400000 + 40000000).toISOString(),
          status: "confirmed",
          total_cents: 120000,
          payment_status: "paid",
          notes: "Addis Stars vs Bambis XI scrimmage",
          created_at: new Date().toISOString(),
        },
        {
          id: "501",
          field_id: "Court 1 — Basketball",
          stadium_id: "Unity Sports Complex",
          player_id: user?.id || "p1",
          booking_date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          start_time: new Date(Date.now() + 172800000 + 50400000).toISOString(),
          end_time: new Date(Date.now() + 172800000 + 57600000).toISOString(),
          status: "pending",
          total_cents: 60000,
          payment_status: "unpaid",
          notes: "3v3 practice session",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (booking: Booking) => {
    try {
      const response = await api.post("/payments", {
        amount_cents: booking.total_cents,
        payment_method: "telebirr",
        description: `Booking at field ${booking.field_id}`,
        booking_id: booking.id,
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      alert("Opening Telebirr / Chapa payment gateway...");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const isPast = new Date(booking.end_time) < new Date();
    return activeTab === "past" ? isPast : !isPast;
  });

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "confirmed" && paymentStatus === "paid") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "#2d6a4f" }}>
          <CheckCircle2 size={12} /> Confirmed &amp; Paid
        </span>
      );
    }
    if (status === "pending" || paymentStatus === "unpaid") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#fffbeb", color: "#b45309" }}>
          <AlertCircle size={12} /> Awaiting Payment
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#fee2e2", color: "#dc2626" }}>
        <XCircle size={12} /> Cancelled
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-36 pb-24" style={{ backgroundColor: "#f4f3ef" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f] mb-1">Player Dashboard</div>
            <h1 className="heading-xl">My Field Reservations</h1>
          </div>
          <Link
            href="/stadiums"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 self-start sm:self-auto"
            style={{ background: "#2d6a4f", boxShadow: "0 4px 14px rgba(45,106,79,0.3)" }}
          >
            <Calendar size={14} /> Book New Field
          </Link>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "upcoming"
                ? "bg-[#2d6a4f] text-white shadow-md"
                : "bg-white text-[#5a5a5a] hover:bg-[#eae8e1]"
            }`}
          >
            Upcoming Matches
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "past"
                ? "bg-[#2d6a4f] text-white shadow-md"
                : "bg-white text-[#5a5a5a] hover:bg-[#eae8e1]"
            }`}
          >
            Past Replays &amp; Matches
          </button>
        </div>

        {/* ── BOOKINGS LIST ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="photo-card p-8 animate-pulse">
                <div className="h-5 bg-[#eae8e1] rounded w-1/3 mb-4" />
                <div className="h-4 bg-[#eae8e1] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="photo-card p-12 text-center max-w-md mx-auto">
            <Calendar size={36} className="text-[#2d6a4f] mx-auto mb-3" />
            <h3 className="text-xl font-black text-[#111] mb-2">No {activeTab} bookings found</h3>
            <p className="text-[#7a7a7a] text-sm mb-6 max-w-sm mx-auto">
              You don&apos;t have any {activeTab} field slots. Browse verified stadiums across Ethiopia and reserve a pitch.
            </p>
            <Link
              href="/stadiums"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white text-xs font-bold"
              style={{ background: "#2d6a4f" }}
            >
              Browse Sports Fields <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <StaggerChildren className="space-y-4">
            {filteredBookings.map((booking) => (
              <StaggerItem key={booking.id}>
                <div className="photo-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {getStatusBadge(booking.status, booking.payment_status)}
                      <span className="text-xs text-[#7a7a7a] font-semibold">
                        ID: #{booking.id}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#111] mb-1">
                      {booking.stadium_id}
                    </h3>
                    <p className="text-xs text-[#7a7a7a] mb-4 font-medium">
                      {booking.field_id}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#fafafa]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#8a8a8a]">Date</div>
                        <div className="text-xs font-bold text-[#111] mt-0.5">{booking.booking_date}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#8a8a8a]">Time Slot</div>
                        <div className="text-xs font-bold text-[#111] mt-0.5">
                          {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#8a8a8a]">Total Amount</div>
                        <div className="text-xs font-black text-[#2d6a4f] mt-0.5">
                          {(booking.total_cents / 100).toLocaleString()} ETB
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-[#8a8a8a] mt-3 italic">
                        Note: &ldquo;{booking.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-black/[0.06]">
                    {booking.payment_status !== "paid" ? (
                      <button
                        onClick={() => handlePayment(booking)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold transition-all hover:opacity-90"
                        style={{ background: "#2d6a4f", boxShadow: "0 4px 12px rgba(45,106,79,0.25)" }}
                      >
                        <CreditCard size={14} /> Pay via Telebirr
                      </button>
                    ) : (
                      <Link
                        href={`/microsite/matches`}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f] hover:bg-[#e1f5ec] transition-colors"
                      >
                        <Zap size={13} /> View AI Match Replay
                      </Link>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f4f3ef" }}>
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
