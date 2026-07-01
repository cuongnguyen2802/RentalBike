"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { BLOCK_DEFS } from "./blockDefs";
import type { Block } from "./types";

interface Props {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function SortableBlock({ block, isSelected, onSelect, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex:  isDragging ? 10 : 0,
  };

  const def = BLOCK_DEFS.find(d => d.type === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center gap-2 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-slate-700 bg-slate-800 hover:border-slate-600"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        className="pl-2 py-3 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Icon + summary */}
      <div className="flex-1 py-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none shrink-0">{def?.icon ?? "📄"}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-snug">{def?.label ?? block.type}</p>
            <BlockSummary block={block} />
          </div>
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="mr-2.5 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
        title="Remove block"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function BlockSummary({ block }: { block: Block }) {
  const d = block.data;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const len = (v: unknown) => (Array.isArray(v) ? v.length : 0);

  const text = (() => {
    switch (block.type) {
      case "hero":         return str(d.title) || "No title";
      case "rich_text":    return "Rich text content";
      case "image":        return str(d.src) ? "Image attached" : "No image set";
      case "features":     return `${len(d.items)} item${len(d.items) !== 1 ? "s" : ""}`;
      case "stats":        return `${len(d.items)} stat${len(d.items) !== 1 ? "s" : ""}`;
      case "cta":          return str(d.title) || "No title";
      case "team":         return `${len(d.members)} member${len(d.members) !== 1 ? "s" : ""}`;
      case "faq":          return `${len(d.items)} question${len(d.items) !== 1 ? "s" : ""}`;
      case "contact_form": return str(d.email) || "Contact form";
      case "divider":      return str(d.style) || "line";
      case "spacer":       return `${str(d.height) || "md"} spacing`;
      default:             return "";
    }
  })();

  return <p className="text-xs text-slate-500 truncate leading-snug">{text}</p>;
}
