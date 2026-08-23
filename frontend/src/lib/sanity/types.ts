// Sanity document types for ET Smart Fields microsites

export interface SanityStadium {
  _id: string;
  name: string;
  slug: { current: string };
  city: string;
  address: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  totalBookings: number;
  coverImage?: any;
  primaryColor: string;
  isActive: boolean;
  isVerified: boolean;
  openingHours?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    telegram?: string;
  };
  fields?: SanityField[];
  events?: SanityEvent[];
  highlights?: SanityHighlight[];
  testimonials?: SanityTestimonial[];
  matches?: SanityMatch[];
  services?: SanityService[];
}

export interface SanityField {
  _id: string;
  name: string;
  surface: "artificial-turf" | "natural-grass" | "hard-court" | "hybrid";
  size: string;
  pricePerHour: number;
  hasLighting: boolean;
  hasChangingRoom: boolean;
  isActive: boolean;
}

export interface SanityEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  time: string;
  spotsLeft: number;
  eventType: "league" | "tournament" | "corporate" | "youth" | "other";
}

export interface SanityHighlight {
  _id: string;
  title: string;
  player: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: any;
  votes: number;
  highlightType: "goal" | "save" | "skill" | "assist" | "other";
}

export interface SanityTestimonial {
  _id: string;
  name: string;
  text: string;
  rating: number;
  role: string;
}

export interface SanityMatch {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  field: string;
  hasReplay: boolean;
  replayUrl?: string;
}

export interface SanityService {
  _id: string;
  name: string;
  description: string;
  icon: string;
}
