import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";

interface Props { params: { slug: string } }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
    return posts.map(p => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: "Post Not Found" };
  const title       = post.seoTitle       ?? `${post.title} — PedalGo Blog`;
  const description = post.seoDescription ?? post.excerpt ?? "Read this post on the PedalGo blog.";
  return {
    title,
    description,
    openGraph: {
      title, description, type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });

  if (!post || post.status !== "PUBLISHED") notFound();

  // Related posts (same status, exclude current, latest 3)
  const related = await prisma.post.findMany({
    where:   { status: "PUBLISHED", NOT: { id: post.id } },
    orderBy: { publishedAt: "desc" },
    take:    3,
  });

  const publishDate = post.publishedAt?.toISOString() ?? post.createdAt.toISOString();

  return (
    <article className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-gray-900 text-white">
        {post.imageUrl && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover opacity-40"
                unoptimized={post.imageUrl.startsWith("/uploads/")}
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/30" />
          </>
        )}
        <div className="relative container mx-auto px-4 py-20 max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All Posts
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">PedalGo Blog</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg text-white/70 leading-relaxed mb-6 max-w-2xl">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Calendar className="h-4 w-4" />
            {formatDate(publishDate)}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {post.content ? (
          <div
            className="rich-editor-content prose prose-emerald max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-gray-400 italic">No content yet.</p>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-emerald-50 border border-emerald-100 p-8 text-center">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Ready to ride?</p>
          <h3 className="text-2xl font-black text-gray-900 mb-3">Explore Vietnam by bike</h3>
          <p className="text-gray-500 mb-6">Book a bike online in 2 minutes. Real-time availability, instant confirmation.</p>
          <Link
            href="/bikes"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Bikes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More from the blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[16/9] bg-gray-100">
                    {r.imageUrl ? (
                      <Image src={r.imageUrl} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized={r.imageUrl.startsWith("/uploads/")} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-emerald-50">
                        <span className="text-3xl">🚲</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatDate(r.publishedAt?.toISOString() ?? r.createdAt.toISOString())}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to all posts
          </Link>
        </div>
      </div>
    </article>
  );
}
