"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PageSchema = z.object({
  title:          z.string().min(1, "Title is required").max(200),
  slug:           z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  content:        z.string().optional().transform(v => v?.trim() || undefined),
  excerpt:        z.string().optional().transform(v => v?.trim() || undefined),
  imageUrl:       z.string().optional().transform(v => v?.trim() || undefined),
  showInNav:      z.boolean().optional().default(false),
  navOrder:       z.number().int().optional().default(0),
  seoTitle:       z.string().optional().transform(v => v?.trim() || undefined),
  seoDescription: z.string().optional().transform(v => v?.trim() || undefined),
  blocks:         z.unknown().optional(),
});

type PageResult = { success: true; slug: string; id: string } | { error: string };

function isUniqueError(e: unknown) {
  return e instanceof Error && e.message.includes("Unique constraint");
}

export async function createPage(status: string, data: unknown): Promise<PageResult> {
  const parsed = PageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  try {
    const { blocks, ...rest } = parsed.data;
    const page = await prisma.page.create({
      data: {
        ...rest,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(blocks !== undefined && { blocks: blocks as any }),
      },
    });
    revalidatePath("/admin/pages");
    revalidatePath(`/pages/${page.slug}`);
    return { success: true, slug: page.slug, id: page.id };
  } catch (e) {
    if (isUniqueError(e)) return { error: "A page with this slug already exists." };
    return { error: "Failed to create page." };
  }
}

export async function updatePage(id: string, status: string, data: unknown): Promise<PageResult> {
  const parsed = PageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  try {
    const { blocks, ...rest } = parsed.data;
    const page = await prisma.page.update({
      where: { id },
      data: {
        ...rest,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(blocks !== undefined && { blocks: blocks as any }),
      },
    });
    revalidatePath("/admin/pages");
    revalidatePath(`/pages/${page.slug}`);
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/");
    return { success: true, slug: page.slug, id: page.id };
  } catch (e) {
    if (isUniqueError(e)) return { error: "A page with this slug already exists." };
    return { error: "Failed to update page." };
  }
}

export async function deletePage(id: string): Promise<{ success: true } | { error: string }> {
  try {
    const page = await prisma.page.findUnique({ where: { id }, select: { pageKey: true } });
    if (page?.pageKey) return { error: "System pages cannot be deleted." };
    const deleted = await prisma.page.delete({ where: { id } });
    revalidatePath("/admin/pages");
    revalidatePath(`/pages/${deleted.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to delete page." };
  }
}

export async function deleteManyPages(ids: string[]): Promise<{ success: true; count: number } | { error: string }> {
  if (!ids.length) return { error: "No pages selected." };
  try {
    const system = await prisma.page.findMany({ where: { id: { in: ids }, pageKey: { not: null } } });
    const safeIds = ids.filter(id => !system.find(p => p.id === id));
    if (!safeIds.length) return { error: "Selected pages are system pages and cannot be deleted." };
    const { count } = await prisma.page.deleteMany({ where: { id: { in: safeIds } } });
    revalidatePath("/admin/pages");
    return { success: true, count };
  } catch {
    return { error: "Failed to delete pages." };
  }
}

export async function togglePublishPage(id: string): Promise<{ success: true } | { error: string }> {
  try {
    const page = await prisma.page.findUnique({ where: { id }, select: { status: true, slug: true } });
    if (!page) return { error: "Page not found." };
    const newStatus = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.page.update({ where: { id }, data: { status: newStatus } });
    revalidatePath("/admin/pages");
    revalidatePath(`/pages/${page.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to update status." };
  }
}
