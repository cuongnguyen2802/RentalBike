import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import BookingsClient from "./BookingsClient";

export const metadata: Metadata = { title: "Bookings — Admin" };

export default async function AdminBookingsPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

  const [rawBookings, counts] = await Promise.all([
    prisma.booking.findMany({
      include: { bike: { include: { station: true } }, user: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total    = counts.reduce((s, c) => s + c._count._all, 0);

  // Serialize for Client Component (no Decimal / Date objects)
  const bookings = rawBookings.map((b) => ({
    id:         b.id,
    status:     b.status,
    startTime:  b.startTime.toISOString(),
    endTime:    b.endTime.toISOString(),
    createdAt:  b.createdAt.toISOString(),
    totalPrice: Number(b.totalPrice),
    notes:      b.notes ?? null,
    user: {
      name:  b.user.name,
      email: b.user.email,
      phone: b.user.phone ?? null,
    },
    bike: {
      model: b.bike.model,
      type:  b.bike.type,
    },
    station: {
      name: b.bike.station.name,
    },
  }));

  return (
    <div className="p-8">
      <BookingsClient bookings={bookings} countMap={countMap} total={total} />
    </div>
  );
}
