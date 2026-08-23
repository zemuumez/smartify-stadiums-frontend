"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Lightbulb, Shirt, ArrowRight } from "lucide-react";
import { useStadium, useFields } from "@/lib/sanity/hooks";

const DEMO_STADIUM_ID = "demo-stadium-1";

const SURFACE_LABELS: Record<string, string> = {
  "artificial-turf": "Artificial Turf",
  "natural-grass": "Natural Grass",
  "hard-court": "Hard Court",
  hybrid: "Hybrid",
};

export default function MicrositeFields() {
  const { stadium } = useStadium("bambis-meda");
  const { fields } = useFields(stadium?._id || DEMO_STADIUM_ID);

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">Our Fields</span>
          <h1 className="text-4xl font-black text-slate-900 mt-2">Choose Your Field</h1>
          <p className="text-slate-500 mt-2">{fields.length} fields available for booking. Prices per hour.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {fields.map((field, i) => (
            <motion.div key={field._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-6xl">🟢</div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{field.name}</h3>
                  <span className="text-2xl font-black text-green-600">₮{field.pricePerHour}<span className="text-sm font-normal text-slate-500">/hr</span></span>
                </div>
                <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
                  <span>{SURFACE_LABELS[field.surface] || field.surface}</span><span>•</span><span>{field.size}</span>
                </div>
                <div className="flex gap-2 mb-4">
                  {field.hasLighting && <span className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg"><Lightbulb size={12} /> Lighting</span>}
                  {field.hasChangingRoom && <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg"><Shirt size={12} /> Changing Room</span>}
                  <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg"><Zap size={12} /> {SURFACE_LABELS[field.surface] || field.surface}</span>
                </div>
                <Link href="/bookings/new" className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                  Book Now <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
