export const revalidate = 60; // ISR: regenerate at most once per minute

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bike, Calendar, Clock, MapPin, Shield, Star, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getBikeTypeLabel } from "@/lib/utils";
import HeroSlider from "@/components/shared/HeroSlider";
import { BIKE_IMAGES } from "@/lib/bike-images";

const features = [
  { icon: Clock,  title: "Real-Time Availability",  description: "See live availability as you browse. No double bookings — ever." },
  { icon: MapPin, title: "Multiple Stations",        description: "Pick up and drop off at any of our conveniently located rental stations." },
  { icon: Shield, title: "Secure & Simple",          description: "Book and pay online in seconds. Your deposit is protected." },
  { icon: Zap,    title: "Instant Confirmation",     description: "Get your booking confirmed immediately — no waiting, no calls." },
];

const TYPE_BADGE: Record<string, string> = {
  CITY:     "bg-sky-100 text-sky-700",
  MOUNTAIN: "bg-amber-100 text-amber-700",
  ELECTRIC: "bg-emerald-100 text-emerald-700",
  ROAD:     "bg-violet-100 text-violet-700",
  KIDS:     "bg-pink-100 text-pink-700",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function HomePage() {
  const [featuredBikes, totalAvailable, latestPosts] = await Promise.all([
    prisma.bike.findMany({
      where: { status: "AVAILABLE" },
      include: { station: true },
      take: 6,
      orderBy: { hourlyRate: "asc" },
    }).catch(() => []),
    prisma.bike.count({ where: { status: "AVAILABLE" } }).catch(() => 0),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, excerpt: true, imageUrl: true, publishedAt: true, createdAt: true },
    }).catch(() => []),
  ]);

  return (
    <div>
      {/* ── Hero Slider ── */}
      <HeroSlider totalAvailable={totalAvailable} />

      {/* ── Available Bikes ── */}
      <section id="available-bikes" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-2">
                Book now
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Available Bikes</h2>
              <p className="text-gray-500 mt-1">
                {totalAvailable} bikes ready for pickup today
              </p>
            </div>
            <Link
              href="/bikes"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              See all {totalAvailable} bikes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredBikes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bike className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No bikes available right now. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBikes.map((bike) => {
                  const imageUrl  = bike.imageUrl ?? BIKE_IMAGES[bike.type] ?? BIKE_IMAGES.CITY;
                  const badgeClass = TYPE_BADGE[bike.type] ?? "bg-gray-100 text-gray-700";
                  return (
                    <div key={bike.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <Image
                          src={imageUrl}
                          alt={bike.model}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                          {getBikeTypeLabel(bike.type)}
                        </span>
                        <span className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Available
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-base leading-snug">{bike.model}</h3>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-gray-600">4.8</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span className="truncate">{bike.station.name}</span>
                        </div>

                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-2xl font-black text-gray-900">{formatCurrency(Number(bike.hourlyRate))}</span>
                            <span className="text-gray-400 text-sm">/hr</span>
                          </div>
                          <span className="text-sm text-gray-400">{formatCurrency(Number(bike.dailyRate))}/day</span>
                        </div>

                        <Link
                          href={`/book/${bike.id}`}
                          className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                        >
                          Book This Bike
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalAvailable > 6 && (
                <div className="text-center mt-10">
                  <Link
                    href="/bikes"
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-sm"
                  >
                    See all {totalAvailable} bikes <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why PedalGo?</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">Everything you need for a perfect bike rental experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-gray-50 border border-gray-100 p-6 hover:border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100 mb-4">
                  <f.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog ── */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-2">
                  Tips & Guides
                </p>
                <h2 className="text-3xl font-bold text-gray-900">From the Blog</h2>
                <p className="text-gray-500 mt-1">Cycling routes, gear tips, and local know-how.</p>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post, i) => {
                const date = post.publishedAt ?? post.createdAt;
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={`group rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col ${i === 0 ? "md:col-span-2" : ""}`}
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden bg-gray-100 ${i === 0 ? "aspect-[16/7]" : "aspect-[16/9]"}`}>
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-50">
                          <Bike className="h-12 w-12 text-emerald-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(date)}
                      </div>
                      <h3 className={`font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug mb-2 ${i === 0 ? "text-xl" : "text-base"}`}>
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View all articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 bg-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <Bike className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to Ride?</h2>
          <p className="text-emerald-200 mb-8 max-w-md mx-auto">
            {totalAvailable} bikes ready across 3 stations. Real-time booking — no phone calls needed.
          </p>
          <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50" asChild>
            <Link href="/bikes">Book Your Bike Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
