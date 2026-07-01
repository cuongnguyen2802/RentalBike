import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

const MENUS = [
  {
    name: "Header",
    slug: "header",
    items: [
      { label: "Browse Bikes",  url: "/bikes",         target: "_self", order: 0 },
      { label: "Stations",      url: "/stations",       target: "_self", order: 1 },
      { label: "Pricing",       url: "/pricing",        target: "_self", order: 2 },
      { label: "How It Works",  url: "/how-it-works",   target: "_self", order: 3 },
      { label: "Blog",          url: "/blog",           target: "_self", order: 4 },
      { label: "About",         url: "/about",          target: "_self", order: 5 },
      { label: "Contact",       url: "/contact",        target: "_self", order: 6 },
    ],
  },
  {
    name: "Explore",
    slug: "footer-explore",
    items: [
      { label: "Browse Bikes",  url: "/bikes",          target: "_self", order: 0 },
      { label: "Stations",      url: "/stations",        target: "_self", order: 1 },
      { label: "Pricing",       url: "/pricing",         target: "_self", order: 2 },
      { label: "How It Works",  url: "/how-it-works",    target: "_self", order: 3 },
    ],
  },
  {
    name: "Company",
    slug: "footer-company",
    items: [
      { label: "About Us",  url: "/about",     target: "_self", order: 0 },
      { label: "Blog",      url: "/blog",       target: "_self", order: 1 },
      { label: "Contact",   url: "/contact",    target: "_self", order: 2 },
    ],
  },
  {
    name: "Account",
    slug: "footer-account",
    items: [
      { label: "Sign In",     url: "/login",     target: "_self", order: 0 },
      { label: "Register",    url: "/register",   target: "_self", order: 1 },
      { label: "My Bookings", url: "/account",    target: "_self", order: 2 },
    ],
  },
];

async function main() {
  for (const { name, slug, items } of MENUS) {
    const menu = await prisma.menu.upsert({
      where:  { slug },
      update: { name },
      create: { name, slug },
    });

    // Delete existing items and re-create so order is clean on re-seed
    await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
    await prisma.menuItem.createMany({
      data: items.map(i => ({ ...i, menuId: menu.id })),
    });

    console.log(`  ✓ ${name} (${slug}) — ${items.length} items`);
  }
}

main()
  .then(() => {
    console.log("\n✅ Menu seed complete.");
    return prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
