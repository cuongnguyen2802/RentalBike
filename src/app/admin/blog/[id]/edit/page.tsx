import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import PostFormPage from "../../PostFormPage";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  return { title: post ? `Edit — ${post.title}` : "Edit Post" };
}

export default async function EditPostPage({ params }: Props) {
  await requireAdmin();

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
