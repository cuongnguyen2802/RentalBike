"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkOverlap } from "./availability";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const DEV_USER_EMAIL = "dev@pedalgo.local";

const BookingSchema = z.object({
  bikeId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(500).optional(),
  customerName:  z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(6, "Phone number is required"),
});

export async function createBooking(formData: unknown) {
  let supabaseUserId: string | null = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in to book a bike." };
    supabaseUserId = user.id;
  }

  const parsed = BookingSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid booking data.", details: parsed.error.flatten() };
  }

  const { bikeId, startTime: startStr, endTime: endStr, notes,
    customerName, customerPhone } = parsed.data;
  const startTime = new Date(startStr);
  const endTime = new Date(endStr);

  if (startTime >= endTime) {
    return { error: "End time must be after start time." };
  }
  if (startTime < new Date()) {
    return { error: "Start time cannot be in the past." };
  }

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    include: { station: true },
  });
  if (!bike || bike.status !== "AVAILABLE") {
    return { error: "This bike is not available." };
  }

  const hasOverlap = await checkOverlap(bikeId, startTime, endTime);
  if (hasOverlap) {
    return { error: "This bike is already booked for the selected time." };
  }

  const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const totalPrice =
    hours >= 24
      ? Math.ceil(hours / 24) * Number(bike.dailyRate)
      : hours * Number(bike.hourlyRate);

  let dbUser;
  if (supabaseUserId) {
    dbUser = await prisma.user.findUnique({ where: { supabaseId: supabaseUserId } });
    if (!dbUser) return { error: "User profile not found. Please complete your profile." };
  } else {
    // Dev mode: upsert dev user, update with submitted customer info
    dbUser = await prisma.user.upsert({
      where: { email: DEV_USER_EMAIL },
      create: {
        name: customerName,
        email: DEV_USER_EMAIL,
        supabaseId: "dev-local",
        phone: customerPhone,
        role: "ADMIN",
      },
      update: {
        name: customerName,
        phone: customerPhone,
      },
    });
  }

  const lockExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min soft lock

  const booking = await prisma.$transaction(async (tx) => {
    const overlap = await tx.booking.findFirst({
      where: {
        bikeId,
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    if (overlap) throw new Error("OVERLAP");

    const newBooking = await tx.booking.create({
      data: {
        bikeId,
        userId: dbUser.id,
        startTime,
        endTime,
        totalPrice,
        notes,
        status: "PENDING",
        lock: {
          create: { bikeId, expiresAt: lockExpiresAt },
        },
      },
    });
    return newBooking;
  });

  revalidatePath(`/bikes`);
  revalidatePath(`/book/${bikeId}`);

  return { success: true, bookingId: booking.id, totalPrice };
}

export async function checkAvailability(
  bikeId: string,
  startTime: string,
  endTime: string
): Promise<{ available: boolean; error?: string }> {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return { available: false, error: "Invalid time range" };
  }
  const conflict = await checkOverlap(bikeId, start, end);
  return { available: !conflict };
}

export async function cancelBooking(bookingId: string) {
  let dbUser;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };
    dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) return { error: "User not found" };
  } else {
    dbUser = await prisma.user.findUnique({ where: { email: DEV_USER_EMAIL } });
    if (!dbUser) return { error: "Dev user not found" };
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: dbUser.id },
  });
  if (!booking) return { error: "Booking not found" };
  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return { error: "This booking cannot be cancelled." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/account/bookings");
  return { success: true };
}
