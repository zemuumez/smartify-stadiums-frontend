"use client";

import { motion } from "framer-motion";
import { Shield, Camera, Star, Calendar } from "lucide-react";
import { useStadium } from "@/lib/sanity/hooks";

const DEMO_STADIUM_ID = "demo-stadium-1";

export default function MicrositeAbout() {
  const { stadium } = useStadium("bambis-meda");

  const stadiumName = stadium?.name || "Bambis Meda Stadium";
  const stadiumCity = stadium?.city || "Addis Ababa";
  const description = stadium?.description || "One of Addis Ababa's premier football facilities with professional-grade fields and AI-powered camera systems.";
  const rating = stadium?.rating || 4.9;
  const totalBookings = stadium?.totalBookings || 1247;
  const fieldsCount = stadium?.fields?.length || 4;
  const isVerified = stadium?.isVerified ?? true;

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">About Us</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2 mb-6">{stadiumName}</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">{description}</p>
          <p className="text-slate-500 leading-relaxed mb-8">
            Since joining the ET Smart Fields ULS network, we&apos;ve been able to digitize our operations, attract more players
            through online bookings, and provide match replays that our community loves.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {[
              { icon: <Shield className="text-green-600" size={24} />, title: "ULS Verified", desc: "Certified quality and technology standards" },
              { icon: <Camera className="text-green-600" size={24} />, title: "AI Cameras", desc: "Automated match recording and highlights" },
              { icon: <Star className="text-green-600" size={24} />, title: `${rating} Rating`, desc: `Rated by ${totalBookings.toLocaleString()}+ bookings` },
              { icon: <Calendar className="text-green-600" size={24} />, title: "Open 7 Days", desc: stadium?.openingHours || "6 AM - 10 PM daily" },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div><h3 className="font-bold text-slate-900">{item.title}</h3><p className="text-sm text-slate-500">{item.desc}</p></div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Facilities</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { value: fieldsCount, label: "Fields" },
              { value: "2", label: "AI Cameras" },
              { value: "8", label: "Goals" },
              { value: "12", label: "Changing Rooms" },
              { value: "400", label: "Capacity" },
              { value: "24/7", label: "Security" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="text-2xl font-black text-green-700">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
