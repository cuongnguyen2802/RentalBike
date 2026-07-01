"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1920&q=90",
    tag: "Mountain & Trail",
    headline: ["Conquer", "Every Trail."],
    sub: "Built for adventure. Our mountain bikes tackle every terrain Vietnam has to offer.",
    cta: "Mountain Bikes",
    link: "/bikes?type=MOUNTAIN",
    accent: "from-orange-600/80 to-transparent",
    dot: "bg-orange-400",
  },
  {
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1920&q=90",
    tag: "City Cruiser",
    headline: ["Explore Vietnam", "Instantly."],
    sub: "Book in seconds, ride in minutes. Real-time availability means your bike is always ready.",
    cta: "City Bikes",
    link: "/bikes?type=CITY",
    accent: "from-sky-700/80 to-transparent",
    dot: "bg-sky-400",
  },
  {
    image: "https://images.unsplash.com/photo-1619118606863-d26a3e3fcad6?auto=format&fit=crop&w=1920&q=90",
    tag: "Electric Bikes",
    headline: ["Go Further,", "Faster."],
    sub: "Our e-bike fleet makes longer routes effortless. Zero effort, pure freedom.",
    cta: "Electric Bikes",
    link: "/bikes?type=ELECTRIC",
    accent: "from-emerald-700/80 to-transparent",
    dot: "bg-emerald-400",
  },
  {
    image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1920&q=90",
    tag: "Road Cycling",
    headline: ["The Open Road", "Awaits."],
    sub: "Feel the wind. Our road bikes are perfect for coastal routes and long-distance rides.",
    cta: "Road Bikes",
    link: "/bikes?type=ROAD",
    accent: "from-violet-800/80 to-transparent",
    dot: "bg-violet-400",
  },
];

export default function HeroSlider({ totalAvailable }: { totalAvailable: number }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [paused, setPaused]   = useState(false);

  const goTo = useCallback((idx: number) => {
    setPrev(current);
    setCurrent(idx);
  }, [current]);

  const goNext = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(goNext, 5500);
    return () => clearInterval(id);
  }, [paused, goNext]);

  // Clear "prev" after transition completes
  useEffect(() => {
    if (prev === null) return;
    const id = setTimeout(() => setPrev(null), 1000);
    return () => clearTimeout(id);
  }, [prev]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "calc(100vh - 64px)", minHeight: 560 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background images ── */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            i === current ? "opacity-100 z-10" : i === prev ? "opacity-0 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={s.image}
            alt={s.tag}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Left-heavy dark gradient for text legibility */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.accent} via-black/30 to-black/10`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>
      ))}

      {/* ── Content ── */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium text-white mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            {totalAvailable} bikes available right now
          </div>

          {/* Tag */}
          <p
            key={`tag-${current}`}
            className="text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-3 animate-[fadeSlideUp_0.6s_ease_both]"
          >
            {slide.tag}
          </p>

          {/* Headline */}
          <h1
            key={`h1-${current}`}
            className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-5 animate-[fadeSlideUp_0.6s_0.1s_ease_both]"
            style={{ animationFillMode: "both" }}
          >
            {slide.headline[0]}
            <br />
            <span className="text-white/80">{slide.headline[1]}</span>
          </h1>

          {/* Sub */}
          <p
            key={`sub-${current}`}
            className="text-white/75 text-lg md:text-xl leading-relaxed mb-8 max-w-lg animate-[fadeSlideUp_0.6s_0.2s_ease_both]"
            style={{ animationFillMode: "both" }}
          >
            {slide.sub}
          </p>

          {/* CTAs */}
          <div
            key={`cta-${current}`}
            className="flex flex-col sm:flex-row gap-3 animate-[fadeSlideUp_0.6s_0.3s_ease_both]"
            style={{ animationFillMode: "both" }}
          >
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-white/90 font-bold text-base shadow-xl"
              asChild
            >
              <Link href={slide.link}>
                {slide.cta} <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm font-semibold"
              asChild
            >
              <Link href="#available-bikes">Browse All Bikes</Link>
            </Button>
          </div>

          {/* Rating strip */}
          <div className="flex items-center gap-5 mt-8 text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-white/80 font-semibold">4.9</span>
              <span>· 500+ rentals</span>
            </div>
            <span>·</span>
            <span>{totalAvailable} bikes available</span>
            <span>·</span>
            <span>3 stations</span>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-500 ${
              i === current
                ? `w-7 h-2.5 ${s.dot}`
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-9 right-8 z-20 text-white/50 text-sm font-mono tabular-nums">
        {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </section>
  );
}
