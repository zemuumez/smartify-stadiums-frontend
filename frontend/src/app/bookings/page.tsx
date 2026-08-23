"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { Booking } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { 
  Calendar, Clock, Loader2, CheckCircle, XCircle, 
  AlertCircle, ChevronLeft, CreditCard
} from "lucide-react";

function BookingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Check if this is a new booking flow
  const fieldId = searchParams.get("field");
  const startTime = searchParams.get("start");
  const endTime = searchParams.get("end");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      // Demo data
      setBookings([
        {
          id: "500",
          field_id: "200",
          stadium_id: "1",
          player_id: user?.id || "",
          booking_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          start_time: new Date(Date.now() + 86400000 + 36000000).toISOString(),
          end_time: new Date(Date.now() + 86400000 + 40000000).toISOString(),
          status: "confirmed",
          total_cents: 50000,
          payment_status: "paid",
          notes: "Team practice",
          created_at: new Date().toISOString(),
        },
        {
          id: "501",
          field_id: "202",
          stadium_id: "2",
          player_id: user?.id || "",
          booking_date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          start_time: new Date(Date.now() + 172800000 + 50400000).toISOString(),
          end_time: new Date(Date.now() + 172800000 + 57600000).toISOString(),
          status: "pending",
          total_cents: 150000,
          payment_status: "unpaid",
          notes: "League match",
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
      
      // Redirect to Chapa checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment initialization failed. Please try again.");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const isPast = new Date(booking.end_time) < new Date();
    return activeTab === "past" ? isPast : !isPast;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="text-green-600" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-600" size={20} />;
      case "pending":
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/stadiums" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeft size={20} />
            Back to Stadiums
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your field bookings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "upcoming"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "past"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Past
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg mb-4">
              No {activeTab} bookings
            </p>
            <Link
              href="/stadiums"
              className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800"
            >
              Find a Stadium
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(booking.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.payment_status !== "paid" && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          Payment {booking.payment_status}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">{booking.booking_date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">
                          {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-medium text-green-700">
                          {(booking.total_cents / 100).toLocaleString()} ETB
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Booking ID</p>
                        <p className="font-medium text-gray-600">#{booking.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <p className="text-sm text-gray-500 mt-2">Note: {booking.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {booking.status === "pending" && booking.payment_status !== "paid" && (
                      <button
                        onClick={() => handlePayment(booking)}
                        className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
                      >
                        <CreditCard size={16} />
                        Pay Now
                      </button>
                    )}
                    {booking.status === "confirmed" && (
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
