import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, overrideCurrency?: string): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('atelier_country_info');
      if (saved) {
        const info = JSON.parse(saved);
        const rate = info.rate || 1.0;
        const currency = overrideCurrency || info.currency || 'USD';
        const locale = info.locale || 'en-US';
        const converted = Math.round(amount * rate * 100) / 100;
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: currency === 'JPY' ? 0 : 2,
          maximumFractionDigits: currency === 'JPY' ? 0 : 2,
        }).format(converted);
      }
    } catch {}
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: overrideCurrency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function calculateSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export function calculateDiscount(subtotal: number, couponType?: 'percentage' | 'fixed', couponValue?: number): number {
  if (!couponType || !couponValue) return 0;
  if (couponType === 'percentage') {
    return Math.round(((subtotal * couponValue) / 100) * 100) / 100;
  }
  return Math.min(subtotal, couponValue);
}

export function calculateTax(amount: number, taxRate: number = 8.875): number {
  return Math.round(((amount * taxRate) / 100) * 100) / 100;
}
