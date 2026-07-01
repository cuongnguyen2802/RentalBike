import Link from "next/link";
import { Bike, Mail, Phone, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings, DEFAULT_FOOTER } from "@/lib/settings";

const FALLBACK_COLS = [
  {
    title: "Explore",
    links: [
      { label: "Browse Bikes",  href: "/bikes"        },
      { label: "Stations",      href: "/stations"      },
      { label: "Pricing",       href: "/pricing"       },
      { label: "How It Works",  href: "/how-it-works"  },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",  href: "/about"   },
      { label: "Blog",      href: "/blog"    },
      { label: "Contact",   href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In",     href: "/login"    },
      { label: "Register",    href: "/register" },
      { label: "My Bookings", href: "/account"  },
    ],
  },
];

const FOOTER_SLUGS: { slug: string; fallbackTitle: string }[] = [
  { slug: "footer-explore",  fallbackTitle: "Explore"  },
  { slug: "footer-company",  fallbackTitle: "Company"  },
  { slug: "footer-account",  fallbackTitle: "Account"  },
];

export default async function Footer() {
  const [footerCfg, menus] = await Promise.all([
    getSettings("footer", DEFAULT_FOOTER),
    prisma.menu.findMany({
      where:   { slug: { in: FOOTER_SLUGS.map(s => s.slug) } },
      include: { items: { orderBy: { order: "asc" } } },
    }).catch(() => []),
  ]);

  const cols = menus.length > 0
    ? FOOTER_SLUGS.map(({ slug, fallbackTitle }) => {
        const menu     = menus.find(m => m.slug === slug);
        const fallback = FALLBACK_COLS.find(c => c.title === fallbackTitle)!;
        if (!menu || menu.items.length === 0) return fallback;
        return { title: menu.name, links: menu.items.map(i => ({ label: i.label, href: i.url })) };
      })
    : FALLBACK_COLS;

  const year      = new Date().getFullYear();
  const copyright = footerCfg.copyrightText || `© ${year} PedalGo Rentals. All rights reserved.`;

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-emerald-400 mb-4">
              <Bike className="h-6 w-6" />
              PedalGo Rentals
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              Ho Chi Minh City&apos;s premier bike rental service. Real-time booking,
              quality bikes, and multiple stations across the city.
            </p>
            <div className="space-y-2.5">
              {footerCfg.email && (
                <a href={`mailto:${footerCfg.email}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                  {footerCfg.email}
                </a>
              )}
              {footerCfg.phone && (
                <a href={`tel:${footerCfg.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  {footerCfg.phone}
                </a>
              )}
              {footerCfg.address && (
                <p className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  {footerCfg.address}
                </p>
              )}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>{copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/about"       className="hover:text-slate-400 transition-colors">About</Link>
            <Link href="/contact"     className="hover:text-slate-400 transition-colors">Contact</Link>
            <Link href="/sitemap.xml" className="hover:text-slate-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
