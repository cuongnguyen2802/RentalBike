"use client";

import { BLOCK_DEFS } from "./blockDefs";
import type { BlockType } from "./types";

interface Props {
  onAdd: (type: BlockType) => void;
}

export default function BlockPalette({ onAdd }: Props) {
  return (
    <div className="w-52 shrink-0 bg-slate-900 border-r border-white/8 overflow-y-auto">
      <div className="px-3 pt-4 pb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 px-1">Add Block</p>
        <div className="space-y-0.5">
          {BLOCK_DEFS.map(def => (
            <button
              key={def.type}
              type="button"
              onClick={() => onAdd(def.type)}
              title={def.description}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-all group"
            >
              <span className="text-base leading-none shrink-0">{def.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-300 group-hover:text-white leading-none">{def.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
