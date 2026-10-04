'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
  rate: number; // 1 USD = rate units of this currency
  locale: string;
  phoneCode: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    flag: '🇮🇳',
    rate: 83.5,
    locale: 'en-IN',
    phoneCode: '+91',
  },
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    rate: 1.0,
    locale: 'en-US',
    phoneCode: '+1',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    flag: '🇬🇧',
    rate: 0.79,
    locale: 'en-GB',
    phoneCode: '+44',
  },
  {
    code: 'EU',
    name: 'Germany (Eurozone)',
    currency: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
    rate: 0.92,
    locale: 'de-DE',
    phoneCode: '+49',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    symbol: 'د.إ',
    flag: '🇦🇪',
    rate: 3.67,
    locale: 'ar-AE',
    phoneCode: '+971',
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    symbol: 'CA$',
    flag: '🇨🇦',
    rate: 1.36,
    locale: 'en-CA',
    phoneCode: '+1',
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    flag: '🇦🇺',
    rate: 1.52,
    locale: 'en-AU',
    phoneCode: '+61',
  },
  {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    symbol: 'S$',
    flag: '🇸🇬',
    rate: 1.34,
    locale: 'en-SG',
    phoneCode: '+65',
  },
  {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    symbol: '¥',
    flag: '🇯🇵',
    rate: 155.0,
    locale: 'ja-JP',
    phoneCode: '+81',
  },
];

interface CurrencyContextType {
  currentCountry: CountryConfig;
  setCountry: (countryCode: string) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  availableCountries: CountryConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to India or stored country
  const [currentCountry, setCurrentCountry] = useState<CountryConfig>(COUNTRIES[0]);

  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('atelier_country');
      if (savedCode) {
        const found = COUNTRIES.find(
          (c) => c.code.toUpperCase() === savedCode.toUpperCase()
        );
        if (found) {
          setCurrentCountry(found);
          localStorage.setItem('atelier_country_info', JSON.stringify(found));
          return;
        }
      }
      // If nothing saved, store initial default
      localStorage.setItem('atelier_country', COUNTRIES[0].code);
      localStorage.setItem('atelier_country_info', JSON.stringify(COUNTRIES[0]));
    } catch {}
  }, []);

  const setCountry = (countryCode: string) => {
    const found = COUNTRIES.find(
      (c) => c.code.toUpperCase() === countryCode.toUpperCase()
    );
    if (found) {
      setCurrentCountry(found);
      try {
        localStorage.setItem('atelier_country', found.code);
        localStorage.setItem('atelier_country_info', JSON.stringify(found));
        window.dispatchEvent(new CustomEvent('atelier_currency_changed', { detail: found }));
      } catch {}
    }
  };

  const convertPrice = (amountInUSD: number): number => {
    return Math.round(amountInUSD * currentCountry.rate * 100) / 100;
  };

  const formatPrice = (amountInUSD: number): string => {
    const converted = convertPrice(amountInUSD);
    try {
      return new Intl.NumberFormat(currentCountry.locale, {
        style: 'currency',
        currency: currentCountry.currency,
        minimumFractionDigits: currentCountry.currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currentCountry.currency === 'JPY' ? 0 : 2,
      }).format(converted);
    } catch {
      return `${currentCountry.symbol}${converted.toLocaleString()}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCountry,
        setCountry,
        formatPrice,
        convertPrice,
        availableCountries: COUNTRIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      currentCountry: COUNTRIES[0],
      setCountry: () => {},
      formatPrice: (amt: number) => `₹${Math.round(amt * 83.5).toLocaleString()}`,
      convertPrice: (amt: number) => amt * 83.5,
      availableCountries: COUNTRIES,
    };
  }
  return context;
}
