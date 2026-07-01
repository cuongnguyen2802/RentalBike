import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import PagesClient from "./PagesClient";

export const metadata: Metadata = { title: "Pages — Admin" };

export default async function AdminPagesPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

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
