"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell, X, BookOpen, CheckCircle2, Bike, RotateCcw,
  XCircle, Clock, Package,
} from "lucide-react";

export type ActivityItem = {
  id:        string;
  type:      "NEW_BOOKING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  message:   string;
  sub:       string;
  href:      string;
  createdAt: string;
};

const TYPE_CFG = {
  NEW_BOOKING: { icon: Package,      bg: "bg-amber-100",   text: "text-amber-600",   label: "New Order"  },
  CONFIRMED:   { icon: CheckCircle2, bg: "bg-blue-100",    text: "text-blue-600",    label: "Confirmed"  },
  ACTIVE:      { icon: Bike,         bg: "bg-emerald-100", text: "text-emerald-600", label: "Active"     },
  COMPLETED:   { icon: RotateCcw,    bg: "bg-gray-100",    text: "text-gray-500",    label: "Returned"   },
  CANCELLED:   { icon: XCircle,      bg: "bg-red-100",     text: "text-red-500",     label: "Cancelled"  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STORAGE_KEY = "pedalgo_notif_read_at";

export default function NotificationBell({ items }: { items: ActivityItem[] }) {
  const [open,     setOpen]     = useState(false);
  const [readAt,   setReadAt]   = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setReadAt(Number(stored));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = items.filter(i => new Date(i.createdAt).getTime() > readAt).length;

  function markAllRead() {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    setReadAt(now);
  }

  function handleOpen() {
    setOpen(v => !v);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-gray-900 text-sm">Notifications</span>
              {unread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            ) : (
              items.map(item => {
                const cfg     = TYPE_CFG[item.type];
                const Icon    = cfg.icon;
                const isNew   = new Date(item.createdAt).getTime() > readAt;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${isNew ? "bg-blue-50/40" : ""}`}
                  >
                    <div className={`h-8 w-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`h-4 w-4 ${cfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-snug ${isNew ? "text-gray-900" : "text-gray-700"}`}>
                          {item.message}
                        </p>
                        {isNew && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{item.sub}</p>
                      <p className="text-[11px] text-gray-300 mt-1">{timeAgo(item.createdAt)}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <Link
                href="/admin/bookings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                View all bookings →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
