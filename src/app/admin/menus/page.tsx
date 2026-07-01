import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import MenusClient from "./MenusClient";

export const metadata: Metadata = { title: "Menus — Admin" };

export default async function AdminMenusPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

  const raw = await prisma.menu.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { items: true } } },
  });

  const menus = raw.map(m => ({
    id:        m.id,
    name:      m.name,
    slug:      m.slug,
    itemCount: m._count.items,
    updatedAt: m.updatedAt.toISOString(),
  }));

  return (
    <div className="p-8">
      <MenusClient menus={menus} />
    </div>
  );
}
