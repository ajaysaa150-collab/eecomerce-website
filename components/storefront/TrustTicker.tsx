'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, RotateCcw, Sparkles, Award } from 'lucide-react';

export function TrustTicker() {
  const items = [
    { icon: Truck, title: 'Complimentary Global Express', desc: 'Over $250' },
    { icon: ShieldCheck, title: 'Two-Year Archival Warranty', desc: 'Full manufacturer guarantee' },
    { icon: RotateCcw, title: '30-Day Hassle-Free Returns', desc: 'Prepaid return shipping' },
    { icon: Sparkles, title: 'Artisanal Craftsmanship', desc: 'Hand-finished materials' },
    { icon: Award, title: 'Certified Sustainable', desc: 'Carbon neutral delivery' },
  ];

  return (
    <div className="w-full bg-[#111113] text-[#E8E8E8] border-y border-white/10 py-5 overflow-hidden shadow-inner">
      <div className="flex select-none">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 28 }}
          className="flex gap-14 whitespace-nowrap items-center shrink-0 pr-14"
        >
          {[...items, ...items].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-amber-300 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">{item.desc}</span>
                </div>
                <span className="text-white/20 ml-6">•</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
