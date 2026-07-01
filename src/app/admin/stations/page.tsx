import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MapPin, Phone, Clock, Bike, CheckCircle2, Wrench } from "lucide-react";

export const metadata: Metadata = { title: "Stations — Admin" };

export default async function AdminStationsPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

  const stations = await prisma.station.findMany({
    include: {
      bikes: {
        select: { status: true, type: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stations</h1>
        <p className="text-sm text-gray-500 mt-0.5">{stations.length} pickup locations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {stations.map((station) => {
          const totalBikes     = station.bikes.length;
          const availableBikes = station.bikes.filter((b) => b.status === "AVAILABLE").length;
          const rentedBikes    = station.bikes.filter((b) => b.status === "RENTED").length;
          const maintBikes     = station.bikes.filter((b) => b.status === "MAINTENANCE").length;

          const typeCounts = station.bikes.reduce<Record<string, number>>((acc, b) => {
            acc[b.type] = (acc[b.type] ?? 0) + 1;
            return acc;
          }, {});

          const hours = station.openingHours as Record<string, string> | null;

          return (
            <div key={station.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Map placeholder / header */}
              <div className="h-32 bg-gradient-to-br from-emerald-50 to-teal-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-emerald-400 opacity-50" />
                </div>
                <div className="absolute top-3 right-3 bg-white rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                  {totalBikes} bikes
                </div>
              </div>

              <div className="p-5">
                <h2 className="font-bold text-gray-900 text-base mb-1">{station.name}</h2>

                <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-3">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" />
                  {station.address}
                </div>

                {station.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {station.phone}
                  </div>
                )}

                {hours && (
                  <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-4">
                    <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" />
                    <div>
                      {Object.entries(hours).map(([day, time]) => (
                        <p key={day}><span className="font-medium capitalize">{day}:</span> {time}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bike status breakdown */}
                <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Available", count: availableBikes, icon: CheckCircle2, color: "text-emerald-600" },
                    { label: "Rented",    count: rentedBikes,    icon: Bike,         color: "text-blue-600" },
                    { label: "Maint.",    count: maintBikes,     icon: Wrench,       color: "text-amber-600" },
                  ].map(({ label, count, icon: Icon, color }) => (
                    <div key={label} className="text-center">
                      <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                      <p className="text-lg font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Bike types */}
                {Object.keys(typeCounts).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(typeCounts).map(([type, count]) => (
                      <span key={type} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 font-medium">
                        {type.charAt(0) + type.slice(1).toLowerCase()} ×{count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {stations.length === 0 && (
          <div className="col-span-full text-center py-16">
            <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No stations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
