'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Coupon } from '@/types';
import { calculateSubtotal, calculateDiscount, calculateTax } from '@/lib/utils';
import { useToast } from './useToast';

interface FlyingGhostState {
  id: string;
  image: string;
  startX: number;
  startY: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, sourceElement?: HTMLElement | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon: Coupon | null;
  setCoupon: (c: Coupon | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  flyingGhosts: FlyingGhostState[];
  cartBounceKey: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [flyingGhosts, setFlyingGhosts] = useState<FlyingGhostState[]>([]);
  const [cartBounceKey, setCartBounceKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('atelier_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('atelier_cart', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const triggerFlyingAnimation = useCallback((image: string, sourceElement?: HTMLElement | null) => {
    if (!sourceElement) return;
    const rect = sourceElement.getBoundingClientRect();
    const ghostId = 'ghost-' + Date.now();
    setFlyingGhosts((prev) => [
      ...prev,
      {
        id: ghostId,
        image,
        startX: rect.left + rect.width / 2 - 30,
        startY: rect.top + rect.height / 2 - 30,
      },
    ]);

    setTimeout(() => {
      setCartBounceKey((k) => k + 1);
    }, 600);

    setTimeout(() => {
      setFlyingGhosts((prev) => prev.filter((g) => g.id !== ghostId));
    }, 900);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'> & { quantity?: number }, sourceElement?: HTMLElement | null) => {
      const qtyToAdd = item.quantity || 1;
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === item.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = Math.min(updated[existingIndex].maxStock, updated[existingIndex].quantity + qtyToAdd);
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
          return updated;
        }
        return [...prev, { ...item, quantity: qtyToAdd }];
      });

      if (sourceElement) {
        triggerFlyingAnimation(item.image, sourceElement);
      } else {
        setCartBounceKey((k) => k + 1);
      }

      success('Added to Bag', `${item.title} has been added to your shopping bag.`);
    },
    [triggerFlyingAnimation, success]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: Math.min(item.maxStock, newQty) };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = calculateSubtotal(items);
  const discount = coupon ? calculateDiscount(subtotal, coupon.type, coupon.value) : 0;
  const shipping = subtotal > 250 || subtotal === 0 ? 0 : 25;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = calculateTax(taxableAmount, 8.875);
  const total = Math.max(0, taxableAmount + shipping + tax);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        coupon,
        setCoupon,
        isDrawerOpen,
        setIsDrawerOpen,
        flyingGhosts,
        cartBounceKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
