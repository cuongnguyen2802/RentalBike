import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { Block } from "@/app/admin/pages/builder/types";
import ContactPageStatic from "./ContactPageStatic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { pageKey: "contact" }, select: { seoTitle: true, seoDescription: true, excerpt: true } });
  return {
    title:       page?.seoTitle       ?? "Contact — PedalGo Rentals",
    description: page?.seoDescription ?? page?.excerpt ?? "Get in touch with PedalGo. We reply within a few hours.",
  };
}

export default async function ContactPage() {
  const dbPage = await prisma.page.findUnique({ where: { pageKey: "contact" }, select: { blocks: true } });
  const blocks = Array.isArray(dbPage?.blocks) ? (dbPage!.blocks as unknown as Block[]) : null;

  if (blocks && blocks.length > 0) {
    return <div className="min-h-screen bg-white"><BlockRenderer blocks={blocks} /></div>;
  }

  return <ContactPageStatic />;
}
