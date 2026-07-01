import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { Block } from "@/app/admin/pages/builder/types";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return pages.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) return { title: "Page Not Found" };
  const title       = page.seoTitle       ?? `${page.title} — PedalGo`;
  const description = page.seoDescription ?? page.excerpt ?? undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: page.imageUrl ? [{ url: page.imageUrl }] : [] },
    twitter:   { card: "summary_large_image", title, description },
  };
}

export default async function DynamicPage({ params }: Props) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || page.status !== "PUBLISHED") notFound();

  const blocks = Array.isArray(page.blocks) ? (page.blocks as unknown as Block[]) : null;

  if (blocks && blocks.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        <BlockRenderer blocks={blocks} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className={`relative ${page.imageUrl ? "bg-slate-900 text-white" : "bg-gray-50 border-b border-gray-100"}`}>
        {page.imageUrl && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <Image src={page.imageUrl} alt={page.title} fill className="object-cover opacity-30" priority />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />
          </>
        )}
        <div className="relative container mx-auto px-4 py-20 max-w-3xl">
          <Link href="/"
            className={`inline-flex items-center gap-1.5 text-sm mb-8 transition-colors ${page.imageUrl ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className={`text-4xl md:text-5xl font-black leading-tight mb-4 ${page.imageUrl ? "text-white" : "text-gray-900"}`}>
            {page.title}
          </h1>
          {page.excerpt && (
            <p className={`text-lg leading-relaxed max-w-2xl ${page.imageUrl ? "text-white/70" : "text-gray-500"}`}>
              {page.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-14 max-w-3xl">
        {page.content ? (
          <div className="rich-editor-content prose prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <p className="text-gray-400 italic text-center py-12">No content yet.</p>
        )}
        <div className="mt-16 rounded-2xl bg-emerald-50 border border-emerald-100 p-8 text-center">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Ready to ride?</p>
          <h3 className="text-2xl font-black text-gray-900 mb-3">Explore Vietnam by bike</h3>
          <p className="text-gray-500 mb-6">Book a bike online in 2 minutes. Real-time availability, instant confirmation.</p>
          <Link href="/bikes" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Browse Bikes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
