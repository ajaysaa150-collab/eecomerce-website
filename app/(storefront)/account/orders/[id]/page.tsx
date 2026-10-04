'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AccountLayoutClient } from '@/components/storefront/AccountLayoutClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Check, Truck, Package, Clock, ShieldCheck, Printer, AlertCircle, Copy } from 'lucide-react';
import { getOrderById, Order } from '@/lib/supabase';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadOrder = async () => {
    try {
      const data = await getOrderById(params.id);
      if (data) {
        setOrder(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();

    const handleUpdate = (e: any) => {
      const { orderId, updates } = e.detail || {};
      if (orderId === params.id || order?.order_number === orderId) {
        setOrder((prev: any) => (prev ? { ...prev, ...updates } : prev));
      }
      loadOrder();
    };

    window.addEventListener('atelier_order_updated', handleUpdate);
    return () => window.removeEventListener('atelier_order_updated', handleUpdate);
  }, [params.id, order?.order_number]);

  if (isLoading) {
    return (
      <AccountLayoutClient>
        <div className="luxury-card rounded-2xl p-12 text-center text-xs text-secondary">
          Loading order details...
        </div>
      </AccountLayoutClient>
    );
  }

  if (!order) {
    return (
      <AccountLayoutClient>
        <div className="luxury-card rounded-2xl p-12 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold">Order Not Found</h2>
          <p className="text-xs text-secondary">
            We could not locate this order. It may have been archived or removed.
          </p>
          <Link href="/account/orders">
            <Button variant="primary" size="md">
              Return to Order Archive
            </Button>
          </Link>
        </div>
      </AccountLayoutClient>
    );
  }

  const fulfillment = order.fulfillment_status || 'processing';
  const isDelivered = fulfillment === 'delivered';
  const isShipped = fulfillment === 'shipped' || isDelivered;
  const isProcessing = true; // Confirmed orders are at least processing

  const createdDateStr = order.created_at ? formatDate(order.created_at) : 'Recent';
  const carrier = order.tracking_carrier || 'DHL Express';
  const trackingNo = order.tracking_number || 'Awaiting Airway Bill';

  const timelineSteps = [
    {
      title: 'Order Confirmed',
      date: createdDateStr,
      completed: true,
      note: order.payment_method === 'cod' ? 'Cash on Delivery registered' : 'Payment confirmed & authorized',
    },
    {
      title: 'Processing & Hand-Inspection',
      date: createdDateStr,
      completed: isProcessing,
      note: isShipped ? 'Passed quality & packaging inspection' : 'Currently being carefully prepared in our atelier',
    },
    {
      title: `Dispatched with ${carrier}`,
      date: isShipped ? 'In Transit' : 'Pending Dispatch',
      completed: isShipped,
      note: isShipped ? `Waybill: #${trackingNo}` : 'Handover to courier scheduled',
    },
    {
      title: 'Delivered',
      date: isDelivered ? 'Delivered' : 'Estimated 2-4 Days',
      completed: isDelivered,
      note: isDelivered ? 'Successfully delivered to recipient destination' : 'Pending final courier delivery',
    },
  ];

  const address = order.shipping_address as any;

  return (
    <AccountLayoutClient>
      <div className="space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <Link href="/account/orders">
              <button className="p-2 rounded-lg border border-black/10 hover:bg-black/5 text-secondary hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-heading text-2xl font-bold text-foreground">
                  Order {order.order_number}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isDelivered
                      ? 'bg-emerald-100 text-emerald-800'
                      : isShipped
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {fulfillment}
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                {isShipped ? `Dispatched via ${carrier}` : 'Under atelier fulfillment inspection'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Packing Slip
          </Button>
        </div>

        {/* Prominent Shipment Tracking Banner */}
        {order.tracking_number && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                      Courier Partner:
                    </span>
                    <span className="text-xs font-bold text-foreground bg-white/90 px-2.5 py-0.5 rounded border border-blue-200">
                      {carrier}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    Your package has been dispatched. Track your parcel status using the tracking code below.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-blue-200/80 shadow-xs">
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                    Tracking / Waybill No.
                  </p>
                  <p className="font-mono text-sm font-bold text-foreground selection:bg-blue-200">
                    {order.tracking_number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (order.tracking_number) {
                      navigator.clipboard.writeText(order.tracking_number);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-secondary hover:text-foreground transition-colors border border-black/5"
                  title="Copy Tracking Number"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <Check className="w-4 h-4 stroke-[3]" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                      <Copy className="w-3.5 h-3.5 text-secondary" /> Copy
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Timeline Animation */}
        <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Live Fulfillment Timeline
            </h3>
            <span className="text-xs font-mono text-secondary">
              Status: <strong className="text-foreground uppercase">{fulfillment}</strong>
            </span>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10">
            {timelineSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.3 }}
                className="relative"
              >
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                    step.completed ? 'bg-emerald-600 ring-4 ring-emerald-500/20' : 'bg-neutral-300'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="pl-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className={`text-sm font-semibold ${step.completed ? 'text-foreground' : 'text-secondary'}`}>
                      {step.title}
                    </h4>
                    <span className="text-[11px] text-secondary font-mono">{step.date}</span>
                  </div>
                  <p className="text-xs text-secondary mt-1">{step.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        {order.items && order.items.length > 0 && (
          <div className="luxury-card rounded-2xl p-6 space-y-4">
            <h4 className="font-serif-heading text-base font-bold text-foreground pb-2 border-b border-black/5">
              Purchased Objects
            </h4>
            <div className="divide-y divide-black/5">
              {order.items.map((it: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{it.title}</p>
                    <p className="text-secondary mt-0.5">Quantity: {it.quantity || 1}</p>
                  </div>
                  <p className="font-bold text-foreground">
                    {formatCurrency(it.line_total || it.unit_price || 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="luxury-card rounded-2xl p-6 space-y-3 text-xs">
            <h4 className="font-serif-heading text-base font-bold text-foreground">
              Destination Address
            </h4>
            {address ? (
              <>
                <p className="text-foreground font-semibold">{address.fullName || order.email}</p>
                <p className="text-secondary">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-secondary">{address.addressLine2}</p>}
                <p className="text-secondary">
                  {address.city}{address.state ? `, ${address.state}` : ''} {address.zip || ''}
                </p>
                <p className="text-secondary font-medium">{address.country || 'Global'}</p>
                {address.phone && <p className="text-secondary text-[11px]">Phone: {address.phone}</p>}
              </>
            ) : (
              <p className="text-secondary">Atelier Digital Concierge</p>
            )}
          </div>

          <div className="luxury-card rounded-2xl p-6 space-y-3 text-xs">
            <h4 className="font-serif-heading text-base font-bold text-foreground">
              Payment Summary
            </h4>
            <div className="flex justify-between text-secondary">
              <span>Payment Mode</span>
              <span className="text-foreground font-semibold uppercase">{order.payment_method || 'Online'}</span>
            </div>
            <div className="flex justify-between text-secondary">
              <span>Item Subtotal</span>
              <span className="text-foreground font-semibold">{formatCurrency(order.subtotal || order.total)}</span>
            </div>
            {order.shipping_cost !== undefined && (
              <div className="flex justify-between text-secondary">
                <span>Shipping Courier</span>
                <span>{order.shipping_cost === 0 ? 'Complimentary' : formatCurrency(order.shipping_cost)}</span>
              </div>
            )}
            {order.tax_amount !== undefined && (
              <div className="flex justify-between text-secondary">
                <span>Estimated Tax</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t border-black/5">
              <span>Total Amount</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </AccountLayoutClient>
  );
}
