"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { error: string };

function refresh() {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

function refreshPost(slug: string) {
  revalidatePath(`/blog/${slug}`);
  refresh();
}

const PostSchema = z.object({
  title:          z.string().min(2, "Title must be at least 2 characters"),
  slug:           z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  excerpt:        z.string().optional().transform(v => v?.trim() || undefined),
  content:        z.string().optional(),
  imageUrl:       z.string().optional().transform(v => v?.trim() || undefined),
  status:         z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle:       z.string().optional().transform(v => v?.trim() || undefined),
  seoDescription: z.string().optional().transform(v => v?.trim() || undefined),
});

export async function createPost(data: unknown): Promise<Result> {
  const parsed = PostSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const { status, ...rest } = parsed.data;
  try {
    await prisma.post.create({
      data: {
        ...rest,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    refresh();
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("slug")) return { error: "This slug is already in use — choose a different one." };
    return { error: "Failed to create post." };
  }
}

export async function updatePost(postId: string, data: unknown): Promise<Result & { slug?: string }> {
  const parsed = PostSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const { status, ...rest } = parsed.data;

  // Fetch current to know if it was previously published
  const current = await prisma.post.findUnique({ where: { id: postId } });
  if (!current) return { error: "Post not found." };

  const publishedAt =
    status === "PUBLISHED" && !current.publishedAt ? new Date()
    : status === "PUBLISHED"                        ? current.publishedAt
    : null;

  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { ...rest, status, publishedAt },
    });
    refreshPost(post.slug);
    return { success: true, slug: post.slug };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("slug")) return { error: "This slug is already in use — choose a different one." };
    return { error: "Failed to update post." };
  }
}

export async function deletePost(postId: string): Promise<Result> {
  try {
    const post = await prisma.post.delete({ where: { id: postId } });
    refreshPost(post.slug);
    return { success: true };
  } catch {
    return { error: "Failed to delete post." };
  }
}

export async function deleteManyPosts(postIds: string[]): Promise<Result> {
  if (!postIds.length) return { error: "No posts selected." };
  try {
    await prisma.post.deleteMany({ where: { id: { in: postIds } } });
    refresh();
    return { success: true };
  } catch {
    return { error: "Failed to delete posts." };
  }
}

export async function togglePublish(postId: string): Promise<Result> {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found." };
  const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.post.update({
    where: { id: postId },
    data: {
      status: newStatus,
      publishedAt: newStatus === "PUBLISHED" ? (post.publishedAt ?? new Date()) : null,
    },
  });
  refreshPost(post.slug);
  return { success: true };
}
