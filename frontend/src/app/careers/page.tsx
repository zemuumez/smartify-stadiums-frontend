"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";

export default function CareersPage() {
  const jobs = [
    { title: "Senior Go Backend Engineer", location: "Addis Ababa", type: "Full-time", team: "Engineering" },
    { title: "React/Next.js Frontend Developer", location: "Addis Ababa", type: "Full-time", team: "Engineering" },
    { title: "DevOps Engineer", location: "Remote", type: "Full-time", team: "Infrastructure" },
    { title: "Field Operations Specialist", location: "Addis Ababa", type: "Full-time", team: "Operations" },
    { title: "Product Designer", location: "Addis Ababa / Remote", type: "Full-time", team: "Design" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">Careers</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-4 mb-6">
              Build the Future of <span className="gradient-text">Football</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl">Join our team and help digitize Ethiopia&apos;s football infrastructure.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {jobs.map((job, i) => (
            <motion.div key={job.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:shadow-md transition-all group">
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{job.type}</span>
                    <span className="flex items-center gap-1"><Briefcase size={14} />{job.team}</span>
                  </div>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-green-600 transition-colors" size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
