import React from 'react';
import { getHeroSlides, getCategories, getProducts } from '@/lib/supabase';
import { HomePageClient } from '@/components/storefront/HomePageClient';

export const revalidate = 60;

export default async function HomePage() {
  const [slides, categories, newArrivals, bestSellers] = await Promise.all([
    getHeroSlides(),
    getCategories(),
    getProducts({ sortBy: 'newest', limit: 8 }),
    getProducts({ sortBy: 'rating', limit: 8 }),
  ]);

  return (
    <HomePageClient
      slides={slides}
      categories={categories}
      newArrivals={newArrivals}
      bestSellers={bestSellers}
    />
  );
}
