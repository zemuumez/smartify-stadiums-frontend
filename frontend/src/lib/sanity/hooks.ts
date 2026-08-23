"use client";

import { useState, useEffect, useCallback } from "react";
import { sanityClient, queries } from "./client";
import type {
  SanityStadium,
  SanityEvent,
  SanityHighlight,
  SanityTestimonial,
  SanityMatch,
  SanityField,
  SanityService,
} from "./types";

// Demo fallback data when Sanity is not configured
const DEMO_STADIUM: SanityStadium = {
  _id: "demo-stadium-1",
  name: "Bambis Meda Stadium",
  slug: { current: "bambis-meda" },
  city: "Addis Ababa",
  address: "Bole Road, Bole Sub City, Addis Ababa, Ethiopia",
  description:
    "Bambis Meda Stadium is one of Addis Ababa's premier football facilities. We offer 4 professional-grade fields with state-of-the-art lighting, artificial turf, and AI-powered camera systems.",
  phone: "+251 911 234 567",
  email: "info@bambismeda.etsmartfields.com",
  rating: 4.9,
  totalBookings: 1247,
  primaryColor: "#16a34a",
  isActive: true,
  isVerified: true,
  openingHours: "Mon-Sun: 6:00 AM - 10:00 PM",
  fields: [
    { _id: "f1", name: "Field A", surface: "artificial-turf", size: "100m x 64m", pricePerHour: 800, hasLighting: true, hasChangingRoom: true, isActive: true },
    { _id: "f2", name: "Field B", surface: "natural-grass", size: "100m x 64m", pricePerHour: 600, hasLighting: true, hasChangingRoom: true, isActive: true },
    { _id: "f3", name: "Field C", surface: "artificial-turf", size: "80m x 50m", pricePerHour: 500, hasLighting: true, hasChangingRoom: false, isActive: true },
    { _id: "f4", name: "Field D", surface: "hard-court", size: "60m x 40m", pricePerHour: 300, hasLighting: false, hasChangingRoom: true, isActive: true },
  ],
  events: [
    { _id: "e1", title: "Friday Night League", description: "Weekly 7-a-side league", startDate: "2026-08-29", time: "7:00 PM", spotsLeft: 8, eventType: "league" },
    { _id: "e2", title: "Youth Tournament", description: "Under-16 tournament", startDate: "2026-08-30", time: "2:00 PM", spotsLeft: 16, eventType: "youth" },
    { _id: "e3", title: "Corporate Cup", description: "Annual corporate football tournament", startDate: "2026-09-15", time: "10:00 AM", spotsLeft: 12, eventType: "corporate" },
  ],
  highlights: [
    { _id: "h1", title: "Goal of the Month", player: "Abebe K.", description: "Incredible long-range strike from 35 meters", votes: 342, highlightType: "goal" },
    { _id: "h2", title: "Best Save", player: "Dawit M.", description: "Penalty save in the 90th minute", votes: 218, highlightType: "save" },
    { _id: "h3", title: "Skill of the Week", player: "Yonas T.", description: "Solo run beating 4 defenders", votes: 189, highlightType: "skill" },
  ],
  testimonials: [
    { _id: "t1", name: "Abebe K.", text: "Best artificial turf in Addis. The camera system is incredible — we can rewatch every goal!", rating: 5, role: "Player" },
    { _id: "t2", name: "Fatuma A.", text: "Clean facilities, fair prices, and the microsite makes it easy to book. Highly recommended.", rating: 5, role: "Player" },
    { _id: "t3", name: "Daniel T.", text: "We hold our team practices here weekly. The lighting is perfect for evening sessions.", rating: 4, role: "Team Captain" },
  ],
  matches: [
    { _id: "m1", homeTeam: "Addis Stars", awayTeam: "Lion City FC", homeScore: 3, awayScore: 2, date: "2026-08-20", field: "Field A", hasReplay: true },
    { _id: "m2", homeTeam: "Bambis XI", awayTeam: "Bole United", homeScore: 1, awayScore: 1, date: "2026-08-18", field: "Field B", hasReplay: true },
    { _id: "m3", homeTeam: "Holy City FC", awayTeam: "Addis Stars", homeScore: 0, awayScore: 2, date: "2026-08-15", field: "Field A", hasReplay: true },
    { _id: "m4", homeTeam: "Lion City FC", awayTeam: "Bambis XI", homeScore: 4, awayScore: 1, date: "2026-08-12", field: "Field A", hasReplay: false },
  ],
  services: [
    { _id: "s1", name: "AI Match Recording", description: "Automated camera system records every match with AI-powered key moment detection.", icon: "camera" },
    { _id: "s2", name: "Match Replays", description: "Watch full match replays or auto-generated highlights. Available within minutes.", icon: "video" },
    { _id: "s3", name: "Tournament Hosting", description: "We organize and host tournaments, leagues, and corporate events.", icon: "trophy" },
    { _id: "s4", name: "Team Registration", description: "Register your team, manage rosters, and track your league performance.", icon: "users" },
    { _id: "s5", name: "Certified Referees", description: "Professional referees available for league matches and tournaments.", icon: "shield" },
    { _id: "s6", name: "Free WiFi", description: "High-speed WiFi available throughout the facility for players and spectators.", icon: "wifi" },
  ],
};

