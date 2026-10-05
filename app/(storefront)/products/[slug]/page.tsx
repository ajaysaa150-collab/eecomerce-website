import React from 'react';
import { Metadata } from 'next';
import { getProductBySlug, getProductReviews, getProducts } from '@/lib/supabase';
import { PDPClient } from '@/components/storefront/PDPClient';
import { ProductDetailFallback } from '@/components/storefront/ProductDetailFallback';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Masterwork | Atelier' };
  }
  return {
    title: product.meta_title || `${product.title} | Atelier`,
    description: product.meta_description || product.description.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.replace(/<[^>]+>/g, '').slice(0, 160),
      images: product.images[0]?.image_url ? [{ url: product.images[0].image_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return <ProductDetailFallback slug={params.slug} />;
  }

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    getProducts({ categoryId: product.category_id, limit: 4 }),
  ]);

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id);

  return (
    <PDPClient
      product={product}
      initialReviews={reviews}
      relatedProducts={filteredRelated}
    />
  );
}
