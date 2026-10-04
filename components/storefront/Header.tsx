'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Heart, 
  User, 
  Menu, 
  X, 
  Shield, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  Package,
  LogOut
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { SiteSettings, Category } from '@/types';
import { getCategories } from '@/lib/supabase';
import { CurrencySelector } from './CurrencySelector';

interface HeaderProps {
  settings: SiteSettings;
  onOpenSearch: () => void;
}

export function Header({ settings, onOpenSearch }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { itemCount, setIsDrawerOpen, cartBounceKey } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, profile, isAdmin, openAuthModal, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartIconControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const liveCats = await getCategories();
        if (liveCats && liveCats.length > 0) {
          setCategories(liveCats);
        }
      } catch {}
    };

    loadCategories();
    window.addEventListener('atelier_categories_updated', loadCategories);
    window.addEventListener('storage', loadCategories);
    return () => {
      window.removeEventListener('atelier_categories_updated', loadCategories);
      window.removeEventListener('storage', loadCategories);
    };
  }, []);

  // Cart bounce spring animation whenever an item is added
  useEffect(() => {
    if (cartBounceKey > 0) {
      cartIconControls.start({
        scale: [1, 1.25, 0.95, 1],
        transition: { type: 'spring', stiffness: 500, damping: 14 },
      });
    }
  }, [cartBounceKey, cartIconControls]);

  const desktopNavLinks = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { label: 'Catalog', href: '/products' },
        { label: 'Living', href: '/products?category=living-object' },
        { label: 'Audio', href: '/products?category=audio-acoustics' },
        { label: 'Horology', href: '/products?category=time-horology' },
        { label: 'Carry', href: '/products?category=leather-carry' },
        { label: 'About', href: '/about' },
      ];
    }

    return [
      { label: 'Catalog', href: '/products' },
      ...categories.slice(0, 4).map((c) => ({
        label: c.name,
        href: `/products?category=${c.slug}`,
      })),
      { label: 'About', href: '/about' },
    ];
  }, [categories]);

  const mobileNavLinks = useMemo(() => {
    if (!categories || categories.length === 0) return desktopNavLinks;

    return [
      { label: 'Catalog', href: '/products' },
      ...categories.map((c) => ({
        label: c.name,
        href: `/products?category=${c.slug}`,
      })),
      { label: 'About', href: '/about' },
    ];
  }, [categories, desktopNavLinks]);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#0F0F11] text-[#E0E0E0] text-[10px] sm:text-[11px] font-medium tracking-wider py-1.5 sm:py-2 px-3 sm:px-6 lg:px-12 border-b border-white/5 transition-all">
        <div className="max-w-container mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden truncate">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              Complimentary White-Glove Dispatch on orders over ₹2,500 / $100
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-widest text-[#A0A0A0] shrink-0">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Architectural Grade Objects</span>
            </span>
            <span>•</span>
            <Link href="/about" className="hover:text-white transition-colors">
              Studio Philosophy
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <motion.header
        animate={{
          height: isScrolled ? 62 : 74,
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.98)',
          boxShadow: isScrolled
            ? '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)'
            : '0 2px 10px -2px rgba(0, 0, 0, 0.03)',
          borderBottomColor: isScrolled ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="sticky top-0 z-40 w-full backdrop-blur-xl border-b flex items-center"
      >
        <div className="max-w-container mx-auto w-full px-3 sm:px-6 lg:px-12 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Left Area: Mobile Toggle + Desktop Nav Links */}
          <div className="flex items-center gap-1 sm:gap-6 shrink-0 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-xl text-foreground hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {desktopNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                      isActive
                        ? 'bg-black text-white shadow-xs'
                        : 'text-secondary hover:text-foreground hover:bg-black/[0.04]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Area: Prestigious Brand Emblem & Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 py-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-black text-white flex items-center justify-center font-serif-heading font-bold text-xs sm:text-sm md:text-base shadow-sm group-hover:bg-neutral-800 transition-colors shrink-0">
              {settings.site_name ? settings.site_name.charAt(0) : 'B'}
            </div>
            <span className="font-serif-heading text-sm sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground group-hover:text-black transition-colors leading-none whitespace-nowrap">
              {settings.site_name || 'BRANDWORLD'}
            </span>
          </Link>

          {/* Right Area: Action Controls (Currency, Search, Wishlist, Account, Cart) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Country & Currency Switcher */}
            <CurrencySelector variant="header" />

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100/80 hover:bg-black hover:text-white text-secondary transition-all flex items-center justify-center border border-black/5 shadow-xs cursor-pointer"
              aria-label="Search catalog"
              title="Search collection"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Wishlist Link - visible on all screen sizes */}
            <Link
              href="/account/wishlist"
              className="relative flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100/80 hover:bg-black hover:text-white text-secondary transition-all items-center justify-center border border-black/5 shadow-xs shrink-0 cursor-pointer"
              aria-label="Wishlist"
              title="Saved wishlist"
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-white ring-1 ring-destructive/20" />
              )}
            </Link>

            {/* User Account / Profile Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal('signin');
                  } else {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all shadow-xs cursor-pointer ${
                  user
                    ? 'bg-black text-white border-black font-semibold text-xs'
                    : 'bg-neutral-100/80 hover:bg-black hover:text-white text-secondary border-black/5'
                }`}
                aria-label="User account"
                title={user ? profile?.full_name || 'My Account' : 'Sign In'}
              >
                {user ? (
                  profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>

              <AnimatePresence>
                {isUserMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-floating border border-black/10 py-2.5 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-black/5 bg-neutral-50/50">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground truncate">{profile?.full_name}</p>
                        {isAdmin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white font-bold tracking-wider uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-secondary truncate mt-0.5">{profile?.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 transition-colors border-b border-black/5"
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-accent" />
                          <span>Admin Control Center</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-accent" />
                      </Link>
                    )}

                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs text-foreground hover:bg-black/5 transition-colors font-medium"
                      >
                        <span>My Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5 text-secondary" />
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs text-foreground hover:bg-black/5 transition-colors font-medium"
                      >
                        <span>Order History</span>
                        <ChevronRight className="w-3.5 h-3.5 text-secondary" />
                      </Link>
                      <Link
                        href="/account/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs text-foreground hover:bg-black/5 transition-colors font-medium"
                      >
                        <span>Saved Wishlist</span>
                        <ChevronRight className="w-3.5 h-3.5 text-secondary" />
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-black/5">
                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-destructive/5 transition-colors font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Admin Shortcut when logged in */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black text-white hover:bg-neutral-800 transition-all shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-accent" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Full-Screen Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/98 backdrop-blur-2xl flex flex-col p-6 overflow-y-auto"
          >
            {/* Mobile Header Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-serif-heading font-bold text-base">
                  {settings.site_name ? settings.site_name.charAt(0) : 'B'}
                </div>
                <span className="font-serif-heading text-2xl font-bold tracking-tight text-foreground">
                  {settings.site_name}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-secondary hover:text-foreground hover:bg-black/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Category Links */}
            <nav className="flex flex-col gap-2 py-6">
              {mobileNavLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * idx, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-xl font-serif-heading text-xl transition-all ${
                        isActive
                          ? 'bg-black text-white font-bold'
                          : 'text-foreground hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-secondary'}`} />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Mobile Account & Wishlist Shortcuts */}
            <div className="py-4 border-t border-black/5 space-y-2">
              <Link
                href="/account/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span>Saved Wishlist</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-black/10 font-bold">
                  {wishlistIds.length}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (!user) {
                    openAuthModal('signin');
                  } else {
                    window.location.href = '/account';
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-foreground transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <span>{user ? (profile?.full_name || 'My Account') : 'Sign In / Register'}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-secondary" />
              </button>
            </div>

            {/* Mobile Footer Info */}
            <div className="mt-auto pt-4 border-t border-black/10 text-xs text-secondary space-y-3">
              <div className="flex items-center justify-between">
                <span>Select Currency:</span>
                <CurrencySelector variant="compact" />
              </div>
              <div className="pt-2 text-[11px] text-secondary/80 space-y-1">
                <p>{settings.contact_email}</p>
                <p>{settings.business_address}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
