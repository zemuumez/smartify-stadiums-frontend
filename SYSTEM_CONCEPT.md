# ET Smart Fields — Full System Concept

## 1. Vision Statement

**ET Smart Fields** is Ethiopia's first integrated multi-sport smart infrastructure platform. It connects players, teams, and stadium owners through a single digital ecosystem that handles field booking, AI-powered match recording, video replays, team management, and stadium microsites — all in one place.

The platform digitizes Ethiopia's fragmented sports facility landscape, replacing WhatsApp groups, phone calls, and manual scheduling with a professional, real-time booking and management system.

---

## 2. What the Platform Does

ET Smart Fields serves three primary functions:

1. **Field Discovery and Booking** — Players find, compare, and book sports fields across Ethiopia in under 2 minutes.
2. **Smart Stadium Management** — Stadium owners manage their fields, cameras, bookings, revenue, and public presence through a unified dashboard.
3. **Match Intelligence** — AI cameras record every match, generate highlights automatically, and provide video replays accessible to players and teams.

---

## 3. Supported Sports

The platform is designed for multi-sport support, covering all sports commonly played in small fields across Ethiopia:

- **Football / Soccer** (primary, including 11v11, 7v7, and futsal)
- **Basketball**
- **Volleyball**
- **Badminton**
- **Tennis**
- **Futsal** (indoor/small-sided football)

Each field in the system has a `sport_type` attribute, and the public-facing interface allows filtering by sport category.

---

## 4. System Actors

There are four distinct actor roles in the system. Each has a different interface, permissions, and workflow.

### 4.1 Player

**Who they are:** Individual athletes, recreational players, or casual users who want to book a field for personal or team use.

**What they can do:**
- Browse and search fields by sport type, location, date, and time
- View stadium details, ratings, reviews, and amenities
- Book a field and pay online (Telebirr, CBE Birr, credit card)
- Join or create teams
- View match replays and highlights from games they played in
- Rate and review stadiums after a booking
- Manage their profile and booking history

**Registration:** Phone number + OTP verification. Optional full name and email.

**Key screens:**
- Home page with search widget and sport category selector
- Stadium discovery / field listing page
- Stadium detail page (microsite)
- Booking flow (select field, date, time, pay)
- My Bookings page
- Team management
- Match replay viewer

---

### 4.2 Stadium Owner

**Who they are:** Individuals or businesses that own or operate sports facilities. They may own one small field or a multi-field complex.

**What they can do:**
- Register their stadium(s) on the platform
- Add and configure fields (sport type, surface, pricing, schedule, amenities)
- Register and manage AI camera systems attached to their fields
- Manage their public microsite (custom branding, colors, photos, events, videos)
- View analytics: revenue, bookings, video views, downloads, popular fields
- Manage billing and subscription plan
- Respond to reviews
- Post events, tournaments, and match highlights

**Registration:** Phone number + OTP, then select "Register as Owner" flow. Business name and stadium details collected during onboarding.

**Key screens:**
- Owner Dashboard (overview stats, recent bookings, quick actions)
- Stadium Management (CRUD stadiums, status, verification)
- Field Management (schedules, pricing, amenities per field)
- Camera Management (register devices, monitor status, storage, uptime)
- Microsite Editor (general info, appearance/branding, media, events, videos)
- Analytics (revenue charts, booking trends, video views, top fields, payment methods)
- Billing (current plan, usage meters, plan comparison, invoices)
- Settings (profile, notifications, security, integrations)

---

### 4.3 Platform Admin

**Who they are:** ET Smart Fields internal team members who manage the overall platform.

**What they can do:**
- View platform-wide statistics (total users, active stadiums, monthly bookings, revenue)
- Approve or reject stadium registration requests (verification)
- Manage users (view, suspend, delete)
- Monitor platform health (API uptime, response times, error rates, camera online status)
- View recent registrations and their statuses
- Manage platform-wide settings and configurations

**Registration:** Pre-seeded accounts. Not open for public registration.

**Key screens:**
- Admin Overview (platform stats, recent registrations, platform health)
- User Management (list, search, filter users)
- Stadium Management (approve/reject, view all stadiums)
- Analytics (platform-wide metrics)

