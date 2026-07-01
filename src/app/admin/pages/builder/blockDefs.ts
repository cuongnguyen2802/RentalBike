import type { BlockType, Block } from "./types";

export interface BlockDef {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  defaultData: Record<string, unknown>;
}

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: "hero",
    label: "Hero",
    description: "Full-width hero with image and CTA",
    icon: "🖼️",
    defaultData: {
      title: "Your Headline Here",
      subtitle: "A compelling subtitle that describes your offering",
      backgroundImage: "",
      overlayOpacity: 50,
      height: "large",
      textAlign: "center",
      ctaLabel: "Get Started",
      ctaHref: "/bikes",
      ctaSecondaryLabel: "",
      ctaSecondaryHref: "",
    },
  },
  {
    type: "rich_text",
    label: "Rich Text",
    description: "Formatted HTML content block",
    icon: "📝",
    defaultData: { content: "<p>Start typing your content here...</p>" },
  },
  {
    type: "image",
    label: "Image",
    description: "Single image with optional caption",
    icon: "🌅",
    defaultData: { src: "", alt: "", caption: "", width: "contained" },
  },
  {
    type: "features",
    label: "Features",
    description: "Grid of feature cards with icons",
    icon: "⭐",
    defaultData: {
      title: "Why Choose Us?",
      subtitle: "We offer the best experience in the city",
      columns: 3,
      items: [
        { icon: "🚲", title: "Quality Bikes",    description: "Inspected before every rental — clean, safe, ready to ride." },
        { icon: "⚡", title: "Instant Booking",  description: "Book in under 2 minutes with real-time availability." },
        { icon: "📍", title: "Great Locations",  description: "Stations across the city, right where you need them." },
      ],
    },
  },
  {
    type: "stats",
    label: "Stats",
    description: "Statistics bar with numbers",
    icon: "📊",
    defaultData: {
      theme: "emerald",
      items: [
        { value: "500+",  label: "Happy Riders"    },
        { value: "12+",   label: "Bikes in Fleet"  },
        { value: "3",     label: "Stations"        },
        { value: "4.8★",  label: "Average Rating"  },
      ],
    },
  },
  {
    type: "cta",
    label: "Call to Action",
    description: "CTA section with button",
    icon: "🎯",
    defaultData: {
      title: "Ready to explore the city?",
      subtitle: "Book a bike online in 2 minutes. Real-time availability, instant confirmation.",
      buttonLabel: "Browse Bikes",
      buttonHref: "/bikes",
      theme: "emerald",
    },
  },
  {
    type: "team",
    label: "Team",
    description: "Team members grid with photos",
    icon: "👥",
    defaultData: {
      title: "Meet the Team",
      members: [
        { name: "Team Member", role: "Position", image: "", bio: "Short bio goes here." },
      ],
    },
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Frequently asked questions accordion",
    icon: "❓",
    defaultData: {
      title: "Frequently Asked Questions",
      items: [
        { question: "How do I book a bike?",             answer: "Browse our fleet, pick your dates, and confirm in 2 minutes." },
        { question: "Can I cancel my booking?",          answer: "Yes — full refund if cancelled more than 24 hours before pickup." },
      ],
    },
  },
  {
    type: "contact_form",
    label: "Contact Form",
    description: "Contact form with info columns",
    icon: "📬",
    defaultData: {
      title: "Get In Touch",
      subtitle: "We'd love to hear from you. We reply within a few hours.",
      email: "hello@pedalgo.com",
      phone: "+84 28 1234 5678",
      address: "District 1, Ho Chi Minh City",
    },
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal section divider",
    icon: "➖",
    defaultData: { style: "line", spacing: "md" },
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Blank vertical space",
    icon: "⬜",
    defaultData: { height: "md" },
  },
];

export function createBlock(type: BlockType): Block {
  const def = BLOCK_DEFS.find(d => d.type === type)!;
  return {
    id: crypto.randomUUID(),
    type,
    data: structuredClone(def.defaultData),
  };
}
