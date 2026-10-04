'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { validateCoupon } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/context/CurrencyContext';

export function CartDrawer() {
  const { currentCountry } = useCurrency();
  const { profile, openAuthModal } = useAuth();
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon,
    setCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const { success, error: toastError } = useToast();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const result = await validateCoupon(couponInput, subtotal);
    setIsApplyingCoupon(false);

    if (result.valid && result.coupon) {
      setCoupon(result.coupon);
      setCouponInput('');
      success('Coupon Applied', `Code ${result.coupon.code} applied successfully.`);
    } else {
      toastError('Coupon Error', result.message || 'Invalid promotion code');
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Slide-over Panel from Right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-floating border-l border-black/10 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-foreground" />
                  <h2 className="text-lg font-serif-heading font-semibold text-foreground">
                    Shopping Bag
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cream text-secondary">
                    {items.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-secondary hover:text-foreground rounded-lg hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-5 text-secondary">
                      <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Your bag is empty</h3>
                    <p className="text-xs text-secondary max-w-xs leading-relaxed mb-6">
                      Explore our collection of precision-engineered home essentials and timeless instruments.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setIsDrawerOpen(false)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                    className="flex flex-col divide-y divide-black/5"
                  >
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, x: 50, marginBottom: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.25 }}
                          className="py-4 flex gap-4 items-center"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream border border-black/5 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover object-center"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-secondary mt-0.5 font-medium">
                              {formatCurrency(item.price)}
                            </p>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-black/10 rounded-md overflow-hidden bg-cream/50 h-8">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="px-2.5 hover:bg-black/5 text-xs font-semibold"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="px-2.5 hover:bg-black/5 text-xs font-semibold"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-secondary hover:text-destructive p-1 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* Footer with Calculations and Checkout CTA */}
              {items.length > 0 && (
                <div className="px-6 py-5 border-t border-black/5 bg-cream/30 space-y-4">
                  {/* Coupon form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-secondary" />
                      <input
                        type="text"
                        placeholder="Promo code (try WELCOME15)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 h-9 bg-white border border-black/10 rounded-lg uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-accent"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      isLoading={isApplyingCoupon}
                    >
                      Apply
                    </Button>
                  </form>

                  {coupon && (
                    <div className="flex items-center justify-between bg-accent/5 border border-accent/20 px-3 py-1.5 rounded-lg text-xs text-accent">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5" /> Code: {coupon.code} (
                        {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`})
                      </span>
                      <button
                        onClick={() => setCoupon(null)}
                        className="text-secondary hover:text-destructive underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-secondary">
                      <span>Subtotal</span>
                      <span className="text-foreground font-medium">{formatCurrency(subtotal)}</span>
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
                      <span>Estimated Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-semibold text-foreground pt-2 border-t border-black/5">
                      <span>Estimated Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    href="/checkout"
                    onClick={(e) => {
                      if (!profile) {
                        e.preventDefault();
                        toastError('Account Required', 'Please sign in or create an account to proceed to checkout.');
                        openAuthModal('signin');
                        return;
                      }
                      setIsDrawerOpen(false);
                    }}
                    className="block w-full"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full shadow-floating group"
                      rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    >
                      {profile ? 'Proceed to Checkout' : 'Sign In to Complete Purchase'}
                    </Button>
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-secondary">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    <span>Encrypted & secure checkout with Razorpay</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
