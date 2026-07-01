"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { ArrowLeft, Save, Globe, Loader2, Check, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";
import BlockPalette from "./BlockPalette";
import SortableBlock from "./SortableBlock";
import BlockPropertiesPanel from "./BlockPropertiesPanel";
import { createPage, updatePage } from "../actions";
import type { Block, BlockType } from "./types";
import { createBlock } from "./blockDefs";

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    .slice(0, 100);
}

export interface PageBuilderData {
  id?:             string;
  title?:          string;
  slug?:           string;
  excerpt?:        string | null;
  imageUrl?:       string | null;
  status?:         string;
  showInNav?:      boolean;
  navOrder?:       number;
  seoTitle?:       string | null;
  seoDescription?: string | null;
  blocks?:         unknown;
  pageKey?:        string | null;
}

interface Props {
  mode: "add" | "edit";
  page?: PageBuilderData;
}

export default function PageBuilder({ mode, page }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialBlocks: Block[] = Array.isArray(page?.blocks) ? (page.blocks as Block[]) : [];

  const [blocks,      setBlocks]      = useState<Block[]>(initialBlocks);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(mode === "add");
  const [error,       setError]       = useState<string | null>(null);
  const [saved,       setSaved]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [status,      setStatus]      = useState<string>(page?.status ?? "DRAFT");
  const [settings,    setSettings]    = useState({
    title:          page?.title          ?? "",
    slug:           page?.slug           ?? "",
    excerpt:        page?.excerpt        ?? "",
    imageUrl:       page?.imageUrl       ?? "",
    showInNav:      page?.showInNav      ?? false,
    navOrder:       page?.navOrder       ?? 0,
    seoTitle:       page?.seoTitle       ?? "",
    seoDescription: page?.seoDescription ?? "",
  });

  const isSystem = !!page?.pageKey;

  function handleTitleChange(title: string) {
    setSettings(prev => ({
      ...prev,
      title,
      slug: mode === "add" && !prev.slug ? slugify(title) : prev.slug,
    }));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks(prev => {
      const oi = prev.findIndex(b => b.id === active.id);
      const ni = prev.findIndex(b => b.id === over.id);
      return arrayMove(prev, oi, ni);
    });
  }

  function addBlock(type: BlockType) {
    const block = createBlock(type);
    setBlocks(prev => [...prev, block]);
    setSelectedId(block.id);
    setShowSettings(false);
  }

  function deleteBlock(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateBlock(id: string, data: Record<string, unknown>) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b));
  }

  const selectedBlock = selectedId ? blocks.find(b => b.id === selectedId) ?? null : null;

  async function save(publish?: boolean) {
    if (!settings.title.trim()) { setError("Title is required."); return; }
    if (!settings.slug.trim())  { setError("Slug is required.");  return; }

    setSaving(true);
    setError(null);

    const finalStatus = publish ? "PUBLISHED" : status;
    const data = {
      title:          settings.title,
      slug:           settings.slug,
      excerpt:        settings.excerpt        || undefined,
      imageUrl:       settings.imageUrl       || undefined,
      showInNav:      settings.showInNav,
      navOrder:       settings.navOrder       || 0,
      seoTitle:       settings.seoTitle       || undefined,
      seoDescription: settings.seoDescription || undefined,
      blocks,
    };

    let result;
    startTransition(() => {});

    if (mode === "edit" && page?.id) {
      result = await updatePage(page.id, finalStatus, data);
    } else {
      result = await createPage(finalStatus, data);
    }

    setSaving(false);

    if ("error" in result) { setError(result.error); return; }

    if (publish) setStatus("PUBLISHED");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    if (mode === "add" && "id" in result) {
      router.push(`/admin/pages/${result.id}/edit`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* ── Top bar ── */}
      <div className="shrink-0 h-14 bg-slate-950 border-b border-white/8 flex items-center gap-3 px-4">
        <Link href="/admin/pages"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4" /> Pages
        </Link>
        <div className="w-px h-5 bg-white/10 shrink-0" />
        <input
          type="text"
          value={settings.title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Page title…"
          className="flex-1 bg-transparent text-white text-sm font-semibold placeholder-slate-500 focus:outline-none min-w-0"
        />
        <div className="flex items-center gap-2 shrink-0">
          {isSystem && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2.5 py-1 font-medium hidden sm:inline">
              System Page
            </span>
          )}
          {status === "PUBLISHED" && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-1 font-medium hidden sm:inline">
              Published
            </span>
          )}
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving  ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
             saved   ? <Check   className="h-3.5 w-3.5 text-emerald-400" /> :
             <Save className="h-3.5 w-3.5" />}
            Save
          </button>
          {status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Globe className="h-3.5 w-3.5" /> Publish
            </button>
          )}
        </div>
      </div>

      {/* ── Error bar ── */}
      {error && (
        <div className="shrink-0 bg-red-900/40 border-b border-red-500/30 px-4 py-2.5 flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 text-base leading-none">×</button>
        </div>
      )}

      {/* ── 3-panel main layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Block palette */}
        <BlockPalette onAdd={addBlock} />

        {/* Center: Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-850">
          {blocks.length === 0 ? (
            <div className="h-full min-h-96 flex flex-col items-center justify-center text-center px-6">
              <div className="text-6xl mb-5">🧱</div>
              <p className="text-slate-300 font-semibold text-lg mb-2">Empty page</p>
              <p className="text-slate-500 text-sm max-w-xs">
                Click a block type in the left panel to add your first section.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-w-xl mx-auto">
                  {blocks.map(block => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedId === block.id}
                      onSelect={() => {
                        setSelectedId(block.id);
                        setShowSettings(false);
                      }}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Right: Properties panel */}
        <div className="w-72 shrink-0 bg-slate-950 border-l border-white/8 flex flex-col overflow-hidden">
          {/* Tab row */}
          <div className="flex shrink-0 border-b border-white/8">
            <button
              type="button"
              onClick={() => { setSelectedId(null); setShowSettings(false); }}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${!showSettings && !selectedId ? "text-white border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300"}`}
            >
              Block
            </button>
            <button
              type="button"
              onClick={() => { setSelectedId(null); setShowSettings(true); }}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${showSettings ? "text-white border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Settings className="h-3 w-3" /> Page
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">
            {showSettings ? (
              <PageSettingsPanel
                settings={settings}
                setSettings={setSettings}
                isSystem={isSystem}
                slug={settings.slug}
                pageKey={page?.pageKey ?? null}
              />
            ) : selectedBlock ? (
              <BlockPropertiesPanel
                block={selectedBlock}
                onUpdate={data => updateBlock(selectedBlock.id, data)}
              />
            ) : (
              <div className="p-6 text-center flex flex-col items-center gap-3 pt-12">
                <div className="text-3xl">👈</div>
                <p className="text-slate-500 text-sm">
                  Select a block in the canvas to edit its properties.
                </p>
                <p className="text-slate-600 text-xs">Or switch to the Page tab to edit page settings and SEO.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page settings sub-panel ────────────────────────────────── */

type Settings = {
  title: string; slug: string; excerpt: string; imageUrl: string;
  showInNav: boolean; navOrder: number; seoTitle: string; seoDescription: string;
};

function PageSettingsPanel({
  settings, setSettings, isSystem, slug, pageKey,
}: {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isSystem: boolean;
  slug: string;
  pageKey: string | null;
}) {
  function upd(key: keyof Settings, value: unknown) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  const publicUrl =
    pageKey === "home"    ? "/" :
    pageKey === "about"   ? "/about" :
    pageKey === "contact" ? "/contact" : `/pages/${slug}`;

  const inp = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors";
  const lbl = "block text-xs font-medium text-slate-400 mb-1.5";

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className={lbl}>Title</label>
        <input type="text" value={settings.title} onChange={e => upd("title", e.target.value)} className={inp} />
      </div>
      <div>
        <label className={lbl}>URL {isSystem && <span className="text-amber-500 text-xs">(locked)</span>}</label>
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden focus-within:border-emerald-500 flex items-center">
          <span className="pl-3 text-slate-500 text-xs shrink-0">{isSystem ? "" : "/pages/"}</span>
          {isSystem ? (
            <span className="px-3 py-2 text-sm text-slate-400 font-mono">{publicUrl}</span>
          ) : (
            <input type="text" value={settings.slug} onChange={e => upd("slug", e.target.value)}
              className="flex-1 bg-transparent px-1 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
          )}
        </div>
      </div>
      <div>
        <label className={lbl}>Excerpt / Summary</label>
        <textarea value={settings.excerpt} onChange={e => upd("excerpt", e.target.value)} rows={3}
          className={`${inp} resize-none`} placeholder="Brief description of this page…" />
      </div>
      <div>
        <label className={lbl}>Featured Image URL</label>
        <input type="text" value={settings.imageUrl} onChange={e => upd("imageUrl", e.target.value)}
          className={inp} placeholder="https://…" />
      </div>
      <div className="flex items-center justify-between py-1">
        <label className={`${lbl} mb-0`}>Show in Navigation</label>
        <button type="button" onClick={() => upd("showInNav", !settings.showInNav)}
          className={`relative h-5 w-9 rounded-full transition-colors ${settings.showInNav ? "bg-emerald-600" : "bg-slate-600"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${settings.showInNav ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
      {settings.showInNav && (
        <div>
          <label className={lbl}>Nav Order</label>
          <input type="number" value={settings.navOrder} onChange={e => upd("navOrder", parseInt(e.target.value) || 0)} className={inp} />
        </div>
      )}

      <div className="border-t border-white/8 pt-4 space-y-4">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">SEO</p>
        <div>
          <label className={lbl}>SEO Title</label>
          <input type="text" value={settings.seoTitle} onChange={e => upd("seoTitle", e.target.value)}
            className={inp} placeholder="Custom page title for search engines…" />
        </div>
        <div>
          <label className={lbl}>SEO Description</label>
          <textarea value={settings.seoDescription} onChange={e => upd("seoDescription", e.target.value)} rows={3}
            className={`${inp} resize-none`} placeholder="Meta description (under 160 chars)…" />
        </div>
        {settings.seoTitle && (
          <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-0.5 border border-slate-700">
            <p className="text-blue-400 font-medium truncate">{settings.seoTitle}</p>
            <p className="text-green-500/80 truncate">pedalgo.com{publicUrl}</p>
            <p className="text-slate-400 line-clamp-2">{settings.seoDescription || settings.excerpt || "No description"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
