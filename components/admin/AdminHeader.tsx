'use client';

import React from 'react';
import { Menu, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  title: string;
}

export function AdminHeader({ onToggleMobileMenu, title }: AdminHeaderProps) {
  const { profile, signOut } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-black/10 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-secondary hover:text-foreground -ml-2"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-foreground font-serif-heading">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Admin info pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-black/5 text-xs">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span className="text-secondary font-medium">Logged in:</span>
          <span className="font-semibold text-foreground">{profile?.full_name}</span>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-foreground text-white flex items-center justify-center text-xs font-bold">
          {profile?.full_name?.charAt(0) || 'A'}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
          title="Sign Out to Storefront"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
