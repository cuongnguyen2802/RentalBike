import { prisma } from "./prisma";

export interface SeoSettings {
  defaultTitle:       string;
  titleTemplate:      string;
  defaultDescription: string;
  keywords:           string;
  ogImage:            string;
  googleVerification: string;
  canonicalUrl:       string;
  robotsIndex:        boolean;
  robotsFollow:       boolean;
}

export interface HeaderSettings {
  sticky:   boolean;
  showCta:  boolean;
  ctaLabel: string;
  ctaHref:  string;
}

export interface FooterSettings {
  copyrightText: string;
  email:         string;
  phone:         string;
  address:       string;
}

export interface ChatSettings {
  enabled:   boolean;
  mode:      "button" | "embed";
  icon:      "chat" | "whatsapp" | "zalo" | "phone";
  href:      string;
  label:     string;
  color:     string;
  position:  "bottom-right" | "bottom-left";
  embedCode: string;
}

export const DEFAULT_SEO: SeoSettings = {
  defaultTitle:       "PedalGo Rentals — Bike Rental in Vietnam",
  titleTemplate:      "%s | PedalGo Rentals",
  defaultDescription: "Rent quality bikes in Vietnam with real-time availability. City bikes, mountain bikes, e-bikes and more. Book online instantly.",
  keywords:           "bike rental, bicycle rental, Vietnam, Ho Chi Minh City, xe đạp thuê",
  ogImage:            "",
  googleVerification: "",
  canonicalUrl:       "https://pedalgo.com",
  robotsIndex:        true,
  robotsFollow:       true,
};

export const DEFAULT_HEADER: HeaderSettings = {
  sticky:   true,
  showCta:  true,
  ctaLabel: "Book Now",
  ctaHref:  "/bikes",
};

export const DEFAULT_FOOTER: FooterSettings = {
  copyrightText: "",
  email:         "hello@pedalgo.com",
  phone:         "+84 28 1234 5678",
  address:       "District 1, District 3 & Thu Duc — Ho Chi Minh City",
};

export const DEFAULT_CHAT: ChatSettings = {
  enabled:   false,
  mode:      "button",
  icon:      "chat",
  href:      "",
  label:     "Chat with us",
  color:     "#10b981",
  position:  "bottom-right",
  embedCode: "",
};

export type SettingKey = "seo" | "header" | "footer" | "chat";

export async function getSettings<T>(key: SettingKey, defaults: T): Promise<T> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row?.value || typeof row.value !== "object" || Array.isArray(row.value)) return defaults;
    return { ...defaults, ...(row.value as T) };
  } catch {
    return defaults;
  }
}

export async function getAllSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map  = Object.fromEntries(rows.map(r => [r.key, r.value as Record<string, unknown>]));

  return {
    seo:    { ...DEFAULT_SEO,    ...(map.seo    ?? {}) } as SeoSettings,
    header: { ...DEFAULT_HEADER, ...(map.header ?? {}) } as HeaderSettings,
    footer: { ...DEFAULT_FOOTER, ...(map.footer ?? {}) } as FooterSettings,
    chat:   { ...DEFAULT_CHAT,   ...(map.chat   ?? {}) } as ChatSettings,
  };
}
