import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo-project",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-08-23",
  useCdn: true,
};

export const sanityClient = createClient(sanityConfig);

const builder = imageUrlBuilder(sanityConfig);

export function urlFor(source: any) {
  return builder.image(source);
}

// GROQ query helpers
export const queries = {
  allStadiums: `*[_type == "stadium"] | order(name asc) {
    _id, name, slug, city, address, description, rating, totalBookings,
    coverImage, primaryColor, isActive, isVerified,
    "fieldsCount": count(*[_type == "field" && stadium._ref == ^._id])
  }`,

  stadiumBySlug: `*[_type == "stadium" && slug.current == $slug][0] {
    _id, name, slug, city, address, description, phone, email, website,
    rating, totalBookings, coverImage, primaryColor, isActive, isVerified,
    openingHours, socialLinks,
    "fields": *[_type == "field" && stadium._ref == ^._id] | order(name asc) {
      _id, name, surface, size, pricePerHour, hasLighting, hasChangingRoom, isActive
    },
    "events": *[_type == "event" && stadium._ref == ^._id] | order(startDate asc) {
      _id, title, description, startDate, endDate, time, spotsLeft, eventType
    },
    "highlights": *[_type == "highlight" && stadium._ref == ^._id] | order(votes desc) {
      _id, title, player, description, videoUrl, thumbnailUrl, votes, highlightType
    },
    "testimonials": *[_type == "testimonial" && stadium._ref == ^._id] | order(_createdAt desc) {
      _id, name, text, rating, role
    },
    "matches": *[_type == "match" && stadium._ref == ^._id] | order(date desc) {
      _id, homeTeam, awayTeam, homeScore, awayScore, date, field, hasReplay, replayUrl
    },
    "services": *[_type == "service" && stadium._ref == ^._id] | order(name asc) {
      _id, name, description, icon
    }
  }`,

  stadiumEvents: `*[_type == "event" && stadium._ref == $stadiumId && startDate >= now()] | order(startDate asc) {
    _id, title, description, startDate, endDate, time, spotsLeft, eventType
  }`,

  stadiumHighlights: `*[_type == "highlight" && stadium._ref == $stadiumId] | order(votes desc) {
    _id, title, player, description, videoUrl, thumbnailUrl, votes, highlightType
  }`,

  stadiumTestimonials: `*[_type == "testimonial" && stadium._ref == $stadiumId] | order(_createdAt desc) {
    _id, name, text, rating, role
  }`,

  stadiumMatches: `*[_type == "match" && stadium._ref == $stadiumId] | order(date desc) {
    _id, homeTeam, awayTeam, homeScore, awayScore, date, field, hasReplay, replayUrl
  }`,

  stadiumFields: `*[_type == "field" && stadium._ref == $stadiumId] | order(name asc) {
    _id, name, surface, size, pricePerHour, hasLighting, hasChangingRoom, isActive
  }`,

  stadiumServices: `*[_type == "service" && stadium._ref == $stadiumId] | order(name asc) {
    _id, name, description, icon
  }`,
};
