import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import FleetClient from "./FleetClient";

export const metadata: Metadata = { title: "Fleet — Admin" };

export default async function AdminFleetPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

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
