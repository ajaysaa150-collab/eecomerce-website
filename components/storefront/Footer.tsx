'use client';

import React from 'react';
import Link from 'next/link';
import { SiteSettings } from '@/types';
import { Instagram, Facebook, Twitter, Youtube, ShieldCheck } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-[#0C0C0E] text-[#EDEDED] border-t border-white/10 pt-16 sm:pt-20 pb-12 mt-20">
      <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Info (2 cols on large) */}
          <div className="lg:col-span-2 space-y-4">
            {settings.site_name && settings.site_name !== 'BRANDWORLD' && (
              <span className="font-serif-heading text-3xl font-bold tracking-tight text-white block">
                {settings.site_name}
              </span>
            )}
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              {settings.tagline}
            </p>
            <div className="text-xs text-neutral-400 space-y-1 pt-2">
              <p>{settings.business_address}</p>
              <p>{settings.contact_email}</p>
              <p>{settings.contact_phone}</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {settings.social_instagram && (
                <a
                  href={settings.social_instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-white/10 text-neutral-300 hover:text-black hover:bg-white transition-all shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-white/10 text-neutral-300 hover:text-black hover:bg-white transition-all shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.social_twitter && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-white/10 text-neutral-300 hover:text-black hover:bg-white transition-all shadow-sm"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.social_youtube && (
                <a
                  href={settings.social_youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-white/10 text-neutral-300 hover:text-black hover:bg-white transition-all shadow-sm"
                  aria-label="Youtube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.16em] font-bold text-white mb-4">
              Atelier Archive
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/products?category=living-object" className="hover:text-white transition-colors">
                  Living & Objects
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio-acoustics" className="hover:text-white transition-colors">
                  Audio & Acoustics
                </Link>
              </li>
              <li>
                <Link href="/products?category=time-horology" className="hover:text-white transition-colors">
                  Time & Horology
                </Link>
              </li>
              <li>
                <Link href="/products?category=leather-carry" className="hover:text-white transition-colors">
                  Leather & Carry
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-300 transition-colors font-medium">
                  View Full Catalog →
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.16em] font-bold text-white mb-4">
              Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Track An Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Exchanges & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.16em] font-bold text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  The Philosophy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-neutral-400">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} Studio Atelier. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-widest text-neutral-400">
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">RAZORPAY SECURED</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">APPLE PAY</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">UPI</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">VISA / MC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
