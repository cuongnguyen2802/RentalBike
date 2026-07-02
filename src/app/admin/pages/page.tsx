import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import PagesClient from "./PagesClient";

export const metadata: Metadata = { title: "Pages — Admin" };

export default async function AdminPagesPage() {
  await requireAdmin();

  const rawPages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  const pages = rawPages.map(p => ({
    id:        p.id,
    title:     p.title,
    slug:      p.slug,
    status:    p.status as string,
    showInNav: p.showInNav,
    pageKey:   p.pageKey,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="p-8">
      <PagesClient pages={pages} total={pages.length} />
    </div>
  );
}
