# Setup Guide — PedalGo Bike Rental

## Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Stripe account (test mode)
- A Mapbox account (free tier)

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project Settings > API |
| `DATABASE_URL` | Supabase project Settings > Database > Connection string (Transaction pooler) |
| `DIRECT_URL` | Supabase project Settings > Database > Connection string (Session pooler) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | mapbox.com > Account > Access Tokens |

## 2. Database Setup

```bash
# Push schema to Supabase (first deploy)
npm run db:push

# Run seed data (stations + bikes)
npm run db:seed
```

## 3. Supabase Auth Setup

In your Supabase project:
1. Authentication > URL Configuration > Site URL: `http://localhost:3000`
2. Add redirect URL: `http://localhost:3000/auth/callback`
3. Enable Google OAuth (optional): Authentication > Providers > Google

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Real-Time Availability (Supabase Realtime)

Enable Realtime on the `bookings` table in Supabase:
- Database > Replication > Enable for `bookings` table

## 6. Stripe Webhooks (local dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Production Deployment

1. Deploy to Vercel: connect the GitHub repo
2. Set all env variables in Vercel project settings
3. Add production URL to Supabase allowed redirect URLs
4. Create a Stripe webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe`
