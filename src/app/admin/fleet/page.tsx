export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import FleetClient from "./FleetClient";

export const metadata: Metadata = { title: "Fleet — Admin" };

export default async function AdminFleetPage() {
  await requireAdmin();

  const bikes = await prisma.bike.findMany({
    include: { station: true, _count: { select: { bookings: true } } },
    orderBy: [{ status: "asc" }, { type: "asc" }],
  });

  const serializedBikes = bikes.map((b) => ({
    ...b,
    hourlyRate: Number(b.hourlyRate),
    dailyRate:  Number(b.dailyRate),
  }));

  return (
    <div className="p-8">
      <FleetClient bikes={serializedBikes} />
    </div>
  );
}
