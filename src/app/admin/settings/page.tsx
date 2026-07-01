import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAllSettings } from "@/lib/settings";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") redirect("/");
  }

  const settings = await getAllSettings();

  return (
    <div className="p-8">
      <SettingsClient {...settings} />
    </div>
  );
}
