import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import PageBuilder from "../../builder/PageBuilder";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: page ? `Edit "${page.title}" — Admin` : "Edit Page — Admin" };
}

export default async function EditPagePage({ params }: Props) {
  await requireAdmin();

  const page = await prisma.page.findUnique({ where: { id: params.id } });
  if (!page) notFound();

  const pageData = {
    id:             page.id,
    title:          page.title,
    slug:           page.slug,
    content:        page.content,
    excerpt:        page.excerpt,
    imageUrl:       page.imageUrl,
    status:         page.status as string,
    showInNav:      page.showInNav,
    navOrder:       page.navOrder,
    seoTitle:       page.seoTitle,
    seoDescription: page.seoDescription,
    blocks:         page.blocks,
    pageKey:        page.pageKey,
  };

  return <PageBuilder mode="edit" page={pageData} />;
}
