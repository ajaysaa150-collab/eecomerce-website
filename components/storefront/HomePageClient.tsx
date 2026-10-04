'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product, Category, HeroSlide } from '@/types';
import { getProducts, getCategories } from '@/lib/supabase';
import { HeroCarousel } from './HeroCarousel';
import { TrustTicker } from './TrustTicker';
import { PromoBanner } from './PromoBanner';
import { NewsletterSection } from './NewsletterSection';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Instagram } from 'lucide-react';

interface HomePageClientProps {
  slides: HeroSlide[];
  categories: Category[];
  newArrivals: Product[];
  bestSellers: Product[];
}

export function HomePageClient({
  slides,
  categories,
  newArrivals,
  bestSellers,
}: HomePageClientProps) {
  const [arrivals, setArrivals] = useState<Product[]>(() =>
    (newArrivals || []).filter((p) => (p.status || 'active') === 'active')
  );
  const [sellers, setSellers] = useState<Product[]>(() =>
    (bestSellers || []).filter((p) => (p.status || 'active') === 'active')
  );
  const [catList, setCatList] = useState<Category[]>(categories);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const refreshLiveArrivals = async () => {
      try {
        const live = await getProducts({ sortBy: 'newest', limit: 8 });
        if (Array.isArray(live)) {
          setArrivals(live.filter((p) => (p.status || 'active') === 'active'));
        }
      } catch {}
    };

    const refreshLiveBestSellers = async () => {
      try {
        const live = await getProducts({ sortBy: 'rating', limit: 8 });
        if (Array.isArray(live)) {
          setSellers(live.filter((p) => (p.status || 'active') === 'active'));
        }
      } catch {}
    };

    const refreshLiveCategories = async () => {
      try {
        const live = await getCategories();
        if (Array.isArray(live)) {
          setCatList(live);
        }
      } catch {}
    };

    refreshLiveArrivals();
    refreshLiveBestSellers();
    refreshLiveCategories();
    window.addEventListener('atelier_products_updated', refreshLiveArrivals);
    window.addEventListener('atelier_products_updated', refreshLiveBestSellers);
    window.addEventListener('atelier_categories_updated', refreshLiveCategories);
    window.addEventListener('storage', refreshLiveArrivals);
    window.addEventListener('storage', refreshLiveBestSellers);
    window.addEventListener('storage', refreshLiveCategories);
    return () => {
      window.removeEventListener('atelier_products_updated', refreshLiveArrivals);
      window.removeEventListener('atelier_products_updated', refreshLiveBestSellers);
      window.removeEventListener('atelier_categories_updated', refreshLiveCategories);
      window.removeEventListener('storage', refreshLiveArrivals);
      window.removeEventListener('storage', refreshLiveBestSellers);
      window.removeEventListener('storage', refreshLiveCategories);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const lifestyleInstagramImages = [
    {
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
      alt: 'Atelier Living Studio',
    },
    {
      url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop',
      alt: 'Atelier Audio Workspace',
    },
    {
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
      alt: 'Horology Timepiece On Desk',
    },
    {
      url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop',
      alt: 'Tuscan Leather Carry In Sunlight',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Carousel */}
      <HeroCarousel slides={slides} />

      {/* 2. Trust Badges Infinite Ticker */}
      <TrustTicker />

      {/* 3. Featured Categories Horizontal Scrollable Row */}
      <section className="max-w-container mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
              Curated Spaces
            </span>
            <h2 className="font-serif-heading text-2xl sm:text-4xl font-bold text-foreground">
              Featured Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs uppercase tracking-label font-semibold text-foreground hover:text-accent flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {catList.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col luxury-card rounded-2xl overflow-hidden"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
                <Image
                  src={cat.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800'}
                  alt={cat.name}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif-heading text-lg sm:text-xl font-semibold mb-1">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-white/80 group-hover:text-white flex items-center gap-1 font-medium transition-colors">
                    Explore items <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3.5 The Atelier Standard: High-Fashion Architectural Feature */}
      <section className="max-w-container mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-16 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-[#0F0F11] text-white p-6 sm:p-10 lg:p-14 border border-white/10 shadow-floating">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none bg-gradient-to-l from-amber-500/20 via-accent/10 to-transparent" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-bold text-amber-300 block">
                The Atelier Standard
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                Architectural Form. Hand-Finished Substance.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                Every creation in our archive is precision-machined from aerospace-grade metals, solid walnut, and hand-burnished Tuscan leathers. Objects deliberately engineered to outlive trends and cultivate character across decades.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="font-bold text-white block text-sm font-serif-heading mb-0.5">01. Bespoke Alloys</span>
                  <p className="text-neutral-400 text-[11px]">Solid aerospace titanium & blasted aluminum housing.</p>
                </div>
                <div>
                  <span className="font-bold text-white block text-sm font-serif-heading mb-0.5">02. Tuscan Leathers</span>
                  <p className="text-neutral-400 text-[11px]">Vegetal-tanned hides that patina with time and touch.</p>
                </div>
                <div>
                  <span className="font-bold text-white block text-sm font-serif-heading mb-0.5">03. Lifetime Integrity</span>
                  <p className="text-neutral-400 text-[11px]">Mechanical modularity and archival repairability.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link href="/about">
                  <Button variant="primary" size="md" className="bg-white text-black hover:bg-neutral-100 shadow-sm">
                    Read Studio Manifesto
                  </Button>
                </Link>
                <Link
                  href="/products"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Explore Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-square sm:aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-elevated">
              <Image
                src="https://images.unsplash.com/photo-1507646227500-4d389b0012be?q=80&w=1000&auto=format&fit=crop"
                alt="Atelier Craftsmanship"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-0.5">
                  Bespoke Manufacture
                </span>
                <p className="font-serif-heading text-sm sm:text-base font-semibold">
                  Zero Compromise on Materiality
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. New Arrivals Product Grid (4 columns desktop, 2 mobile) */}
      <section className="max-w-container mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
              Latest Additions
            </span>
            <h2 className="font-serif-heading text-2xl sm:text-4xl font-bold text-foreground">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-xs uppercase tracking-label font-semibold text-foreground hover:text-accent flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            View New Archive <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
        >
          {arrivals.slice(0, 4).map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. Promotional Banner with Countdown */}
      <PromoBanner />

      {/* 6. Best Sellers Grid */}
      <section className="max-w-container mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
              Collector Favorites
            </span>
            <h2 className="font-serif-heading text-2xl sm:text-4xl font-bold text-foreground">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products?sort=best-selling"
            className="text-xs uppercase tracking-label font-semibold text-foreground hover:text-accent flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            Explore Best Sellers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
        >
          {sellers.slice(0, 4).map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 7. Instagram / Social Feed Gallery */}
      <section className="max-w-container mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 w-full">
        <div className="text-center max-w-lg mx-auto mb-8 sm:mb-10 px-4">
          <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
            @brandworld_studio
          </span>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Form In Situ
          </h2>
          <p className="text-xs text-secondary">
            Tag #BrandWorldSpaces to be featured in our seasonal curation index.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {lifestyleInstagramImages.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-cream border border-black/5"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Instagram className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Newsletter Signup */}
      <NewsletterSection />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