function isConfigured(): boolean {
  return (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== undefined &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "demo-project"
  );
}

// Hook to fetch stadium data
export function useStadium(slug: string) {
  const [stadium, setStadium] = useState<SanityStadium | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStadium() {
      if (!isConfigured()) {
        // Use demo data
        setStadium(DEMO_STADIUM);
        setLoading(false);
        return;
      }

      try {
        const data = await sanityClient.fetch(queries.stadiumBySlug, { slug });
        setStadium(data || DEMO_STADIUM);
      } catch (err) {
        console.error("Sanity fetch error:", err);
        setStadium(DEMO_STADIUM);
      } finally {
        setLoading(false);
      }
    }

    fetchStadium();
  }, [slug]);

  return { stadium, loading, error };
}

// Hook to fetch events
export function useEvents(stadiumId: string) {
  const [events, setEvents] = useState<SanityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      if (!isConfigured()) {
        setEvents(DEMO_STADIUM.events || []);
        setLoading(false);
        return;
      }

      try {
        const data = await sanityClient.fetch(queries.stadiumEvents, { stadiumId });
        setEvents(data?.length ? data : DEMO_STADIUM.events || []);
      } catch {
        setEvents(DEMO_STADIUM.events || []);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [stadiumId]);

  return { events, loading };
}

// Hook to fetch highlights
export function useHighlights(stadiumId: string) {
  const [highlights, setHighlights] = useState<SanityHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHighlights() {
      if (!isConfigured()) {
        setHighlights(DEMO_STADIUM.highlights || []);
        setLoading(false);
        return;
      }

      try {
        const data = await sanityClient.fetch(queries.stadiumHighlights, { stadiumId });
        setHighlights(data?.length ? data : DEMO_STADIUM.highlights || []);
      } catch {
        setHighlights(DEMO_STADIUM.highlights || []);
      } finally {
        setLoading(false);
      }
    }

    fetchHighlights();
  }, [stadiumId]);

  return { highlights, loading };
}

// Hook to fetch testimonials
export function useTestimonials(stadiumId: string) {
  const [testimonials, setTestimonials] = useState<SanityTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      if (!isConfigured()) {
        setTestimonials(DEMO_STADIUM.testimonials || []);
        setLoading(false);
        return;
      }

      try {
        const data = await sanityClient.fetch(queries.stadiumTestimonials, { stadiumId });
        setTestimonials(data?.length ? data : DEMO_STADIUM.testimonials || []);
      } catch {
        setTestimonials(DEMO_STADIUM.testimonials || []);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, [stadiumId]);

  return { testimonials, loading };
}

// Hook to fetch matches
export function useMatches(stadiumId: string) {
  const [matches, setMatches] = useState<SanityMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      if (!isConfigured()) {
        setMatches(DEMO_STADIUM.matches || []);
        setLoading(false);
        return;
      }

      try {
        const data = await sanityClient.fetch(queries.stadiumMatches, { stadiumId });
        setMatches(data?.length ? data : DEMO_STADIUM.matches || []);
      } catch {
        setMatches(DEMO_STADIUM.matches || []);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [stadiumId]);

  return { matches, loading };
}

// Hook to fetch fields
export function useFields(stadiumId: string) {
  const [fields, setFields] = useState<SanityField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFields() {
      if (!isConfigured()) {
        setFields(DEMO_STADIUM.fields || []);
        setLoading(false);
        return;
      }

      try {
        const data = await sanityClient.fetch(queries.stadiumFields, { stadiumId });
        setFields(data?.length ? data : DEMO_STADIUM.fields || []);
      } catch {
        setFields(DEMO_STADIUM.fields || []);
      } finally {
        setLoading(false);
      }
    }

    fetchFields();
  }, [stadiumId]);

  return { fields, loading };
}

// Hook to fetch services
export function useServices(stadiumId: string) {
  const [services, setServices] = useState<SanityService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      if (!isConfigured()) {
        setServices(DEMO_STADIUM.services || []);
        setLoading(false);
        return;
      }

      try {
        const data = await sanityClient.fetch(queries.stadiumServices, { stadiumId });
        setServices(data?.length ? data : DEMO_STADIUM.services || []);
      } catch {
        setServices(DEMO_STADIUM.services || []);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [stadiumId]);

  return { services, loading };
}
