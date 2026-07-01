import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://pedalgo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  ["/admin/", "/account/", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
