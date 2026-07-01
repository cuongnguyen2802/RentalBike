"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bike,
  BookOpen,
  MapPin,
  Images,
  Newspaper,
  Users,
  FileText,
  Menu,
  Settings,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { href: "/admin",           label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings",  label: "Bookings",  icon: BookOpen },
  { href: "/admin/fleet",     label: "Fleet",     icon: Bike },
  { href: "/admin/stations",  label: "Stations",  icon: MapPin },
  { href: "/admin/users",     label: "Users",     icon: Users },
  { href: "/admin/blog",      label: "Blog",      icon: Newspaper },
  { href: "/admin/pages",     label: "Pages",     icon: FileText },
  { href: "/admin/menus",     label: "Menus",     icon: Menu },
  { href: "/admin/media",     label: "Media",     icon: Images },
  { href: "/admin/settings",  label: "Settings",  icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-slate-950 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center text-base leading-none">
            🚲
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">PedalGo</p>
            <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
