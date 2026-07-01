"use client";

import { Trash2 } from "lucide-react";
import RichEditor from "@/components/shared/RichEditor";
import type { Block } from "./types";

/* ── Shared micro-components ─────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Inp({
  value, onChange, placeholder = "", type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
    />
  );
}

function Txt({
  value, onChange, rows = 3, placeholder = "",
}: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
    />
  );
}

function Sel({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SectionHeading({ label }: { label: string }) {
  return <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest pt-2 border-t border-white/8">{label}</p>;
}

/* ── Generic array editor ─────────────────────────────────────── */

function ArrayEditor<T extends Record<string, unknown>>({
  items, onChange, newItem, addLabel, renderItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: T;
  addLabel: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void, remove: () => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-slate-700/50 rounded-xl p-3 space-y-2 border border-slate-600/50">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-semibold text-slate-400">Item {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {renderItem(
            item,
            (patch) => {
              const next = [...items];
              next[i] = { ...item, ...patch };
              onChange(next);
            },
            () => onChange(items.filter((_, j) => j !== i)),
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { ...newItem }])}
        className="w-full py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-400 text-xs font-medium hover:border-emerald-500 hover:text-emerald-400 transition-colors"
      >
        + {addLabel}
      </button>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */

interface Props {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

export default function BlockPropertiesPanel({ block, onUpdate }: Props) {
  const d = block.data;
  const upd = (key: string, value: unknown) => onUpdate({ ...d, [key]: value });
  const s = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
  const n = (k: string) => (typeof d[k] === "number" ? (d[k] as number) : 0);

  return (
    <div className="p-4 space-y-4">
      <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
        {block.type.replace(/_/g, " ")} Properties
      </p>

      {block.type === "hero" && (
        <>
          <Field label="Title"><Inp value={s("title")} onChange={v => upd("title", v)} placeholder="Headline…" /></Field>
          <Field label="Subtitle"><Txt value={s("subtitle")} onChange={v => upd("subtitle", v)} placeholder="Supporting text…" /></Field>
          <Field label="Background Image URL"><Inp value={s("backgroundImage")} onChange={v => upd("backgroundImage", v)} placeholder="https://…" /></Field>
          <Field label={`Overlay Opacity: ${n("overlayOpacity")}%`}>
            <input type="range" min={0} max={90} value={n("overlayOpacity")} onChange={e => upd("overlayOpacity", Number(e.target.value))}
              className="w-full accent-emerald-500" />
          </Field>
          <Field label="Height">
            <Sel value={s("height") || "large"} onChange={v => upd("height", v)}
              options={[{ value: "medium", label: "Medium (400px)" }, { value: "large", label: "Large (600px)" }, { value: "full", label: "Full screen" }]} />
          </Field>
          <Field label="Text Alignment">
            <Sel value={s("textAlign") || "center"} onChange={v => upd("textAlign", v)}
              options={[{ value: "center", label: "Center" }, { value: "left", label: "Left" }]} />
          </Field>
          <SectionHeading label="Primary Button" />
          <Field label="Button Label"><Inp value={s("ctaLabel")} onChange={v => upd("ctaLabel", v)} placeholder="Get Started" /></Field>
          <Field label="Button Link"><Inp value={s("ctaHref")} onChange={v => upd("ctaHref", v)} placeholder="/bikes" /></Field>
          <SectionHeading label="Secondary Button" />
          <Field label="Button Label"><Inp value={s("ctaSecondaryLabel")} onChange={v => upd("ctaSecondaryLabel", v)} placeholder="Learn More" /></Field>
          <Field label="Button Link"><Inp value={s("ctaSecondaryHref")} onChange={v => upd("ctaSecondaryHref", v)} placeholder="/about" /></Field>
        </>
      )}

      {block.type === "rich_text" && (
        <Field label="Content">
          <div className="rounded-xl overflow-hidden">
            <RichEditor
              key={block.id}
              defaultValue={s("content")}
              onChange={v => upd("content", v)}
              minHeight={180}
            />
          </div>
        </Field>
      )}

      {block.type === "image" && (
        <>
          <Field label="Image URL"><Inp value={s("src")} onChange={v => upd("src", v)} placeholder="https://…" /></Field>
          <Field label="Alt Text"><Inp value={s("alt")} onChange={v => upd("alt", v)} placeholder="Describe the image" /></Field>
          <Field label="Caption"><Inp value={s("caption")} onChange={v => upd("caption", v)} placeholder="Optional caption…" /></Field>
          <Field label="Width">
            <Sel value={s("width") || "contained"} onChange={v => upd("width", v)}
              options={[{ value: "small", label: "Small (max 576px)" }, { value: "contained", label: "Contained (max 896px)" }, { value: "full", label: "Full width" }]} />
          </Field>
        </>
      )}

      {block.type === "features" && (
        <>
          <Field label="Title"><Inp value={s("title")} onChange={v => upd("title", v)} placeholder="Section title…" /></Field>
          <Field label="Subtitle"><Inp value={s("subtitle")} onChange={v => upd("subtitle", v)} placeholder="Section subtitle…" /></Field>
          <Field label="Columns">
            <Sel value={String(d.columns || 3)} onChange={v => upd("columns", Number(v))}
              options={[{ value: "2", label: "2 Columns" }, { value: "3", label: "3 Columns" }, { value: "4", label: "4 Columns" }]} />
          </Field>
          <SectionHeading label="Feature Items" />
          <ArrayEditor<{ icon?: string; title?: string; description?: string }>
            items={(d.items as { icon?: string; title?: string; description?: string }[]) || []}
            newItem={{ icon: "⭐", title: "", description: "" }}
            addLabel="Add feature"
            onChange={items => upd("items", items)}
            renderItem={(item, update) => (
              <>
                <Inp value={item.icon || ""} onChange={v => update({ icon: v })} placeholder="🚲 Emoji or icon" />
                <Inp value={item.title || ""} onChange={v => update({ title: v })} placeholder="Feature title" />
                <Txt value={item.description || ""} onChange={v => update({ description: v })} rows={2} placeholder="Short description…" />
              </>
            )}
          />
        </>
      )}

      {block.type === "stats" && (
        <>
          <Field label="Theme">
            <Sel value={s("theme") || "emerald"} onChange={v => upd("theme", v)}
              options={[{ value: "emerald", label: "Emerald (green)" }, { value: "dark", label: "Dark (slate)" }]} />
          </Field>
          <SectionHeading label="Stats" />
          <ArrayEditor<{ value?: string; label?: string }>
            items={(d.items as { value?: string; label?: string }[]) || []}
            newItem={{ value: "0", label: "Stat label" }}
            addLabel="Add stat"
            onChange={items => upd("items", items)}
            renderItem={(item, update) => (
              <>
                <Inp value={item.value || ""} onChange={v => update({ value: v })} placeholder="500+ or 4.8★" />
                <Inp value={item.label || ""} onChange={v => update({ label: v })} placeholder="Label" />
              </>
            )}
          />
        </>
      )}

      {block.type === "cta" && (
        <>
          <Field label="Title"><Inp value={s("title")} onChange={v => upd("title", v)} placeholder="Ready to start?" /></Field>
          <Field label="Subtitle"><Txt value={s("subtitle")} onChange={v => upd("subtitle", v)} placeholder="Supporting text…" /></Field>
          <Field label="Button Label"><Inp value={s("buttonLabel")} onChange={v => upd("buttonLabel", v)} placeholder="Get Started" /></Field>
          <Field label="Button Link"><Inp value={s("buttonHref")} onChange={v => upd("buttonHref", v)} placeholder="/bikes" /></Field>
          <Field label="Theme">
            <Sel value={s("theme") || "emerald"} onChange={v => upd("theme", v)}
              options={[{ value: "emerald", label: "Emerald" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
          </Field>
        </>
      )}

      {block.type === "team" && (
        <>
          <Field label="Section Title"><Inp value={s("title")} onChange={v => upd("title", v)} placeholder="Meet the Team" /></Field>
          <SectionHeading label="Team Members" />
          <ArrayEditor<{ name?: string; role?: string; image?: string; bio?: string }>
            items={(d.members as { name?: string; role?: string; image?: string; bio?: string }[]) || []}
            newItem={{ name: "", role: "", image: "", bio: "" }}
            addLabel="Add member"
            onChange={members => upd("members", members)}
            renderItem={(item, update) => (
              <>
                <Inp value={item.name || ""}  onChange={v => update({ name: v })}  placeholder="Full name" />
                <Inp value={item.role || ""}  onChange={v => update({ role: v })}  placeholder="Job title" />
                <Inp value={item.image || ""} onChange={v => update({ image: v })} placeholder="Photo URL" />
                <Txt value={item.bio || ""}   onChange={v => update({ bio: v })}   rows={2} placeholder="Short bio…" />
              </>
            )}
          />
        </>
      )}

      {block.type === "faq" && (
        <>
          <Field label="Section Title"><Inp value={s("title")} onChange={v => upd("title", v)} placeholder="FAQ" /></Field>
          <SectionHeading label="Questions" />
          <ArrayEditor<{ question?: string; answer?: string }>
            items={(d.items as { question?: string; answer?: string }[]) || []}
            newItem={{ question: "", answer: "" }}
            addLabel="Add question"
            onChange={items => upd("items", items)}
            renderItem={(item, update) => (
              <>
                <Inp value={item.question || ""} onChange={v => update({ question: v })} placeholder="Question?" />
                <Txt value={item.answer || ""}   onChange={v => update({ answer: v })}   rows={3} placeholder="Answer…" />
              </>
            )}
          />
        </>
      )}

      {block.type === "contact_form" && (
        <>
          <Field label="Title"><Inp value={s("title")} onChange={v => upd("title", v)} placeholder="Get In Touch" /></Field>
          <Field label="Subtitle"><Txt value={s("subtitle")} onChange={v => upd("subtitle", v)} placeholder="Supporting text…" /></Field>
          <SectionHeading label="Contact Info" />
          <Field label="Email"><Inp value={s("email")} onChange={v => upd("email", v)} placeholder="hello@example.com" /></Field>
          <Field label="Phone"><Inp value={s("phone")} onChange={v => upd("phone", v)} placeholder="+84 28 1234 5678" /></Field>
          <Field label="Address"><Inp value={s("address")} onChange={v => upd("address", v)} placeholder="City, Country" /></Field>
        </>
      )}

      {block.type === "divider" && (
        <>
          <Field label="Style">
            <Sel value={s("style") || "line"} onChange={v => upd("style", v)}
              options={[{ value: "line", label: "Line" }, { value: "dots", label: "Dots" }, { value: "gradient", label: "Gradient" }]} />
          </Field>
          <Field label="Spacing">
            <Sel value={s("spacing") || "md"} onChange={v => upd("spacing", v)}
              options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
          </Field>
        </>
      )}

      {block.type === "spacer" && (
        <Field label="Height">
          <Sel value={s("height") || "md"} onChange={v => upd("height", v)}
            options={[{ value: "sm", label: "Small (32px)" }, { value: "md", label: "Medium (64px)" }, { value: "lg", label: "Large (96px)" }, { value: "xl", label: "XL (160px)" }]} />
        </Field>
      )}
    </div>
  );
}
