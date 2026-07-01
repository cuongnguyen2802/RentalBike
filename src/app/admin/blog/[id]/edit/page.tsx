import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import PostFormPage from "../../PostFormPage";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  return { title: post ? `Edit — ${post.title}` : "Edit Post" };
}

export default async function EditPostPage({ params }: Props) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser || dbUser.role === "CUSTOMER") redirect("/");
  }

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  const postData = {
    id:             post.id,
    title:          post.title,
    slug:           post.slug,
    excerpt:        post.excerpt,
    content:        post.content,
    imageUrl:       post.imageUrl,
    status:         post.status,
    seoTitle:       post.seoTitle,
    seoDescription: post.seoDescription,
  };

  return (
    <div className="p-8">
      <PostFormPage mode="edit" post={postData} />
    </div>
  );
}
