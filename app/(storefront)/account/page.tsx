'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AccountLayoutClient } from '@/components/storefront/AccountLayoutClient';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { useCurrency } from '@/context/CurrencyContext';
import { formatDate } from '@/lib/utils';
import {
  Package,
  MapPin,
  Heart,
  ArrowRight,
  Truck,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  CreditCard,
  Banknote,
  Compass,
  Headphones,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getOrders } from '@/lib/supabase';

export default function AccountDashboardPage() {
  const { profile, user } = useAuth();
  const { wishlistProducts } = useWishlist();
  const { formatPrice } = useCurrency();
  const [allUserOrders, setAllUserOrders] = useState<any[]>([]);
  const [defaultAddressText, setDefaultAddressText] = useState<string>('None Saved');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    const userEmail = (profile?.email || user?.email || '').trim().toLowerCase();
    const userId = profile?.id || user?.id || '';

    // Load user's default address
    const userKey = userId || (userEmail ? userEmail.toLowerCase() : null);
    if (userKey) {
      try {
        const stored = localStorage.getItem(`atelier_addresses_${userKey}`);
        if (stored) {
          const list = JSON.parse(stored);
          const def = list.find((a: any) => a.isDefault) || list[0];
          if (def) {
            setDefaultAddressText(`${def.city}, ${def.state || def.country}`);
          } else {
            setDefaultAddressText('None Saved');
          }
        } else {
          setDefaultAddressText('None Saved');
        }
      } catch {
        setDefaultAddressText('None Saved');
      }
    } else {
      setDefaultAddressText('None Saved');
    }

    if (!userEmail && !userId) {
      setAllUserOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const live = await getOrders();
      if (live && live.length > 0) {
        // Strictly filter to authenticated user
        const filtered = live.filter((o) => {
          const matchId = Boolean(userId && o.user_id && o.user_id === userId);
          const matchEmail = Boolean(userEmail && o.email && o.email.trim().toLowerCase() === userEmail);
          return matchId || matchEmail;
        });

        const mapped = filtered.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          date: o.created_at ? formatDate(o.created_at) : 'Recent',
          status: o.fulfillment_status || 'processing',
          payment_method: o.payment_method || 'cod',
          payment_status: o.payment_status || 'pending',
          tracking_number: o.tracking_number || '',
          tracking_carrier: o.tracking_carrier || 'DHL Express',
          total: o.total,
          itemsCount: o.items?.length || 1,
          items: o.items || [{ title: 'Curated Atelier Object', quantity: 1 }],
        }));

        setAllUserOrders(mapped);
      } else {
        setAllUserOrders([]);
      }
    } catch {
      setAllUserOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.email, profile?.id, user?.email, user?.id]);

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    const handleAuthChange = (e: any) => {
      if (!e.detail) {
        setAllUserOrders([]);
        setDefaultAddressText('None Saved');
        return;
      }
      loadDashboardData();
    };

    window.addEventListener('atelier_order_updated', handleUpdate);
    window.addEventListener('atelier_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('atelier_order_updated', handleUpdate);
      window.removeEventListener('atelier_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadDashboardData]);

  const recentOrders = useMemo(() => allUserOrders.slice(0, 3), [allUserOrders]);
  const latestOrder = allUserOrders[0] || null;

  // Calculate greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Collector';

  // Membership level based on orders
  const memberTier = allUserOrders.length >= 3 ? 'Gold Patron' : allUserOrders.length > 0 ? 'Silver Collector' : 'Archival Member';

  return (
    <AccountLayoutClient>
      <div className="space-y-8">
        {/* 1. Welcome Card with Subtle Luxury Accent */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-cream/30 to-amber-50/20 border border-black/10 p-6 sm:p-8 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{memberTier}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-secondary">
                  Active Status
                </span>
              </div>

              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-foreground">
                {greeting}, {userName}
              </h2>
              <p className="text-xs text-secondary max-w-xl leading-relaxed">
                Welcome to your private atelier command center. Monitor courier tracking, access archival invoices, and manage curated wishlists with white-glove security.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link href="/products">
                <Button variant="primary" size="sm" rightIcon={<Compass className="w-3.5 h-3.5" />}>
                  Explore Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Key Interactive Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Orders */}
          <Link
            href="/account/orders"
            className="group luxury-card rounded-2xl p-4 sm:p-5 bg-white border border-black/5 hover:border-black/20 hover:shadow-elevated transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary group-hover:text-foreground transition-colors">
                Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-serif-heading text-foreground block">
                {allUserOrders.length}
              </span>
              <span className="text-[11px] text-secondary mt-0.5 flex items-center gap-1">
                <span>All Dispatches</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Saved Wishlist */}
          <Link
            href="/account/wishlist"
            className="group luxury-card rounded-2xl p-4 sm:p-5 bg-white border border-black/5 hover:border-black/20 hover:shadow-elevated transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary group-hover:text-foreground transition-colors">
                Wishlist
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-serif-heading text-foreground block">
                {wishlistProducts.length}
              </span>
              <span className="text-[11px] text-secondary mt-0.5 flex items-center gap-1">
                <span>Saved Objects</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Default Address */}
          <Link
            href="/account/addresses"
            className="group luxury-card rounded-2xl p-4 sm:p-5 bg-white border border-black/5 hover:border-black/20 hover:shadow-elevated transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary group-hover:text-foreground transition-colors">
                Shipping
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-foreground truncate block leading-tight">
                {defaultAddressText}
              </span>
              <span className="text-[11px] text-secondary mt-0.5 flex items-center gap-1">
                <span>Address Book</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Patron Privilege */}
          <div className="luxury-card rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white flex flex-col justify-between shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Tier Privilege
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-sm font-serif-heading font-bold text-white block">
                White-Glove Shipping
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Priority packing & direct courier dispatch
              </span>
            </div>
          </div>
        </div>

        {/* 3. Live Active Dispatch Visual Progress (If User Has At Least One Order) */}
        {latestOrder && (
          <div className="luxury-card rounded-3xl p-6 sm:p-8 bg-white border border-black/10 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    Order {latestOrder.order_number}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      latestOrder.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : latestOrder.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {latestOrder.status}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Placed on {latestOrder.date} • {latestOrder.itemsCount} object(s) • Total: {formatPrice(latestOrder.total)}
                </p>
              </div>

              <Link href={`/account/orders/${latestOrder.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                  Live Tracking Details
                </Button>
              </Link>
            </div>

            {/* 4-Step Visual Progress Bar */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Step 1: Confirmed */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground text-[11px]">Confirmed</span>
                </div>

                {/* Step 2: Quality Inspection */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      latestOrder.status === 'processing' || latestOrder.status === 'shipped' || latestOrder.status === 'delivered'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground text-[11px]">Inspected</span>
                </div>

                {/* Step 3: Dispatched */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      latestOrder.status === 'shipped' || latestOrder.status === 'delivered'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground text-[11px]">In Transit</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      latestOrder.status === 'delivered'
                        ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-100'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-foreground text-[11px]">Delivered</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                  style={{
                    width:
                      latestOrder.status === 'delivered'
                        ? '100%'
                        : latestOrder.status === 'shipped'
                        ? '75%'
                        : latestOrder.status === 'processing'
                        ? '50%'
                        : '25%',
                  }}
                />
              </div>

              {/* Waybill / Courier info if present */}
              {latestOrder.tracking_number && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-blue-900 font-semibold">Waybill:</span>
                    <span className="font-mono font-bold text-foreground bg-white px-2 py-0.5 rounded border border-blue-200">
                      {latestOrder.tracking_number}
                    </span>
                  </div>
                  <span className="text-blue-700 font-medium text-[11px]">
                    Courier Carrier: {latestOrder.tracking_carrier}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Quick-Launch Archival Navigation Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="p-5 rounded-2xl bg-white border border-black/5 hover:border-black/20 hover:shadow-subtle transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="font-semibold text-xs text-foreground block group-hover:text-accent transition-colors">
                Order History
              </span>
              <p className="text-[11px] text-secondary">
                View all past dispatches & status
              </p>
            </div>
            <Package className="w-4 h-4 text-secondary group-hover:text-accent transition-colors shrink-0 mt-0.5" />
          </Link>

          <Link
            href="/account/wishlist"
            className="p-5 rounded-2xl bg-white border border-black/5 hover:border-black/20 hover:shadow-subtle transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="font-semibold text-xs text-foreground block group-hover:text-accent transition-colors">
                Saved Wishlist
              </span>
              <p className="text-[11px] text-secondary">
                {wishlistProducts.length} objects bookmarked
              </p>
            </div>
            <Heart className="w-4 h-4 text-secondary group-hover:text-destructive transition-colors shrink-0 mt-0.5" />
          </Link>

          <Link
            href="/account/addresses"
            className="p-5 rounded-2xl bg-white border border-black/5 hover:border-black/20 hover:shadow-subtle transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="font-semibold text-xs text-foreground block group-hover:text-accent transition-colors">
                Address Book
              </span>
              <p className="text-[11px] text-secondary">
                Manage delivery destinations
              </p>
            </div>
            <MapPin className="w-4 h-4 text-secondary group-hover:text-success transition-colors shrink-0 mt-0.5" />
          </Link>

          <Link
            href="/account/settings"
            className="p-5 rounded-2xl bg-white border border-black/5 hover:border-black/20 hover:shadow-subtle transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="font-semibold text-xs text-foreground block group-hover:text-accent transition-colors">
                Profile Settings
              </span>
              <p className="text-[11px] text-secondary">
                Security & contact credentials
              </p>
            </div>
            <Settings className="w-4 h-4 text-secondary group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
          </Link>
        </div>

        {/* 5. Recent Dispatches & Orders Showcase */}
        <div className="luxury-card rounded-3xl p-6 sm:p-8 bg-white border border-black/10 shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div>
              <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-foreground">
                Recent Dispatches
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Review your latest acquisitions and courier movements.
              </p>
            </div>
            <Link
              href="/account/orders"
              className="text-xs text-accent hover:underline font-semibold flex items-center gap-1 shrink-0"
            >
              View All ({allUserOrders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-secondary">
              Synchronizing orders archive...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-cream mx-auto flex items-center justify-center text-secondary/60">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="font-serif-heading text-base font-bold text-foreground">
                Your Archive is Empty
              </h4>
              <p className="text-xs text-secondary max-w-sm mx-auto">
                No orders registered under this profile yet. Discover our curated collection of architectural and lifestyle goods.
              </p>
              <div className="pt-2">
                <Link href="/products">
                  <Button variant="primary" size="md">
                    Explore Modern Catalog
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-cream/20 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{ord.order_number}</span>
                      {ord.payment_method === 'cod' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <Banknote className="w-3 h-3" />
                          COD ({ord.payment_status === 'paid' ? 'Paid' : 'Pending'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-foreground">
                          <CreditCard className="w-3 h-3" />
                          Online ({ord.payment_status === 'paid' ? 'Paid' : 'Pending'})
                        </span>
                      )}
                    </div>
                    <p className="text-secondary text-[11px]">
                      {ord.date} • {ord.itemsCount} curated object(s)
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                          : ord.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                          : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                      }`}
                    >
                      {ord.status}
                    </span>

                    <span className="font-bold text-foreground text-sm">
                      {formatPrice(ord.total)}
                    </span>

                    <Link href={`/account/orders/${ord.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Concierge & White-Glove Support Card */}
        <div className="rounded-3xl bg-neutral-100/80 border border-black/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-heading text-base font-bold text-foreground">
                Dedicated Atelier Concierge
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                Need bespoke shipping assistance, invoice receipts, or delivery rescheduling?
              </p>
            </div>
          </div>

          <a
            href="mailto:ajaysaa789@gmail.com"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-black hover:text-white border border-black/10 text-xs font-semibold text-foreground transition-all shrink-0 self-start sm:self-auto shadow-xs"
          >
            <span>Contact Concierge</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </AccountLayoutClient>
  );
}
