'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { useToast } from './useToast';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { info } = useToast();

  const loadUserWishlist = useCallback(() => {
    try {
      const demoUser = localStorage.getItem('atelier_demo_user');
      const user = demoUser ? JSON.parse(demoUser) : null;
      const userKey = user?.id || (user?.email ? user.email.toLowerCase() : null);
      if (!userKey) {
        setWishlistProducts([]);
        return;
      }
      const stored = localStorage.getItem(`atelier_wishlist_${userKey}`);
      if (stored) {
        setWishlistProducts(JSON.parse(stored));
      } else {
        setWishlistProducts([]);
      }
    } catch {
      setWishlistProducts([]);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadUserWishlist();

    const handleAuthChange = (e: any) => {
      if (!e.detail) {
        setWishlistProducts([]);
        return;
      }
      loadUserWishlist();
    };

    window.addEventListener('atelier_auth_changed', handleAuthChange);
    return () => window.removeEventListener('atelier_auth_changed', handleAuthChange);
  }, [loadUserWishlist]);

  useEffect(() => {
    if (isMounted) {
      try {
        const demoUser = localStorage.getItem('atelier_demo_user');
        const user = demoUser ? JSON.parse(demoUser) : null;
        const userKey = user?.id || (user?.email ? user.email.toLowerCase() : null);
        if (userKey) {
          localStorage.setItem(`atelier_wishlist_${userKey}`, JSON.stringify(wishlistProducts));
        }
      } catch {}
    }
  }, [wishlistProducts, isMounted]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistProducts.some((p) => p.id === productId),
    [wishlistProducts]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlistProducts((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        if (exists) {
          info('Removed from Wishlist', `${product.title} removed.`);
          return prev.filter((p) => p.id !== product.id);
        } else {
          info('Saved to Wishlist', `${product.title} saved to your collection.`);
          return [...prev, product];
        }
      });
    },
    [info]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds: wishlistProducts.map((p) => p.id),
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
