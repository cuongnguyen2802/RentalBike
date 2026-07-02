import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import BikeFormPage from "../BikeFormPage";

export const metadata: Metadata = { title: "Add Bike — Admin" };

export default async function NewBikePage() {
  await requireAdmin();

  const stations = await prisma.station.findMany({ orderBy: { name: "asc" } });
  const stationOptions = stations.map(s => ({ id: s.id, name: s.name }));

  return (
    <div className="p-8">
      <BikeFormPage mode="add" stations={stationOptions} />
    </div>
  );
}
