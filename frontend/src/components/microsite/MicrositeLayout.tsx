"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe, Clock } from "lucide-react";

interface MicrositeLayoutProps {
  stadium: {
    name: string;
    slug: string;
    address: string;
    city: string;
    phone?: string;
    email?: string;
    website?: string;
    operating_hours?: string;
    logo?: string;
  };
  children: ReactNode;
}

export function MicrositeLayout({ stadium, children }: MicrositeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${stadium.slug}`} className="flex items-center gap-3">
              {stadium.logo ? (
                <img src={stadium.logo} alt={stadium.name} className="w-8 h-8 rounded-lg" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm">⚽</span>
                </div>
              )}
              <span className="font-bold text-white">{stadium.name}</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <Link href={`/${stadium.slug}`} className="hover:text-green-400 transition-colors">
                Home
              </Link>
              <Link href={`/${stadium.slug}/fields`} className="hover:text-green-400 transition-colors">
                Fields
              </Link>
              <Link href={`/${stadium.slug}/matches`} className="hover:text-green-400 transition-colors">
                Matches
              </Link>
              <Link href={`/${stadium.slug}/contact`} className="hover:text-green-400 transition-colors">
                Contact
              </Link>
            </div>
            <Link
              href={`/${stadium.slug}/book`}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-bold"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {stadium.logo ? (
                  <img src={stadium.logo} alt={stadium.name} className="w-10 h-10 rounded-lg" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚽</span>
                  </div>
                )}
                <span className="font-bold text-white">{stadium.name}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-green-400" />
                  <span>{stadium.address}, {stadium.city}</span>
                </div>
                {stadium.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-green-400" />
                    <span>{stadium.phone}</span>
                  </div>
                )}
                {stadium.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-green-400" />
                    <span>{stadium.email}</span>
                  </div>
                )}
                {stadium.operating_hours && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-400" />
                    <span>{stadium.operating_hours}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={`/${stadium.slug}/fields`} className="hover:text-green-400">Fields & Pricing</Link></li>
                <li><Link href={`/${stadium.slug}/matches`} className="hover:text-green-400">Match Replays</Link></li>
                <li><Link href={`/${stadium.slug}/book`} className="hover:text-green-400">Book Now</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Powered By</h4>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm">⚽</span>
                </div>
                <div>
                  <span className="font-bold text-white text-sm">Play</span>
                  <span className="font-bold text-yellow-400 text-sm ml-1">Ethiopia</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                ULS Verified Stadium<br />
                Powered by ET Smart Fields Platform
              </p>
            </div>
          </div>
          <div className="section-divider mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 {stadium.name}. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-green-400">Privacy</Link>
              <Link href="/terms" className="hover:text-green-400">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
