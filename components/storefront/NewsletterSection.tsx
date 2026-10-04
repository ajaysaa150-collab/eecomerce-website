'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { subscribeNewsletter } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  BookOpen, 
  Copy, 
  Check, 
  RotateCcw,
  BellRing
} from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { success, error: toastError } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME15');
    setCopiedCode(true);
    success('Promo Code Copied', 'WELCOME15 copied to clipboard for 15% off.');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toastError('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await subscribeNewsletter(cleanEmail);
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      success('Subscription Confirmed', res.message);
    } else {
      toastError('Submission Failed', 'Please try again later.');
    }
  };

  return (
    <section className="max-w-container mx-auto px-6 sm:px-12 my-20">
      <div className="relative overflow-hidden bg-[#0D0D10] text-white rounded-3xl p-8 sm:p-14 lg:p-16 border border-white/10 shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent pointer-events-none" />

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="submitted-state"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="max-w-3xl mx-auto text-center space-y-6 relative z-10"
            >
              {/* VIP Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span className="tracking-wide">Subscription Confirmed · Private Releases Dispatch</span>
              </div>

              {/* Heading & Subtitle */}
              <div className="space-y-2">
                <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Welcome to the Private Dispatch
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                  Your invitation has been registered for <strong className="text-white font-semibold">{email}</strong>. 
                  You will now receive confidential studio dispatches before any public announcement.
                </p>
              </div>

              {/* 3 Professional Context Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-left">
                <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-subtle flex flex-col justify-between hover:border-amber-400/30 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mb-3 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      Priority Archival Drops
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Exclusive 48-hour advance window to acquire limited production runs before public catalog availability.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-subtle flex flex-col justify-between hover:border-amber-400/30 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mb-3 shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      Curated Studio Journal
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Monthly editorial monographs covering industrial design philosophy, acoustics, and horological movements.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-subtle flex flex-col justify-between hover:border-amber-400/30 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mb-3 shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      Bespoke Concierge Desk
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Direct access to our design studio for custom fabrication inquiries, personalized gifting, and private previews.
                    </p>
                  </div>
                </div>
              </div>

              {/* Welcome Privilege Banner */}
              <div className="p-4 rounded-2xl bg-white/[0.06] border border-amber-400/25 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Welcome Privilege: Enjoy 15% Off</p>
                    <p className="text-[11px] text-neutral-400">Apply code <code className="font-mono font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">WELCOME15</code> at checkout on your first order.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Reset link to subscribe another email */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Subscribe another email address</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10"
            >
              <div className="max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-[10px] uppercase tracking-[0.16em] font-bold text-amber-300 mb-3 shadow-xs">
                  <BellRing className="w-3 h-3 text-amber-400" />
                  <span>The Journal & Privileges</span>
                </div>
                <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
                  Subscribe to Private Releases.
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg">
                  Receive confidential invitations to limited archival editions, private showcase gatherings, and quarterly monographs on material craft. Zero spam, guaranteed privacy.
                </p>
                <div className="flex items-center gap-4 mt-4 text-[11px] text-neutral-400 justify-center md:justify-start">
                  <span className="flex items-center gap-1 text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct Studio Dispatch
                  </span>
                  <span>•</span>
                  <span>Instant Unsubscribe Anytime</span>
                </div>
              </div>

              <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 h-12 px-4 rounded-xl bg-white/[0.08] border border-white/20 text-xs sm:text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:border-amber-400 focus:bg-white/[0.12] transition-colors shadow-xs"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    className="h-12 px-7 bg-amber-400 hover:bg-amber-300 text-black font-bold tracking-wide shadow-md border-0 shrink-0"
                    rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
                  >
                    Join
                  </Button>
                </form>
                <p className="text-[10px] text-neutral-500 mt-2.5 text-center md:text-left">
                  By joining, you agree to receive studio updates and exclusive private release invites.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
