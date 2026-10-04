import React, { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/supabase';
import { PLPClient } from '@/components/storefront/PLPClient';

export const revalidate = 60;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<div className="max-w-container mx-auto px-6 py-20 text-center text-xs text-secondary">Loading catalog...</div>}>
      <PLPClient initialProducts={products} categories={categories} />
    </Suspense>
  );
}
