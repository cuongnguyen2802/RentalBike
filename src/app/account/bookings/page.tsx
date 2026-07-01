import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatDatetime, formatCurrency, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CalendarClock, Bike } from "lucide-react";
import CancelBookingButton from "./CancelBookingButton";

export const metadata: Metadata = { title: "My Bookings" };

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/bookings");

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) redirect("/");

  const bookings = await prisma.booking.findMany({
    where: { userId: dbUser.id },
    include: { bike: { include: { station: true } } },
    orderBy: { createdAt: "desc" },
  });

  const upcoming = bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "ACTIVE"].includes(b.status)
  );
  const past = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(b.status)
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <Bike className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h2>
          <p className="text-gray-500 mb-6">Ready for your first ride?</p>
          <Button asChild>
            <Link href="/bikes">Browse Bikes</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showCancel />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Past Bookings</h2>
              <div className="space-y-4">
                {past.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  showCancel,
}: {
  booking: Awaited<ReturnType<typeof prisma.booking.findMany>>[0] & {
    bike: { model: string; type: string; station: { name: string } };
  };
  showCancel?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{booking.bike.model}</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(booking.status)}`}
          >
            {booking.status}
          </span>
        </CardTitle>
        <p className="text-sm text-gray-500">{booking.bike.station.name}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Pickup</p>
            <div className="flex items-center gap-1 font-medium">
              <CalendarClock className="h-3.5 w-3.5 text-emerald-500" />
              {formatDatetime(booking.startTime)}
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Return</p>
            <div className="flex items-center gap-1 font-medium">
              <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
              {formatDatetime(booking.endTime)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{formatCurrency(Number(booking.totalPrice))}</span>
          {showCancel && ["PENDING", "CONFIRMED"].includes(booking.status) && (
            <CancelBookingButton bookingId={booking.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
