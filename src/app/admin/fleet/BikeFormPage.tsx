"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft, Loader2, AlertCircle, ChevronDown, ChevronUp, Search,
  ImageIcon, X, Upload,
} from "lucide-react";
import RichEditor from "@/components/shared/RichEditor";
import MediaPickerModal from "@/components/shared/MediaPickerModal";
import { createBike, updateBike } from "./actions";

/* ── Types ── */

export type StationOption = { id: string; name: string };

export type BikeEditData = {
  id: string;
  model: string;
  type: string;
  status: string;
  hourlyRate: number;
  dailyRate: number;
  description: string | null;
  imageUrl: string | null;
  slug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  station: { id: string; name: string };
};

type FormData = {
  model: string;
  type: string;
  stationId: string;
  status: string;
  hourlyRate: string;
  dailyRate: string;
  description: string;
  imageUrl: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
};

/* ── Constants ── */

const BIKE_TYPES = [
  { value: "CITY",     label: "City Bike" },
  { value: "MOUNTAIN", label: "Mountain Bike" },
  { value: "ELECTRIC", label: "Electric Bike" },
  { value: "ROAD",     label: "Road Bike" },
  { value: "KIDS",     label: "Kids Bike" },
];

const STATUSES = [
  { value: "AVAILABLE",   label: "Available" },
  { value: "RENTED",      label: "Rented" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

/* ── Helpers ── */

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function emptyForm(firstStationId = ""): FormData {
  return {
    model: "", type: "CITY", stationId: firstStationId, status: "AVAILABLE",
    hourlyRate: "", dailyRate: "", description: "", imageUrl: "",
    slug: "", seoTitle: "", seoDescription: "",
  };
}

function fromBike(bike: BikeEditData): FormData {
  return {
    model:          bike.model,
    type:           bike.type,
    stationId:      bike.station.id,
    status:         bike.status,
    hourlyRate:     String(bike.hourlyRate),
    dailyRate:      String(bike.dailyRate),
    description:    bike.description ?? "",
    imageUrl:       bike.imageUrl ?? "",
    slug:           bike.slug ?? "",
    seoTitle:       bike.seoTitle ?? "",
    seoDescription: bike.seoDescription ?? "",
  };
}

/* ── Small UI helpers ── */

const inputCls  = "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition";
const selectCls = `${inputCls} bg-white`;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ── Main component ── */

export default function BikeFormPage({
  mode,
  bike,
  stations,
}: {
  mode: "add" | "edit";
  bike?: BikeEditData;
  stations: StationOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(
    mode === "edit" && bike ? fromBike(bike) : emptyForm(stations[0]?.id ?? "")
  );
  const [slugManual, setSlugManual] = useState(mode === "edit" && !!bike?.slug);
  const [seoOpen, setSeoOpen] = useState(
    mode === "edit" && !!(bike?.slug || bike?.seoTitle || bike?.seoDescription)
  );
  const [mediaOpen, setMediaOpen] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Auto-generate slug from model name when adding
  useEffect(() => {
    if (mode === "add" && !slugManual && form.model) {
      setForm(f => ({ ...f, slug: toSlug(f.model) }));
    }
  }, [form.model, mode, slugManual]);

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSlugChange(v: string) {
    setSlugManual(true);
    set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-"));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...form,
      hourlyRate: parseFloat(form.hourlyRate),
      dailyRate:  parseFloat(form.dailyRate),
      imageUrl:   form.imageUrl.trim() || undefined,
    };
    startTransition(async () => {
      const r = mode === "add"
        ? await createBike(payload)
        : await updateBike(bike!.id, payload);
      if ("error" in r) { setError(r.error); return; }
      router.push("/admin/fleet");
      router.refresh();
    });
  }

  const charCount = form.seoDescription.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/admin/fleet"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Fleet Management
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">
            {mode === "add" ? "Add New Bike" : `Edit — ${bike?.model}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mode === "add" ? "Add a bike to the fleet" : "Update bike details and SEO settings"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

          {/* Model */}
          <Field label="Model Name">
            <input
              className={inputCls}
              value={form.model}
              onChange={e => set("model", e.target.value)}
              placeholder="e.g. Trek FX 3"
              required
            />
          </Field>

          {/* Type + Station */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <select className={selectCls} value={form.type} onChange={e => set("type", e.target.value)}>
                {BIKE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Station">
              <select className={selectCls} value={form.stationId} onChange={e => set("stationId", e.target.value)} required>
                <option value="">— Select —</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Status (edit only) */}
          {mode === "edit" && (
            <Field label="Status">
              <select className={selectCls} value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          )}

          {/* Rates */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Hourly Rate ($)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number" min="0" step="0.5"
                  className={`${inputCls} pl-8`}
                  value={form.hourlyRate}
                  onChange={e => set("hourlyRate", e.target.value)}
                  placeholder="5.00" required
                />
              </div>
            </Field>
            <Field label="Daily Rate ($)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number" min="0" step="0.5"
                  className={`${inputCls} pl-8`}
                  value={form.dailyRate}
                  onChange={e => set("dailyRate", e.target.value)}
                  placeholder="24.00" required
                />
              </div>
            </Field>
          </div>

          {/* ── Featured Image ── */}
          <Field label="Featured Image">
            {form.imageUrl ? (
              /* Image preview */
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={form.imageUrl}
                    alt="Featured image"
                    fill
                    className="object-cover"
                    unoptimized={form.imageUrl.startsWith("/uploads/")}
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMediaOpen(true)}
                    className="bg-white/90 hover:bg-white text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => set("imageUrl", "")}
                    className="bg-white/90 hover:bg-red-50 text-red-500 p-1.5 rounded-lg shadow-sm transition-colors"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Upload / pick area */
              <div className="rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 transition-colors">
                {urlMode ? (
                  /* URL input mode */
                  <div className="p-4 space-y-3">
                    <input
                      className={inputCls}
                      value={form.imageUrl}
                      onChange={e => set("imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUrlMode(false)}
                        className="text-xs text-emerald-600 hover:underline font-medium"
                      >
                        ← Or pick from library
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUrlMode(false); set("imageUrl", ""); }}
                        className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Default pick area */
                  <div className="p-6 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 text-center">No image selected</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMediaOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Pick from Library
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrlMode(true)}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium underline underline-offset-2"
                      >
                        Paste URL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Field>

          {/* Description */}
          <Field label="Description (optional)">
            <RichEditor
              key={bike?.id ?? "new"}
              defaultValue={form.description}
              onChange={v => set("description", v)}
              placeholder="Write a description, add images…"
              minHeight={120}
            />
          </Field>

          {/* ── SEO section ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">SEO Settings</span>
                {(form.slug || form.seoTitle || form.seoDescription) && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">active</span>
                )}
              </div>
              {seoOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {seoOpen && (
              <div className="px-5 py-5 space-y-4 border-t border-gray-200">
                {/* Slug */}
                <Field
                  label="URL Slug"
                  hint={`Public URL: /bikes/${form.slug || "auto-generated"}`}
                >
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono">/bikes/</span>
                    <input
                      className={`${inputCls} pl-14 font-mono text-xs`}
                      value={form.slug}
                      onChange={e => handleSlugChange(e.target.value)}
                      placeholder="trek-fx-3-city-bike"
                    />
                  </div>
                </Field>

                {/* Meta Title */}
                <Field
                  label="Meta Title"
                  hint={`Defaults to "Book ${form.model || "…"} — PedalGo"`}
                >
                  <input
                    className={inputCls}
                    value={form.seoTitle}
                    onChange={e => set("seoTitle", e.target.value)}
                    placeholder={`Book ${form.model || "…"} — PedalGo`}
                    maxLength={70}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">Ideal: 50–60 characters</p>
                    <p className={`text-xs font-mono ${form.seoTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>
                      {form.seoTitle.length}/70
                    </p>
                  </div>
                </Field>

                {/* Meta Description */}
                <Field label="Meta Description">
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={form.seoDescription}
                    onChange={e => set("seoDescription", e.target.value)}
                    placeholder="Rent this bike from PedalGo. Best rates in Ho Chi Minh City…"
                    maxLength={160}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">Ideal: 120–155 characters</p>
                    <p className={`text-xs font-mono ${charCount > 155 ? "text-amber-500" : "text-gray-400"}`}>
                      {charCount}/160
                    </p>
                  </div>
                </Field>

                {/* SERP Preview */}
                {(form.seoTitle || form.model) && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Google Preview</p>
                    <p className="text-blue-700 text-sm font-medium hover:underline cursor-pointer leading-snug">
                      {form.seoTitle || `Book ${form.model} — PedalGo`}
                    </p>
                    <p className="text-green-700 text-xs mt-0.5 font-mono">
                      pedalgo.com/bikes/{form.slug || "…"}
                    </p>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                      {form.seoDescription || `Rent the ${form.model} from PedalGo. From $${form.hourlyRate || "?"}/hr.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Link
              href="/admin/fleet"
              className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white text-sm font-semibold transition-colors"
            >
              {isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : mode === "add" ? "Add Bike" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Media Picker Modal */}
      {mediaOpen && (
        <MediaPickerModal
          onClose={() => setMediaOpen(false)}
          onSelect={(url) => {
            set("imageUrl", url);
            setUrlMode(false);
            setMediaOpen(false);
          }}
        />
      )}
    </div>
  );
}
