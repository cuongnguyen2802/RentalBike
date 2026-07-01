"use client";

import { useState, useEffect, useTransition } from "react";
import {
  X, AlertCircle, UserPlus, Pencil,
  ShieldCheck, UserCheck, User as UserIcon, Check,
} from "lucide-react";
import type { UserRow } from "./UsersClient";
import { createUser, updateUser } from "./actions";

/* ── Role metadata & permissions ────────────────────────────── */

const ROLE_CFG = {
  CUSTOMER: { label: "Customer", color: "bg-sky-50 text-sky-700 border-sky-200",     icon: UserIcon,    ring: "ring-sky-400"    },
  STAFF:    { label: "Staff",    color: "bg-amber-50 text-amber-700 border-amber-200",  icon: UserCheck,   ring: "ring-amber-400"  },
  ADMIN:    { label: "Admin",    color: "bg-violet-50 text-violet-700 border-violet-200", icon: ShieldCheck, ring: "ring-violet-400" },
} as const;

const PERMISSIONS: { label: string; CUSTOMER: boolean; STAFF: boolean; ADMIN: boolean }[] = [
  { label: "Browse & book bikes",        CUSTOMER: true,  STAFF: true,  ADMIN: true  },
  { label: "View own bookings",          CUSTOMER: true,  STAFF: true,  ADMIN: true  },
  { label: "Manage all bookings",        CUSTOMER: false, STAFF: true,  ADMIN: true  },
  { label: "Manage fleet & stations",    CUSTOMER: false, STAFF: true,  ADMIN: true  },
  { label: "Manage blog & pages",        CUSTOMER: false, STAFF: true,  ADMIN: true  },
  { label: "Manage users & permissions", CUSTOMER: false, STAFF: false, ADMIN: true  },
  { label: "Manage settings & menus",    CUSTOMER: false, STAFF: false, ADMIN: true  },
];

/* ── Props ───────────────────────────────────────────────────── */

interface Props {
  user:    UserRow | null;   // null = add mode
  onClose: () => void;
  onSaved: (user: UserRow, prevRole?: string) => void;
}

type Form = { name: string; email: string; phone: string; role: "CUSTOMER" | "STAFF" | "ADMIN" };

const EMPTY_FORM: Form = { name: "", email: "", phone: "", role: "CUSTOMER" };

/* ── Drawer ──────────────────────────────────────────────────── */

export default function UserDrawer({ user, onClose, onSaved }: Props) {
  const isEdit = Boolean(user);

  const [form,   setForm]   = useState<Form>(
    user
      ? { name: user.name, email: user.email, phone: user.phone ?? "", role: user.role as Form["role"] }
      : EMPTY_FORM
  );
  const [error,  setError]  = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  /* Slide-in animation */
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  function upd<K extends keyof Form>(key: K, val: Form[K]) {
    setForm(p => ({ ...p, [key]: val }));
    setError(null);
  }

  async function handleSave() {
    setError(null);
    startTransition(async () => {
      if (isEdit && user) {
        const r = await updateUser(user.id, { name: form.name, phone: form.phone, role: form.role });
        if ("error" in r) { setError(r.error); return; }
        onSaved({ ...user, name: form.name, phone: form.phone || null, role: form.role }, user.role);
      } else {
        const r = await createUser(form);
        if ("error" in r) { setError(r.error); return; }
        if ("user" in r)  onSaved(r.user);
      }
      setSaved(true);
      setTimeout(close, 800);
    });
  }

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-250 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Panel */}
      <div
        className={`relative z-10 flex flex-col w-full max-w-md bg-white h-full shadow-2xl transition-transform duration-250 ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isEdit ? "bg-sky-50" : "bg-emerald-50"}`}>
            {isEdit ? <Pencil className="h-4 w-4 text-sky-600" /> : <UserPlus className="h-4 w-4 text-emerald-600" />}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{isEdit ? "Edit User" : "Add New User"}</h2>
            <p className="text-xs text-gray-400">{isEdit ? user!.email : "Create a new account"}</p>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => upd("name", e.target.value)}
                placeholder="Nguyen Van A"
                autoFocus={!isEdit}
                className={inp}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => upd("email", e.target.value)}
                placeholder="user@email.com"
                disabled={isEdit}
                className={inp}
              />
              {isEdit && (
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Use Supabase Auth to update it.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => upd("phone", e.target.value)}
                placeholder="+84 9x xxx xxxx"
                className={inp}
              />
            </div>
          </div>

          {/* Role picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Role
            </label>
            <div className="space-y-2">
              {(["CUSTOMER", "STAFF", "ADMIN"] as const).map(role => {
                const cfg    = ROLE_CFG[role];
                const Icon   = cfg.icon;
                const active = form.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => upd("role", role)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      active
                        ? `border-current ${cfg.color} ring-2 ${cfg.ring} ring-offset-1`
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${active ? "bg-white/50" : "bg-gray-100"}`}>
                      <Icon className={`h-4 w-4 ${active ? cfg.color.split(" ").find(c => c.startsWith("text-")) ?? "" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
                      <p className="text-xs text-gray-400 leading-snug">
                        {role === "CUSTOMER" && "Can browse and book bikes"}
                        {role === "STAFF"    && "Can manage bookings and fleet"}
                        {role === "ADMIN"    && "Full access to all features"}
                      </p>
                    </div>
                    {active && <Check className="h-4 w-4 shrink-0 text-current" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions matrix */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Permission Matrix</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-center border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-gray-500 font-medium w-full">Permission</th>
                  {(["CUSTOMER", "STAFF", "ADMIN"] as const).map(r => (
                    <th key={r} className={`px-3 py-2.5 font-bold w-16 ${form.role === r ? ROLE_CFG[r].color.split(" ").find(c => c.startsWith("text-")) : "text-gray-400"}`}>
                      {r === "CUSTOMER" ? "Cus." : r === "STAFF" ? "Staff" : "Admin"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm, i) => (
                  <tr key={i} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-2 text-gray-600">{perm.label}</td>
                    {(["CUSTOMER", "STAFF", "ADMIN"] as const).map(r => (
                      <td key={r} className="px-3 py-2 text-center">
                        {perm[r]
                          ? <span className="text-emerald-500 font-bold">✓</span>
                          : <span className="text-gray-200">—</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saved || !form.name || !form.email}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            {saved ? (
              <><Check className="h-4 w-4" /> Saved!</>
            ) : (
              <>{isEdit ? <Pencil className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{isEdit ? "Save Changes" : "Create User"}</>
            )}
          </button>
          <button
            onClick={close}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
