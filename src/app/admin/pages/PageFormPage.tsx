"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronUp, Eye, FileText, Loader2,
  AlertCircle, ExternalLink, Globe,
} from "lucide-react";
import { createPage, updatePage } from "./actions";
import MediaPickerModal from "@/components/shared/MediaPickerModal";
import RichEditor from "@/components/shared/RichEditor";

/* ── Types ── */

export type PageEditData = {
  id:             string;
  title:          string;
  slug:           string;
  content:        string | null;
  excerpt:        string | null;
  imageUrl:       string | null;
  status:         string;
  showInNav:      boolean;
  navOrder:       number;
  seoTitle:       string | null;
  seoDescription: string | null;
};

type FormData = {
  title:          string;
  slug:           string;
  content:        string;
  excerpt:        string;
  imageUrl:       string;
  showInNav:      boolean;
  navOrder:       number;
  seoTitle:       string;
  seoDescription: string;
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Component ── */

export default function PageFormPage({
  mode,
  page,
}: {
  mode: "add" | "edit";
  page?: PageEditData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormData>({
    title:          page?.title          ?? "",
    slug:           page?.slug           ?? "",
    content:        page?.content        ?? "",
    excerpt:        page?.excerpt        ?? "",
    imageUrl:       page?.imageUrl       ?? "",
    showInNav:      page?.showInNav      ?? false,
    navOrder:       page?.navOrder       ?? 0,
    seoTitle:       page?.seoTitle       ?? "",
    seoDescription: page?.seoDescription ?? "",
  });

  const [slugManual,  setSlugManual]  = useState(mode === "edit");
  const [seoOpen,     setSeoOpen]     = useState(!!(page?.seoTitle || page?.seoDescription));
  const [navOpen,     setNavOpen]     = useState(false);
  const [mediaOpen,   setMediaOpen]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(page?.status ?? "DRAFT");

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && form.title) {
      setForm(prev => ({ ...prev, slug: toSlug(form.title) }));
    }
  }, [form.title, slugManual]);

  function set(field: keyof FormData, value: string | boolean | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function submit(status: string) {
    setError(null);
    startTransition(async () => {
      const data = {
        title:          form.title,
        slug:           form.slug,
        content:        form.content,
        excerpt:        form.excerpt,
        imageUrl:       form.imageUrl || undefined,
        showInNav:      form.showInNav,
        navOrder:       form.navOrder,
        seoTitle:       form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
      };

      const result = mode === "add"
        ? await createPage(status, data)
        : await updatePage(page!.id, status, data);

      if ("error" in result) { setError(result.error); return; }
      setCurrentStatus(status);
      router.push("/admin/pages");
    });
  }

  const seoHasValues = !!(form.seoTitle || form.seoDescription);
  const isPublished  = currentStatus === "PUBLISHED";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/pages" className="text-slate-400 hover:text-white text-sm transition-colors">Pages</Link>
            <span className="text-slate-600 text-sm">/</span>
            <span className="text-white text-sm font-medium">{mode === "add" ? "New Page" : form.title || "Edit Page"}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === "add" ? "New Page" : "Edit Page"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isPublished && page && (
            <Link
              href={`/pages/${page.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/8 transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> View
            </Link>
          )}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
          }`}>
            {isPublished ? <Eye className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 p-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Page Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="About Us"
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 outline-none border-b border-white/10 pb-2 focus:border-emerald-500 transition-colors"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-slate-500 text-sm">URL:</span>
            <span className="text-slate-500 text-sm">/pages/</span>
            <input
              type="text"
              value={form.slug}
              onChange={e => { setSlugManual(true); set("slug", e.target.value); }}
              placeholder="about-us"
              className="flex-1 bg-transparent text-sm text-emerald-400 outline-none border-b border-white/10 pb-0.5 focus:border-emerald-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 p-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Featured Image</label>
          {form.imageUrl ? (
            <div className="relative rounded-xl overflow-hidden aspect-[16/6] bg-slate-700 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="Featured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => setMediaOpen(true)} className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg">Change</button>
                <button onClick={() => set("imageUrl", "")} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Remove</button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setMediaOpen(true)}
              className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
            >
              <Globe className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">Add a featured image</p>
              <button type="button" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors">
                Pick from Library
              </button>
            </div>
          )}
          <div className="mt-3">
            <input
              type="text"
              value={form.imageUrl}
              onChange={e => set("imageUrl", e.target.value)}
              placeholder="Or paste image URL…"
              className="w-full bg-slate-900/50 text-sm text-slate-300 placeholder-slate-600 px-3 py-2 rounded-xl border border-white/8 outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 p-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Excerpt / Short Description</label>
          <textarea
            value={form.excerpt}
            onChange={e => set("excerpt", e.target.value)}
            rows={2}
            placeholder="Brief description shown in meta tags and page previews…"
            className="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 p-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Page Content</label>
          <div className="rich-editor-dark">
            <RichEditor
              defaultValue={form.content}
              onChange={v => set("content", v)}
              placeholder="Start writing your page content…"
            />
          </div>
        </div>

        {/* Navigation settings */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 overflow-hidden">
          <button
            type="button"
            onClick={() => setNavOpen(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-white">Navigation</span>
              {form.showInNav && (
                <span className="text-[10px] font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Visible</span>
              )}
            </div>
            {navOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {navOpen && (
            <div className="px-6 pb-6 border-t border-white/8 pt-4 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showInNav}
                  onChange={e => set("showInNav", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                />
                <div>
                  <p className="text-sm font-medium text-white">Show in navigation</p>
                  <p className="text-xs text-slate-500">Page link will appear in the site footer</p>
                </div>
              </label>
              {form.showInNav && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nav Order</label>
                  <input
                    type="number"
                    value={form.navOrder}
                    onChange={e => set("navOrder", parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-24 bg-slate-900/50 text-sm text-slate-300 px-3 py-2 rounded-xl border border-white/8 outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 overflow-hidden">
          <button
            type="button"
            onClick={() => setSeoOpen(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">SEO</span>
              {seoHasValues && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
              )}
            </div>
            {seoOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {seoOpen && (
            <div className="px-6 pb-6 border-t border-white/8 pt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Meta Title</label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={e => set("seoTitle", e.target.value)}
                  placeholder={form.title ? `${form.title} — PedalGo` : "Meta title…"}
                  className="w-full bg-slate-900/50 text-sm text-slate-300 placeholder-slate-600 px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-emerald-500/50 transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">{(form.seoTitle || "").length}/60 chars</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Meta Description</label>
                <textarea
                  value={form.seoDescription}
                  onChange={e => set("seoDescription", e.target.value)}
                  rows={2}
                  placeholder="Short description for search engines…"
                  className="w-full bg-slate-900/50 text-sm text-slate-300 placeholder-slate-600 px-3 py-2.5 rounded-xl border border-white/8 outline-none focus:border-emerald-500/50 transition-colors resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">{(form.seoDescription || "").length}/160 chars</p>
              </div>

              {/* Google Preview */}
              {(form.seoTitle || form.title) && (
                <div className="bg-white rounded-xl p-4 mt-2">
                  <p className="text-[11px] text-gray-400 mb-2 font-medium uppercase tracking-widest">Google Preview</p>
                  <p className="text-blue-600 text-base font-medium leading-tight truncate">
                    {form.seoTitle || `${form.title} — PedalGo`}
                  </p>
                  <p className="text-green-700 text-xs mt-0.5">pedalgo.com/pages/{form.slug}</p>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {form.seoDescription || form.excerpt || "No description set."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/admin/pages"
            className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => submit("DRAFT")}
            disabled={isPending || !form.title || !form.slug}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border border-white/10 text-slate-300 hover:text-white hover:border-white/20 rounded-xl transition-colors disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => submit("PUBLISHED")}
            disabled={isPending || !form.title || !form.slug}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            {isPublished ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {mediaOpen && (
        <MediaPickerModal
          onClose={() => setMediaOpen(false)}
          onSelect={url => { set("imageUrl", url); setMediaOpen(false); }}
        />
      )}
    </div>
  );
}
