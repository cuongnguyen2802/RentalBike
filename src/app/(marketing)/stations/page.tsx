import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MapPin, Clock, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Stations",
  description: "Find a PedalGo rental station near you.",
};

export const revalidate = 300;

export default async function StationsPage() {
  const stations = await prisma.station.findMany({
    include: { _count: { select: { bikes: { where: { status: "AVAILABLE" } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Stations</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Find a station near you. All stations are staffed during opening hours
            and equipped with a full fleet of bikes.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {stations.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Station information coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map((station) => {
                const hours = station.openingHours as Record<string, string>;
                return (
                  <Card key={station.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span>{station.name}</span>
                        <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                          {station._count.bikes} available
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        {station.address}
                      </div>
                      {station.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          {station.phone}
                        </div>
                      )}
                      {hours.weekday && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                          Mon–Fri {hours.weekday}
                          {hours.weekend && `, Sat–Sun ${hours.weekend}`}
                        </div>
                      )}
                      <Button variant="outline" className="w-full mt-2" asChild>
                        <Link href={`/bikes?station=${station.id}`}>
                          View Bikes at This Station
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
