"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, calcRentalPrice } from "@/lib/utils";
import { createBooking, checkAvailability } from "@/lib/booking/actions";
import {
  MapPin, CheckCircle2, XCircle, Loader2, ArrowRight, AlertCircle, User, Mail, Phone,
} from "lucide-react";

interface BikeInfo {
  id: string;
  model: string;
  hourlyRate: number;
  dailyRate: number;
  station: { name: string; address: string };
}

interface Props {
  bike: BikeInfo;
  customerDefaults?: { name?: string; email?: string; phone?: string };
  defaultStart?: string | null;
  defaultEnd?: string | null;
}

type AvailStatus = "idle" | "checking" | "available" | "unavailable";

function FieldInput({
  icon: Icon, label, type = "text", value, onChange, placeholder, required, disabled,
}: {
  icon: React.ElementType;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder:font-normal placeholder:text-gray-300 disabled:opacity-40 [color-scheme:light]"
        />
      </div>
    </div>
  );
}

export default function BookingForm({ bike, customerDefaults = {}, defaultStart, defaultEnd }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dates — pre-fill from URL params when coming from /bikes?from=&to=
  const [startTime, setStartTime] = useState(defaultStart ?? "");
  const [endTime, setEndTime]     = useState(defaultEnd   ?? "");

  // Customer info
  const [custName,  setCustName]  = useState(customerDefaults.name  ?? "");
  const [custEmail, setCustEmail] = useState(customerDefaults.email ?? "");
  const [custPhone, setCustPhone] = useState(customerDefaults.phone ?? "");

  const [notes, setNotes]         = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess]     = useState(false);
  const [availStatus, setAvailStatus] = useState<AvailStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timesValid  = startTime && endTime && new Date(endTime) > new Date(startTime);
  const priceCalc   = timesValid
    ? calcRentalPrice(bike.hourlyRate, bike.dailyRate, new Date(startTime), new Date(endTime))
    : null;
  const deposit = priceCalc ? priceCalc.total * 0.3 : null;

  const PRICE_TIERS = [
    { label: "1 hour",  price: formatCurrency(bike.hourlyRate) },
    { label: "3 hours", price: formatCurrency(bike.hourlyRate * 3) },
    { label: "1 day",   price: formatCurrency(bike.dailyRate) },
    { label: "3 days",  price: formatCurrency(bike.dailyRate * 3) },
    { label: "1 week",  price: formatCurrency(bike.dailyRate * 7) },
  ];

  // Availability check
  useEffect(() => {
    if (!timesValid) { setAvailStatus("idle"); return; }
    setAvailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkAvailability(
        bike.id,
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString()
      ).then((r) => setAvailStatus(r.available ? "available" : "unavailable"));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [bike.id, startTime, endTime, timesValid]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation
    const errs: Record<string, string> = {};
    if (!custName.trim() || custName.trim().length < 2)  errs.name  = "Full name is required";
    if (!custEmail.trim() || !/\S+@\S+\.\S+/.test(custEmail)) errs.email = "Valid email is required";
    if (!custPhone.trim() || custPhone.trim().length < 6) errs.phone = "Phone number is required";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    startTransition(async () => {
      const result = await createBooking({
        bikeId: bike.id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        notes: notes || undefined,
        customerName:  custName.trim(),
        customerEmail: custEmail.trim(),
        customerPhone: custPhone.trim(),
      });
      if (result.error) { setError(result.error); return; }
      setSuccess(true);
      setTimeout(() => router.push("/account/bookings"), 2200);
    });
  }

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re booked!</h2>
        <p className="text-gray-500 text-sm">Redirecting to your bookings…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">

      {/* ── Station ── */}
      <div className="px-6 pt-6 pb-5">
        <p className="text-sm text-gray-500 mb-4 font-medium">
          Pick your dates · station confirmed
        </p>
        <div className="flex items-start gap-3 border-2 border-emerald-500 bg-emerald-50 rounded-2xl p-4">
          <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-snug">{bike.station.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{bike.station.address}</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        </div>
      </div>

      {/* ── Price reference ── */}
      <div className="border-t border-gray-100">
        {PRICE_TIERS.map(({ label, price }, i) => (
          <div key={label} className={`flex items-center justify-between px-6 py-2.5 text-sm ${i < PRICE_TIERS.length - 1 ? "border-b border-gray-100" : ""}`}>
            <span className="text-gray-600">{label}</span>
            <span className="font-bold text-gray-900">{price}</span>
          </div>
        ))}
      </div>

      {/* ── Date pickers ── */}
      <div className="border-t border-gray-100 px-6 pt-5 space-y-3">
        <FieldInput
          icon={({ className }: { className?: string }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          )}
          label="Pick-up"
          type="datetime-local"
          value={startTime}
          onChange={(v) => {
            setStartTime(v);
            if (endTime && new Date(v) >= new Date(endTime)) setEndTime("");
          }}
          required
        />
        <FieldInput
          icon={({ className }: { className?: string }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          )}
          label="Return"
          type="datetime-local"
          value={endTime}
          onChange={setEndTime}
          required
          disabled={!startTime}
        />

        {/* Availability */}
        {availStatus !== "idle" && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
            availStatus === "checking"    ? "bg-gray-100 text-gray-500"
            : availStatus === "available" ? "bg-emerald-50 text-emerald-700"
            :                               "bg-red-50 text-red-600"
          }`}>
            {availStatus === "checking"    && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            {availStatus === "available"   && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {availStatus === "unavailable" && <XCircle className="h-4 w-4 shrink-0" />}
            <span>
              {availStatus === "checking"    && "Checking availability…"}
              {availStatus === "available"   && priceCalc ? `Available · Total ${formatCurrency(priceCalc.total)}` : "Available!"}
              {availStatus === "unavailable" && "Already booked — try different dates"}
            </span>
          </div>
        )}
      </div>

      {/* ── Customer details ── */}
      <div className="border-t border-gray-100 px-6 pt-5 pb-1 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your details</p>

        <div>
          <FieldInput
            icon={User}
            label="Full name"
            value={custName}
            onChange={setCustName}
            placeholder="Nguyen Van A"
            required
          />
          {fieldErrors.name && <p className="text-xs text-red-500 mt-1 px-1">{fieldErrors.name}</p>}
        </div>

        <div>
          <FieldInput
            icon={Mail}
            label="Email"
            type="email"
            value={custEmail}
            onChange={setCustEmail}
            placeholder="you@example.com"
            required
          />
          {fieldErrors.email && <p className="text-xs text-red-500 mt-1 px-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <FieldInput
            icon={Phone}
            label="Phone number"
            type="tel"
            value={custPhone}
            onChange={setCustPhone}
            placeholder="+84 90 123 4567"
            required
          />
          {fieldErrors.phone && <p className="text-xs text-red-500 mt-1 px-1">{fieldErrors.phone}</p>}
        </div>
      </div>

      {/* ── Notes + CTA ── */}
      <div className="px-6 pt-4 pb-6 space-y-3">
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)…"
          maxLength={500}
          className="w-full text-sm text-gray-600 placeholder:text-gray-300 bg-gray-50 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-emerald-100 border border-transparent focus:border-emerald-300 transition-all"
        />

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!timesValid || availStatus !== "available" || isPending}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-[15px] py-4 transition-all shadow-lg hover:shadow-emerald-200 disabled:shadow-none"
        >
          {isPending ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Securing your bike…</>
          ) : !timesValid ? (
            <>Select dates first</>
          ) : availStatus === "available" && deposit ? (
            <>Book now — Pay {formatCurrency(deposit)} deposit <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>Check Availability</>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">
        No ID needed · 30% deposit only · free cancellation
      </p>
    </form>
  );
}
