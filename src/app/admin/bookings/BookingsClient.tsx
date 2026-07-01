"use client";

import { useState, useTransition, useEffect } from "react";
import {
  BookOpen, CheckCircle2, XCircle, Bike as BikeIcon,
  RotateCcw, Clock, Loader2, AlertCircle, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { confirmBooking, activateBooking, completeBooking, cancelBooking } from "./actions";

/* ── Types ── */

export type BookingRow = {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  totalPrice: number;
  notes: string | null;
  user: { name: string; email: string; phone: string | null };
  bike: { model: string; type: string };
  station: { name: string };
};

/* ── Status config ── */

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"  },
  CONFIRMED: { label: "Confirmed", bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400"   },
  ACTIVE:    { label: "Active",    bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500 animate-pulse" },
  COMPLETED: { label: "Completed", bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400"   },
  CANCELLED: { label: "Cancelled", bg: "bg-red-50",     text: "text-red-500",     dot: "bg-red-400"    },
};

const STATUS_TABS = [
  { key: "ALL",       label: "All"       },
  { key: "PENDING",   label: "Pending"   },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "ACTIVE",    label: "Active"    },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
] as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDT(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function formatDuration(start: string, end: string) {
  const ms   = new Date(end).getTime() - new Date(start).getTime();
  const hrs  = ms / (1000 * 60 * 60);
  if (hrs < 24) return `${hrs.toFixed(hrs % 1 === 0 ? 0 : 1)} hr${hrs !== 1 ? "s" : ""}`;
  const days = Math.ceil(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
}

/* ── Action button ── */

function ActionBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant: "green" | "blue" | "emerald" | "red" | "gray";
  children: React.ReactNode;
}) {
  const colors = {
    green:   "bg-emerald-600 hover:bg-emerald-500 text-white",
    blue:    "bg-blue-600   hover:bg-blue-500   text-white",
    emerald: "bg-teal-600   hover:bg-teal-500   text-white",
    red:     "bg-red-500    hover:bg-red-400    text-white",
    gray:    "bg-gray-100   hover:bg-gray-200   text-gray-700",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${colors[variant]}`}
    >
      {children}
    </button>
  );
}

/* ── Main component ── */

export default function BookingsClient({
  bookings: initial,
  countMap,
  total,
}: {
  bookings: BookingRow[];
  countMap: Record<string, number>;
  total: number;
}) {
  const [bookings,    setBookings]    = useState(initial);
  const [activeTab,   setActiveTab]   = useState<string>("ALL");
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);
  const [loadingId,   setLoadingId]   = useState<string | null>(null);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [counts,      setCounts]      = useState(countMap);
  const [isPending,   startTransition] = useTransition();

  useEffect(() => { setBookings(initial); setCounts(countMap); }, [initial, countMap]);

  const displayed = activeTab === "ALL"
    ? bookings
    : bookings.filter(b => b.status === activeTab);

  /* ── Transition helpers ── */
  async function run(id: string, action: () => Promise<{ success: true } | { error: string }>) {
    setErrorMsg(null);
    setLoadingId(id);
    startTransition(async () => {
      const r = await action();
      setLoadingId(null);
      if ("error" in r) { setErrorMsg(r.error); return; }
      // Optimistic update disabled — rely on server revalidate; page will re-render
    });
  }

  const loading = (id: string) => isPending && loadingId === id;

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} total bookings</p>
      </div>

      {/* ── Error banner ── */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Status tabs ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_TABS.map(({ key, label }) => {
          const count  = key === "ALL" ? total : (counts[key] ?? 0);
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3.5 font-medium">Customer</th>
              <th className="px-6 py-3.5 font-medium">Bike</th>
              <th className="px-6 py-3.5 font-medium">Station</th>
              <th className="px-6 py-3.5 font-medium">Period</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
              <th className="px-6 py-3.5 font-medium text-right">Total</th>
              <th className="px-6 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((b) => (
              <>
                {/* ── Main row ── */}
                <tr
                  key={b.id}
                  className={`border-b border-gray-50 transition-colors ${
                    expandedId === b.id ? "bg-slate-50" : "hover:bg-gray-50/50"
                  }`}
                >
                  {/* Customer */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{b.user.name}</p>
                    <p className="text-xs text-gray-400">{b.user.email}</p>
                    {b.user.phone && <p className="text-xs text-gray-400">{b.user.phone}</p>}
                  </td>

                  {/* Bike */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{b.bike.model}</p>
                    <p className="text-xs text-gray-400">{b.bike.type}</p>
                  </td>

                  {/* Station */}
                  <td className="px-6 py-4 text-gray-500 text-xs">{b.station.name}</td>

                  {/* Period */}
                  <td className="px-6 py-4">
                    <p className="text-gray-700 text-xs font-medium">{formatDT(b.startTime)}</p>
                    <p className="text-xs text-gray-400">→ {formatDT(b.endTime)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatDuration(b.startTime, b.endTime)}</p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(b.totalPrice)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* PENDING: Confirm + Cancel */}
                      {b.status === "PENDING" && (
                        <>
                          <ActionBtn
                            variant="green"
                            disabled={loading(b.id)}
                            onClick={() => run(b.id, () => confirmBooking(b.id))}
                          >
                            {loading(b.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Confirm
                          </ActionBtn>
                          <ActionBtn
                            variant="gray"
                            disabled={loading(b.id)}
                            onClick={() => run(b.id, () => cancelBooking(b.id))}
                          >
                            <XCircle className="h-3.5 w-3.5 text-red-400" />
                            Cancel
                          </ActionBtn>
                        </>
                      )}

                      {/* CONFIRMED: Mark Active + Cancel */}
                      {b.status === "CONFIRMED" && (
                        <>
                          <ActionBtn
                            variant="blue"
                            disabled={loading(b.id)}
                            onClick={() => run(b.id, () => activateBooking(b.id))}
                          >
                            {loading(b.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BikeIcon className="h-3.5 w-3.5" />}
                            Picked Up
                          </ActionBtn>
                          <ActionBtn
                            variant="gray"
                            disabled={loading(b.id)}
                            onClick={() => run(b.id, () => cancelBooking(b.id))}
                          >
                            <XCircle className="h-3.5 w-3.5 text-red-400" />
                            Cancel
                          </ActionBtn>
                        </>
                      )}

                      {/* ACTIVE: Return Bike — most prominent */}
                      {b.status === "ACTIVE" && (
                        <ActionBtn
                          variant="emerald"
                          disabled={loading(b.id)}
                          onClick={() => run(b.id, () => completeBooking(b.id))}
                        >
                          {loading(b.id)
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <RotateCcw className="h-3.5 w-3.5" />}
                          Return Bike
                        </ActionBtn>
                      )}

                      {/* Expand details */}
                      <button
                        onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Details"
                      >
                        {expandedId === b.id
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* ── Expanded detail row ── */}
                {expandedId === b.id && (
                  <tr key={`exp-${b.id}`} className="border-b border-gray-100 bg-slate-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
                          <p className="font-mono text-xs text-gray-600">{b.id.slice(0, 8)}…</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created</p>
                          <p className="text-gray-700">{formatDT(b.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                          <p className="text-gray-700">{formatDuration(b.startTime, b.endTime)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                          <p className="font-bold text-gray-900">{formatCurrency(b.totalPrice)}</p>
                        </div>
                        {b.notes && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</p>
                            <p className="text-gray-600">{b.notes}</p>
                          </div>
                        )}
                        {/* Status flow */}
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Booking flow</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {[
                              { s: "PENDING",   icon: Clock,        label: "Pending" },
                              { s: "CONFIRMED", icon: CheckCircle2, label: "Confirmed" },
                              { s: "ACTIVE",    icon: BikeIcon,     label: "Active" },
                              { s: "COMPLETED", icon: RotateCcw,    label: "Returned" },
                            ].map(({ s, icon: Icon, label }, i, arr) => {
                              const statuses = ["PENDING","CONFIRMED","ACTIVE","COMPLETED","CANCELLED"];
                              const currentIdx = statuses.indexOf(b.status);
                              const stepIdx   = statuses.indexOf(s);
                              const done = currentIdx >= stepIdx && b.status !== "CANCELLED";
                              const current = b.status === s;
                              return (
                                <div key={s} className="flex items-center gap-2">
                                  <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                                    current ? (STATUS_CFG[s]?.bg + " " + STATUS_CFG[s]?.text)
                                    : done   ? "bg-gray-100 text-gray-500"
                                    :          "bg-gray-50 text-gray-300"
                                  }`}>
                                    <Icon className="h-3 w-3" />
                                    {label}
                                  </div>
                                  {i < arr.length - 1 && <span className="text-gray-300 text-xs">→</span>}
                                </div>
                              );
                            })}
                            {b.status === "CANCELLED" && (
                              <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-500">
                                <XCircle className="h-3 w-3" /> Cancelled
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}

            {displayed.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No bookings found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
