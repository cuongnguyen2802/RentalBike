"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users, Search, Loader2, AlertCircle, X, Trash2, ChevronDown,
  ShieldCheck, UserCheck, User as UserIcon, Pencil, UserPlus,
} from "lucide-react";
import { changeRole, deleteUser, deleteManyUsers } from "./actions";
import UserDrawer from "./UserDrawer";

/* ── Types ── */

export type UserRow = {
  id:           string;
  name:         string;
  email:        string;
  phone:        string | null;
  role:         string;
  createdAt:    string;
  bookingCount: number;
};

/* ── Role config ── */

const ROLE_CFG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  CUSTOMER: { label: "Customer", bg: "bg-sky-50",    text: "text-sky-700",    icon: UserIcon    },
  STAFF:    { label: "Staff",    bg: "bg-amber-50",  text: "text-amber-700",  icon: UserCheck   },
  ADMIN:    { label: "Admin",    bg: "bg-violet-50", text: "text-violet-700", icon: ShieldCheck },
};

const ALL_ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const;

const ROLE_TABS = [
  { key: "ALL",      label: "All"       },
  { key: "CUSTOMER", label: "Customers" },
  { key: "STAFF",    label: "Staff"     },
  { key: "ADMIN",    label: "Admins"    },
] as const;

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const ini   = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return (
    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0 uppercase">
      {ini}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Role dropdown ── */

function RoleDropdown({
  userId, currentRole, onChanged, disabled,
}: {
  userId: string; currentRole: string; onChanged: (id: string, role: string) => void; disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cfg = ROLE_CFG[currentRole] ?? ROLE_CFG.CUSTOMER;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${cfg.bg} ${cfg.text} hover:ring-2 hover:ring-offset-1 hover:ring-current/30 disabled:opacity-40`}
      >
        <cfg.icon className="h-3 w-3" />
        {cfg.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[130px]">
            {ALL_ROLES.map(role => {
              const c = ROLE_CFG[role];
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setOpen(false); onChanged(userId, role); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${role === currentRole ? "opacity-40 cursor-default" : ""}`}
                >
                  <c.icon className={`h-3.5 w-3.5 ${c.text}`} />
                  {c.label}
                  {role === currentRole && <span className="ml-auto text-gray-300 text-[10px]">current</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main component ── */

export default function UsersClient({
  users: initial,
  roleCounts,
  total,
}: {
  users:      UserRow[];
  roleCounts: Record<string, number>;
  total:      number;
}) {
  const [users,       setUsers]       = useState(initial);
  const [activeTab,   setActiveTab]   = useState<string>("ALL");
  const [search,      setSearch]      = useState("");
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);
  const [loadingId,   setLoadingId]   = useState<string | null>(null);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [confirmId,   setConfirmId]   = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [counts,      setCounts]      = useState(roleCounts);
  const [drawerUser,  setDrawerUser]  = useState<UserRow | null | "new">(undefined as unknown as "new");
  const [showDrawer,  setShowDrawer]  = useState(false);
  const [isPending,   startTransition] = useTransition();

  const displayed = useMemo(() => {
    let list = users;
    if (activeTab !== "ALL") list = list.filter(u => u.role === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q)
      );
    }
    return list;
  }, [users, activeTab, search]);

  const allChecked = displayed.length > 0 && displayed.every(u => selected.has(u.id));

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) displayed.forEach(u => next.delete(u.id));
      else            displayed.forEach(u => next.add(u.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function adjustCount(role: string, delta: number) {
    setCounts(prev => ({ ...prev, [role]: Math.max(0, (prev[role] ?? 0) + delta) }));
  }

  function openAdd()          { setDrawerUser(null);  setShowDrawer(true); }
  function openEdit(u: UserRow) { setDrawerUser(u);   setShowDrawer(true); }
  function closeDrawer()      { setShowDrawer(false); }

  function handleSaved(saved: UserRow, prevRole?: string) {
    const exists = users.find(u => u.id === saved.id);
    if (exists) {
      // Edit
      setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
      if (prevRole && prevRole !== saved.role) {
        adjustCount(prevRole, -1);
        adjustCount(saved.role, +1);
      }
    } else {
      // Add
      setUsers(prev => [saved, ...prev]);
      adjustCount(saved.role, +1);
      setCounts(prev => ({ ...prev, _total: (prev._total ?? total) + 1 }));
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const user = users.find(u => u.id === userId);
    if (!user || user.role === newRole) return;
    const oldRole = user.role;
    setErrorMsg(null);
    setLoadingId(userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    adjustCount(oldRole, -1);
    adjustCount(newRole, +1);
    startTransition(async () => {
      const r = await changeRole(userId, newRole);
      setLoadingId(null);
      if ("error" in r) {
        setErrorMsg(r.error);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: oldRole } : u));
        adjustCount(newRole, -1);
        adjustCount(oldRole, +1);
      }
    });
  }

  async function handleDelete(userId: string) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setConfirmId(null);
    setErrorMsg(null);
    setLoadingId(userId);
    startTransition(async () => {
      const r = await deleteUser(userId);
      setLoadingId(null);
      if ("error" in r) { setErrorMsg(r.error); return; }
      setUsers(prev => prev.filter(u => u.id !== userId));
      adjustCount(user.role, -1);
      setSelected(prev => { const next = new Set(prev); next.delete(userId); return next; });
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    setBulkConfirm(false);
    setErrorMsg(null);
    startTransition(async () => {
      const r = await deleteManyUsers(ids);
      if ("error" in r) { setErrorMsg(r.error); return; }
      const deleted = users.filter(u => ids.includes(u.id));
      deleted.forEach(u => adjustCount(u.role, -1));
      setUsers(prev => prev.filter(u => !ids.includes(u.id)));
      setSelected(new Set());
    });
  }

  const loading = (id: string) => isPending && loadingId === id;
  const totalCount = users.length;

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-0.5">{totalCount} registered users</p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total",     value: totalCount,           color: "text-gray-900"   },
            { label: "Customers", value: counts.CUSTOMER ?? 0, color: "text-sky-700"    },
            { label: "Staff",     value: counts.STAFF    ?? 0, color: "text-amber-700"  },
            { label: "Admins",    value: counts.ADMIN    ?? 0, color: "text-violet-700" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            {ROLE_TABS.map(({ key, label }) => {
              const count  = key === "ALL" ? totalCount : (counts[key] ?? 0);
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setSelected(new Set()); }}
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

          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl mb-4">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <div className="flex-1" />
            {bulkConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-300">Delete {selected.size} users?</span>
                <button
                  onClick={handleBulkDelete}
                  disabled={isPending}
                  className="text-xs font-semibold bg-red-500 hover:bg-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, delete"}
                </button>
                <button onClick={() => setBulkConfirm(false)} className="text-xs text-white/60 hover:text-white px-2 py-1.5">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setBulkConfirm(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete selected
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                <th className="pl-5 pr-3 py-3.5">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-4 py-3.5 font-medium">User</th>
                <th className="px-4 py-3.5 font-medium">Contact</th>
                <th className="px-4 py-3.5 font-medium">Role</th>
                <th className="px-4 py-3.5 font-medium text-center">Bookings</th>
                <th className="px-4 py-3.5 font-medium">Joined</th>
                <th className="px-4 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(u => (
                confirmId === u.id ? (
                  <tr key={`confirm-${u.id}`} className="bg-red-50 border-b border-red-100">
                    <td />
                    <td colSpan={5} className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="text-sm text-red-700 font-medium">
                          Delete <strong>{u.name}</strong>? This cannot be undone.
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={isPending}
                          className="text-xs font-semibold bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading(u.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
                        </button>
                        <button onClick={() => setConfirmId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="pl-5 pr-3 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleOne(u.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Initials name={u.name} />
                        <div>
                          <p className="font-semibold text-gray-900 leading-snug">{u.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-gray-700 text-sm">{u.email}</p>
                      {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                    </td>

                    <td className="px-4 py-4">
                      <RoleDropdown
                        userId={u.id}
                        currentRole={u.role}
                        onChanged={handleRoleChange}
                        disabled={loading(u.id)}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block min-w-[2rem] text-center text-sm font-bold px-2 py-0.5 rounded-lg ${
                        u.bookingCount > 0 ? "bg-emerald-50 text-emerald-700" : "text-gray-300"
                      }`}>
                        {u.bookingCount}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {loading(u.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                              title="Edit user"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmId(u.id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      {search ? `No users match "${search}"` : "No users found."}
                    </p>
                    {!search && (
                      <button onClick={openAdd} className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        Add the first user →
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {showDrawer && (
        <UserDrawer
          user={drawerUser as UserRow | null}
          onClose={closeDrawer}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
