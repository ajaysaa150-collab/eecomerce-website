'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How are ATELIER objects manufactured and authenticated?',
      a: 'Each piece in our catalog is engineered in small limited production batches in collaboration with specialized artisanal studios across Japan, Italy, and Germany. Every object ships with an individually serialized Certificate of Archival Authenticity.',
    },
    {
      q: 'What are your delivery timeframes and global shipping rates?',
      a: 'We offer complimentary expedited DHL express courier shipping on all international and domestic orders over $250. Orders placed prior to 2:00 PM EST dispatch within the same business day.',
    },
    {
      q: 'What is your returns and exchange protocol?',
      a: 'We accept returns within 30 days of confirmed delivery. Items must remain unblemished in original archival packaging with all serialized accessories intact. Return shipping is complimentary.',
    },
    {
      q: 'How does the 2-Year Archival Warranty operate?',
      a: 'Our products carry a full two-year warranty covering material flaws, mechanical failures, and caliber irregularities. We provide complimentary repair or replacement with expedited turnaround.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 w-full">
      <div className="text-center mb-12 space-y-3">
        <span className="text-[11px] uppercase tracking-label font-bold text-secondary">
          Inquiries
        </span>
        <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          Common queries regarding our design standards, shipping protocols, and guarantees.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="luxury-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between font-serif-heading text-lg font-semibold"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-secondary transition-transform duration-200 shrink-0 ml-4 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 pb-6 text-xs sm:text-sm text-secondary leading-relaxed border-t border-black/5 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
