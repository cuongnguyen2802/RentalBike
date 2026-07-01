"use client";

import { useState, useTransition } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Pencil, Trash2, Plus, Check, X, AlertCircle,
  Loader2, ExternalLink, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { addMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems } from "../actions";

export interface MenuItemRow {
  id:     string;
  label:  string;
  url:    string;
  target: string;
  order:  number;
}

interface Props {
  menu: { id: string; name: string; slug: string };
  initialItems: MenuItemRow[];
}

type EditForm = { label: string; url: string; target: string };
const EMPTY_FORM: EditForm = { label: "", url: "", target: "_self" };

export default function MenuEditorClient({ menu, initialItems }: Props) {
  const [items,     setItems]     = useState<MenuItemRow[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm,  setEditForm]  = useState<EditForm>(EMPTY_FORM);
  const [showAdd,   setShowAdd]   = useState(false);
  const [addForm,   setAddForm]   = useState<EditForm>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [, startTransition]       = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oi   = prev.findIndex(i => i.id === active.id);
      const ni   = prev.findIndex(i => i.id === over.id);
      const next = arrayMove(prev, oi, ni);
      startTransition(async () => {
        await reorderMenuItems(menu.id, next.map(i => i.id));
      });
      return next;
    });
  }

  function startEdit(item: MenuItemRow) {
    setEditingId(item.id);
    setEditForm({ label: item.label, url: item.url, target: item.target });
    setShowAdd(false);
  }

  async function saveEdit(id: string) {
    if (!editForm.label || !editForm.url) { setError("Label and URL are required."); return; }
    setSaving(true); setError(null);
    const r = await updateMenuItem(id, editForm);
    setSaving(false);
    if ("error" in r) { setError(r.error); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...editForm } : i));
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const r = await deleteMenuItem(id);
      if ("error" in r) { setError(r.error); return; }
      setItems(prev => prev.filter(i => i.id !== id));
      if (editingId === id) setEditingId(null);
    });
  }

  async function handleAdd() {
    if (!addForm.label || !addForm.url) { setError("Label and URL are required."); return; }
    setSaving(true); setError(null);
    const r = await addMenuItem(menu.id, addForm);
    setSaving(false);
    if ("error" in r) { setError(r.error); return; }
    if ("item" in r) setItems(prev => [...prev, r.item]);
    setAddForm(EMPTY_FORM);
    setShowAdd(false);
  }

  const inpCls = "bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors";

  return (
    <div>
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/menus"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Menus
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">{menu.name}</h1>
        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{menu.slug}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Items panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Column headers */}
        {items.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            <span className="w-5 shrink-0" />
            <span className="flex-1">Label</span>
            <span className="w-52">URL</span>
            <span className="w-24 text-center">New Tab</span>
            <span className="w-20 text-right">Actions</span>
          </div>
        )}

        {/* Sortable list */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              editingId === item.id ? (
                /* Inline edit row */
                <div key={item.id} className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                  <span className="w-5 shrink-0 text-slate-300"><GripVertical className="h-4 w-4" /></span>
                  <input
                    type="text" value={editForm.label}
                    onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))}
                    placeholder="Label" autoFocus
                    className={`${inpCls} flex-1`}
                  />
                  <input
                    type="text" value={editForm.url}
                    onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))}
                    placeholder="/path or https://…"
                    className={`${inpCls} w-52 font-mono text-xs`}
                  />
                  <div className="w-24 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setEditForm(p => ({ ...p, target: p.target === "_blank" ? "_self" : "_blank" }))}
                      className={`relative h-5 w-9 rounded-full transition-colors ${editForm.target === "_blank" ? "bg-emerald-600" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${editForm.target === "_blank" ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="w-20 flex items-center justify-end gap-1.5">
                    <button onClick={() => saveEdit(item.id)} disabled={saving}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50">
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <SortableRow
                  key={item.id}
                  item={item}
                  onEdit={() => startEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              )
            ))}
          </SortableContext>
        </DndContext>

        {/* Empty state */}
        {items.length === 0 && !showAdd && (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">No items in this menu yet.</p>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              <Plus className="h-4 w-4" /> Add first item
            </button>
          </div>
        )}

        {/* Add row */}
        {showAdd && (
          <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border-t border-emerald-100">
            <span className="w-5 shrink-0" />
            <input
              type="text" value={addForm.label}
              onChange={e => setAddForm(p => ({ ...p, label: e.target.value }))}
              placeholder="Label" autoFocus
              className={`${inpCls} flex-1`}
            />
            <input
              type="text" value={addForm.url}
              onChange={e => setAddForm(p => ({ ...p, url: e.target.value }))}
              placeholder="/path or https://…"
              className={`${inpCls} w-52 font-mono text-xs`}
            />
            <div className="w-24 flex justify-center">
              <button
                type="button"
                onClick={() => setAddForm(p => ({ ...p, target: p.target === "_blank" ? "_self" : "_blank" }))}
                className={`relative h-5 w-9 rounded-full transition-colors ${addForm.target === "_blank" ? "bg-emerald-600" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${addForm.target === "_blank" ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="w-20 flex items-center justify-end gap-1.5">
              <button onClick={handleAdd} disabled={saving}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Add item button */}
        {!showAdd && items.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50">
            <button
              onClick={() => { setShowAdd(true); setEditingId(null); }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add item
            </button>
          </div>
        )}
      </div>

      {items.length > 1 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Drag items by the handle ⠿ to reorder — changes save automatically
        </p>
      )}
    </div>
  );
}

/* ── Sortable row ─────────────────────────────────────────────── */

function SortableRow({
  item, onEdit, onDelete,
}: { item: MenuItemRow; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex:  isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="w-5 shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Label */}
      <span className="flex-1 font-medium text-gray-900 text-sm">{item.label}</span>

      {/* URL */}
      <span className="w-52 font-mono text-xs text-gray-400 truncate" title={item.url}>
        {item.url}
      </span>

      {/* New tab */}
      <div className="w-24 flex justify-center">
        {item.target === "_blank" ? (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            <ExternalLink className="h-3 w-3" /> New tab
          </span>
        ) : (
          <span className="text-gray-200 text-xs">—</span>
        )}
      </div>

      {/* Actions */}
      <div className="w-20 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
