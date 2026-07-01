import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Cycling tips, travel guides, and route recommendations in Vietnam from the PedalGo team.",
  openGraph: {
    title:       "Blog — PedalGo Rentals",
    description: "Cycling tips, travel guides, and route recommendations in Vietnam.",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where:   { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">PedalGo Blog</p>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Cycling in Vietnam</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Routes, tips, and stories from our riders and team.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🚲</p>
          <p className="text-gray-500 text-lg">No posts yet — check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={`group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${i === 0 ? "md:col-span-2 lg:col-span-3 md:flex-row" : ""}`}
            >
              {/* Image */}
              <div className={`relative bg-gray-100 overflow-hidden ${i === 0 ? "md:w-1/2 aspect-[4/3] md:aspect-auto" : "aspect-[16/9]"}`}>
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={post.imageUrl.startsWith("/uploads/")}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <span className="text-5xl">🚲</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`flex flex-col flex-1 p-6 ${i === 0 ? "md:justify-center md:p-10" : ""}`}>
                {i === 0 && (
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Featured</span>
                )}
                <h2 className={`font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-snug ${i === 0 ? "text-2xl md:text-3xl mb-3" : "text-lg mb-2"}`}>
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-4">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt?.toISOString() ?? post.createdAt.toISOString())}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
