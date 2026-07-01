import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, UserCheck, User as UserIcon, LogOut, Settings } from "lucide-react";
import NotificationBell, { type ActivityItem } from "./NotificationBell";

const ROLE_CFG = {
  ADMIN:    { label: "Admin",    icon: ShieldCheck, color: "text-violet-400" },
  STAFF:    { label: "Staff",    icon: UserCheck,   color: "text-amber-400"  },
  CUSTOMER: { label: "Customer", icon: UserIcon,    color: "text-sky-400"    },
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const ini   = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return (
    <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
      {ini}
    </div>
  );
}

export default async function AdminHeader() {
  /* ── Current user ── */
  let userName  = "Dev Admin";
  let userEmail = "dev@pedalgo.local";
  let userRole  = "ADMIN";

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
      if (dbUser) {
        userName  = dbUser.name;
        userEmail = dbUser.email;
        userRole  = dbUser.role;
      }
    }
  } else {
    // Dev mode — read the dev user from DB if it exists
    const devUser = await prisma.user.findUnique({ where: { email: "dev@pedalgo.local" } });
    if (devUser) {
      userName  = devUser.name;
      userEmail = devUser.email;
      userRole  = devUser.role;
    }
  }

  /* ── Recent activity (last 7 days, max 20) ── */
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentBookings = await prisma.booking.findMany({
    where:   { createdAt: { gte: since } },
    include: { user: { select: { name: true } }, bike: { select: { model: true } } },
    orderBy: { createdAt: "desc" },
    take:    20,
  });

  const activities: ActivityItem[] = recentBookings.map(b => {
    const typeMap: Record<string, ActivityItem["type"]> = {
      PENDING:   "NEW_BOOKING",
      CONFIRMED: "CONFIRMED",
      ACTIVE:    "ACTIVE",
      COMPLETED: "COMPLETED",
      CANCELLED: "CANCELLED",
    };
    const msgMap: Record<string, string> = {
      PENDING:   `New booking from ${b.user.name}`,
      CONFIRMED: `Booking confirmed — ${b.user.name}`,
      ACTIVE:    `Ride started — ${b.user.name}`,
      COMPLETED: `Bike returned — ${b.user.name}`,
      CANCELLED: `Booking cancelled — ${b.user.name}`,
    };
    return {
      id:        b.id,
      type:      typeMap[b.status] ?? "NEW_BOOKING",
      message:   msgMap[b.status] ?? `Booking — ${b.user.name}`,
      sub:       b.bike.model,
      href:      "/admin/bookings",
      createdAt: b.createdAt.toISOString(),
    };
  });

  const roleCfg = ROLE_CFG[userRole as keyof typeof ROLE_CFG] ?? ROLE_CFG.ADMIN;
  const RoleIcon = roleCfg.icon;

  return (
    <header className="h-14 bg-slate-950 border-b border-white/8 flex items-center px-6 gap-4 shrink-0">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell */}
      <NotificationBell items={activities} />

      {/* Divider */}
      <div className="h-6 w-px bg-white/10" />

      {/* User card */}
      <div className="flex items-center gap-2.5 group relative">
        <Initials name={userName} />
        <div className="hidden sm:block leading-none">
          <p className="text-sm font-semibold text-white leading-snug">{userName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <RoleIcon className={`h-3 w-3 ${roleCfg.color}`} />
            <span className={`text-[11px] font-medium ${roleCfg.color}`}>{roleCfg.label}</span>
          </div>
        </div>

        {/* Dropdown on hover */}
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 translate-y-1 group-hover:translate-y-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{userEmail}</p>
          </div>
          <div className="py-1">
            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" /> Account settings
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 text-gray-400" /> Back to site
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
