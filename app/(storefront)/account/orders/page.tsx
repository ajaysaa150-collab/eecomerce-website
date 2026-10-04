'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AccountLayoutClient } from '@/components/storefront/AccountLayoutClient';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Package, ArrowRight, Banknote, CreditCard, RefreshCw, Truck } from 'lucide-react';
import { getOrders, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function OrderHistoryPage() {
  const { user, profile } = useAuth();
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveOrders = useCallback(async () => {
    try {
      const userEmail = (profile?.email || user?.email || '').trim().toLowerCase();
      const userId = profile?.id || user?.id || '';

      // If no user is logged in, show NO orders
      if (!userEmail && !userId) {
        setOrdersList([]);
        return;
      }

      const live = await getOrders();
      if (live && live.length > 0) {
        // Strictly filter by current authenticated user
        const filtered = live.filter((o) => {
          const matchId = Boolean(userId && o.user_id && o.user_id === userId);
          const matchEmail = Boolean(userEmail && o.email && o.email.trim().toLowerCase() === userEmail);
          return matchId || matchEmail;
        });

        const mapped = filtered.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          date: o.created_at
            ? new Date(o.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recent',
          total: o.total,
          payment_method: o.payment_method || 'cod',
          payment_status: o.payment_status || 'pending',
          fulfillment_status: o.fulfillment_status || 'processing',
          tracking_number: o.tracking_number || '',
          tracking_carrier: o.tracking_carrier || '',
          items:
            o.items && o.items.length > 0
              ? o.items.map((it: any) => ({ title: it.title, qty: it.quantity || 1 }))
              : [{ title: 'Curated Atelier Selection', qty: 1 }],
        }));

        setOrdersList(mapped);
      } else {
        setOrdersList([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [profile?.email, profile?.id, user?.email, user?.id]);

  useEffect(() => {
    const userEmail = (profile?.email || user?.email || '').trim().toLowerCase();
    const userId = profile?.id || user?.id || '';

    if (!userEmail && !userId) {
      setOrdersList([]);
      setIsLoading(false);
      return;
    }

    fetchLiveOrders();

    // 1. Listen for local custom event dispatched from admin order updates
    const handleOrderUpdated = (e: any) => {
      const { orderId, updates } = e.detail || {};
      if (orderId && updates) {
        setOrdersList((prev) =>
          prev.map((ord) => {
            if (ord.id === orderId || ord.order_number === orderId) {
              return { ...ord, ...updates };
            }
            return ord;
          })
        );
      }
      fetchLiveOrders();
    };

    const handleAuthChanged = (e: any) => {
      if (!e.detail) {
        setOrdersList([]);
        return;
      }
      fetchLiveOrders();
    };

    window.addEventListener('atelier_order_updated', handleOrderUpdated);
    window.addEventListener('atelier_auth_changed', handleAuthChanged);
    window.addEventListener('storage', fetchLiveOrders);

    // 2. Supabase Realtime listener on orders table
    let channel: any = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('public:orders_storefront')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
              if (payload.eventType === 'UPDATE' && payload.new) {
                const updated = payload.new;
                setOrdersList((prev) =>
                  prev.map((ord) => {
                    if (ord.id === updated.id || ord.order_number === updated.order_number) {
                      return {
                        ...ord,
                        fulfillment_status: updated.fulfillment_status,
                        payment_status: updated.payment_status,
                        tracking_number: updated.tracking_number || ord.tracking_number,
                        tracking_carrier: updated.tracking_carrier || ord.tracking_carrier,
                      };
                    }
                    return ord;
                  })
                );
              }
              fetchLiveOrders();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    return () => {
      window.removeEventListener('atelier_order_updated', handleOrderUpdated);
      window.removeEventListener('atelier_auth_changed', handleAuthChanged);
      window.removeEventListener('storage', fetchLiveOrders);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchLiveOrders, profile, user]);

  return (
    <AccountLayoutClient>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-foreground">
              Order Archive
            </h2>
            <p className="text-xs text-secondary mt-1">
              Review real-time fulfillment updates, tracking numbers, and delivery timelines.
            </p>
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchLiveOrders();
            }}
            className="p-2 text-secondary hover:text-foreground rounded-lg border border-black/5 hover:bg-black/5 transition-colors flex items-center gap-1.5 text-xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="luxury-card rounded-2xl p-12 text-center text-xs text-secondary">
            Loading order records...
          </div>
        ) : ordersList.length === 0 ? (
          <div className="luxury-card rounded-2xl p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-secondary/40 mx-auto" />
            <h3 className="font-serif-heading text-lg font-bold text-foreground">No Orders Found</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Discover our latest collections and curations.
            </p>
            <Link href="/products" className="inline-block pt-2">
              <Button variant="primary" size="md">
                Explore Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersList.map((ord) => (
              <div key={ord.id} className="luxury-card rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/5 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground block">
                        {ord.order_number}
                      </span>
                      {ord.payment_method === 'cod' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <Banknote className="w-3 h-3" />
                          COD ({ord.payment_status === 'paid' ? 'Paid' : 'Pay on Delivery'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-foreground">
                          <CreditCard className="w-3 h-3" />
                          Online ({ord.payment_status === 'paid' ? 'Paid' : 'Pending'})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-secondary">Placed on {ord.date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        ord.fulfillment_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                          : ord.fulfillment_status === 'shipped'
                          ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                          : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                      }`}
                    >
                      {ord.fulfillment_status}
                    </span>

                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(ord.total)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {ord.items.map((it: { title: string; qty: number }, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{it.title}</span>
                      <span className="text-secondary">Qty: {it.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking Badge if available */}
                {ord.tracking_number && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-blue-900 font-semibold">Tracking Number:</span>
                      <span className="font-mono font-bold text-foreground bg-white px-2 py-0.5 rounded border border-blue-200">
                        {ord.tracking_number}
                      </span>
                    </div>
                    {ord.tracking_carrier && (
                      <span className="text-blue-700 font-medium text-[11px] bg-blue-100/80 px-2 py-0.5 rounded-full">
                        Courier: {ord.tracking_carrier}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-black/5 flex justify-end">
                  <Link href={`/account/orders/${ord.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Tracking & Timeline
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayoutClient>
  );
}
