'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { validateCoupon } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Trash2, ArrowRight, Tag, Check, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export default function CartPage() {
  const { profile, openAuthModal } = useAuth();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon,
    setCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { success, error: toastError } = useToast();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    const res = await validateCoupon(couponCode, subtotal);
    setIsApplying(false);

    if (res.valid && res.coupon) {
      setCoupon(res.coupon);
      setCouponCode('');
      success('Coupon Applied', `Code ${res.coupon.code} applied.`);
    } else {
      toastError('Coupon Error', res.message || 'Invalid promotion code');
    }
  };

  return (
    <div className="max-w-container mx-auto px-6 sm:px-12 py-12 w-full">
      {/* Header */}
      <div className="pb-8 mb-8 border-b border-black/5 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
            Order Preparation
          </span>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-foreground">
            Shopping Bag
          </h1>
        </div>
        <Link
          href="/products"
          className="text-xs uppercase tracking-label font-semibold text-secondary hover:text-foreground flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center luxury-card rounded-2xl max-w-lg mx-auto p-10">
          <div className="w-20 h-20 rounded-full bg-cream mx-auto flex items-center justify-center mb-6 text-secondary">
            <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
          </div>
          <h2 className="font-serif-heading text-2xl font-semibold mb-2">Your Bag is Empty</h2>
          <p className="text-xs sm:text-sm text-secondary mb-8 leading-relaxed">
            There are no archival goods currently placed in your order bag.
          </p>
          <Link href="/products">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Master Collection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="divide-y divide-black/5 luxury-card rounded-2xl p-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, x: 50 }}
                    transition={{ duration: 0.25 }}
                    className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-6"
                  >
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-cream border border-black/5 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif-heading text-lg font-semibold text-foreground truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-secondary mt-1 font-mono">
                        {formatCurrency(item.price)} each
                      </p>

                      <div className="flex items-center gap-6 mt-4">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-black/10 rounded-lg overflow-hidden bg-white h-9 shadow-subtle">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-3 hover:bg-black/5 text-xs font-semibold"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="px-3 hover:bg-black/5 text-xs font-semibold disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-secondary hover:text-destructive flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-base font-bold text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center text-xs text-secondary">
              <button
                onClick={clearCart}
                className="hover:text-destructive transition-colors underline"
              >
                Clear entire bag
              </button>
              <span>{items.reduce((acc, i) => acc + i.quantity, 0)} total objects</span>
            </div>
          </div>

          {/* Order Summary Box (4 cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            <div className="luxury-card rounded-2xl p-6 space-y-6">
              <h3 className="font-serif-heading text-xl font-bold text-foreground pb-4 border-b border-black/5">
                Summary
              </h3>

              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-secondary" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME15)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 h-10 bg-cream/40 border border-black/10 rounded-lg uppercase tracking-wider focus:outline-none focus:border-accent"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" isLoading={isApplying}>
                  Apply
                </Button>
              </form>

              {coupon && (
                <div className="flex items-center justify-between bg-accent/5 border border-accent/20 px-3 py-2 rounded-lg text-xs text-accent">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5" /> Code: {coupon.code} (
                    {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`})
                  </span>
                  <button
                    onClick={() => setCoupon(null)}
                    className="text-secondary hover:text-destructive underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Line items */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-secondary">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary' : formatCurrency(shipping)}</span>
                </div>

                <div className="flex justify-between text-secondary">
                  <span>Estimated Taxes</span>
                  <span>{formatCurrency(tax)}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-foreground pt-4 border-t border-black/5">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Proceed to checkout */}
              <Link
                href="/checkout"
                onClick={(e) => {
                  if (!profile) {
                    e.preventDefault();
                    toastError('Account Required', 'Please sign in or create an account to proceed to checkout.');
                    openAuthModal('signin');
                  }
                }}
                className="block w-full"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shadow-floating group"
                  leftIcon={!profile ? <Lock className="w-4 h-4" /> : undefined}
                  rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                >
                  {profile ? 'Proceed to Checkout' : 'Sign In to Proceed to Checkout'}
                </Button>
              </Link>

              <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-secondary">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>SSL Encrypted Checkout • Razorpay Payments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
