import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ChatWidget from "@/components/shared/ChatWidget";
import { getSettings, DEFAULT_SEO } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSettings("seo", DEFAULT_SEO);

  return {
    metadataBase: new URL(seo.canonicalUrl || (process.env.NEXT_PUBLIC_APP_URL ?? "https://pedalgo.com")),
    title: {
      default:  seo.defaultTitle,
      template: seo.titleTemplate,
    },
    description: seo.defaultDescription,
    keywords:    seo.keywords ? seo.keywords.split(",").map(k => k.trim()) : [],
    openGraph: {
      siteName:    "PedalGo Rentals",
      locale:      "en_US",
      type:        "website",
      title:       seo.defaultTitle,
      description: seo.defaultDescription,
      ...(seo.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
    twitter: {
      card:        "summary_large_image",
      title:       seo.defaultTitle,
      description: seo.defaultDescription,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    verification: seo.googleVerification ? { google: seo.googleVerification } : undefined,
    robots: {
      index:     seo.robotsIndex,
      follow:    seo.robotsFollow,
      googleBot: { index: seo.robotsIndex, follow: seo.robotsFollow, "max-image-preview": "large" },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname    = headersList.get("x-pathname") ?? "";
  const isAdmin     = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        {!isAdmin && <Navbar />}
        <main className="min-h-screen">{children}</main>
        {!isAdmin && <Footer />}
        {!isAdmin && <ChatWidget />}
      </body>
    </html>
  );
}
