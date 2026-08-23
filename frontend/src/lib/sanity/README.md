# Sanity CMS Integration - ET Smart Fields Microsites

## Overview

The microsite pages are powered by Sanity CMS for dynamic content management. 
When Sanity is not configured (demo mode), all pages use built-in demo data.

## Setup

### 1. Create a Sanity Project
1. Go to https://www.sanity.io/manage
2. Create a new project named "ET Smart Fields"
3. Copy the Project ID

### 2. Configure Environment
Update `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Set Up Sanity Studio
```bash
cd frontend
npm install -g sanity@latest
sanity init
# Choose your project, dataset: production
# Import schemas from src/lib/sanity/schemas.ts
```

### 4. Schema Types
The following document types are available in Sanity Studio:

| Type | Description |
|------|-------------|
| `stadium` | Stadium info, contact, social links |
| `field` | Field details, pricing, amenities |
| `event` | Upcoming events and tournaments |
| `highlight` | Goal of the month, best saves, skills |
| `testimonial` | Player reviews and ratings |
| `match` | Match results with replay links |
| `service` | Stadium services and offerings |

### 5. Content Structure
```
Stadium (Bambis Meda Stadium)
├── Fields (Field A, B, C, D)
├── Events (Friday Night League, Youth Tournament)
├── Highlights (Goal of the Month, Best Save)
├── Testimonials (Abebe K., Fatuma A.)
├── Matches (Addis Stars vs Lion City FC)
└── Services (AI Recording, Replays, WiFi)
```

## Hooks

| Hook | Purpose |
|------|---------|
| `useStadium(slug)` | Fetch stadium by slug |
| `useEvents(stadiumId)` | Fetch upcoming events |
| `useHighlights(stadiumId)` | Fetch highlights |
| `useTestimonials(stadiumId)` | Fetch testimonials |
| `useMatches(stadiumId)` | Fetch matches |
| `useFields(stadiumId)` | Fetch fields |
| `useServices(stadiumId)` | Fetch services |

## Demo Mode

When `NEXT_PUBLIC_SANITY_PROJECT_ID` is not set or equals "demo-project",
all hooks return demo data automatically. No configuration needed for development.

## GROQ Queries

All queries are defined in `src/lib/sanity/client.ts`.
The `stadiumBySlug` query fetches a stadium with all nested data (fields, events, highlights, testimonials, matches, services).
