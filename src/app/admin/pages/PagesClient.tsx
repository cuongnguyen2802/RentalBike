"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Eye, Plus, Trash2, Search, X, AlertCircle,
  Loader2, Globe, ExternalLink, ToggleLeft, ToggleRight, Lock,
} from "lucide-react";
import { deletePage, deleteManyPages, togglePublishPage } from "./actions";

export type PageRow = {
  id:        string;
  title:     string;
  slug:      string;
  status:    string;
  showInNav: boolean;
  pageKey:   string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_TABS = [
  { key: "ALL",       label: "All"       },
  { key: "PUBLISHED", label: "Published" },
  { key: "DRAFT",     label: "Drafts"    },
] as const;

function StatusBadge({ status }: { status: string }) {
  return status === "PUBLISHED" ? (
    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      <Eye className="h-3 w-3" /> Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
      <FileText className="h-3 w-3" /> Draft
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function pageUrl(p: PageRow) {
  if (p.pageKey === "home")    return "/";
  if (p.pageKey === "about")   return "/about";
  if (p.pageKey === "contact") return "/contact";
  return `/pages/${p.slug}`;
}

export default function PagesClient({ pages: initial, total }: { pages: PageRow[]; total: number }) {
  const [pages,       setPages]       = useState(initial);
  const [activeTab,   setActiveTab]   = useState("ALL");
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [confirmId,   setConfirmId]   = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [loadingId,   setLoadingId]   = useState<string | null>(null);
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);
  const [isPending,   startTransition] = useTransition();

  const displayed = useMemo(() => {
    let list = pages;
    if (activeTab !== "ALL") list = list.filter(p => p.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    return list;
  }, [pages, activeTab, search]);

  const published = pages.filter(p => p.status === "PUBLISHED").length;
  const drafts    = pages.filter(p => p.status === "DRAFT").length;

  const allChecked = displayed.filter(p => !p.pageKey).length > 0 &&
    displayed.filter(p => !p.pageKey).every(p => selected.has(p.id));

  function toggleAll() {
    const deletable = displayed.filter(p => !p.pageKey);
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) { deletable.forEach(p => next.delete(p.id)); }
      else            { deletable.forEach(p => next.add(p.id)); }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next;
    });
  }

  async function handleDelete(id: string) {
    setConfirmId(null); setErrorMsg(null); setLoadingId(id);
    startTransition(async () => {
      const r = await deletePage(id);
      setLoadingId(null);
      if ("error" in r) { setErrorMsg(r.error); return; }
      setPages(prev => prev.filter(p => p.id !== id));
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    setBulkConfirm(false); setErrorMsg(null);
    startTransition(async () => {
      const r = await deleteManyPages(ids);
      if ("error" in r) { setErrorMsg(r.error); return; }
      setPages(prev => prev.filter(p => !ids.includes(p.id)));
      setSelected(new Set());
    });
  }

  async function handleToggle(id: string) {
    setErrorMsg(null); setLoadingId(id);
    const page = pages.find(p => p.id === id);
    if (!page) return;
    const newStatus = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setPages(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    startTransition(async () => {
      const r = await togglePublishPage(id);
      setLoadingId(null);
      if ("error" in r) {
        setErrorMsg(r.error);
        setPages(prev => prev.map(p => p.id === id ? { ...p, status: page.status } : p));
      }
    });
  }

  const loading = (id: string) => isPending && loadingId === id;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total pages</p>
        </div>
        <Link href="/admin/pages/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> New Page
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: "Total", value: total, color: "text-gray-900" }, { label: "Published", value: published, color: "text-emerald-700" }, { label: "Drafts", value: drafts, color: "text-amber-700" }]
          .map(s => (
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
          {STATUS_TABS.map(({ key, label }) => {
            const count  = key === "ALL" ? total : key === "PUBLISHED" ? published : drafts;
            const active = activeTab === key;
            return (
              <button key={key} onClick={() => { setActiveTab(key); setSelected(new Set()); }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"}`}>
                {label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative sm:ml-auto sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>}
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl mb-4">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          {bulkConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-300">Delete {selected.size} pages?</span>
              <button onClick={handleBulkDelete} disabled={isPending}
                className="text-xs font-semibold bg-red-500 hover:bg-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, delete"}
              </button>
              <button onClick={() => setBulkConfirm(false)} className="text-xs text-white/60 hover:text-white px-2 py-1.5">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setBulkConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete selected
            </button>
          )}
          <button onClick={() => setSelected(new Set())} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="pl-5 pr-3 py-3.5">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              </th>
              <th className="px-4 py-3.5 font-medium">Title</th>
              <th className="px-4 py-3.5 font-medium">URL</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-4 py-3.5 font-medium text-center">In Nav</th>
              <th className="px-4 py-3.5 font-medium">Updated</th>
              <th className="px-4 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(p =>
              confirmId === p.id ? (
                <tr key={`confirm-${p.id}`} className="bg-red-50 border-b border-red-100">
                  <td />
                  <td colSpan={5} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="text-sm text-red-700 font-medium">Delete <strong>{p.title}</strong>? This cannot be undone.</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDelete(p.id)} disabled={isPending}
                        className="text-xs font-semibold bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {loading(p.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">Cancel</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="pl-5 pr-3 py-4">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)}
                      disabled={!!p.pageKey}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-30" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        {p.pageKey ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <FileText className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 leading-snug">{p.title}</p>
                        {p.pageKey && (
                          <span className="text-xs text-amber-600 font-medium">System page</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-gray-400">{pageUrl(p)}</span>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-4 text-center">
                    {p.showInNav ? <Globe className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-gray-200">—</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggle(p.id)} disabled={loading(p.id)}
                        title={p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 transition-colors">
                        {loading(p.id) ? <Loader2 className="h-4 w-4 animate-spin" /> :
                         p.status === "PUBLISHED" ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <Link href={`/admin/pages/${p.id}/edit`}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Edit in builder">
                        <FileText className="h-4 w-4" />
                      </Link>
                      {p.status === "PUBLISHED" && (
                        <Link href={pageUrl(p)} target="_blank"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="View">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      {!p.pageKey && (
                        <button onClick={() => setConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
            {displayed.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-16 text-center">
                <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">{search ? `No pages match "${search}"` : "No pages yet."}</p>
                {!search && <Link href="/admin/pages/new" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"><Plus className="h-4 w-4" /> Create page</Link>}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
