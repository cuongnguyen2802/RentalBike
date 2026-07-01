"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Search, ImageIcon, X, Upload, Eye, FileText,
} from "lucide-react";
import RichEditor from "@/components/shared/RichEditor";
import MediaPickerModal from "@/components/shared/MediaPickerModal";
import { createPost, updatePost } from "./actions";

/* ── Types ── */

export type PostEditData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  imageUrl: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
};

/* ── Helpers ── */

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function emptyForm(): FormData {
  return { title: "", slug: "", excerpt: "", content: "", imageUrl: "", status: "DRAFT", seoTitle: "", seoDescription: "" };
}

function fromPost(post: PostEditData): FormData {
  return {
    title:          post.title,
    slug:           post.slug,
    excerpt:        post.excerpt ?? "",
    content:        post.content ?? "",
    imageUrl:       post.imageUrl ?? "",
    status:         post.status,
    seoTitle:       post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
  };
}

/* ── UI helpers ── */

const inputCls    = "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition";
const textareaCls = `${inputCls} resize-none`;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ── Main ── */

export default function PostFormPage({
  mode,
  post,
}: {
  mode: "add" | "edit";
  post?: PostEditData;
}) {
  const router = useRouter();
  const [form, setForm]           = useState<FormData>(mode === "edit" && post ? fromPost(post) : emptyForm());
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [seoOpen, setSeoOpen]     = useState(mode === "edit" && !!(post?.seoTitle || post?.seoDescription));
  const [mediaOpen, setMediaOpen] = useState(false);
  const [urlMode, setUrlMode]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Auto-slug from title when creating
  useEffect(() => {
    if (mode === "add" && !slugManual && form.title) {
      setForm(f => ({ ...f, slug: toSlug(f.title) }));
    }
  }, [form.title, mode, slugManual]);

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSlugChange(v: string) {
    setSlugManual(true);
    set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-"));
  }

  function submit(status: string) {
    setError(null);
    const payload = { ...form, status, imageUrl: form.imageUrl.trim() || undefined };
    startTransition(async () => {
      const r = mode === "add"
        ? await createPost(payload)
        : await updatePost(post!.id, payload);
      if ("error" in r) { setError(r.error); return; }
      router.push("/admin/blog");
      router.refresh();
    });
  }

  const descCount = form.seoDescription.length;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Blog Posts
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "add" ? "New Blog Post" : `Edit — ${post?.title}`}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {form.status === "PUBLISHED"
                ? <span className="inline-flex items-center gap-1 text-emerald-600"><Eye className="h-3.5 w-3.5" /> Published</span>
                : <span className="inline-flex items-center gap-1 text-gray-400"><FileText className="h-3.5 w-3.5" /> Draft</span>}
            </p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Title */}
          <Field label="Post Title">
            <input
              className={`${inputCls} text-base font-semibold`}
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Top 5 Cycling Routes in Ho Chi Minh City"
              required
            />
          </Field>

          {/* Slug */}
          <Field label="URL Slug" hint={`pedalgo.com/blog/${form.slug || "auto-generated"}`}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono">/blog/</span>
              <input
                className={`${inputCls} pl-14 font-mono text-xs`}
                value={form.slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="top-5-cycling-routes"
              />
            </div>
          </Field>

          {/* Featured Image */}
          <Field label="Featured Image">
            {form.imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={form.imageUrl}
                    alt="Featured"
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
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 transition-colors">
                {urlMode ? (
                  <div className="p-4 space-y-3">
                    <input
                      className={inputCls}
                      value={form.imageUrl}
                      onChange={e => set("imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setUrlMode(false)} className="text-xs text-emerald-600 hover:underline font-medium">← Or pick from library</button>
                      <button type="button" onClick={() => { setUrlMode(false); set("imageUrl", ""); }} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No featured image</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMediaOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" /> Pick from Library
                      </button>
                      <button type="button" onClick={() => setUrlMode(true)} className="text-xs text-gray-500 hover:text-gray-700 font-medium underline underline-offset-2">Paste URL</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Field>

          {/* Excerpt */}
          <Field label="Excerpt" hint="Short summary shown in blog listing (optional)">
            <textarea
              className={textareaCls}
              rows={2}
              value={form.excerpt}
              onChange={e => set("excerpt", e.target.value)}
              placeholder="A short description of this post…"
              maxLength={300}
            />
          </Field>

          {/* Content */}
          <Field label="Content">
            <RichEditor
              key={post?.id ?? "new"}
              defaultValue={form.content}
              onChange={v => set("content", v)}
              placeholder="Start writing your blog post…"
              minHeight={300}
            />
          </Field>

          {/* SEO */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">SEO Settings</span>
                {(form.seoTitle || form.seoDescription) && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">active</span>
                )}
              </div>
              {seoOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {seoOpen && (
              <div className="px-5 py-5 space-y-4 border-t border-gray-200">
                <Field label="Meta Title" hint={`Defaults to "${form.title || "Post title"} — PedalGo"`}>
                  <input
                    className={inputCls}
                    value={form.seoTitle}
                    onChange={e => set("seoTitle", e.target.value)}
                    placeholder={`${form.title || "Post title"} — PedalGo Blog`}
                    maxLength={70}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">Ideal: 50–60 chars</p>
                    <p className={`text-xs font-mono ${form.seoTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>{form.seoTitle.length}/70</p>
                  </div>
                </Field>

                <Field label="Meta Description">
                  <textarea
                    className={textareaCls}
                    rows={3}
                    value={form.seoDescription}
                    onChange={e => set("seoDescription", e.target.value)}
                    placeholder="Describe what this post is about for search engines…"
                    maxLength={160}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">Ideal: 120–155 chars</p>
                    <p className={`text-xs font-mono ${descCount > 155 ? "text-amber-500" : "text-gray-400"}`}>{descCount}/160</p>
                  </div>
                </Field>

                {(form.seoTitle || form.title) && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Google Preview</p>
                    <p className="text-blue-700 text-sm font-medium leading-snug">{form.seoTitle || `${form.title} — PedalGo Blog`}</p>
                    <p className="text-green-700 text-xs mt-0.5 font-mono">pedalgo.com/blog/{form.slug || "…"}</p>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">{form.seoDescription || form.excerpt || "No description set."}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Link
              href="/admin/blog"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => submit("DRAFT")}
              disabled={isPending || !form.title || !form.slug}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => submit("PUBLISHED")}
              disabled={isPending || !form.title || !form.slug}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white text-sm font-semibold transition-colors"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {form.status === "PUBLISHED" ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {mediaOpen && (
        <MediaPickerModal
          onClose={() => setMediaOpen(false)}
          onSelect={(url) => { set("imageUrl", url); setUrlMode(false); setMediaOpen(false); }}
        />
      )}
    </div>
  );
}
