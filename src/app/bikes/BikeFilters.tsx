"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import type { Station } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Calendar, X } from "lucide-react";

const bikeTypes = [
  { value: "city",     label: "City Bike" },
  { value: "mountain", label: "Mountain Bike" },
  { value: "electric", label: "Electric Bike" },
  { value: "road",     label: "Road Bike" },
  { value: "kids",     label: "Kids Bike" },
];

const maxPrices = [
  { value: "5",  label: "Up to $5/hr" },
  { value: "8",  label: "Up to $8/hr" },
  { value: "12", label: "Up to $12/hr" },
  { value: "20", label: "Up to $20/hr" },
];

function getMinDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

const dtInputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition [color-scheme:light]";

export default function BikeFilters({ stations }: { stations: Station[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const minDT = getMinDateTime();

  // Local state for dates to avoid URL push on every keystroke
  const [fromVal, setFromVal] = useState(params.get("from") ?? "");
  const [toVal,   setToVal]   = useState(params.get("to")   ?? "");

  // Sync local date state when params change (e.g. browser back)
  useEffect(() => {
    setFromVal(params.get("from") ?? "");
    setToVal(params.get("to") ?? "");
  }, [params]);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value); else next.delete(key);
      router.push(`/bikes?${next.toString()}`);
    },
    [params, router]
  );

  function applyDates() {
    const next = new URLSearchParams(params.toString());
    if (fromVal) next.set("from", fromVal); else next.delete("from");
    if (toVal)   next.set("to",   toVal);   else next.delete("to");
    router.push(`/bikes?${next.toString()}`);
  }

  function clearDates() {
    setFromVal("");
    setToVal("");
    const next = new URLSearchParams(params.toString());
    next.delete("from");
    next.delete("to");
    router.push(`/bikes?${next.toString()}`);
  }

  const datesActive = params.has("from") && params.has("to");
  const hasFilters  = params.has("type") || params.has("station") || params.has("maxPrice") || datesActive;
  const datesValid  = fromVal && toVal && new Date(toVal) > new Date(fromVal);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2 font-semibold text-gray-900">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </div>

      {/* ── Date availability picker ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Check Availability
          </span>
          {datesActive && (
            <button onClick={clearDates} className="ml-auto text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {datesActive && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium">
            Showing availability for selected dates
          </div>
        )}

        <div>
          <p className="text-[11px] text-gray-400 mb-1 font-medium">Pick-up</p>
          <input
            type="datetime-local"
            className={dtInputCls}
            value={fromVal}
            min={minDT}
            onChange={e => {
              setFromVal(e.target.value);
              if (toVal && new Date(e.target.value) >= new Date(toVal)) setToVal("");
            }}
          />
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-1 font-medium">Return</p>
          <input
            type="datetime-local"
            className={dtInputCls}
            value={toVal}
            min={fromVal || minDT}
            disabled={!fromVal}
            onChange={e => setToVal(e.target.value)}
          />
        </div>

        <button
          onClick={applyDates}
          disabled={!datesValid}
          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold transition-colors"
        >
          Check Availability
        </button>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-4">
        {/* Type filter */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Bike Type
          </label>
          <Select
            value={params.get("type") ?? ""}
            onValueChange={(v) => updateParam("type", v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              {bikeTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Station filter */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Station
          </label>
          <Select
            value={params.get("station") ?? ""}
            onValueChange={(v) => updateParam("station", v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All stations" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price filter */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Max Price
          </label>
          <Select
            value={params.get("maxPrice") ?? ""}
            onValueChange={(v) => updateParam("maxPrice", v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any price" />
            </SelectTrigger>
            <SelectContent>
              {maxPrices.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-gray-500"
          onClick={() => { setFromVal(""); setToVal(""); router.push("/bikes"); }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
