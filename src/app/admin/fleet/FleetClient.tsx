"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Loader2, AlertCircle, X, CheckCircle2, Wrench, CircleDot,
  Bike as BikeIcon, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatCurrency, getBikeTypeLabel } from "@/lib/utils";
import { updateBike, deleteBike, deleteManyBikes } from "./actions";

/* ── Types ─────────────────────────────────────────────────── */

export type StationOption = { id: string; name: string };

export type BikeRow = {
  id: string;
  model: string;
  type: string;
  status: string;
  hourlyRate: number;
  dailyRate: number;
  description: string | null;
  station: { id: string; name: string; address: string };
  _count: { bookings: number };
};

/* ── Constants ─────────────────────────────────────────────── */

const PAGE_SIZE = 10;

const STATUSES = [
  { value: "AVAILABLE",   label: "Available",   color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { value: "RENTED",      label: "Rented",      color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "MAINTENANCE", label: "Maintenance", color: "text-amber-700 bg-amber-50 border-amber-200" },
];

const TYPE_BADGE: Record<string, string> = {
  CITY:     "bg-sky-100 text-sky-700",
  MOUNTAIN: "bg-amber-100 text-amber-700",
  ELECTRIC: "bg-emerald-100 text-emerald-700",
  ROAD:     "bg-violet-100 text-violet-700",
  KIDS:     "bg-pink-100 text-pink-700",
};

const TYPE_EMOJI: Record<string, string> = {
  CITY: "🚲", MOUNTAIN: "🏔️", ELECTRIC: "⚡", ROAD: "🛣️", KIDS: "🧒",
};

/* ── Form for quick-edit ──────────────────────────────────── */

const inputCls  = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition";
const selectCls = `${inputCls} bg-white`;

/* ── Small helpers ──────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = STATUSES.find(x => x.value === status);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s?.color ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status === "AVAILABLE"   && <CheckCircle2 className="h-3 w-3" />}
      {status === "RENTED"      && <CircleDot className="h-3 w-3" />}
      {status === "MAINTENANCE" && <Wrench className="h-3 w-3" />}
      {s?.label ?? status}
    </span>
  );
}

/* ── Checkbox ───────────────────────────────────────────────── */

function Checkbox({
  checked, indeterminate = false, onChange, label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center cursor-pointer select-none group">
      <span className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
        checked || indeterminate
          ? "bg-emerald-600 border-emerald-600"
          : "border-gray-300 group-hover:border-emerald-400 bg-white"
      }`}>
        {indeterminate && !checked
          ? <span className="block h-0.5 w-2 bg-white rounded" />
          : checked
            ? <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-white"><path d="M1 4l3 3 5-6"/></svg>
            : null}
      </span>
      {label && <span className="sr-only">{label}</span>}
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
    </label>
  );
}

/* ── Pagination ─────────────────────────────────────────────── */

function Pagination({
  page, totalPages, total, pageSize, onChange,
}: {
  page: number; totalPages: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  function pages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, "…", page-1, page, page+1, "…", totalPages];
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span> bikes
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages().map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function FleetClient({
  bikes: initialBikes,
}: {
  bikes: BikeRow[];
}) {
  const [bikes, setBikes] = useState<BikeRow[]>(initialBikes);

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(bikes.length / PAGE_SIZE);
  const paginated  = bikes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allOnPageSelected  = paginated.length > 0 && paginated.every(b => selectedIds.has(b.id));
  const someOnPageSelected = paginated.some(b => selectedIds.has(b.id)) && !allOnPageSelected;
  const selectedCount      = selectedIds.size;

  // Row state
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickForm,   setQuickForm]   = useState({ status: "", hourlyRate: "", dailyRate: "" });
  const [bulkConfirm, setBulkConfirm] = useState(false);

  // Errors / loading
  const [rowError,  setRowError]    = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBikes(initialBikes);
    setPage(1);
    setSelectedIds(new Set());
  }, [initialBikes]);

  /* ── Selection ── */
  function toggleAll() {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) paginated.forEach(b => next.delete(b.id));
      else                    paginated.forEach(b => next.add(b.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ── Page change ── */
  function goToPage(p: number) {
    setPage(p);
    setDeleteId(null);
    setQuickEditId(null);
    setRowError(null);
  }

  /* ── Quick Edit ── */
  function openQuickEdit(bike: BikeRow) {
    setQuickEditId(bike.id);
    setQuickForm({ status: bike.status, hourlyRate: String(bike.hourlyRate), dailyRate: String(bike.dailyRate) });
    setRowError(null);
    setDeleteId(null);
  }
  function closeQuickEdit() { setQuickEditId(null); setRowError(null); }

  function handleQuickSave(bike: BikeRow) {
    setRowError(null);
    const payload = {
      model: bike.model, type: bike.type, stationId: bike.station.id,
      description: bike.description ?? undefined, status: quickForm.status,
      hourlyRate: parseFloat(quickForm.hourlyRate), dailyRate: parseFloat(quickForm.dailyRate),
    };
    startTransition(async () => {
      const r = await updateBike(bike.id, payload);
      if ("error" in r) { setRowError(r.error); return; }
      closeQuickEdit();
    });
  }

  /* ── Single Delete ── */
  function handleDelete(id: string) {
    setRowError(null);
    startTransition(async () => {
      const r = await deleteBike(id);
      if ("error" in r) { setRowError(r.error); setDeleteId(null); return; }
      setDeleteId(null);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    });
  }

  /* ── Bulk Delete ── */
  function handleBulkDelete() {
    setRowError(null);
    startTransition(async () => {
      const r = await deleteManyBikes(Array.from(selectedIds));
      if ("error" in r) { setRowError(r.error); setBulkConfirm(false); return; }
      setSelectedIds(new Set());
      setBulkConfirm(false);
    });
  }

  const available   = bikes.filter(b => b.status === "AVAILABLE").length;
  const rented      = bikes.filter(b => b.status === "RENTED").length;
  const maintenance = bikes.filter(b => b.status === "MAINTENANCE").length;

  /* ── Render ── */
  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{bikes.length} bikes across all stations</p>
        </div>
        <Link
          href="/admin/fleet/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Bike
        </Link>
      </div>

      {/* ── Status cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available",   count: available,   icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", ic: "text-emerald-500" },
          { label: "Rented",      count: rented,      icon: CircleDot,    bg: "bg-blue-50",    text: "text-blue-700",    ic: "text-blue-500" },
          { label: "Maintenance", count: maintenance, icon: Wrench,       bg: "bg-amber-50",   text: "text-amber-700",   ic: "text-amber-500" },
        ].map(({ label, count, icon: Icon, bg, text, ic }) => (
          <div key={label} className={`rounded-2xl ${bg} px-5 py-4 flex items-center gap-4`}>
            <Icon className={`h-6 w-6 ${ic}`} />
            <div>
              <p className={`text-2xl font-bold ${text}`}>{count}</p>
              <p className={`text-sm font-medium ${text} opacity-80`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row error ── */}
      {rowError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{rowError}</span>
          <button onClick={() => setRowError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Bulk action bar ── */}
      {selectedCount > 0 && (
        <div className={`flex items-center gap-4 px-5 py-3 rounded-xl mb-4 border transition-all ${
          bulkConfirm ? "bg-red-50 border-red-200" : "bg-slate-900 border-slate-800"
        }`}>
          <span className={`text-sm font-semibold ${bulkConfirm ? "text-red-700" : "text-white"}`}>
            {selectedCount} bike{selectedCount !== 1 ? "s" : ""} selected
          </span>

          {!bulkConfirm ? (
            <>
              <button
                onClick={() => setBulkConfirm(true)}
                className="ml-auto inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selectedCount} bikes
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear selection
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-red-600 flex-1">
                Are you sure? This will permanently delete <strong>{selectedCount} bikes</strong>.
              </p>
              <button
                onClick={handleBulkDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Delete
              </button>
              <button onClick={() => setBulkConfirm(false)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="pl-5 pr-3 py-3.5 w-10">
                <Checkbox
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected}
                  onChange={toggleAll}
                  label="Select all on page"
                />
              </th>
              <th className="px-4 py-3.5 font-medium">Model</th>
              <th className="px-4 py-3.5 font-medium">Type</th>
              <th className="px-4 py-3.5 font-medium">Station</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-4 py-3.5 font-medium">Hourly</th>
              <th className="px-4 py-3.5 font-medium">Daily</th>
              <th className="px-4 py-3.5 font-medium text-center">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((bike) => (
              <>
                {/* ── Main row ── */}
                <tr
                  key={bike.id}
                  className={`group border-b border-gray-50 transition-colors ${
                    selectedIds.has(bike.id)    ? "bg-emerald-50/60" :
                    deleteId    === bike.id      ? "bg-red-50 border-red-100" :
                    quickEditId === bike.id      ? "bg-amber-50/40" :
                    "hover:bg-gray-50/70"
                  }`}
                >
                  {/* Checkbox */}
                  <td className="pl-5 pr-3 py-3">
                    <Checkbox
                      checked={selectedIds.has(bike.id)}
                      onChange={() => toggleOne(bike.id)}
                      label={`Select ${bike.model}`}
                    />
                  </td>

                  {/* Model + hover actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xl mt-0.5 shrink-0">{TYPE_EMOJI[bike.type] ?? "🚲"}</span>
                      <div>
                        <p className="font-semibold text-gray-900 leading-snug">{bike.model}</p>
                        {bike.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[160px] mt-0.5"
                            dangerouslySetInnerHTML={{ __html: bike.description.replace(/<[^>]+>/g, "").slice(0, 60) }}
                          />
                        )}
                        {/* Hover actions */}
                        <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                          <Link
                            href={`/admin/fleet/${bike.id}/edit`}
                            className="text-emerald-600 hover:underline font-medium"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => quickEditId === bike.id ? closeQuickEdit() : openQuickEdit(bike)}
                            className="text-sky-600 hover:underline font-medium"
                          >
                            {quickEditId === bike.id ? "Close" : "Quick Edit"}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => { setDeleteId(bike.id); setQuickEditId(null); setRowError(null); }}
                            className="text-red-500 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[bike.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {getBikeTypeLabel(bike.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{bike.station.name}</td>
                  <td className="px-4 py-3"><StatusPill status={bike.status} /></td>
                  <td className="px-4 py-3 font-medium text-gray-700">{formatCurrency(bike.hourlyRate)}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{formatCurrency(bike.dailyRate)}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{bike._count.bookings}</td>
                </tr>

                {/* ── Quick Edit row ── */}
                {quickEditId === bike.id && (
                  <tr key={`qe-${bike.id}`} className="border-b border-amber-100 bg-amber-50/30">
                    <td />
                    <td colSpan={7} className="px-4 py-4">
                      <div className="flex items-end gap-4 flex-wrap">
                        <div className="w-40">
                          <Field label="Status">
                            <select className={selectCls} value={quickForm.status} onChange={e => setQuickForm(f => ({ ...f, status: e.target.value }))}>
                              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </Field>
                        </div>
                        <div className="w-32">
                          <Field label="Hourly ($)">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                              <input type="number" min="0" step="0.5" className={`${inputCls} pl-7`} value={quickForm.hourlyRate} onChange={e => setQuickForm(f => ({ ...f, hourlyRate: e.target.value }))} />
                            </div>
                          </Field>
                        </div>
                        <div className="w-32">
                          <Field label="Daily ($)">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                              <input type="number" min="0" step="0.5" className={`${inputCls} pl-7`} value={quickForm.dailyRate} onChange={e => setQuickForm(f => ({ ...f, dailyRate: e.target.value }))} />
                            </div>
                          </Field>
                        </div>
                        <div className="flex gap-2 pb-0.5">
                          <button onClick={() => handleQuickSave(bike)} disabled={isPending} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors">
                            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Update
                          </button>
                          <button onClick={closeQuickEdit} className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-2">Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* ── Delete confirm row ── */}
                {deleteId === bike.id && (
                  <tr key={`del-${bike.id}`} className="border-b border-red-100 bg-red-50/60">
                    <td />
                    <td colSpan={7} className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-700 flex-1">
                          Delete <strong>{bike.model}</strong>? Cannot be undone.
                        </p>
                        <button onClick={() => handleDelete(bike.id)} disabled={isPending} className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors">
                          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Confirm
                        </button>
                        <button onClick={() => setDeleteId(null)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}

            {bikes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <BikeIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No bikes in fleet yet.</p>
                  <Link href="/admin/fleet/new" className="mt-3 inline-block text-sm text-emerald-600 hover:underline font-medium">
                    + Add your first bike
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={bikes.length}
          pageSize={PAGE_SIZE}
          onChange={goToPage}
        />
      </div>
    </>
  );
}
