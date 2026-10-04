'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  Check,
  CheckCircle2,
  Share2,
  Zap,
} from 'lucide-react';
import { Product, Review } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/context/CurrencyContext';
import { addProductReview } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ProductCard } from './ProductCard';

interface PDPClientProps {
  product: Product;
  initialReviews: Review[];
  relatedProducts: Product[];
}

export function PDPClient({ product, initialReviews, relatedProducts }: PDPClientProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, error: toastError } = useToast();
  const { currentCountry, formatPrice } = useCurrency();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product?.variants?.[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string>('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewBody, setNewReviewBody] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const images = (product?.images && product.images.length > 0)
    ? product.images
    : [{ id: '1', product_id: product?.id || '', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000', sort_order: 1 }];
  const currentImage = images[activeImageIdx] || images[0];

  const isFavorited = product?.id ? isInWishlist(product.id) : false;
  const activePrice = Number(product?.sale_price ?? product?.price ?? 0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomCoords({ x, y });
  };

  const handleDirectBuy = () => {
    if (product.stock_quantity === 0) return;
    addItem({
      id: `${product.id}-${selectedVariantId || 'default'}`,
      productId: product.id,
      variantId: selectedVariantId || undefined,
      title: product.title,
      price: activePrice,
      image: currentImage.image_url,
      quantity,
      maxStock: product.stock_quantity,
    });
    router.push('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewTitle || !newReviewBody || !newReviewName) {
      toastError('Missing fields', 'Please complete your review title, body, and name.');
      return;
    }
    setIsSubmittingReview(true);
    const added = await addProductReview({
      product_id: product.id,
      product_title: product.title,
      user_id: profile?.id || 'guest-' + Date.now(),
      user_name: newReviewName || profile?.full_name || 'Verified Collector',
      rating: newReviewRating,
      title: newReviewTitle,
      body: newReviewBody,
      is_verified: true,
    } as any);
    setReviews([added, ...reviews]);
    setIsSubmittingReview(false);
    setNewReviewTitle('');
    setNewReviewBody('');
    setNewReviewName('');
    success('Review Submitted', 'Thank you for contributing your perspective to our archive.');
  };

  // Rating calculations
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage:
      totalReviews > 0
        ? (reviews.filter((r) => r.rating === stars).length / totalReviews) * 100
        : stars === 5
        ? 100
        : 0,
  }));

  // JSON-LD structured data for Google Search rich snippets
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product?.title || 'Masterwork Object',
    image: images.map((i) => i.image_url),
    description: (product?.description || '').replace(/<[^>]+>/g, ''),
    sku: product?.sku || 'ATL-PROD',
    offers: {
      '@type': 'Offer',
      priceCurrency: currentCountry?.currency || 'USD',
      price: activePrice,
      availability:
        (product?.stock_quantity ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: Math.max(1, totalReviews),
    },
  };

  return (
    <>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-container mx-auto px-6 sm:px-12 py-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            BrandWorld
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">
            Catalog
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Top Product Section: Left Gallery + Right Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[620px] shrink-0 pb-2 md:pb-0">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-cream border transition-all ${
                    idx === activeImageIdx
                      ? 'border-accent ring-2 ring-accent/20 scale-95'
                      : 'border-black/5 hover:border-black/25 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || product?.title || 'Thumbnail'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image with Zoom on Hover */}
            <div
              ref={mainImageRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-cream border border-black/5 cursor-crosshair luxury-card"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentImage.id}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={currentImage.image_url}
                    alt={product?.title || 'Product Image'}
                    fill
                    priority
                    unoptimized
                    className="object-cover object-center"
                    style={{
                      transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                      transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                      transition: isZoomed ? 'none' : 'transform 0.4s ease-out',
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Wishlist button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 backdrop-blur shadow-subtle hover:bg-white transition-colors"
                aria-label="Save to wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorited ? 'fill-destructive text-destructive' : 'text-foreground'
                  }`}
                />
              </motion.button>
            </div>
          </div>

          {/* Right Info Section (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              {product.category && (
                <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
                  {product.category.name}
                </span>
              )}
              <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Star rating summary */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-foreground">{averageRating}</span>
                <span className="text-xs text-secondary">({totalReviews} reviews)</span>
                <span className="text-secondary">•</span>
                <span className="text-xs text-secondary uppercase tracking-wider font-mono">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-black/5">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(activePrice)}
              </span>
              {product?.sale_price && (
                <span className="text-lg text-secondary line-through">
                  {formatPrice(Number(product.price))}
                </span>
              )}
              {product?.sale_price && (
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-destructive text-white">
                  Seasonal Pricing
                </span>
              )}
            </div>

            {/* Description intro */}
            <div
              className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-4"
              dangerouslySetInnerHTML={{ __html: product?.description || '' }}
            />

            {/* Dynamic Variant Selector */}
            {product?.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-label text-foreground mb-2">
                    <span>Variant Selection</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariantId === v.id;
                      const isOutOfStock = v.stock_quantity === 0;
                      const label =
                        v.option_values && Array.isArray(v.option_values) && v.option_values.length > 0
                          ? v.option_values.map((ov) => ov?.value || '').filter(Boolean).join(' / ')
                          : (v as any).title || `Variant ${v.id}`;

                      return (
                        <button
                          key={v.id}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`relative px-4 py-2 text-xs rounded-xl border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-accent bg-accent/5 text-accent font-semibold ring-2 ring-accent/20'
                              : isOutOfStock
                              ? 'border-black/5 text-secondary/40 line-through cursor-not-allowed bg-cream/40'
                              : 'border-black/10 hover:border-black/30 text-foreground bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector + Large Add to Cart Button */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                {/* Quantity increment/decrement */}
                <div className="flex items-center border border-black/15 rounded-xl bg-white h-13 overflow-hidden shadow-subtle">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 hover:bg-black/5 text-base font-semibold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="px-4 hover:bg-black/5 text-base font-semibold transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Direct Buy CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  disabled={product.stock_quantity === 0}
                  onClick={handleDirectBuy}
                  className="flex-1 h-13 shadow-floating group text-sm font-bold bg-black text-white hover:bg-neutral-900"
                  leftIcon={<Zap className="w-4 h-4 fill-amber-400 text-amber-400" />}
                >
                  {product.stock_quantity > 0 ? 'Direct Buy Now' : 'Archive Out of Stock'}
                </Button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between text-xs text-secondary pt-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      product.stock_quantity > 0 ? 'bg-success' : 'bg-destructive'
                    }`}
                  />
                  {product.stock_quantity > 0
                    ? `Available in Archive (${product.stock_quantity} units)`
                    : 'Currently Backordered'}
                </span>
                <span>Ships in 24 Hours</span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/5 text-xs text-secondary">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-foreground" />
                <span>Complimentary Express Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-foreground" />
                <span>30-Day Archival Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-foreground" />
                <span>2-Year Atelier Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-foreground" />
                <span>Hand-Inspected in Soho</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accordions Section: Description, Specifications, Shipping, Reviews */}
        <div className="border-t border-black/10 pt-12 max-w-4xl mx-auto space-y-4 mb-20">
          {/* 1. Description */}
          <div className="border border-black/5 rounded-2xl bg-white overflow-hidden shadow-subtle">
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === 'description' ? '' : 'description')
              }
              className="w-full px-6 py-5 flex items-center justify-between text-left font-serif-heading text-lg font-semibold"
            >
              <span>Design & Philosophy</span>
              <ChevronDown
                className={`w-5 h-5 text-secondary transition-transform ${
                  openAccordion === 'description' ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openAccordion === 'description' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 text-xs sm:text-sm text-secondary leading-relaxed space-y-4"
                >
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  <p>
                    Every detail has been curated to minimize visual noise while maximizing tactile delight.
                    Formed from authentic raw materials that gain elegance over time.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Specifications Table */}
          <div className="border border-black/5 rounded-2xl bg-white overflow-hidden shadow-subtle">
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')
              }
              className="w-full px-6 py-5 flex items-center justify-between text-left font-serif-heading text-lg font-semibold"
            >
              <span>Technical Specifications</span>
              <ChevronDown
                className={`w-5 h-5 text-secondary transition-transform ${
                  openAccordion === 'specs' ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openAccordion === 'specs' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 text-xs text-foreground"
                >
                  <div className="divide-y divide-black/5 border border-black/5 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-2 p-3 bg-cream/40">
                      <span className="font-semibold text-secondary">Material Origin</span>
                      <span>Anodized Aerospace Aluminium & Vegetable-Tanned Hide</span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-white">
                      <span className="font-semibold text-secondary">Dimensions</span>
                      <span>220mm × 140mm × 95mm</span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-cream/40">
                      <span className="font-semibold text-secondary">Weight</span>
                      <span>1,420 grams</span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-white">
                      <span className="font-semibold text-secondary">Stock Keeping Unit</span>
                      <span className="font-mono text-xs">{product.sku}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Shipping & Returns */}
          <div className="border border-black/5 rounded-2xl bg-white overflow-hidden shadow-subtle">
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')
              }
              className="w-full px-6 py-5 flex items-center justify-between text-left font-serif-heading text-lg font-semibold"
            >
              <span>Shipping & Archival Care</span>
              <ChevronDown
                className={`w-5 h-5 text-secondary transition-transform ${
                  openAccordion === 'shipping' ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openAccordion === 'shipping' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 text-xs text-secondary leading-relaxed space-y-2"
                >
                  <p>
                    All items are hand-packed in archival acid-free museum tissue and double-boxed.
                    Orders placed before 2:00 PM EST ship the same business day via DHL Express.
                  </p>
                  <p>
                    Complimentary 30-day global returns are accepted on all unworn items in original packaging.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="max-w-4xl mx-auto pt-8 border-t border-black/10 mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
                Client Reflections
              </span>
              <h2 className="font-serif-heading text-3xl font-bold text-foreground">
                Verified Reviews
              </h2>
            </div>
            <div className="text-right">
              <span className="text-4xl font-serif-heading font-bold text-foreground mr-2">
                {averageRating}
              </span>
              <span className="text-xs text-secondary">out of 5 stars</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-black/5 shadow-subtle mb-10">
            <div className="space-y-2">
              {ratingCounts.map((rc) => (
                <div key={rc.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-medium">{rc.stars} stars</span>
                  <div className="flex-1 h-2 bg-cream rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${rc.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-secondary">{rc.count}</span>
                </div>
              ))}
            </div>

            {/* Write review form trigger */}
            <form onSubmit={handleSubmitReview} className="space-y-3 pt-2 md:pt-0 md:pl-6 md:border-l md:border-black/5">
              <h4 className="text-xs uppercase tracking-label font-bold text-foreground">
                Leave a Reflection
              </h4>

              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewReviewRating(s)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Your Name"
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-lg border border-black/10 focus:outline-none focus:border-accent"
                required
              />

              <input
                type="text"
                placeholder="Review Headline"
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-lg border border-black/10 focus:outline-none focus:border-accent"
                required
              />

              <textarea
                placeholder="Share your experience with this design object..."
                rows={2}
                value={newReviewBody}
                onChange={(e) => setNewReviewBody(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-black/10 focus:outline-none focus:border-accent"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingReview}
              >
                Submit Review
              </Button>
            </form>
          </div>

          {/* List of reviews */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-black/5 shadow-subtle space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {rev.user_name || 'Verified Collector'}
                    </span>
                    {rev.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-success font-semibold px-2 py-0.5 rounded bg-success/10">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-secondary">{formatDate(rev.created_at)}</span>
                </div>

                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>

                <h4 className="text-sm font-semibold text-foreground">{rev.title}</h4>
                <p className="text-xs text-secondary leading-relaxed">{rev.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-black/10 mb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
                  Harmonious Complements
                </span>
                <h3 className="font-serif-heading text-3xl font-bold text-foreground">
                  Related Objects
                </h3>
              </div>
              <Link
                href="/products"
                className="text-xs uppercase tracking-label font-semibold text-foreground hover:text-accent"
              >
                View Full Archive
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar - ensures CTA is always visible on small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/10 px-4 py-3 flex items-center justify-between gap-3 shadow-floating">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-foreground truncate">
            {product.title}
          </span>
          <span className="text-sm font-bold text-foreground">
            {formatPrice(activePrice)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className="p-2.5 rounded-xl border border-black/10 text-foreground hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? 'fill-destructive text-destructive' : 'text-foreground'
              }`}
            />
          </button>

          <Button
            size="md"
            variant="primary"
            disabled={product.stock_quantity === 0}
            onClick={handleDirectBuy}
            className="h-10 px-4 text-xs font-bold shadow-sm bg-black text-white hover:bg-neutral-900"
            leftIcon={<Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
          >
            {product.stock_quantity > 0 ? 'Buy Now' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </>
  );
}
