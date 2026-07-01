# CLAUDE.md — Bike Rental & Real-Time Booking Platform

This file gives Claude Code persistent context for working on this project. Keep it concise; move deep-dive details into `/docs/*.md` and reference them here so this file doesn't bloat the context window.

## 1. Project Overview

A bicycle rental website with a **real-time reservation system**. Customers browse available bikes/locations, pick a date & time slot, and book instantly with live availability (no double-booking). Site content and UI are in **English**, targeting both local and international renters.

This is a separate project from `VietnamBikeTours` (guided tours). This project is **rental-by-time-slot** (hourly/daily self-service rental), so the data model and booking logic are different — availability is per-bike, per-time-window, not per-tour-date.

## 2. Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components + Server Actions)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (Postgres) with Prisma as ORM
- **Realtime**: Supabase Realtime (Postgres changes) to push live availability updates to all connected clients
- **Maps**: Mapbox GL JS (rental station / pickup-point locations)
- **Auth**: Supabase Auth (email + Google OAuth)
- **Payments**: Stripe (deposit + full payment flows) — TBD provider for VN domestic cards if needed
- **Hosting**: Vercel (frontend) + Supabase (backend/db)
- **Language**: TypeScript throughout

## 3. Core Domain Model (draft — refine in `/docs/schema.md`)

- `bikes` — id, model, type (city/mountain/electric/kids), station_id, status (available/rented/maintenance), hourly_rate, daily_rate
- `stations` — id, name, address, lat, lng, opening_hours
- `bookings` — id, bike_id, user_id, start_time, end_time, status (pending/confirmed/active/completed/cancelled), total_price, deposit_paid
- `availability_locks` — short-lived row used to prevent race conditions when two users try to book the same bike/time-slot simultaneously (or use a Postgres exclusion constraint on `bookings (bike_id, tsrange(start_time, end_time))`)
- `users` — id, name, email, phone, role (customer/admin/staff)
- `payments` — id, booking_id, provider, amount, status

**Critical rule**: booking creation must be atomic and prevent overlapping time ranges for the same bike. Prefer a Postgres `EXCLUDE USING gist` constraint over application-level locking for correctness.

## 4. Real-Time Booking Requirements

- When a user selects a bike + time range, the UI must reflect **live availability** (another user booking the same bike should instantly disable that slot for everyone viewing it).
- Use Supabase Realtime subscriptions on the `bookings` table to push updates to the client.
- On the booking form, hold a short optimistic "soft lock" (e.g. 5 minutes) while the user completes payment, then release it if payment isn't completed in time (use a cron/Edge Function or DB trigger with `expires_at`).
- All booking writes go through a single Server Action / API route that does the final overlap check inside the DB transaction — never trust client-side availability state for the final write.

## 5. Project Structure (adjust as it evolves)

```
/app
  /(marketing)        — public pages: home, how-it-works, stations, pricing
  /bikes               — browse & filter bikes
  /book/[bikeId]       — booking flow (date/time picker, payment)
  /account             — user's bookings, profile
  /admin               — staff dashboard: fleet, bookings, stations
  /api                 — route handlers (webhooks, etc.)
/components
/lib
  /supabase            — client/server Supabase helpers
  /booking             — availability + overlap logic
/prisma
  schema.prisma
/docs
  schema.md
  booking-flow.md
```

## 6. Conventions

- Components: PascalCase, colocated with the route when route-specific; shared ones in `/components/ui` (shadcn) and `/components/shared`.
- Server Actions for all mutations (bookings, payments callbacks via webhook route handlers).
- All dates/times stored in UTC in the DB; display converted to station's local timezone.
- Validate all booking inputs with Zod, both client and server side.
- No business logic in client components — keep them presentational; data + mutations in Server Components/Actions.

## 7. Current Status / MVP Scope

- [ ] Define stations & seed initial bike fleet
- [ ] Bike browsing + filtering UI
- [ ] Real-time availability calendar/time-slot picker
- [ ] Booking creation with overlap-safe transaction
- [ ] Payment integration (deposit flow)
- [ ] Customer account: view/cancel bookings
- [ ] Admin dashboard: manage fleet + bookings

## 8. Out of Scope (for now)

- Multi-day guided tours (that's the separate VietnamBikeTours project)
- Multi-language i18n (English only for now)
- Native mobile app

## 9. Open Questions / Decisions Needed

- Payment provider for Vietnamese domestic cards alongside Stripe?
- Pricing model: hourly vs daily vs both, and how deposits are calculated?
- Do stations have fixed opening hours, or per-station overrides/holidays?

---
*Keep this file lean. When a section grows past ~20 lines, move the detail into `/docs/` and link it here instead of inlining.*