---

### 4.4 Camera Device (System Actor)

**What it is:** An AI-powered camera system (hardware) installed at a stadium that connects to the ET Smart Fields platform. Examples: Veo Cam 3, SporPin X200, Hikvision DS-2DE.

**What it does:**
- Sends heartbeat signals to indicate it is online
- Streams match footage to the platform
- Passes a certification process before going live
- Reports storage usage and uptime statistics
- Streams can be viewed live by the stadium owner

**Lifecycle:**
1. Owner registers the camera with a device key
2. Camera enters "Pending" status, awaiting certification
3. After certification passes, camera moves to "Active" and begins streaming
4. If camera goes offline, status changes to "Offline" and owner is notified
5. Admin can revoke a camera if policy is violated

---

## 5. System Architecture

### 5.1 Frontend

- **Framework:** Next.js 16 with App Router and Turbopack
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom design tokens
- **State Management:** Zustand (auth store)
- **Animations:** Framer Motion
- **3D Elements:** Three.js (React Three Fiber) for particle animations and wireframe sphere visuals
- **CMS Integration:** Sanity.io for stadium microsite content (events, highlights, testimonials, matches, services)
- **API Client:** Axios with JWT interceptors (access token + refresh token)

### 5.2 Backend (API)

- **Base URL:** Configured via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080`)
- **API version:** `/api/v1/`
- **Authentication:** Phone number + OTP, JWT tokens (access + refresh)
- **Payment integration:** Telebirr, CBE Birr, Chapa, credit cards

### 5.3 Key API Endpoints (observed from code)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/auth/request-otp` | POST | Request OTP for phone verification |
| `/api/v1/auth/login` | POST | Login with phone + OTP code |
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/refresh` | POST | Refresh JWT access token |
| `/api/v1/users/me` | GET | Get current user profile |
| `/api/v1/stadiums` | GET | List all stadiums |
| `/api/v1/stadiums` | POST | Create a new stadium |
| `/api/v1/cameras` | GET | List camera devices |

### 5.4 CMS (Sanity.io)

Used for microsite content management:
- Stadium profiles (name, description, fields, contact info)
- Events and tournaments
- Match highlights and goal-of-the-month
- Testimonials and reviews
- Match results and replay links
- Services offered by each stadium

---

## 6. Core Features by Module

### 6.1 Public Website (Landing)

| Feature | Description |
|---|---|
| Hero Section | Full-width background image, search widget, stats card |
| Sport Category Selector | Filter fields by sport type (Football, Basketball, Volleyball, etc.) |
| Featured Fields | Top-rated fields with images, ratings, and pricing |
| Value Propositions | Zero double-booking, instant confirmation, widest selection |
| Services | Core services with camera, replay, and referee features |
| Testimonials | Player reviews with ratings and venue names |
| Partner/Investor Section | Benefits of partnering, investment CTA |
| Final CTA | Book now banner |

### 6.2 Stadium Microsite

Each stadium gets a public-facing microsite (e.g., `etsmartfields.com/bambis-meda`):

| Feature | Description |
|---|---|
| Hero | Stadium name, description, rating, stats |
| Events | Upcoming tournaments and leagues |
| Highlights | Goal of the month, best saves, skills |
| Testimonials | Player reviews |
| Match Results | Recent scores with replay links |
| Services | AI recording, replays, referees, WiFi, etc. |
| Field Listings | Available fields with pricing and amenities |
| Booking CTA | Direct link to booking flow |

### 6.3 Booking System

| Feature | Description |
|---|---|
| Field Search | By sport, location, date, time, duration |
| Availability Check | Real-time slot availability |
| Booking Flow | Select field, date, time slot, confirm |
| Payment | Telebirr, CBE Birr, credit card, cash |
| Confirmation | Instant confirmation via app and optional SMS/WhatsApp |
| Booking History | View past and upcoming bookings |
| Cancellation | Cancel with refund policy |

### 6.4 Team Management

| Feature | Description |
|---|---|
| Create Team | Name, city, avatar, color, captain |
| Join Team | Search and request to join public teams |
| League Table | Standings with points, wins, draws, losses |
| Team Profile | Roster, match history, statistics |
| Team Booking | Book fields on behalf of the team |

### 6.5 Camera and Video System

| Feature | Description |
|---|---|
| Camera Registration | Register device with model and device key |
| Certification | Automated certification before going live |
| Live Streaming | Real-time stream URL for active cameras |
| Match Recording | Automatic recording of all matches |
| Highlights Generation | AI-powered key moment detection |
| Video Storage | Per-camera storage with usage tracking |
| Match Replays | Full match replay accessible to players |
| Highlight Clips | Shareable goal/save/skill clips |

### 6.6 Analytics and Revenue

| Feature | Description |
|---|---|
| Revenue Charts | Daily, weekly, monthly revenue trends |
| Booking Metrics | Total bookings, booking rate, no-show rate |
| Video Metrics | Views, downloads, popular replays |
| Field Performance | Revenue per field, utilization rate |
| Payment Breakdown | Revenue by payment method (Telebirr, card, etc.) |
| Platform Fee | 5% platform fee deduction |
| Top Fields | Ranked list of highest-performing fields |

### 6.7 Billing and Subscription

| Plan | Price | Fields | Cameras | Storage | Features |
|---|---|---|---|---|---|
| Starter | 2,500 ETB/month | 1-2 | 1 | 500 GB | Basic analytics, microsite, email support |
| Professional | 7,500 ETB/month | Up to 10 | 5 | 2 TB | Advanced analytics, custom microsite, priority support, API |
| Enterprise | 20,000 ETB/month | Unlimited | Unlimited | 10 TB | Real-time analytics, white-label, 24/7 support, custom integrations |

Usage meters track: stadiums, fields, cameras, storage (GB), and API calls.

### 6.8 Microsite Editor

Stadium owners can customize their public microsite:

| Tab | Controls |
|---|---|
| General | Name, slug, tagline, description, contact info, features list |
| Appearance | Primary color, accent color, live preview |
| Media | Cover photo, gallery images |
| Events | Add/edit/remove upcoming events |
| Videos | Upload match highlight videos (max 500MB, up to 10 videos) |

---

## 7. Data Models

### User
```
id, phone, full_name, email, role (player|owner|admin),
is_verified, avatar_url, date_of_birth, is_minor,
business_name, created_at
```

### Stadium
```
id, owner_id, name, slug, description, address, city, sub_city,
latitude, longitude, phone, email, whatsapp,
status (draft|pending|active|suspended|deactivated),
badge, has_camera, has_online_booking, has_referee_booking,
field_count, created_at
```

### Field
```
id, stadium_id, name, field_number, sport_type, surface_type,
has_lighting, has_changing_room, hourly_rate_cents,
is_active, schedules[]
```

### FieldSchedule
```
id, field_id, day_of_week, open_time, close_time, is_available
```

### Booking
```
id, field_id, stadium_id, player_id, team_id,
booking_date, start_time, end_time,
status (pending|confirmed|cancelled|completed|no_show),
total_cents, payment_status (unpaid|processing|paid|refunded|failed),
notes, created_at
```

### Camera
```
id, stadium_id, field_id, device_key, stream_key,
device_name, device_model,
status (pending|certified|active|offline|revoked),
certification_passed, last_heartbeat, created_at
```

### Transaction
```
id, tx_ref, amount_cents, fee_cents, currency,
payment_method, status (pending|processing|paid|refunded|failed),
description, created_at
```

### Team
```
id, name, city, players, matches, wins, draws, losses,
points, rank, captain, isPublic, avatar, color
```

---

## 8. Page Map

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Homepage with search, sport categories, featured fields |
| `/stadiums` | Public | Browse and filter all stadiums |
| `/stadiums/[slug]` | Public | Individual stadium detail page |
| `/stadiums/live` | Public | Live camera feeds |
| `/teams` | Public | Browse teams, league standings |
| `/teams/create` | Auth | Create a new team |
| `/teams/[id]` | Public | Team profile and stats |
| `/microsite` | Public | Stadium microsite (CMS-driven) |
| `/microsite/about` | Public | About the stadium |
| `/microsite/fields` | Public | Stadium field listings |
| `/microsite/matches` | Public | Match results and replays |
| `/microsite/services` | Public | Services offered |
| `/microsite/contact` | Public | Contact information |
| `/pricing` | Public | Subscription plans and FAQ |
| `/about` | Public | About ET Smart Fields |
| `/contact` | Public | Contact form |
| `/careers` | Public | Job listings |
| `/privacy` | Public | Privacy policy |
| `/terms` | Public | Terms of service |
| `/auth/login` | Public | Phone + OTP login |
| `/auth/register/owner` | Public | Owner registration |
| `/bookings` | Auth | My bookings list |
| `/bookings/new` | Auth | New booking flow |
| `/dashboard` | Owner | Dashboard overview |
| `/dashboard/stadiums` | Owner | Manage stadiums |
| `/dashboard/fields` | Owner | Manage fields and schedules |
| `/dashboard/cameras` | Owner | Manage camera systems |
| `/dashboard/analytics` | Owner | Revenue and performance analytics |
| `/dashboard/billing` | Owner | Subscription and invoices |
| `/dashboard/microsite` | Owner | Microsite editor |
| `/dashboard/settings` | Owner | Profile, notifications, security, integrations |
| `/admin` | Admin | Platform overview |
| `/admin/users` | Admin | User management |
| `/admin/stadiums` | Admin | Stadium approval and management |
| `/admin/analytics` | Admin | Platform-wide analytics |
| `/admin/settings` | Admin | Platform configuration |

---

## 9. Payment Flow

1. Player selects a field, date, and time slot
2. System checks real-time availability (prevents double-booking)
3. Player confirms booking and is redirected to payment
4. Payment processed via Telebirr, CBE Birr, Chapa, or credit card
5. On success: booking status changes to "confirmed", player receives confirmation
6. Platform takes a 5% fee from the transaction
7. Stadium owner sees the revenue in their analytics dashboard

---

## 10. Camera Lifecycle

```
Registered --> Pending Certification --> Certified --> Active (Streaming)
                                                          |
                                                     Offline (heartbeat lost)
                                                          |
                                                     Active (reconnected)

