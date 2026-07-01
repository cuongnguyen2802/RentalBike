import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import ContactFormClient from "./ContactFormClient";
import type {
  Block, HeroData, RichTextData, ImageData, FeaturesData, StatsData,
  CTAData, TeamData, FAQData, ContactFormData, DividerData, SpacerData,
} from "@/app/admin/pages/builder/types";

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map(block => (
        <BlockSwitch key={block.id} block={block} />
      ))}
    </>
  );
}

function BlockSwitch({ block }: { block: Block }) {
  const d = block.data;
  switch (block.type) {
    case "hero":         return <HeroBlock         data={d as HeroData} />;
    case "rich_text":    return <RichTextBlock      data={d as RichTextData} />;
    case "image":        return <ImageBlock         data={d as ImageData} />;
    case "features":     return <FeaturesBlock      data={d as FeaturesData} />;
    case "stats":        return <StatsBlock         data={d as StatsData} />;
    case "cta":          return <CTABlock           data={d as CTAData} />;
    case "team":         return <TeamBlock          data={d as TeamData} />;
    case "faq":          return <FAQBlock           data={d as FAQData} />;
    case "contact_form": return <ContactFormClient  data={d as ContactFormData} />;
    case "divider":      return <DividerBlock       data={d as DividerData} />;
    case "spacer":       return <SpacerBlock        data={d as SpacerData} />;
    default:             return null;
  }
}

