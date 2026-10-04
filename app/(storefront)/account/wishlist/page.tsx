'use client';

import React from 'react';
import Link from 'next/link';
import { AccountLayoutClient } from '@/components/storefront/AccountLayoutClient';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/Button';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistProducts } = useWishlist();

  return (
    <AccountLayoutClient>
      <div className="space-y-6">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Saved Objects ({wishlistProducts.length})
          </h2>
          <p className="text-xs text-secondary mt-1">
            Personal curation of archival pieces earmarked for your collection.
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="luxury-card rounded-2xl p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center mb-4 text-secondary">
              <Heart className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h3 className="font-serif-heading text-xl font-medium mb-1">Your Wishlist is Empty</h3>
            <p className="text-xs text-secondary mb-6">
              Click the heart icon on any design object across our catalog to preserve it here.
            </p>
            <Link href="/products">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {wishlistProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </AccountLayoutClient>
  );
}
