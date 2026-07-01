export type BlockType =
  | "hero"
  | "rich_text"
  | "image"
  | "features"
  | "stats"
  | "cta"
  | "team"
  | "faq"
  | "contact_form"
  | "divider"
  | "spacer";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface HeroData {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  height?: "full" | "large" | "medium";
  textAlign?: "left" | "center";
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}

export interface RichTextData {
  content?: string;
}

export interface ImageData {
  src?: string;
  alt?: string;
  caption?: string;
  width?: "full" | "contained" | "small";
}

export interface FeatureItem {
  icon?: string;
  title?: string;
  description?: string;
}

export interface FeaturesData {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  items?: FeatureItem[];
}

export interface StatItem {
  value?: string;
  label?: string;
}

export interface StatsData {
  items?: StatItem[];
  theme?: "light" | "dark";
}

export interface CTAData {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  theme?: "light" | "dark" | "emerald";
}

export interface TeamMember {
  name?: string;
  role?: string;
  image?: string;
  bio?: string;
}

export interface TeamData {
  title?: string;
  members?: TeamMember[];
}

export interface FAQItem {
  question?: string;
  answer?: string;
}

export interface FAQData {
  title?: string;
  items?: FAQItem[];
}

export interface ContactFormData {
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface DividerData {
  style?: "line" | "dots" | "gradient";
  spacing?: "sm" | "md" | "lg";
}

export interface SpacerData {
  height?: "sm" | "md" | "lg" | "xl";
}
