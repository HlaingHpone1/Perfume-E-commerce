"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
  imageUrl: string;
};

const AUTOPLAY_MS = 5000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  const slide = slides[index];

  return (
    <section
      className="relative"
      aria-roledescription="carousel"
      aria-label="Featured fragrances"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="relative min-h-[calc(100svh-4.25rem)]">
        {slides.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "grid min-h-[calc(100svh-4.25rem)] transition-opacity duration-700 ease-out lg:grid-cols-2",
              i === index
                ? "relative z-10 opacity-100"
                : "pointer-events-none absolute inset-0 z-0 opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <div className="relative z-10 flex flex-col justify-center px-6 py-20 lg:px-12 xl:px-16">
              <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-lg">
                <h1 className="font-display text-foreground text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
                  {item.title}
                </h1>
                {item.subtitle ? (
                  <p className="text-muted-foreground mt-6 max-w-md text-base leading-relaxed md:text-lg">
                    {item.subtitle}
                  </p>
                ) : null}
                <div className="mt-10">
                  <Button
                    size="lg"
                    asChild
                    className="rounded-none px-8 text-[0.7rem] tracking-[0.2em] uppercase"
                    tabIndex={i === index ? 0 : -1}
                  >
                    <Link href={item.ctaHref}>{item.ctaLabel}</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative min-h-[48vh] lg:min-h-full">
              <Image
                unoptimized
                src={item.imageUrl}
                alt={item.title}
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="from-background absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent lg:hidden" />
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex items-center justify-between px-6 lg:px-12">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="border-border bg-background/80 text-foreground hover:bg-background inline-flex h-10 w-10 items-center justify-center border transition-colors"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="border-border bg-background/80 text-foreground hover:bg-background inline-flex h-10 w-10 items-center justify-center border transition-colors"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div
            className="pointer-events-auto flex items-center gap-2"
            role="tablist"
            aria-label="Slide indicators"
          >
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-px w-6 transition-colors",
                  i === index
                    ? "bg-foreground"
                    : "bg-foreground/30 hover:bg-foreground/60",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {count}: {slide.title}
      </p>
    </section>
  );
}
