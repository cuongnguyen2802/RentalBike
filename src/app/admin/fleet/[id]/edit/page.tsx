import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
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
  await requireAdmin();

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
