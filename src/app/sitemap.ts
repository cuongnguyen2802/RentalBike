import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://pedalgo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [bikes, posts] = await Promise.all([
    prisma.bike.findMany({ where: { status: "AVAILABLE" }, select: { id: true, updatedAt: true } }),
    prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const bikeUrls = bikes.map((b) => ({
    url:             `${BASE}/book/${b.id}`,
    lastModified:    b.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  const postUrls = posts.map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  return [
    { url: BASE,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/bikes`,    lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/stations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...bikeUrls,
    ...postUrls,
  ];
}
