'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  Globe,
  Image as ImageIcon,
  BarChart3,
  ExternalLink,
  ChevronRight,
  LogOut,
  Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Customer Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Brand & Settings', href: '/admin/settings', icon: Settings },
    { label: 'SEO Control', href: '/admin/seo', icon: Globe },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-black/10 flex flex-col justify-between h-full min-h-screen">
      <div>
        {/* Brand header */}
        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-serif-heading text-xl font-bold tracking-tight text-foreground">
              BRANDWORLD
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-foreground text-white">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-foreground text-white font-semibold shadow-sm'
                    : 'text-secondary hover:text-foreground hover:bg-cream/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-secondary'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-black/5 space-y-2 bg-cream/20">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-secondary hover:text-foreground hover:bg-black/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> View Storefront
          </span>
          <span className="text-[10px] text-accent font-medium">Live</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
