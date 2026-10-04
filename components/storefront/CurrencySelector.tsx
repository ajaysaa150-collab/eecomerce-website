'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, CountryConfig } from '@/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';

interface CurrencySelectorProps {
  variant?: 'header' | 'footer' | 'compact';
}

export function CurrencySelector({ variant = 'header' }: CurrencySelectorProps) {
  const { currentCountry, setCountry, availableCountries } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCountries = availableCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.currency.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === 'footer'
            ? 'flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 bg-white/60 hover:bg-white text-xs text-foreground transition-all shadow-subtle cursor-pointer'
            : variant === 'compact'
            ? 'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-secondary hover:text-foreground transition-colors cursor-pointer'
            : 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-black/10 hover:border-black/25 bg-white/90 hover:bg-white text-xs font-semibold text-foreground transition-all shadow-xs shrink-0 cursor-pointer'
        }
        aria-label="Select Country and Currency"
      >
        <span className="text-sm leading-none shrink-0">{currentCountry.flag}</span>
        <span className="font-bold tracking-tight text-xs whitespace-nowrap">
          {currentCountry.currency} <span className="text-secondary/80 font-medium">({currentCountry.symbol})</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-elevated border border-black/10 p-2 z-50 text-xs"
          >
            <div className="p-2 border-b border-black/5">
              <div className="flex items-center gap-1.5 text-secondary mb-2">
                <Globe className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-wider text-[10px]">Select Country & Currency</span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  placeholder="Search country or currency..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-100/70 border-none text-xs focus:ring-1 focus:ring-accent outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
              {filteredCountries.map((c) => {
                const isSelected = c.code === currentCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountry(c.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-cream text-foreground font-semibold'
                        : 'hover:bg-black/5 text-secondary hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{c.flag}</span>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-[10px] text-secondary">
                          {c.currency} • {c.symbol}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-accent" />}
                  </button>
                );
              })}

              {filteredCountries.length === 0 && (
                <div className="py-4 text-center text-secondary text-xs">
                  No matching countries found.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
