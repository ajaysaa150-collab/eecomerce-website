'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '@/types';
import { Button } from '@/components/ui/Button';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentIdx];
  const words = activeSlide.heading.split(' ');

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[85vh] min-h-[580px] max-h-[820px] bg-black overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={activeSlide.image_url}
            alt={activeSlide.heading}
            fill
            priority
            className="object-cover object-center brightness-[0.78]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-20 h-full max-w-container mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-end pb-16 sm:pb-24">
        <div className="max-w-2xl">
          {/* Luxury Archival Badge */}
          <motion.div
            key={`${activeSlide.id}-badge`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-bold mb-4 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Private Atelier Collection</span>
          </motion.div>

          {/* Animated Word-by-Word Headline */}
          <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.08] mb-4 sm:mb-5">
            {words.map((word, i) => (
              <motion.span
                key={`${activeSlide.id}-word-${i}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subheading */}
          <motion.p
            key={`${activeSlide.id}-sub`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-base sm:text-lg text-white/80 font-light leading-relaxed mb-8 max-w-lg"
          >
            {activeSlide.subheading}
          </motion.p>

          {/* CTA Button with Shimmer Sweep */}
          <motion.div
            key={`${activeSlide.id}-btn`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href={activeSlide.cta_link}>
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-black hover:bg-neutral-100 shadow-floating"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {activeSlide.cta_text}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Slide Indicators / Progress Bars */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/15">
          <div className="flex items-center gap-3">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIdx(idx)}
                className="group py-2 cursor-pointer flex flex-col gap-1"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div className="w-12 sm:w-16 h-1 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      idx === currentIdx ? 'w-full bg-white' : 'w-0 group-hover:w-1/2 group-hover:bg-white/50'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Arrow navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIdx((prev) => (prev + 1) % slides.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
