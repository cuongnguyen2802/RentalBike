import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import MenuEditorClient from "./MenuEditorClient";

export const metadata: Metadata = { title: "Edit Menu — Admin" };

export default async function MenuEditorPage({ params }: { params: Promise<{ id: string }> }) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

  const { id } = await params;

  const menu = await prisma.menu.findUnique({
    where: { id },
    include: { items: { orderBy: { order: "asc" } } },
  });

  if (!menu) notFound();

  const items = menu.items.map(i => ({
    id:     i.id,
    label:  i.label,
    url:    i.url,
    target: i.target,
    order:  i.order,
  }));

  return (
    <div className="p-8">
      <MenuEditorClient
        menu={{ id: menu.id, name: menu.name, slug: menu.slug }}
        initialItems={items}
      />
    </div>
  );
}
