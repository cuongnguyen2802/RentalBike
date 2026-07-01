import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import BikeFormPage from "../../BikeFormPage";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bike = await prisma.bike.findUnique({ where: { id: params.id } });
  return { title: bike ? `Edit — ${bike.model}` : "Edit Bike" };
}

export default async function EditBikePage({ params }: Props) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

  const [bike, stations] = await Promise.all([
    prisma.bike.findUnique({
      where: { id: params.id },
      include: { station: true },
    }),
    prisma.station.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!bike) notFound();

  const bikeData = {
    id:             bike.id,
    model:          bike.model,
    type:           bike.type,
    status:         bike.status,
    hourlyRate:     Number(bike.hourlyRate),
    dailyRate:      Number(bike.dailyRate),
    description:    bike.description,
    imageUrl:       bike.imageUrl,
    slug:           bike.slug,
    seoTitle:       bike.seoTitle,
    seoDescription: bike.seoDescription,
    station: {
      id:   bike.station.id,
      name: bike.station.name,
    },
  };

  const stationOptions = stations.map(s => ({ id: s.id, name: s.name }));

  return (
    <div className="p-8">
      <BikeFormPage mode="edit" bike={bikeData} stations={stationOptions} />
    </div>
  );
}
