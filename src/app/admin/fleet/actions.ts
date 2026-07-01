"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BikeSchema = z.object({
  model:          z.string().min(2, "Model name must be at least 2 characters"),
  type:           z.enum(["CITY", "MOUNTAIN", "ELECTRIC", "ROAD", "KIDS"]),
  stationId:      z.string().min(1, "Station is required"),
  status:         z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]),
  hourlyRate:     z.coerce.number().positive("Hourly rate must be positive"),
  dailyRate:      z.coerce.number().positive("Daily rate must be positive"),
  description:    z.string().optional(),
  imageUrl:       z.string().optional().transform(v => v?.trim() || undefined),
  slug:           z.string().optional().transform(v => v?.trim() || undefined),
  seoTitle:       z.string().optional().transform(v => v?.trim() || undefined),
  seoDescription: z.string().optional().transform(v => v?.trim() || undefined),
});

type Result = { success: true } | { error: string };

function refresh() {
  revalidatePath("/admin/fleet");
  revalidatePath("/bikes");
  revalidatePath("/");
}

export async function createBike(data: unknown): Promise<Result> {
  const parsed = BikeSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  try {
    await prisma.bike.create({ data: parsed.data });
    refresh();
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("slug")) return { error: "This slug is already in use — choose a different one." };
    return { error: "Failed to create bike. Please try again." };
  }
}

export async function updateBike(bikeId: string, data: unknown): Promise<Result> {
  const parsed = BikeSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  try {
    await prisma.bike.update({ where: { id: bikeId }, data: parsed.data });
    refresh();
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("slug")) return { error: "This slug is already in use — choose a different one." };
    return { error: "Failed to update bike." };
  }
}

export async function deleteBike(bikeId: string): Promise<Result> {
  const active = await prisma.booking.count({
    where: { bikeId, status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] } },
  });
  if (active > 0) return { error: `Cannot delete: ${active} active booking(s) exist.` };
  try {
    await prisma.bike.delete({ where: { id: bikeId } });
    refresh();
    return { success: true };
  } catch {
    return { error: "Failed to delete bike." };
  }
}

export async function deleteManyBikes(bikeIds: string[]): Promise<Result> {
  if (!bikeIds.length) return { error: "No bikes selected." };
  const active = await prisma.booking.count({
    where: { bikeId: { in: bikeIds }, status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] } },
  });
  if (active > 0) return { error: `Cannot delete: ${active} active booking(s) exist on selected bikes.` };
  try {
    await prisma.bike.deleteMany({ where: { id: { in: bikeIds } } });
    refresh();
    return { success: true };
  } catch {
    return { error: "Failed to delete bikes." };
  }
}
