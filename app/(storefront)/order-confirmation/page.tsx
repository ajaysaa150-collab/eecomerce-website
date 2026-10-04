'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Package, Truck, Check, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'ORD-10042';
  const method = searchParams.get('method') || 'online';
  const total = searchParams.get('total') ? Number(searchParams.get('total')) : null;
  const isCOD = method === 'cod';

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      {/* Animated Checkmark Circle */}
      <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center relative ${
        isCOD ? 'bg-emerald-500/10' : 'bg-success/10'
      }`}>
        <svg
          className={`w-12 h-12 ${isCOD ? 'text-emerald-600' : 'text-success'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            variants={checkmarkVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>
      </div>

      <span className={`text-xs uppercase tracking-label font-bold block mb-2 ${
        isCOD ? 'text-emerald-700' : 'text-success'
      }`}>
        {isCOD ? 'Order Confirmed — Cash on Delivery' : 'Payment & Order Confirmed'}
      </span>

      <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
        {isCOD ? 'Acquisition Registered.' : 'Thank You for Your Order.'}
      </h1>

      <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-md mx-auto mb-8">
        {isCOD
          ? 'Your order has been registered for Cash on Delivery dispatch. Our atelier is hand-inspecting and preparing your items.'
          : 'Your acquisition has been received by our Soho atelier and is being carefully prepared for archival dispatch.'}
      </p>

      {/* Details Box */}
      <div className="luxury-card rounded-2xl p-6 sm:p-8 text-left space-y-4 mb-8">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <span className="text-xs font-semibold text-secondary">Order Identifier</span>
          <span className="font-mono text-sm font-bold text-foreground">{orderNumber}</span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <span className="text-xs font-semibold text-secondary">Payment Protocol</span>
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            {isCOD ? (
              <>
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Cash on Delivery (Pending Collection)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Verified Online Payment</span>
              </>
            )}
          </span>
        </div>

        {isCOD && total && (
          <div className="flex justify-between items-center pb-4 border-b border-black/5 bg-emerald-50/60 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3">
            <span className="text-xs font-bold text-emerald-900">Total Cash Due on Arrival</span>
            <span className="font-mono text-sm font-extrabold text-emerald-900">{formatCurrency(total)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <span className="text-xs font-semibold text-secondary">Estimated Delivery</span>
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-accent" /> 3–5 Business Days
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-secondary">Fulfillment Status</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-accent px-2.5 py-0.5 rounded-full bg-accent/10">
            <Package className="w-3 h-3" /> Processing
          </span>
        </div>

        {isCOD && (
          <div className="mt-4 pt-4 border-t border-black/5 text-[11px] text-secondary leading-relaxed bg-cream/40 p-3 rounded-xl">
            <span className="font-bold text-foreground block mb-1">COD Delivery Instructions:</span>
            Please keep physical cash or UPI ready when the courier arrives. The courier will hand over your packaged items with an official tax invoice.
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href={`/account/orders`} className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            View Order Timeline
          </Button>
        </Link>
        <Link href="/products" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto shadow-floating"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue Browsing
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-secondary">Loading order confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
