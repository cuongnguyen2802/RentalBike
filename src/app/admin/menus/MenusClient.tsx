"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Menu, Trash2, X, AlertCircle, Loader2, Settings } from "lucide-react";
import { createMenu, deleteMenu } from "./actions";

export type MenuRow = {
  id:         string;
  name:       string;
  slug:       string;
  itemCount:  number;
  updatedAt:  string;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function MenusClient({ menus: initial }: { menus: MenuRow[] }) {
  const [menus,       setMenus]       = useState(initial);
  const [showNew,     setShowNew]     = useState(false);
  const [newForm,     setNewForm]     = useState({ name: "", slug: "" });
  const [confirmId,   setConfirmId]   = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleNameChange(name: string) {
    setNewForm(prev => ({ ...prev, name, slug: slugify(name) }));
  }

  async function handleCreate() {
    if (!newForm.name || !newForm.slug) return;
    setSaving(true); setError(null);
    const r = await createMenu(newForm);
    setSaving(false);
    if ("error" in r) { setError(r.error); return; }
    setMenus(prev => [...prev, {
      id: r.id, name: newForm.name, slug: newForm.slug,
      itemCount: 0, updatedAt: new Date().toISOString(),
    }]);
    setNewForm({ name: "", slug: "" });
    setShowNew(false);
  }

  function handleDelete(id: string) {
    setConfirmId(null); setError(null);
    startTransition(async () => {
      const r = await deleteMenu(id);
      if ("error" in r) { setError(r.error); return; }
      setMenus(prev => prev.filter(m => m.id !== id));
    });
  }

  const inp = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage navigation menus used on the site</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Menu
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Create form */}
      {showNew && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">New Menu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Name</label>
              <input type="text" value={newForm.name} onChange={e => handleNameChange(e.target.value)}
                placeholder="Main Navigation" className={inp} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Slug</label>
              <input type="text" value={newForm.slug} onChange={e => setNewForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="main-nav" className={`${inp} font-mono`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCreate} disabled={saving || !newForm.name || !newForm.slug}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Menu
            </button>
            <button onClick={() => { setShowNew(false); setNewForm({ name: "", slug: "" }); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Menu cards */}
      {menus.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Menu className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No menus yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Create a menu to manage navigation links</p>
          <button onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            <Plus className="h-4 w-4" /> Create first menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menus.map(menu =>
            confirmId === menu.id ? (
              <div key={menu.id} className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-700 mb-1">Delete &ldquo;{menu.name}&rdquo;?</p>
                <p className="text-xs text-red-600 mb-4">All {menu.itemCount} item{menu.itemCount !== 1 ? "s" : ""} will be removed. This cannot be undone.</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleDelete(menu.id)}
                    className="text-xs font-semibold bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors">
                    Yes, delete
                  </button>
                  <button onClick={() => setConfirmId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">Cancel</button>
                </div>
              </div>
            ) : (
              <div key={menu.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-emerald-100 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Menu className="h-5 w-5 text-emerald-600" />
                  </div>
                  <button onClick={() => setConfirmId(menu.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 mb-0.5">{menu.name}</h3>
                <p className="font-mono text-xs text-gray-400 mb-3">/{menu.slug}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {menu.itemCount} item{menu.itemCount !== 1 ? "s" : ""}
                  </span>
                  <Link href={`/admin/menus/${menu.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                    <Settings className="h-3.5 w-3.5" /> Manage
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Info about slugs */}
      {menus.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-2">Slug reference</p>
          <div className="space-y-1.5">
            {[
              { slug: "header",          where: "Main navigation bar" },
              { slug: "footer-explore",  where: "Footer — Explore column" },
              { slug: "footer-company",  where: "Footer — Company column" },
              { slug: "footer-account",  where: "Footer — Account column" },
            ].map(({ slug, where }) => (
              <div key={slug} className="flex items-center gap-3 text-sm">
                <code className="font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">{slug}</code>
                <span className="text-blue-600">{where}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
