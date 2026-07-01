import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import BikeFormPage from "../BikeFormPage";

export const metadata: Metadata = { title: "Add Bike — Admin" };

export default async function NewBikePage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

  const stations = await prisma.station.findMany({ orderBy: { name: "asc" } });
  const stationOptions = stations.map(s => ({ id: s.id, name: s.name }));

  return (
    <div className="p-8">
      <BikeFormPage mode="add" stations={stationOptions} />
    </div>
  );
}
