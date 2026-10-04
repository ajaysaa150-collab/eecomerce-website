'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-container mx-auto px-4 sm:px-8 lg:px-12 my-14 sm:my-20 w-full">
      <div className="relative overflow-hidden rounded-3xl bg-[#0F0F11] border border-white/15 text-white p-8 sm:p-12 lg:p-16 shadow-floating">
        {/* Ambient atmospheric glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Seasonal Release Privilege
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12] mb-3">
              The Archival Mid-Season Curation.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md">
              Receive a complimentary Horween leather key organizer with any horology or audio selection over ₹3,500 / $150. Use code <span className="font-bold text-white underline decoration-amber-400">WELCOME15</span> for 15% courtesy discount.
            </p>
          </div>

          {/* Countdown + CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3 text-center">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 min-w-[62px] sm:min-w-[70px] border border-white/15 shadow-sm">
                <span className="text-2xl sm:text-3xl font-bold font-serif-heading text-white block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">Hours</span>
              </div>
              <span className="text-xl font-bold text-white/30">:</span>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 min-w-[62px] sm:min-w-[70px] border border-white/15 shadow-sm">
                <span className="text-2xl sm:text-3xl font-bold font-serif-heading text-white block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">Mins</span>
              </div>
              <span className="text-xl font-bold text-white/30">:</span>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 min-w-[62px] sm:min-w-[70px] border border-white/15 shadow-sm">
                <span className="text-2xl sm:text-3xl font-bold font-serif-heading text-amber-300 block">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">Secs</span>
              </div>
            </div>

            <Link href="/products" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto bg-white text-black hover:bg-neutral-100 shadow-floating text-xs font-bold uppercase tracking-wider py-3"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Shop Curations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
