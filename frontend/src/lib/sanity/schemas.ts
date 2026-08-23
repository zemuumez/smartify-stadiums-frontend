// Sanity Schema Definitions for ET Smart Fields Microsites
// These are reference schemas for setting up in Sanity Studio

export const stadiumSchema = {
  name: "stadium",
  title: "Stadium",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string", validation: (r: any) => r.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (r: any) => r.required() },
    { name: "city", title: "City", type: "string" },
    { name: "address", title: "Address", type: "text" },
    { name: "description", title: "Description", type: "text" },
    { name: "phone", title: "Phone", type: "string" },
    { name: "email", title: "Email", type: "string" },
    { name: "website", title: "Website", type: "url" },
    { name: "rating", title: "Rating", type: "number" },
    { name: "totalBookings", title: "Total Bookings", type: "number" },
    { name: "coverImage", title: "Cover Image", type: "image" },
    { name: "primaryColor", title: "Primary Color", type: "string" },
    { name: "isActive", title: "Is Active", type: "boolean" },
    { name: "isVerified", title: "ULS Verified", type: "boolean" },
    { name: "openingHours", title: "Opening Hours", type: "string" },
    {
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        { name: "facebook", title: "Facebook", type: "url" },
        { name: "instagram", title: "Instagram", type: "url" },
        { name: "twitter", title: "Twitter", type: "url" },
        { name: "telegram", title: "Telegram", type: "url" },
      ],
    },
  ],
};

export const fieldSchema = {
  name: "field",
  title: "Field",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string", validation: (r: any) => r.required() },
    { name: "stadium", title: "Stadium", type: "reference", to: [{ type: "stadium" }] },
    { name: "surface", title: "Surface", type: "string", options: { list: [
      { title: "Artificial Turf", value: "artificial-turf" },
      { title: "Natural Grass", value: "natural-grass" },
      { title: "Hard Court", value: "hard-court" },
      { title: "Hybrid", value: "hybrid" },
    ]}},
    { name: "size", title: "Size", type: "string" },
    { name: "pricePerHour", title: "Price Per Hour (ETB)", type: "number" },
    { name: "hasLighting", title: "Has Lighting", type: "boolean" },
    { name: "hasChangingRoom", title: "Has Changing Room", type: "boolean" },
    { name: "isActive", title: "Is Active", type: "boolean" },
  ],
};

export const eventSchema = {
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (r: any) => r.required() },
    { name: "stadium", title: "Stadium", type: "reference", to: [{ type: "stadium" }] },
    { name: "description", title: "Description", type: "text" },
    { name: "startDate", title: "Start Date", type: "date", validation: (r: any) => r.required() },
    { name: "endDate", title: "End Date", type: "date" },
    { name: "time", title: "Time", type: "string" },
    { name: "spotsLeft", title: "Spots Left", type: "number" },
    { name: "eventType", title: "Event Type", type: "string", options: { list: [
      { title: "League", value: "league" },
      { title: "Tournament", value: "tournament" },
      { title: "Corporate", value: "corporate" },
      { title: "Youth", value: "youth" },
      { title: "Other", value: "other" },
    ]}},
  ],
};

export const highlightSchema = {
  name: "highlight",
  title: "Highlight",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (r: any) => r.required() },
    { name: "stadium", title: "Stadium", type: "reference", to: [{ type: "stadium" }] },
    { name: "player", title: "Player", type: "string" },
    { name: "description", title: "Description", type: "text" },
    { name: "videoUrl", title: "Video URL", type: "url" },
    { name: "thumbnailUrl", title: "Thumbnail", type: "image" },
    { name: "votes", title: "Votes", type: "number" },
    { name: "highlightType", title: "Type", type: "string", options: { list: [
      { title: "Goal", value: "goal" },
      { title: "Save", value: "save" },
      { title: "Skill", value: "skill" },
      { title: "Assist", value: "assist" },
      { title: "Other", value: "other" },
    ]}},
  ],
};

export const testimonialSchema = {
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string", validation: (r: any) => r.required() },
    { name: "stadium", title: "Stadium", type: "reference", to: [{ type: "stadium" }] },
    { name: "text", title: "Text", type: "text", validation: (r: any) => r.required() },
    { name: "rating", title: "Rating", type: "number", validation: (r: any) => r.min(1).max(5) },
    { name: "role", title: "Role", type: "string" },
  ],
};

export const matchSchema = {
  name: "match",
  title: "Match",
  type: "document",
  fields: [
    { name: "homeTeam", title: "Home Team", type: "string", validation: (r: any) => r.required() },
    { name: "awayTeam", title: "Away Team", type: "string", validation: (r: any) => r.required() },
    { name: "stadium", title: "Stadium", type: "reference", to: [{ type: "stadium" }] },
    { name: "homeScore", title: "Home Score", type: "number" },
    { name: "awayScore", title: "Away Score", type: "number" },
    { name: "date", title: "Date", type: "date", validation: (r: any) => r.required() },
    { name: "field", title: "Field", type: "string" },
    { name: "hasReplay", title: "Has Replay", type: "boolean" },
    { name: "replayUrl", title: "Replay URL", type: "url" },
  ],
};

export const serviceSchema = {
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string", validation: (r: any) => r.required() },
    { name: "stadium", title: "Stadium", type: "reference", to: [{ type: "stadium" }] },
    { name: "description", title: "Description", type: "text" },
    { name: "icon", title: "Icon", type: "string" },
  ],
};

// Export all schemas for Sanity Studio
export const schemaTypes = [
  stadiumSchema,
  fieldSchema,
  eventSchema,
  highlightSchema,
  testimonialSchema,
  matchSchema,
  serviceSchema,
];
