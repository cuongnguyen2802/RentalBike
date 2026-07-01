"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { error: string };

function refresh() {
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/bikes");
}

/** PENDING → CONFIRMED */
export async function confirmBooking(bookingId: string): Promise<Result> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking)                    return { error: "Booking not found." };
  if (booking.status !== "PENDING") return { error: "Only PENDING bookings can be confirmed." };
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
  refresh();
  return { success: true };
}

/** CONFIRMED → ACTIVE  +  bike.status = RENTED */
export async function activateBooking(bookingId: string): Promise<Result> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { bike: true },
  });
  if (!booking)                      return { error: "Booking not found." };
  if (booking.status !== "CONFIRMED") return { error: "Only CONFIRMED bookings can be activated." };

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { status: "ACTIVE" } }),
    prisma.bike.update({ where: { id: booking.bikeId }, data: { status: "RENTED" } }),
  ]);
  refresh();
  return { success: true };
}

/** ACTIVE → COMPLETED  +  bike.status = AVAILABLE */
export async function completeBooking(bookingId: string): Promise<Result> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { bike: true },
  });
  if (!booking)                    return { error: "Booking not found." };
  if (booking.status !== "ACTIVE") return { error: "Only ACTIVE bookings can be completed." };

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { status: "COMPLETED" } }),
    prisma.bike.update({ where: { id: booking.bikeId }, data: { status: "AVAILABLE" } }),
  ]);
  refresh();
  return { success: true };
}

/** PENDING | CONFIRMED → CANCELLED */
export async function cancelBooking(bookingId: string): Promise<Result> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { bike: true },
  });
  if (!booking) return { error: "Booking not found." };
  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return { error: "Only PENDING or CONFIRMED bookings can be cancelled." };
  }
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  // If bike was somehow RENTED, free it up
  if (booking.bike.status === "RENTED") {
    await prisma.bike.update({ where: { id: booking.bikeId }, data: { status: "AVAILABLE" } });
  }
  refresh();
  return { success: true };
}
