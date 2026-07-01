"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Loader2, AlertCircle, X, Trash2,
  ChevronLeft, ChevronRight, Eye, FileText, Globe,
} from "lucide-react";
import { deletePost, deleteManyPosts, togglePublish } from "./actions";

/* ── Types ── */

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
};

/* ── Constants ── */

const PAGE_SIZE = 10;

/* ── Helpers ── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Checkbox ── */

function Checkbox({ checked, indeterminate = false, onChange, label }: {
  checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; label?: string;
}) {
  return (
    <label className="flex items-center cursor-pointer select-none group">
      <span className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
        checked || indeterminate ? "bg-emerald-600 border-emerald-600" : "border-gray-300 group-hover:border-emerald-400 bg-white"
      }`}>
        {indeterminate && !checked
          ? <span className="block h-0.5 w-2 bg-white rounded" />
          : checked ? <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-white"><path d="M1 4l3 3 5-6"/></svg>
          : null}
      </span>
      {label && <span className="sr-only">{label}</span>}
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );
}

/* ── Pagination ── */

function Pagination({ page, totalPages, total, onChange }: {
  page: number; totalPages: number; total: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to   = Math.min(page * PAGE_SIZE, total);

  function pages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, "…", page-1, page, page+1, "…", totalPages];
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of <span className="font-semibold text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages().map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
            : <button key={p} onClick={() => onChange(p as number)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>{p}</button>
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Main ── */

export default function BlogPostsClient({ posts: initial }: { posts: PostRow[] }) {
  const [posts, setPosts]             = useState<PostRow[]>(initial);
  const [page, setPage]               = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [rowError, setRowError]       = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  useEffect(() => { setPosts(initial); setPage(1); setSelectedIds(new Set()); }, [initial]);

  const filtered    = posts.filter(p => filter === "ALL" || p.status === filter);
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const publishedCount = posts.filter(p => p.status === "PUBLISHED").length;
  const draftCount     = posts.filter(p => p.status === "DRAFT").length;

  const allSelected  = paginated.length > 0 && paginated.every(p => selectedIds.has(p.id));
  const someSelected = paginated.some(p => selectedIds.has(p.id)) && !allSelected;
  const selCount     = selectedIds.size;

  function toggleAll() {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (allSelected) paginated.forEach(p => n.delete(p.id));
      else paginated.forEach(p => n.add(p.id));
      return n;
    });
  }
  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function handleTogglePublish(id: string) {
    setRowError(null);
    startTransition(async () => {
      const r = await togglePublish(id);
      if ("error" in r) setRowError(r.error);
    });
  }

  function handleDelete(id: string) {
    setRowError(null);
    startTransition(async () => {
      const r = await deletePost(id);
      if ("error" in r) { setRowError(r.error); setDeleteId(null); return; }
      setDeleteId(null);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    });
  }

  function handleBulkDelete() {
    setRowError(null);
    startTransition(async () => {
      const r = await deleteManyPosts(Array.from(selectedIds));
      if ("error" in r) { setRowError(r.error); setBulkConfirm(false); return; }
      setSelectedIds(new Set());
      setBulkConfirm(false);
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} posts total</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", count: posts.length, icon: FileText, bg: "bg-gray-50",    text: "text-gray-700",    ic: "text-gray-400" },
          { label: "Published", count: publishedCount, icon: Globe, bg: "bg-emerald-50", text: "text-emerald-700", ic: "text-emerald-500" },
          { label: "Drafts", count: draftCount, icon: FileText, bg: "bg-amber-50",    text: "text-amber-700",   ic: "text-amber-500" },
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

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(["ALL", "PUBLISHED", "DRAFT"] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "ALL" ? `All (${posts.length})` : f === "PUBLISHED" ? `Published (${publishedCount})` : `Drafts (${draftCount})`}
          </button>
        ))}
      </div>

      {/* Row error */}
      {rowError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{rowError}</span>
          <button onClick={() => setRowError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Bulk bar */}
      {selCount > 0 && (
        <div className={`flex items-center gap-4 px-5 py-3 rounded-xl mb-4 border transition-all ${bulkConfirm ? "bg-red-50 border-red-200" : "bg-slate-900 border-slate-800"}`}>
          <span className={`text-sm font-semibold ${bulkConfirm ? "text-red-700" : "text-white"}`}>{selCount} post{selCount !== 1 ? "s" : ""} selected</span>
          {!bulkConfirm ? (
            <>
              <button onClick={() => setBulkConfirm(true)} className="ml-auto inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete {selCount}
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-white transition-colors">Clear</button>
            </>
          ) : (
            <>
              <p className="text-sm text-red-600 flex-1">Delete <strong>{selCount} posts</strong> permanently?</p>
              <button onClick={handleBulkDelete} disabled={isPending} className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Confirm
              </button>
              <button onClick={() => setBulkConfirm(false)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="pl-5 pr-3 py-3.5 w-10">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} label="Select all" />
              </th>
              <th className="px-4 py-3.5 font-medium">Title</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-4 py-3.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(post => (
              <>
                <tr
                  key={post.id}
                  className={`group border-b border-gray-50 transition-colors ${
                    selectedIds.has(post.id) ? "bg-emerald-50/60" :
                    deleteId === post.id     ? "bg-red-50 border-red-100" :
                    "hover:bg-gray-50/70"
                  }`}
                >
                  <td className="pl-5 pr-3 py-3">
                    <Checkbox checked={selectedIds.has(post.id)} onChange={() => toggleOne(post.id)} label={`Select ${post.title}`} />
                  </td>

                  {/* Title + hover actions */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 leading-snug">{post.title}</p>
                    {post.excerpt && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{post.excerpt}</p>
                    )}
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">/blog/{post.slug}</p>
                    {/* Hover actions */}
                    <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      <Link href={`/admin/blog/${post.id}/edit`} className="text-emerald-600 hover:underline font-medium">Edit</Link>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleTogglePublish(post.id)}
                        disabled={isPending}
                        className="text-sky-600 hover:underline font-medium disabled:opacity-40"
                      >
                        {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>
                      <span className="text-gray-300">|</span>
                      {post.status === "PUBLISHED" && (
                        <>
                          <Link href={`/blog/${post.slug}`} target="_blank" className="text-violet-600 hover:underline font-medium">View</Link>
                          <span className="text-gray-300">|</span>
                        </>
                      )}
                      <button
                        onClick={() => { setDeleteId(post.id); setRowError(null); }}
                        className="text-red-500 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {post.status === "PUBLISHED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        <FileText className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  </td>
                </tr>

                {/* Delete confirm row */}
                {deleteId === post.id && (
                  <tr key={`del-${post.id}`} className="border-b border-red-100 bg-red-50/60">
                    <td />
                    <td colSpan={3} className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-700 flex-1">Delete <strong>&ldquo;{post.title}&rdquo;</strong>? Cannot be undone.</p>
                        <button onClick={() => handleDelete(post.id)} disabled={isPending} className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors">
                          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Confirm
                        </button>
                        <button onClick={() => setDeleteId(null)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">{filter === "ALL" ? "No posts yet." : `No ${filter.toLowerCase()} posts.`}</p>
                  {filter === "ALL" && (
                    <Link href="/admin/blog/new" className="mt-3 inline-block text-sm text-emerald-600 hover:underline font-medium">+ Write your first post</Link>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination page={page} totalPages={totalPages} total={filtered.length} onChange={p => setPage(p)} />
      </div>
    </>
  );
}
