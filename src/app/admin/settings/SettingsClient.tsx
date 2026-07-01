"use client";

import { useState, useTransition } from "react";
import {
  Search, LayoutTemplate, FileCode2, MessageCircle,
  Check, AlertCircle, X, Loader2,
} from "lucide-react";
import type { SeoSettings, HeaderSettings, FooterSettings, ChatSettings } from "@/lib/settings";
import { saveSetting } from "./actions";

interface Props {
  seo:    SeoSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  chat:   ChatSettings;
}

type Tab = "seo" | "header" | "footer" | "chat";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "seo",    label: "SEO",         icon: Search         },
  { id: "header", label: "Header",      icon: LayoutTemplate },
  { id: "footer", label: "Footer",      icon: FileCode2      },
  { id: "chat",   label: "Chat Button", icon: MessageCircle  },
];

const CHAT_COLORS = [
  { label: "Emerald", value: "#10b981" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Purple",  value: "#8b5cf6" },
  { label: "Rose",    value: "#f43f5e" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Slate",   value: "#475569" },
];

export default function SettingsClient({ seo: initSeo, header: initHeader, footer: initFooter, chat: initChat }: Props) {
  const [tab,    setTab]    = useState<Tab>("seo");
  const [seo,    setSeo]    = useState(initSeo);
  const [header, setHeader] = useState(initHeader);
  const [footer, setFooter] = useState(initFooter);
  const [chat,   setChat]   = useState(initChat);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [, startTransition] = useTransition();

  const inp  = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors";
  const ta   = `${inp} resize-none font-mono text-xs`;
  const lbl  = "block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5";

  function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
    return (
      <div>
        <label className={lbl}>{label}</label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    );
  }

  function Toggle({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
    return (
      <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative shrink-0 h-5 w-9 rounded-full transition-colors ${value ? "bg-emerald-600" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${value ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
    );
  }

  async function save() {
    setStatus("saving");
    const map = { seo, header, footer, chat };
    const r   = await saveSetting(tab, map[tab]);
    if ("error" in r) { setStatus("error"); setErrMsg(r.error); return; }
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure SEO, layout, and chat</p>
        </div>
        <button
          onClick={() => startTransition(save)}
          disabled={status === "saving"}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {status === "saving" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : status === "saved" ? (
            <><Check className="h-4 w-4" /> Saved!</>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{errMsg}</span>
          <button onClick={() => setStatus("idle")}><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <aside className="w-44 shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Panel */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-7">

          {/* ── SEO ─────────────────────────────────────────── */}
          {tab === "seo" && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-lg mb-1">SEO &amp; Meta</h2>

              <Field label="Default Page Title" hint="Used on the homepage when no page-level title is set">
                <input type="text" value={seo.defaultTitle} onChange={e => setSeo(p => ({ ...p, defaultTitle: e.target.value }))} className={inp} />
              </Field>

              <Field label="Title Template" hint='Use %s as the page title placeholder — e.g. "%s | PedalGo Rentals"'>
                <input type="text" value={seo.titleTemplate} onChange={e => setSeo(p => ({ ...p, titleTemplate: e.target.value }))} className={`${inp} font-mono`} />
              </Field>

              <Field label="Default Meta Description" hint="Used when a page has no custom description (max 160 chars recommended)">
                <textarea rows={3} value={seo.defaultDescription} onChange={e => setSeo(p => ({ ...p, defaultDescription: e.target.value }))} className={ta} />
              </Field>

              <Field label="Keywords" hint="Comma-separated keywords">
                <input type="text" value={seo.keywords} onChange={e => setSeo(p => ({ ...p, keywords: e.target.value }))} className={inp} />
              </Field>

              <Field label="Default OG / Social Image URL" hint="Shown when pages are shared on social media. Use an absolute URL.">
                <input type="url" value={seo.ogImage} onChange={e => setSeo(p => ({ ...p, ogImage: e.target.value }))} placeholder="https://…" className={inp} />
              </Field>

              <Field label="Canonical Base URL" hint="Your production domain — e.g. https://pedalgo.com">
                <input type="url" value={seo.canonicalUrl} onChange={e => setSeo(p => ({ ...p, canonicalUrl: e.target.value }))} placeholder="https://pedalgo.com" className={inp} />
              </Field>

              <Field label="Google Site Verification" hint="From Google Search Console — paste the content value only">
                <input type="text" value={seo.googleVerification} onChange={e => setSeo(p => ({ ...p, googleVerification: e.target.value }))} className={`${inp} font-mono`} />
              </Field>

              <div className="bg-gray-50 rounded-xl p-4 space-y-0">
                <p className={`${lbl} mb-3`}>Robots</p>
                <Toggle
                  value={seo.robotsIndex} onChange={v => setSeo(p => ({ ...p, robotsIndex: v }))}
                  label="Allow search engines to index the site"
                  desc="Uncheck to add noindex to all pages (useful during development)"
                />
                <Toggle
                  value={seo.robotsFollow} onChange={v => setSeo(p => ({ ...p, robotsFollow: v }))}
                  label="Allow search engines to follow links"
                  desc="Uncheck to add nofollow globally"
                />
              </div>
            </div>
          )}

          {/* ── HEADER ──────────────────────────────────────── */}
          {tab === "header" && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Header Layout</h2>

              <div className="bg-gray-50 rounded-xl p-4 space-y-0">
                <Toggle
                  value={header.sticky} onChange={v => setHeader(p => ({ ...p, sticky: v }))}
                  label="Sticky header"
                  desc="Header stays fixed at the top when scrolling"
                />
                <Toggle
                  value={header.showCta} onChange={v => setHeader(p => ({ ...p, showCta: v }))}
                  label="Show CTA button for guests"
                  desc="Displays an action button next to Sign In for logged-out visitors"
                />
              </div>

              {header.showCta && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="CTA Button Label">
                    <input type="text" value={header.ctaLabel} onChange={e => setHeader(p => ({ ...p, ctaLabel: e.target.value }))} className={inp} placeholder="Book Now" />
                  </Field>
                  <Field label="CTA Button URL">
                    <input type="text" value={header.ctaHref} onChange={e => setHeader(p => ({ ...p, ctaHref: e.target.value }))} className={`${inp} font-mono`} placeholder="/bikes" />
                  </Field>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <strong>Note:</strong> Navigation links are managed in{" "}
                <a href="/admin/menus" className="underline font-medium">Menus → Header</a> menu.
              </div>
            </div>
          )}

          {/* ── FOOTER ──────────────────────────────────────── */}
          {tab === "footer" && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Footer Layout</h2>

              <Field label="Copyright Text" hint='Leave blank to use the default "© 2025 PedalGo Rentals. All rights reserved."'>
                <input type="text" value={footer.copyrightText} onChange={e => setFooter(p => ({ ...p, copyrightText: e.target.value }))} className={inp} placeholder="© 2025 PedalGo Rentals. All rights reserved." />
              </Field>

              <div className="border-t border-gray-100 pt-5">
                <p className={`${lbl} mb-3`}>Contact Info</p>
                <div className="space-y-4">
                  <Field label="Email">
                    <input type="email" value={footer.email} onChange={e => setFooter(p => ({ ...p, email: e.target.value }))} className={inp} placeholder="hello@pedalgo.com" />
                  </Field>
                  <Field label="Phone">
                    <input type="text" value={footer.phone} onChange={e => setFooter(p => ({ ...p, phone: e.target.value }))} className={inp} placeholder="+84 28 1234 5678" />
                  </Field>
                  <Field label="Address">
                    <input type="text" value={footer.address} onChange={e => setFooter(p => ({ ...p, address: e.target.value }))} className={inp} placeholder="District 1, Ho Chi Minh City" />
                  </Field>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <strong>Note:</strong> Footer link columns are managed in{" "}
                <a href="/admin/menus" className="underline font-medium">Menus → footer-explore / footer-company / footer-account</a>.
              </div>
            </div>
          )}

          {/* ── CHAT ────────────────────────────────────────── */}
          {tab === "chat" && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Chat Button</h2>

              <div className="bg-gray-50 rounded-xl p-4">
                <Toggle
                  value={chat.enabled} onChange={v => setChat(p => ({ ...p, enabled: v }))}
                  label="Enable chat button"
                  desc="Shows a floating button in the corner of every page"
                />
              </div>

              {chat.enabled && (
                <>
                  <Field label="Mode">
                    <div className="grid grid-cols-2 gap-3">
                      {(["button", "embed"] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setChat(p => ({ ...p, mode: m }))}
                          className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                            chat.mode === m
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border-2 transition-colors ${chat.mode === m ? "border-emerald-600 bg-emerald-600" : "border-gray-300"}`} />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{m === "button" ? "Link Button" : "Embed Code"}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {m === "button" ? "Floating icon → opens a URL (WhatsApp, Zalo, email…)" : "Inject code from Tawk.to, Crisp, Intercom, etc."}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Field>

                  {chat.mode === "button" && (
                    <>
                      <Field label="Icon Type">
                        <div className="grid grid-cols-4 gap-2">
                          {(["chat", "whatsapp", "zalo", "phone"] as const).map(ic => (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => setChat(p => ({ ...p, icon: ic }))}
                              className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                                chat.icon === ic
                                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {ic === "whatsapp" ? "WhatsApp" : ic === "zalo" ? "Zalo" : ic.charAt(0).toUpperCase() + ic.slice(1)}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <Field label="Link URL" hint={chat.icon === "whatsapp" ? "e.g. https://wa.me/84123456789" : chat.icon === "zalo" ? "e.g. https://zalo.me/0123456789" : chat.icon === "phone" ? "e.g. tel:+84281234567" : "Any URL to open on click"}>
                        <input type="text" value={chat.href} onChange={e => setChat(p => ({ ...p, href: e.target.value }))} className={`${inp} font-mono`} placeholder={chat.icon === "whatsapp" ? "https://wa.me/84…" : chat.icon === "zalo" ? "https://zalo.me/…" : chat.icon === "phone" ? "tel:+84…" : "https://…"} />
                      </Field>

                      <Field label="Tooltip Label">
                        <input type="text" value={chat.label} onChange={e => setChat(p => ({ ...p, label: e.target.value }))} className={inp} placeholder="Chat with us" />
                      </Field>

                      <Field label="Button Color">
                        <div className="flex items-center gap-2 flex-wrap">
                          {CHAT_COLORS.map(c => (
                            <button
                              key={c.value}
                              type="button"
                              title={c.label}
                              onClick={() => setChat(p => ({ ...p, color: c.value }))}
                              style={{ backgroundColor: c.value }}
                              className={`h-8 w-8 rounded-full transition-all ${chat.color === c.value ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`}
                            />
                          ))}
                          <div className="flex items-center gap-2 ml-2">
                            <input
                              type="color"
                              value={chat.color}
                              onChange={e => setChat(p => ({ ...p, color: e.target.value }))}
                              className="h-8 w-8 rounded-full cursor-pointer border border-gray-200"
                              title="Custom color"
                            />
                            <span className="font-mono text-xs text-gray-400">{chat.color}</span>
                          </div>
                        </div>
                      </Field>

                      <Field label="Position">
                        <div className="grid grid-cols-2 gap-3">
                          {(["bottom-right", "bottom-left"] as const).map(pos => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setChat(p => ({ ...p, position: pos }))}
                              className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                chat.position === pos
                                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {pos === "bottom-right" ? "Bottom Right" : "Bottom Left"}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </>
                  )}

                  {chat.mode === "embed" && (
                    <Field
                      label="Embed Code"
                      hint="Paste the full script snippet from your chat provider. It will be injected on every public page."
                    >
                      <textarea
                        rows={10}
                        value={chat.embedCode}
                        onChange={e => setChat(p => ({ ...p, embedCode: e.target.value }))}
                        className={ta}
                        placeholder={"<!-- Tawk.to / Crisp / Intercom embed code -->\n<script>\n  ...\n</script>"}
                      />
                    </Field>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
