'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Shield,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface AccountLayoutClientProps {
  children: React.ReactNode;
}

export function AccountLayoutClient({ children }: AccountLayoutClientProps) {
  const pathname = usePathname();
  const { profile, user, signOut, isAdmin } = useAuth();

  const links = [
    { label: 'Overview', href: '/account', icon: User },
    { label: 'Order History', href: '/account/orders', icon: Package },
    { label: 'Saved Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Address Book', href: '/account/addresses', icon: MapPin },
    { label: 'Profile Settings', href: '/account/settings', icon: Settings },
  ];

  return (
    <div className="max-w-container mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 w-full">
      {/* Prestigious Collector Profile Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F0F11] text-white p-6 sm:p-8 lg:p-10 mb-8 border border-white/10 shadow-floating">
        {/* Subtle decorative atmosphere glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar with luxury golden ring */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/20 flex items-center justify-center font-serif-heading font-bold text-2xl sm:text-3xl text-white shadow-elevated">
                {profile?.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : (user?.email?.charAt(0).toUpperCase() || 'U')}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0F0F11] flex items-center justify-center text-white shadow-xs"
                title="Verified Collector"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Profile Credentials */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>My Dashboard</span>
                </span>
                {isAdmin ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent text-white">
                    Administrator
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    Verified Collector
                  </span>
                )}
              </div>

              <h1 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {profile?.full_name || 'Collector Portal'}
              </h1>
              <p className="text-xs text-neutral-400 flex items-center gap-2">
                <span className="truncate max-w-[200px] sm:max-w-none">{profile?.email || user?.email}</span>
                <span>•</span>
                <span className="text-neutral-500">Private Atelier Member</span>
              </p>
            </div>
          </div>

          {/* Quick Actions (Admin link / Sign Out) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-neutral-300 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="lg:hidden mb-6 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-xs font-semibold'
                    : 'bg-white text-secondary hover:text-foreground border border-black/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Desktop Sidebar Nav (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-1 bg-white p-3.5 rounded-2xl border border-black/5 shadow-subtle sticky top-28">
          <div className="px-3 py-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
              Navigation
            </span>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cream font-semibold text-foreground'
                    : 'text-secondary hover:text-foreground hover:bg-cream/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent" />}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-black/5">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-destructive hover:bg-red-50 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Panel (9 cols) */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