Any stage --> Revoked (by admin)
```

Each camera reports:
- Heartbeat timestamps (last seen)
- Storage usage (used / limit in GB)
- Uptime percentage
- Stream URL (RTMP)

---

## 11. Monetization Model

| Revenue Stream | Description |
|---|---|
| SaaS Subscriptions | Stadium owners pay monthly (Starter / Professional / Enterprise) |
| Platform Fee | 5% transaction fee on every booking payment |
| Camera Hardware | Partner-provided camera hardware at additional cost |
| Premium Features | White-label microsites, API access, custom integrations (Enterprise) |

---

## 12. Technology Stack Summary

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| 3D Graphics | Three.js (React Three Fiber, Drei) |
| State Management | Zustand |
| HTTP Client | Axios |
| CMS | Sanity.io |
| Auth | Phone OTP + JWT |
| Payment | Telebirr, CBE Birr, Chapa, Stripe |
| Hosting | Vercel (implied by Next.js) |

---

## 13. Key Differentiators

1. **Multi-Sport Support** — Not just football. Basketball, volleyball, badminton, tennis, and futsal all supported from day one.
2. **AI Camera Integration** — Automatic match recording with AI-powered highlight generation. No manual filming needed.
3. **Instant Booking with Zero Double-Booking** — Real-time slot synchronization ensures a field cannot be double-booked.
4. **Stadium Microsites** — Every stadium owner gets a customizable public page with events, highlights, testimonials, and booking links.
5. **Video Replay Platform** — Players can watch full match replays and share highlight clips, something no competitor in Ethiopia offers.
6. **Ethiopian Payment Methods** — Native support for Telebirr and CBE Birr, the dominant mobile payment methods in Ethiopia.
7. **Team and League Management** — Built-in team creation, roster management, and league standings.
8. **Verified Stadium Program (ULS)** — A verification badge system that builds trust between players and stadium owners.
