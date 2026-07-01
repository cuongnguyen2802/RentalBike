import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import BlogPostsClient from "./BlogPostsClient";

export const metadata: Metadata = { title: "Blog — Admin" };

export default async function AdminBlogPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

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
