import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bike, Heart, MapPin, Shield, Users, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { Block } from "@/app/admin/pages/builder/types";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { pageKey: "about" }, select: { seoTitle: true, seoDescription: true, excerpt: true } });
  return {
    title:       page?.seoTitle       ?? "About Us — PedalGo Rentals",
    description: page?.seoDescription ?? page?.excerpt ?? "PedalGo is Ho Chi Minh City's premier bike rental service.",
  };
}

const staticStats  = [{ value: "12+", label: "Bikes in Fleet" }, { value: "3", label: "Rental Stations" }, { value: "500+", label: "Happy Riders" }, { value: "4.8★", label: "Average Rating" }];
const staticValues = [
  { icon: Bike,   title: "Quality Bikes",         description: "Every bike in our fleet is inspected before each rental — clean, safe, and ready to ride." },
  { icon: Zap,    title: "Instant Booking",        description: "Real-time availability means no phone calls, no waiting. Book your bike in under 2 minutes." },
  { icon: MapPin, title: "Convenient Locations",   description: "Stations across District 1, District 3, and Thu Duc — right where you need them." },
  { icon: Shield, title: "Safe & Reliable",        description: "Helmets at every station, insurance included, and a support line available 7 days a week." },
  { icon: Heart,  title: "Local & Sustainable",    description: "We're a local Saigon business. Every ride reduces traffic congestion and carbon emissions." },
  { icon: Users,  title: "Community First",        description: "From solo travellers to office commuters, we build infrastructure for everyday riders." },
];
const staticTeam   = [
  { name: "Minh Tran",    role: "Co-founder & CEO",          bio: "Former urban planner who grew tired of Saigon traffic.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
  { name: "Linh Nguyen",  role: "Co-founder & Operations",   bio: "Logistics obsessive. Makes sure every bike is perfect before it leaves.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
  { name: "David Park",   role: "Head of Experience",        bio: "Moved from Seoul, brought a love of cycling culture with him.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" },
];

export default async function AboutPage() {
  const dbPage = await prisma.page.findUnique({ where: { pageKey: "about" }, select: { blocks: true } });
  const blocks = Array.isArray(dbPage?.blocks) ? (dbPage!.blocks as unknown as Block[]) : null;

  if (blocks && blocks.length > 0) {
    return <div className="min-h-screen bg-white"><BlockRenderer blocks={blocks} /></div>;
  }

  return (
    <div>
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80"
            alt="Cycling in Ho Chi Minh City" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-24 max-w-4xl">
          <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            Saigon moves faster<br /><span className="text-emerald-400">on two wheels.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            PedalGo was born from a simple frustration — getting around Ho Chi Minh City shouldn&apos;t require
            a motorbike, a grab, or an hour in traffic. We built the rental infrastructure that makes cycling the easiest option.
          </p>
        </div>
      </section>

      <section className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {staticStats.map(s => (
              <div key={s.label}>
                <p className="text-4xl font-black mb-1">{s.value}</p>
                <p className="text-emerald-200 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-4">Our Mission</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-snug">
            Make cycling the default choice<br />for city travel in Vietnam.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            We started with three stations and twelve bikes. Today we serve hundreds of riders a month —
            tourists, locals, coffee-shop hoppers. Every booking is a small vote for a less congested Saigon.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What we stand for</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {staticValues.map(v => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-emerald-100 hover:shadow-sm transition-all">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <v.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {staticTeam.map(member => (
              <div key={member.name} className="text-center">
                <div className="relative h-32 w-32 rounded-2xl overflow-hidden mx-auto mb-4 bg-gray-100">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-emerald-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-emerald-700 text-white text-center">
        <div className="container mx-auto px-4">
          <Bike className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Come ride with us</h2>
          <p className="text-emerald-200 mb-8 max-w-md mx-auto">
            Book a bike online in 2 minutes. Pick it up at any of our stations. Explore Saigon the way it was meant to be seen.
          </p>
          <Link href="/bikes" className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-3 rounded-xl transition-colors">
            Browse Bikes <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
