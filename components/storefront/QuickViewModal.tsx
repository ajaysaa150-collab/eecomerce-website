'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/context/CurrencyContext';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { currentCountry } = useCurrency();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const activePrice = product.sale_price ?? product.price;
  const mainImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800';

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariantId || 'default'}`,
      productId: product.id,
      title: product.title,
      price: activePrice,
      image: mainImage,
      quantity,
      maxStock: product.stock_quantity,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-cream border border-black/5">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover object-center"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs uppercase tracking-label text-secondary font-medium">
              {product.category.name}
            </span>
          )}

          <h2 className="text-2xl font-serif-heading font-medium text-foreground mt-1 mb-2">
            {product.title}
          </h2>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(activePrice)}
            </span>
            {product.sale_price && (
              <span className="text-sm text-secondary line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <p className="text-xs text-secondary leading-relaxed line-clamp-3 mb-6">
            {product.description.replace(/<[^>]+>/g, '')}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary block mb-2">
                Options
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const label = v.option_values.map((ov) => ov.value).join(' / ');
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/5 text-accent font-medium ring-1 ring-accent'
                          : 'border-black/10 hover:border-black/25 text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-black/10 rounded-lg overflow-hidden h-11 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 hover:bg-black/5 text-sm font-semibold transition-colors"
              >
                -
              </button>
              <span className="px-3 text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                className="px-3 hover:bg-black/5 text-sm font-semibold transition-colors"
              >
                +
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="flex-1"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
            >
              Add to Bag
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-black/5 flex justify-end">
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="text-xs text-secondary hover:text-accent font-medium inline-flex items-center gap-1 transition-colors"
            >
              View Full Product Specifications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
