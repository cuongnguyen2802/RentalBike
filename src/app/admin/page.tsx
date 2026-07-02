import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDatetime, getStatusColor } from "@/lib/utils";
import {
  Bike,
  BookOpen,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  CircleDot,
  XCircle,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard — Admin" };

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING:   Clock,
  CONFIRMED: CheckCircle2,
  ACTIVE:    CircleDot,
  CANCELLED: XCircle,
};

export default async function AdminPage() {
  await requireAdmin();

  const [
    totalBikes, availableBikes, rentedBikes, maintenanceBikes,
    totalStations,
    recentBookings,
    bookingStatusCounts,
    revenue,
  ] = await Promise.all([
    prisma.bike.count(),
    prisma.bike.count({ where: { status: "AVAILABLE" } }),
    prisma.bike.count({ where: { status: "RENTED" } }),
    prisma.bike.count({ where: { status: "MAINTENANCE" } }),
    prisma.station.count(),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { bike: true, user: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "ACTIVE", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
  ]);

  const statusMap = Object.fromEntries(
    bookingStatusCounts.map((s) => [s.status, s._count._all])
  );
  const totalBookings = bookingStatusCounts.reduce((sum, s) => sum + s._count._all, 0);
  const activeBookings = (statusMap.PENDING ?? 0) + (statusMap.CONFIRMED ?? 0) + (statusMap.ACTIVE ?? 0);

  const stats = [
    {
      label: "Total Bikes",
      value: totalBikes,
      sub: `${availableBikes} available · ${rentedBikes} rented · ${maintenanceBikes} maintenance`,
      icon: Bike,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/admin/fleet",
    },
    {
      label: "Active Bookings",
      value: activeBookings,
      sub: `${statusMap.PENDING ?? 0} pending · ${statusMap.CONFIRMED ?? 0} confirmed · ${statusMap.ACTIVE ?? 0} active`,
      icon: BookOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/admin/bookings",
    },
    {
      label: "Stations",
      value: totalStations,
      sub: "Pickup locations",
      icon: MapPin,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      href: "/admin/stations",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(Number(revenue._sum.totalPrice ?? 0)),
      sub: `From ${totalBookings} bookings`,
      icon: DollarSign,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const bookingStatuses = [
    { key: "PENDING",   label: "Pending",   color: "bg-amber-400" },
    { key: "CONFIRMED", label: "Confirmed", color: "bg-blue-400" },
    { key: "ACTIVE",    label: "Active",    color: "bg-emerald-400" },
    { key: "COMPLETED", label: "Completed", color: "bg-gray-400" },
    { key: "CANCELLED", label: "Cancelled", color: "bg-red-400" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your bike rental operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => {
          const card = (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.sub}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>{card}</Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-emerald-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">No bookings yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-50">
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Bike</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => {
                  const Icon = STATUS_ICONS[b.status] ?? CircleDot;
                  return (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-900">{b.user.name}</p>
                        <p className="text-xs text-gray-400">{b.user.email}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{b.bike.model}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{formatDatetime(b.startTime)}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(b.status)}`}>
                          <Icon className="h-3 w-3" />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-800">
                        {formatCurrency(Number(b.totalPrice))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Booking status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Bookings by Status</h2>
          {totalBookings === 0 ? (
            <p className="text-sm text-gray-400">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookingStatuses.map(({ key, label, color }) => {
                const count = statusMap[key] ?? 0;
                const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="text-gray-900 font-bold">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bike fleet status */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Fleet Status</h3>
            <div className="space-y-3">
              {[
                { label: "Available", count: availableBikes, color: "bg-emerald-400" },
                { label: "Rented",    count: rentedBikes,    color: "bg-blue-400" },
                { label: "Maintenance", count: maintenanceBikes, color: "bg-amber-400" },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: totalBikes > 0 ? `${(count / totalBikes) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
