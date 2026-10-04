'use client';

import React, { useState } from 'react';
import { SiteSettings } from '@/types';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { AuthModal } from './AuthModal';
import { PageTransition } from './PageTransition';

interface StorefrontShellProps {
  settings: SiteSettings;
  children: React.ReactNode;
}

export function StorefrontShell({ settings, children }: StorefrontShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <Header settings={settings} onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1 flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer settings={settings} />

      {/* Global Storefront Modals & Drawers */}
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal />
    </div>
  );
}
