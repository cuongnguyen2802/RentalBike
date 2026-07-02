import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import MenuEditorClient from "./MenuEditorClient";

export const metadata: Metadata = { title: "Edit Menu — Admin" };

export default async function MenuEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

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
