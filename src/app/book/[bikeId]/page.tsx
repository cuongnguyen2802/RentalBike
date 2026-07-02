import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatCurrency, getBikeTypeLabel } from "@/lib/utils";
import { ChevronLeft, Check, Star } from "lucide-react";
import BookingForm from "./BookingForm";
import { BIKE_IMAGES } from "@/lib/bike-images";

interface Props {
  params: { bikeId: string };
  searchParams?: { from?: string; to?: string };
}

const TYPE_BADGE: Record<string, string> = {
  CITY:     "bg-sky-500",
  MOUNTAIN: "bg-amber-600",
  ELECTRIC: "bg-emerald-500",
  ROAD:     "bg-violet-600",
  KIDS:     "bg-pink-500",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bike = await prisma.bike.findUnique({
    where: { id: params.bikeId },
    include: { station: true },
  });
  if (!bike) return { title: "Bike Not Found" };
  const title       = bike.seoTitle       ?? `Book ${bike.model} — PedalGo`;
  const description = bike.seoDescription ?? `Rent the ${bike.model} from ${bike.station.name}. From ${formatCurrency(Number(bike.hourlyRate))}/hr.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter:   { card: "summary", title, description },
  };
}

export default async function BookingPage({ params, searchParams }: Props) {
  let customerDefaults: { name?: string; email?: string; phone?: string } = {};

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
      if (dbUser) customerDefaults = { name: dbUser.name, email: dbUser.email, phone: dbUser.phone ?? undefined };
    }
  }

  const bike = await prisma.bike.findUnique({
    where: { id: params.bikeId },
    include: { station: true },
  });

  if (!bike) notFound();

  if (bike.status !== "AVAILABLE") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold mb-2">Bike Unavailable</h1>
          <p className="text-gray-500 mb-6">This bike is currently not available for booking.</p>
          <Link href="/bikes" className="text-emerald-600 font-medium hover:underline">Browse other bikes →</Link>
        </div>
      </div>
    );
  }

  const hourlyRate = Number(bike.hourlyRate);
  const dailyRate  = Number(bike.dailyRate);
  const imageUrl   = bike.imageUrl ?? BIKE_IMAGES[bike.type] ?? BIKE_IMAGES.CITY;
  const badgeBg    = TYPE_BADGE[bike.type] ?? "bg-gray-600";

  const bullets = [
    "Free cancellation up to 24 hours before pickup",
    "30% deposit only — pay the rest at pickup",
    "Instant confirmation, no waiting",
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Dev banner */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-500 text-white text-xs text-center py-1.5 font-medium">
          Dev mode — booking as demo account
        </div>
      )}

      {/* Back */}
      <div className="px-8 pt-5">
        <Link href="/bikes" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
          <ChevronLeft className="h-4 w-4" />
          All bikes
        </Link>
      </div>

      {/* Main layout */}
      <div className="flex items-start gap-12 max-w-7xl mx-auto px-8 py-8">

        {/* ── LEFT: Bike image + text ── */}
        <div className="flex-1 min-w-0 hidden md:flex flex-col gap-7 sticky top-8">

          {/* Bike image — full size, clearly visible */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-[3/2]">
            <Image
              src={imageUrl}
              alt={bike.model}
              fill
              sizes="(max-width: 1280px) 55vw, 700px"
              className="object-cover object-center"
              priority
            />
            {/* Only a very light bottom gradient so image stays clear */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Type badge */}
            <span className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full ${badgeBg}`}>
              {getBikeTypeLabel(bike.type)}
            </span>

            {/* Available */}
            <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Available now
            </span>

            {/* Model name on image bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-5">
              <p className="text-white text-2xl font-black drop-shadow-lg">{bike.model}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[1,2,3,4].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  <Star className="h-3.5 w-3.5 fill-amber-300/40 text-amber-300/40" />
                </div>
                <span className="text-white/70 text-xs">4.8 · 120+ rentals</span>
              </div>
            </div>
          </div>

          {/* Marketing text below image */}
          <div className="text-white">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              {bike.station.name.toUpperCase()} · {getBikeTypeLabel(bike.type).toUpperCase()} · BOOK ONLINE
            </p>

            <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-3">
              Rent a bike<br />
              <span className="text-emerald-400">in Vietnam</span>
            </h1>

            <p className="text-3xl font-black mb-6">
              from {formatCurrency(hourlyRate)}
              <span className="text-lg font-normal text-white/50"> / hour.</span>
            </p>

            {bike.description && (
              <p className="text-white/60 text-base leading-relaxed mb-5 max-w-md">
                {bike.description}
              </p>
            )}

            <ul className="space-y-2.5 mb-7">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-white/80 text-sm">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <Link href="/bikes" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              See all bikes & prices →
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Booking card ── */}
        <div className="w-full md:w-[420px] shrink-0">
          <BookingForm
            bike={{
              id: bike.id,
              model: bike.model,
              hourlyRate,
              dailyRate,
              station: {
                name: bike.station.name,
                address: bike.station.address,
              },
            }}
            customerDefaults={customerDefaults}
            defaultStart={searchParams?.from ?? null}
            defaultEnd={searchParams?.to ?? null}
          />
        </div>
      </div>
    </div>
  );
}
