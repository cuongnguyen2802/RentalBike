import { prisma } from "@/lib/prisma";

export async function getBikeAvailability(bikeId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      bikeId,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      OR: [
        { startTime: { gte: dayStart, lte: dayEnd } },
        { endTime: { gte: dayStart, lte: dayEnd } },
        { startTime: { lte: dayStart }, endTime: { gte: dayEnd } },
      ],
    },
    select: { startTime: true, endTime: true, status: true },
  });

  return bookings;
}

export async function checkOverlap(
  bikeId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      bikeId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  return conflict !== null;
}

export async function getAvailableBikes(
  stationId: string | undefined,
  startTime: Date,
  endTime: Date
) {
  const bookedBikeIds = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: { bikeId: true },
  });

  const bookedIds = bookedBikeIds.map((b) => b.bikeId);

  return prisma.bike.findMany({
    where: {
      status: "AVAILABLE",
      stationId: stationId || undefined,
      id: bookedIds.length > 0 ? { notIn: bookedIds } : undefined,
    },
    include: { station: true },
  });
}
