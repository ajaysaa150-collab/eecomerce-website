'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800';
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        id: `${product.id}-default`,
        productId: product.id,
        title: product.title,
        price: product.sale_price ?? product.price,
        image: primaryImage,
        maxStock: product.stock_quantity,
      },
      imageContainerRef.current
    );
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isNew = new Date().getTime() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 14;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col h-full bg-white rounded-xl border border-black/5 p-3 hover:border-black/15 shadow-subtle hover:shadow-elevated transition-all duration-300"
    >
      {/* Product Image Area */}
      <div
        ref={imageContainerRef}
        className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-cream mb-4 cursor-pointer"
      >
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {/* Primary Image */}
          <motion.div
            animate={{
              scale: isHovered ? 1.05 : 1,
              opacity: isHovered && secondaryImage !== primaryImage ? 0 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center"
              priority={false}
            />
          </motion.div>

          {/* Secondary Lifestyle Image Swap on Hover */}
          {secondaryImage !== primaryImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={secondaryImage}
                alt={`${product.title} alternate`}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center"
              />
            </motion.div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.sale_price && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-destructive text-white shadow-sm">
              Sale
            </span>
          )}
          {isNew && !product.sale_price && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-foreground text-white animate-pulse-slow">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button with Scale Bounce */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur text-foreground hover:bg-white transition-colors shadow-sm"
          aria-label="Add to wishlist"
        >
          <motion.div
            animate={{
              scale: isFavorited ? [1, 1.25, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? 'fill-destructive text-destructive' : 'text-foreground hover:text-destructive'
              }`}
            />
          </motion.div>
        </motion.button>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-14 right-2.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur text-foreground hover:bg-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
            title="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Quick Add Action Bar - always visible on mobile, reveals on hover on desktop */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock_quantity === 0}
            className="w-full h-9 sm:h-10 bg-foreground/95 hover:bg-black text-white text-[11px] sm:text-xs uppercase tracking-label font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-floating transition-all active:scale-95 disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock_quantity > 0 ? 'Quick Add' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {product.category && (
            <span className="text-[11px] uppercase tracking-label text-secondary font-medium block mb-1">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-base font-medium text-foreground hover:text-accent transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price and Stock */}
        <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-black/5">
          <div className="flex items-baseline gap-2">
            {product.sale_price ? (
              <>
                <span className="text-sm font-semibold text-destructive">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-xs text-secondary line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="text-[10px] text-destructive font-medium uppercase tracking-wider">
              Only {product.stock_quantity} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
