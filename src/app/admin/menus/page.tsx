import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import MenusClient from "./MenusClient";

export const metadata: Metadata = { title: "Menus — Admin" };

export default async function AdminMenusPage() {
  await requireAdmin();

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
