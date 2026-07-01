import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getSettings, DEFAULT_HEADER } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Bike } from "lucide-react";
import NavbarClient from "./NavbarClient";

const FALLBACK_NAV = [
  { label: "Browse Bikes",  url: "/bikes"        },
  { label: "Stations",      url: "/stations"      },
  { label: "Pricing",       url: "/pricing"       },
  { label: "How It Works",  url: "/how-it-works"  },
  { label: "Blog",          url: "/blog"          },
  { label: "About",         url: "/about"         },
  { label: "Contact",       url: "/contact"       },
];

export default async function Navbar() {
  const [supabase, navMenu, headerCfg] = await Promise.all([
    createClient(),
    prisma.menu.findUnique({
      where:   { slug: "header" },
      include: { items: { orderBy: { order: "asc" } } },
    }).catch(() => null),
    getSettings("header", DEFAULT_HEADER),
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  const navLinks = (navMenu && navMenu.items.length > 0)
    ? navMenu.items.map(i => ({ label: i.label, url: i.url }))
    : FALLBACK_NAV;

  const stickyClass = headerCfg.sticky
    ? "sticky top-0 z-50"
    : "relative z-50";

  return (
    <header className={`${stickyClass} w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700">
          <Bike className="h-6 w-6" />
          PedalGo Rentals
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          {navLinks.map(link => (
            <Link key={link.url} href={link.url} className="hover:text-emerald-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <NavbarClient user={user} />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              {headerCfg.showCta && (
                <Button size="sm" asChild>
                  <Link href={headerCfg.ctaHref}>{headerCfg.ctaLabel}</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
