import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BikeCard from "./BikeCard";
import BikeFilters from "./BikeFilters";
import { Bike, CalendarCheck } from "lucide-react";
import type { BikeType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Browse Bikes",
  description: "Find and book the perfect bike for your adventure in Vietnam. City bikes, mountain bikes, electric bikes — real-time availability.",
  openGraph: {
    title:       "Browse Bikes — PedalGo Rentals",
    description: "Find and book the perfect bike for your adventure in Vietnam. Real-time availability.",
  },
};

interface SearchParams {
  type?:     string;
  station?:  string;
  maxPrice?: string;
  from?:     string;
  to?:       string;
}

export default async function BikesPage({ searchParams }: { searchParams: SearchParams }) {
  const stations = await prisma.station.findMany({ orderBy: { name: "asc" } }).catch(() => []);

  const typeFilter  = searchParams.type?.toUpperCase() as BikeType | undefined;
  const validTypes: BikeType[] = ["CITY", "MOUNTAIN", "ELECTRIC", "KIDS", "ROAD"];
  const type        = typeFilter && validTypes.includes(typeFilter) ? typeFilter : undefined;

  // Parse date window
  const fromRaw = searchParams.from;
  const toRaw   = searchParams.to;
  const from    = fromRaw ? new Date(fromRaw) : null;
  const to      = toRaw   ? new Date(toRaw)   : null;
  const datesValid = from && to && !isNaN(from.getTime()) && !isNaN(to.getTime()) && to > from;

  // Fetch all AVAILABLE bikes (fleet status)
  const bikes = await prisma.bike.findMany({
    where: {
      status: "AVAILABLE",
      type:       type || undefined,
      stationId:  searchParams.station || undefined,
      hourlyRate: searchParams.maxPrice ? { lte: parseFloat(searchParams.maxPrice) } : undefined,
    },
    include: { station: true },
    orderBy: [{ type: "asc" }, { hourlyRate: "asc" }],
  }).catch(() => []);

  // When dates selected: find bookings that overlap the window
  // bookedMap: bikeId → latest endTime among all conflicting bookings
  const bookedMap = new Map<string, Date>();
  if (datesValid) {
    const conflicts = await prisma.booking.findMany({
      where: {
        status:    { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        startTime: { lt: to! },
        endTime:   { gt: from! },
        bikeId:    { in: bikes.map((b) => b.id) },
      },
      select: { bikeId: true, endTime: true },
    });
    for (const c of conflicts) {
      const prev = bookedMap.get(c.bikeId);
      if (!prev || c.endTime > prev) bookedMap.set(c.bikeId, c.endTime);
    }
  }

  // Sort: when dates active, available-for-dates bikes first
  const sorted = datesValid
    ? [...bikes].sort((a, b) => {
        const aBooked = bookedMap.has(a.id) ? 1 : 0;
        const bBooked = bookedMap.has(b.id) ? 1 : 0;
        return aBooked - bBooked;
      })
    : bikes;

  const availableCount = datesValid
    ? bikes.filter((b) => !bookedMap.has(b.id)).length
    : bikes.length;

  // Format label for header
  const dateLabel = datesValid
    ? `${from!.toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })} → ${to!.toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}`
    : null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Bikes</h1>
        {datesValid ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
              <CalendarCheck className="h-4 w-4" />
              {dateLabel}
            </span>
            <span className="text-gray-500 text-sm">
              <strong className="text-gray-900">{availableCount}</strong> of {bikes.length} bikes available
            </span>
          </div>
        ) : (
          <p className="text-gray-500">
            {bikes.length} bike{bikes.length !== 1 ? "s" : ""} available right now
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <BikeFilters stations={stations} />
        </aside>

        <div className="flex-1">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Bike className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No bikes match your filters</p>
              <p className="text-sm mt-1">Try adjusting the filters to see more options.</p>
            </div>
          ) : (
            <>
              {/* Available section */}
              {datesValid && availableCount > 0 && (
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
                  ✓ Available for your dates ({availableCount})
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sorted.map((bike) => {
                  const nextFree = bookedMap.get(bike.id);
                  return (
                    <BikeCard
                      key={bike.id}
                      bike={bike}
                      availableForDates={datesValid ? !bookedMap.has(bike.id) : null}
                      nextFreeAt={nextFree ? nextFree.toISOString() : null}
                      bookingFrom={datesValid ? fromRaw! : null}
                      bookingTo={datesValid ? toRaw! : null}
                    />
                  );
                })}
              </div>

              {/* Unavailable section label */}
              {datesValid && bookedMap.size > 0 && availableCount < sorted.length && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-8 mb-3">
                  Already booked for these dates ({bookedMap.size})
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
