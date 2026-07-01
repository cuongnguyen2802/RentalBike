import Image from "next/image";
import Link from "next/link";
import { MapPin, Zap, Star, CalendarX, CheckCircle2 } from "lucide-react";
import { getBikeTypeLabel, formatCurrency } from "@/lib/utils";
import type { BikeWithStation } from "@/types";

const BIKE_IMAGES: Record<string, string> = {
  CITY:     "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
  MOUNTAIN: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=600&q=80",
  ELECTRIC: "https://images.unsplash.com/photo-1619118606863-d26a3e3fcad6?auto=format&fit=crop&w=600&q=80",
  ROAD:     "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80",
  KIDS:     "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
};

const TYPE_BADGE: Record<string, string> = {
  CITY:     "bg-sky-100 text-sky-700",
  MOUNTAIN: "bg-amber-100 text-amber-700",
  ELECTRIC: "bg-emerald-100 text-emerald-700",
  ROAD:     "bg-violet-100 text-violet-700",
  KIDS:     "bg-pink-100 text-pink-700",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

interface Props {
  bike: BikeWithStation;
  availableForDates?: boolean | null; // null = no dates selected
  nextFreeAt?: string | null;
  bookingFrom?: string | null;
  bookingTo?: string | null;
}

export default function BikeCard({
  bike,
  availableForDates = null,
  nextFreeAt = null,
  bookingFrom = null,
  bookingTo = null,
}: Props) {
  const imageUrl   = bike.imageUrl ?? BIKE_IMAGES[bike.type] ?? BIKE_IMAGES.CITY;
  const badgeClass = TYPE_BADGE[bike.type] ?? "bg-gray-100 text-gray-700";
  const isBooked   = availableForDates === false; // explicitly not available for dates

  // Build booking URL — pass dates as query params if available
  const bookingHref = bookingFrom && bookingTo
    ? `/book/${bike.id}?from=${encodeURIComponent(bookingFrom)}&to=${encodeURIComponent(bookingTo)}`
    : `/book/${bike.id}`;

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 group ${
      isBooked
        ? "border-gray-200 opacity-70 grayscale-[30%]"
        : "border-gray-100 hover:shadow-lg"
    }`}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={bike.model}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 ${isBooked ? "" : "group-hover:scale-105"}`}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Type badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {getBikeTypeLabel(bike.type)}
        </span>

        {/* Availability badge — top right */}
        {availableForDates === true && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Available
          </span>
        )}
        {availableForDates === false && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            <CalendarX className="h-3 w-3" />
            Booked
          </span>
        )}
        {availableForDates === null && bike.type === "ELECTRIC" && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="h-3 w-3 fill-current" /> E-Bike
          </span>
        )}
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

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{bike.station.name}</span>
        </div>

        {/* Next free indicator */}
        {isBooked && nextFreeAt && (
          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 mb-2 mt-1">
            <CalendarX className="h-3.5 w-3.5 shrink-0" />
            <span>Free after {formatDateTime(nextFreeAt)}</span>
          </div>
        )}

        {bike.description && !isBooked && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed mt-1">{bike.description}</p>
        )}

        {/* Price row */}
        <div className="flex items-baseline justify-between mb-4 mt-2">
          <div>
            <span className="text-2xl font-black text-gray-900">{formatCurrency(Number(bike.hourlyRate))}</span>
            <span className="text-gray-400 text-sm font-normal">/hr</span>
          </div>
          <span className="text-sm text-gray-400">{formatCurrency(Number(bike.dailyRate))}/day</span>
        </div>

        {isBooked ? (
          <Link
            href="/bikes"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            Try Different Dates
          </Link>
        ) : (
          <Link
            href={bookingHref}
            className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {availableForDates === true ? "Book for These Dates" : "Book This Bike"}
          </Link>
        )}
      </div>
    </div>
  );
}