function HeroBlock({ data }: { data: HeroData }) {
  const heightClass =
    data.height === "full"   ? "min-h-screen" :
    data.height === "medium" ? "min-h-[400px]" : "min-h-[600px]";
  const alignClass = data.textAlign === "left" ? "text-left" : "text-center";
  const btnAlignClass = data.textAlign === "left" ? "" : "justify-center";

  return (
    <section className={`relative bg-slate-900 text-white flex items-center ${heightClass}`}>
      {data.backgroundImage && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            <Image src={data.backgroundImage} alt="" fill className="object-cover" priority />
          </div>
          <div
            className="absolute inset-0 bg-slate-900"
            style={{ opacity: (data.overlayOpacity ?? 50) / 100 }}
          />
        </>
      )}
      <div className={`relative container mx-auto px-4 max-w-5xl py-24 ${alignClass}`}>
        {data.title && (
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">{data.title}</h1>
        )}
        {data.subtitle && (
          <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 mx-auto">{data.subtitle}</p>
        )}
        {(data.ctaLabel || data.ctaSecondaryLabel) && (
          <div className={`flex gap-4 flex-wrap ${btnAlignClass}`}>
            {data.ctaLabel && (
              <Link href={data.ctaHref || "#"} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-colors">
                {data.ctaLabel} <ArrowRight className="h-5 w-5" />
              </Link>
            )}
            {data.ctaSecondaryLabel && (
              <Link href={data.ctaSecondaryHref || "#"} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors border border-white/20">
                {data.ctaSecondaryLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RichTextBlock({ data }: { data: RichTextData }) {
  return (
    <section className="py-14">
      <div className="container mx-auto px-4 max-w-3xl">
        <div
          className="rich-editor-content prose prose-emerald max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content || "" }}
        />
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: ImageData }) {
  if (!data.src) return null;
  const widthClass =
    data.width === "full"  ? "max-w-full px-0" :
    data.width === "small" ? "max-w-xl mx-auto" : "max-w-4xl mx-auto";
  return (
    <section className="py-10">
      <div className={`container px-4 ${widthClass}`}>
        <figure>
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <Image src={data.src} alt={data.alt || ""} fill className="object-cover" />
          </div>
          {data.caption && <figcaption className="text-sm text-gray-500 text-center mt-3">{data.caption}</figcaption>}
        </figure>
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: FeaturesData }) {
  const cols =
    data.columns === 2 ? "md:grid-cols-2" :
    data.columns === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {(data.title || data.subtitle) && (
          <div className="text-center mb-12">
            {data.title    && <h2 className="text-3xl font-bold text-gray-900 mb-3">{data.title}</h2>}
            {data.subtitle && <p className="text-gray-500 max-w-md mx-auto">{data.subtitle}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 ${cols} gap-6 max-w-5xl mx-auto`}>
          {(data.items || []).map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-emerald-100 hover:shadow-sm transition-all">
              {item.icon        && <div className="text-3xl mb-4">{item.icon}</div>}
              {item.title       && <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>}
              {item.description && <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBlock({ data }: { data: StatsData }) {
  const bg  = data.theme === "dark" ? "bg-slate-900" : "bg-emerald-600";
  const sub = data.theme === "dark" ? "text-slate-400" : "text-emerald-200";
  return (
    <section className={`py-12 ${bg} text-white`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {(data.items || []).map((item, i) => (
            <div key={i}>
              <p className="text-4xl font-black mb-1">{item.value}</p>
              <p className={`text-sm font-medium ${sub}`}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABlock({ data }: { data: CTAData }) {
  const bg =
    data.theme === "dark"    ? "bg-slate-900 text-white" :
    data.theme === "emerald" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-gray-900";
  const sub = data.theme ? "text-emerald-200" : "text-gray-500";
  const btn =
    data.theme === "dark" || data.theme === "emerald"
      ? "bg-white text-emerald-700 hover:bg-emerald-50"
      : "bg-emerald-600 hover:bg-emerald-500 text-white";
  return (
    <section className={`py-20 text-center ${bg}`}>
      <div className="container mx-auto px-4">
        {data.title    && <h2 className="text-3xl font-bold mb-4">{data.title}</h2>}
        {data.subtitle && <p className={`mb-8 max-w-md mx-auto ${sub}`}>{data.subtitle}</p>}
        {data.buttonLabel && (
          <Link href={data.buttonHref || "#"} className={`inline-flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-colors ${btn}`}>
            {data.buttonLabel} <ArrowRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </section>
  );
}

function TeamBlock({ data }: { data: TeamData }) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{data.title}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {(data.members || []).map((member, i) => (
            <div key={i} className="text-center">
              {member.image ? (
                <div className="relative h-32 w-32 rounded-2xl overflow-hidden mx-auto mb-4 bg-gray-100">
                  <Image src={member.image} alt={member.name || ""} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-2xl bg-gray-100 mx-auto mb-4 flex items-center justify-center text-3xl">👤</div>
              )}
              {member.name && <h3 className="font-bold text-gray-900">{member.name}</h3>}
              {member.role && <p className="text-sm text-emerald-600 font-medium mb-2">{member.role}</p>}
              {member.bio  && <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQBlock({ data }: { data: FAQData }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        {data.title && <h2 className="text-2xl font-bold text-gray-900 mb-8">{data.title}</h2>}
        <div className="space-y-3">
          {(data.items || []).map((item, i) => (
            <details key={i} className="bg-white rounded-xl border border-gray-100 group">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 font-semibold text-gray-900 cursor-pointer list-none select-none hover:text-emerald-600 transition-colors">
                {item.question}
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function DividerBlock({ data }: { data: DividerData }) {
  const sp = data.spacing === "sm" ? "py-4" : data.spacing === "lg" ? "py-12" : "py-8";
  return (
    <div className={`container mx-auto px-4 max-w-5xl ${sp}`}>
      {data.style === "dots" ? (
        <div className="flex justify-center gap-2">
          {[0,1,2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-300" />)}
        </div>
      ) : data.style === "gradient" ? (
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      ) : (
        <hr className="border-gray-200" />
      )}
    </div>
  );
}

function SpacerBlock({ data }: { data: SpacerData }) {
  const h =
    data.height === "sm" ? "h-8" :
    data.height === "lg" ? "h-24" :
    data.height === "xl" ? "h-40" : "h-16";
  return <div className={h} />;
}
