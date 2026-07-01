import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const posts = [
  {
    title: "Top 5 Cycling Routes in Ho Chi Minh City",
    slug:  "top-5-cycling-routes-ho-chi-minh-city",
    excerpt: "Discover the best bike routes through Saigon — from the riverside promenade to hidden alley trails in the old quarters.",
    content: `<h2>Riding Through the Heart of Saigon</h2>
<p>Ho Chi Minh City might look chaotic, but on a bicycle you unlock a completely different side of the city. The traffic is slower in the alleys, the street food is closer, and you experience the city like a local.</p>
<h2>1. Bach Dang Riverfront Promenade</h2>
<p>Start at Ton Duc Thang Street and follow the Saigon River south. In the early morning, this stretch is peaceful — fishermen on the bank, cargo boats on the water, and the skyline of District 1 waking up behind you. The flat path makes it perfect for a 10–12 km leisurely ride.</p>
<h2>2. District 3 Coffee Alley Loop</h2>
<p>Weave through the tree-lined streets of District 3 — Vo Van Tan, Tran Cao Van, Nguyen Dinh Chieu — stopping at old French-era villas and the best <em>cà phê trứng</em> (egg coffee) spots in the city. The loop is about 8 km and very flat.</p>
<h2>3. District 4 Market Circuit</h2>
<p>Cross the Thu Thiem Bridge into District 4 to explore one of Saigon's most authentic working-class neighborhoods. The narrow alleys are best navigated by bike. Don't miss the morning wet market on Ton That Thuyet.</p>
<h2>4. Binh Thanh Canal Path</h2>
<p>Follow the Nhieu Loc–Thi Nghe canal as it weaves through Districts 1, 3, Binh Thanh, and Phu Nhuan. The canal-side path is shaded and relatively calm — a 15 km route that gives you a cross-section of the city's neighborhoods.</p>
<h2>5. Phu My Hung to Dam Sen</h2>
<p>Head south to the planned District 7 development, which has wide boulevards and dedicated cycling lanes. Keppel Land's Phu My Hung area feels like a different city — a great contrast to the Old Quarter chaos.</p>
<h2>Tips Before You Go</h2>
<ul>
<li>Ride early — 6am to 8am beats the heat and traffic.</li>
<li>Always carry water. Vietnam sun is no joke.</li>
<li>A city bike or folding bike works best for urban routes.</li>
<li>Helmet is mandatory on all PedalGo rentals.</li>
</ul>`,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2025-05-10"),
    seoTitle: "Top 5 Cycling Routes in Ho Chi Minh City — PedalGo Blog",
    seoDescription: "The best bike routes through Saigon: riverfront promenades, canal paths, and hidden alley trails. Perfect for city and e-bike riders.",
  },
  {
    title: "City Bike vs Electric Bike: Which Should You Rent?",
    slug:  "city-bike-vs-electric-bike-which-to-rent",
    excerpt: "Can't decide between a classic city bike and an e-bike for your Saigon adventure? We break down the pros, cons, and when each makes sense.",
    content: `<h2>The Classic vs. The Future</h2>
<p>We get this question every day at PedalGo. Both bikes are great — the right choice depends on how far you're going, how much you want to sweat, and your budget.</p>
<h2>City Bike: Simple and Honest</h2>
<p>Our city bikes are single-speed or 7-speed upright bikes built for flat urban roads. They're light, easy to lock, and need almost zero maintenance. On a city bike you feel every hill (Saigon doesn't have many, but still).</p>
<p><strong>Choose a city bike if:</strong></p>
<ul>
<li>You're doing short trips under 20 km</li>
<li>You want the full workout experience</li>
<li>You're budget-conscious — city bikes start at $5/hr</li>
<li>You're an experienced city cyclist</li>
</ul>
<h2>Electric Bike: Effortless and Fast</h2>
<p>Our e-bikes have a 250W mid-drive motor with pedal assist up to 25 km/h. The battery gives you 50–70 km of range. You still pedal — the motor just multiplies your effort. Arrive at your destination dry.</p>
<p><strong>Choose an e-bike if:</strong></p>
<ul>
<li>You're covering 30 km+ in a day</li>
<li>Saigon heat is a concern (arrive without sweating)</li>
<li>You're touring multiple neighborhoods in one day</li>
<li>You're carrying a bag or camera gear</li>
</ul>
<h2>The Verdict</h2>
<p>For most first-time visitors: <strong>rent an e-bike for day 1</strong> to explore widely, then switch to a city bike once you know the neighborhoods you want to revisit. We offer half-day rates on both — mix and match.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1619118606863-d26a3e3fcad6?auto=format&fit=crop&w=1200&q=85",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2025-05-22"),
    seoTitle: "City Bike vs E-Bike: Which to Rent in Vietnam? — PedalGo",
    seoDescription: "City bike or electric bike — which is best for your Saigon trip? Compare range, comfort, price, and the best use cases for each.",
  },
  {
    title: "A Morning Routine: Cycling to Breakfast in District 1",
    slug:  "morning-cycling-breakfast-district-1-saigon",
    excerpt: "Wake up early, grab a PedalGo bike, and follow our favourite breakfast crawl through the backstreets of District 1. Best banh mi spots included.",
    content: `<h2>6 AM. Bike Unlocked. Let's Go.</h2>
<p>The best time to see Saigon is before it wakes up. By 6 AM the streets are quiet enough to actually look around — at the old buildings, at the vendors setting up their carts, at the monks collecting alms outside Xa Loi Pagoda.</p>
<p>Here's our favourite morning loop from the Ben Thanh pickup point.</p>
<h2>Stop 1: Banh Mi Huynh Hoa (7:30 AM)</h2>
<p>Start at 26 Le Thi Rieng Street. The queue starts before the shop opens. Order one of everything — the banh mi here is legendary for its generously stuffed ratio of pâté, charcuterie, and pickled vegetables. Eat on the sidewalk.</p>
<h2>Stop 2: Café Apartment Building (8:00 AM)</h2>
<p>Cycle to 42 Nguyen Hue. The French-era apartment block has been taken over by a dozen independent cafés — each floor has a different aesthetic. Take the stairs with the bike if you can (or leave it locked below). Get an iced Vietnamese coffee and watch the boulevard below.</p>
<h2>Stop 3: Ben Thanh Market Outer Ring (8:45 AM)</h2>
<p>The <em>inside</em> of Ben Thanh is touristy. The <em>outside</em> — the street vendors wrapping around the perimeter — is the real deal. Lock your bike on Le Loi and walk the outer ring for fresh fruit, banh cuon, and fresh sugarcane juice.</p>
<h2>Back by 10 AM</h2>
<p>The whole loop is about 12 km and takes 2–3 hours with stops. Return the bike before the heat hits, or extend to a half-day rental and push into District 3 for a second breakfast.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200&q=85",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2025-06-05"),
    seoTitle: "Morning Cycling Breakfast Tour in District 1 — PedalGo Blog",
    seoDescription: "A 12km morning cycling route through District 1 Saigon hitting the best banh mi, egg coffee, and street food spots. Perfect for early risers.",
  },
  {
    title: "How to Stay Safe Cycling in Vietnamese Traffic",
    slug:  "stay-safe-cycling-vietnamese-traffic",
    excerpt: "Vietnamese traffic looks chaotic but follows its own logic. Here are the rules — written and unwritten — that every cyclist needs to know before riding in Saigon or Hanoi.",
    content: `<h2>Traffic in Vietnam: Organised Chaos</h2>
<p>The first time you step into Saigon traffic, your instinct is to freeze. Don't. The secret is to move <em>predictably and steadily</em> — Vietnamese drivers are remarkably good at reading other road users. What they can't handle is unpredictable behaviour.</p>
<h2>The Golden Rules</h2>
<h3>1. Move at a steady pace</h3>
<p>Never stop suddenly in the middle of the road. Maintain a steady speed and other vehicles will flow around you. Think of traffic like water — it will find the gaps.</p>
<h3>2. Look over your shoulder before changing direction</h3>
<p>Use hand signals. In Vietnam, pointing your arm out is universally understood. Do it early and do it clearly.</p>
<h3>3. Own the left lane</h3>
<p>Bicycles and slow vehicles hug the left. Motor scooters (the majority of traffic) use the middle. Stay left and let them pass you on the right.</p>
<h3>4. Treat red lights carefully</h3>
<p>Many motorcycles treat red lights as a suggestion. Wait for the pedestrian signal to confirm it's safe, not just the traffic light colour.</p>
<h3>5. Avoid peak hours</h3>
<p>7:00–9:00 AM and 4:30–6:30 PM are gridlock. If you can, schedule your rides outside these windows.</p>
<h2>Gear Checklist</h2>
<ul>
<li><strong>Helmet</strong> — mandatory with all PedalGo rentals, no exceptions</li>
<li><strong>Gloves</strong> — for long rides and better grip in rain</li>
<li><strong>Phone mount</strong> — available at our stations for navigation</li>
<li><strong>Lights</strong> — front and rear lights provided on all night rentals</li>
</ul>
<h2>If You Have an Accident</h2>
<p>All PedalGo rentals include basic liability cover. If anything happens: stay calm, move to the pavement, call our emergency line printed on your booking confirmation, and do not move the bikes until we arrive.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2025-06-18"),
    seoTitle: "How to Cycle Safely in Vietnamese Traffic — PedalGo Blog",
    seoDescription: "Vietnamese traffic follows its own logic. Learn the unwritten rules, the best lanes to use, and how to stay safe on a bike in Saigon or Hanoi.",
  },
];

async function main() {
  console.log("Seeding blog posts…");
  for (const post of posts) {
    await prisma.post.upsert({
      where:  { slug: post.slug },
      update: post,
      create: post,
    });
    console.log(`  ✓ ${post.title}`);
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
