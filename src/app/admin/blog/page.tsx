import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import BlogPostsClient from "./BlogPostsClient";

export const metadata: Metadata = { title: "Blog — Admin" };

export default async function AdminBlogPage() {
  await requireAdmin();

  const rawPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  const posts = rawPosts.map(p => ({
    id:          p.id,
    title:       p.title,
    slug:        p.slug,
    status:      p.status,
    excerpt:     p.excerpt,
    imageUrl:    p.imageUrl,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt:   p.createdAt.toISOString(),
  }));

  return (
    <div className="p-8">
      <BlogPostsClient posts={posts} />
    </div>
  );
}
