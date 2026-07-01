import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  const homePage = await prisma.page.upsert({
    where:  { pageKey: "home" },
    update: { title: "Home", status: "PUBLISHED" },
    create: {
      title:   "Home",
      slug:    "home",
      pageKey: "home",
      status:  "PUBLISHED",
      excerpt: "PedalGo — Saigon's premier bike rental service. Real-time booking, quality bikes, multiple stations.",
      blocks: [
        {
          id: "home-hero",
          type: "hero",
          data: {
            title:            "Explore Saigon by Bike",
            subtitle:         "Real-time availability. Instant booking. Quality bikes. Multiple stations across the city.",
            backgroundImage:  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
            overlayOpacity:   55,
            height:           "large",
            textAlign:        "center",
            ctaLabel:         "Browse Bikes",
            ctaHref:          "/bikes",
            ctaSecondaryLabel: "Our Stations",
            ctaSecondaryHref: "/stations",
          },
        },
        {
          id: "home-features",
          type: "features",
          data: {
            title:    "Why PedalGo?",
            subtitle: "Everything you need for a seamless bike rental experience.",
            columns:  3,
            items: [
              { icon: "🚲", title: "Quality Bikes",       description: "City, mountain, electric and kids bikes. Inspected before every rental." },
              { icon: "⚡", title: "Instant Booking",     description: "Real-time availability. Book online in under 2 minutes with instant confirmation." },
              { icon: "📍", title: "3 Convenient Stations", description: "District 1, District 3 and Thu Duc. Right where you need them." },
              { icon: "🛡️", title: "Safe & Insured",      description: "Helmets at every station, insurance included, support 7 days a week." },
              { icon: "🌿", title: "Eco-Friendly",        description: "Every bike ride reduces traffic and carbon footprint in the city." },
              { icon: "💳", title: "Easy Payment",        description: "Pay online by card. Simple deposit, automatic release on return." },
            ],
          },
        },
        {
          id: "home-stats",
          type: "stats",
          data: {
            theme: "emerald",
            items: [
              { value: "500+",  label: "Happy Riders"  },
              { value: "12+",   label: "Bikes in Fleet" },
              { value: "3",     label: "Stations"       },
              { value: "4.8★",  label: "Average Rating" },
            ],
          },
        },
        {
          id: "home-cta",
          type: "cta",
          data: {
            title:       "Ready to explore the city?",
            subtitle:    "Book a bike online in 2 minutes. Real-time availability, instant confirmation.",
            buttonLabel: "Browse Bikes",
            buttonHref:  "/bikes",
            theme:       "emerald",
          },
        },
      ],
    },
  });

  console.log("✅ Seeded home page:", homePage.id);

  const aboutPage = await prisma.page.upsert({
    where:  { pageKey: "about" },
    update: { title: "About Us", status: "PUBLISHED" },
    create: {
      title:   "About Us",
      slug:    "about",
      pageKey: "about",
      status:  "PUBLISHED",
      excerpt: "PedalGo is Ho Chi Minh City's premier bike rental service.",
      blocks:  [],
    },
  });

  console.log("✅ Seeded about page:", aboutPage.id);

  const contactPage = await prisma.page.upsert({
    where:  { pageKey: "contact" },
    update: { title: "Contact", status: "PUBLISHED" },
    create: {
      title:   "Contact",
      slug:    "contact",
      pageKey: "contact",
      status:  "PUBLISHED",
      excerpt: "Get in touch with PedalGo. We reply within a few hours.",
      blocks:  [],
    },
  });

  console.log("✅ Seeded contact page:", contactPage.id);
}

main()
  .then(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); await pool.end(); process.exit(1); });
