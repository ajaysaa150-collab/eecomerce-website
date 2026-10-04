'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, Review } from '@/types';
import { getProductBySlug, getProductReviews, getProducts } from '@/lib/supabase';
import { PDPClient } from './PDPClient';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ProductDetailFallbackProps {
  slug: string;
}

export function ProductDetailFallback({ slug }: ProductDetailFallbackProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveProduct = async () => {
      try {
        setLoading(true);
        const resolved = await getProductBySlug(slug);
        if (resolved && isMounted) {
          setProduct(resolved);
          const [revs, prods] = await Promise.all([
            getProductReviews(resolved.id),
            getProducts({ categoryId: resolved.category_id, limit: 4 }),
          ]);
          if (isMounted) {
            setReviews(revs || []);
            setRelated((prods || []).filter((p) => p.id !== resolved.id));
          }
        }
      } catch (err) {
        console.warn('Error resolving product on client:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    resolveProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-xs uppercase tracking-wider text-secondary font-medium">
          Retrieving Archival Record...
        </p>
      </div>
    );
  }

  if (product) {
    return (
      <PDPClient
        product={product}
        initialReviews={reviews}
        relatedProducts={related}
      />
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
      <span className="font-serif-heading text-7xl sm:text-9xl font-bold text-black/10 select-none">
        404
      </span>
      <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-2">
        Object Out of Bounds
      </h2>
      <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        The piece, page, or acquisition link you sought does not exist within the current archive.
      </p>
      <Link href="/products">
        <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Return to Catalog
        </Button>
      </Link>
    </div>
  );
}
