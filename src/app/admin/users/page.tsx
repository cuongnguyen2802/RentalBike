import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const metadata: Metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") redirect("/");
  }

  const [rawUsers, roleCounts] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const total     = rawUsers.length;
  const countMap  = Object.fromEntries(roleCounts.map(r => [r.role, r._count._all]));

  const users = rawUsers.map(u => ({
    id:           u.id,
    name:         u.name,
    email:        u.email,
    phone:        u.phone ?? null,
    role:         u.role,
    createdAt:    u.createdAt.toISOString(),
    bookingCount: u._count.bookings,
  }));

  return (
    <div className="p-8">
      <UsersClient users={users} roleCounts={countMap} total={total} />
    </div>
  );
}
