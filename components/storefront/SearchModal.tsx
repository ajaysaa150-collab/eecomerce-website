'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { Product } from '@/types';
import { getProducts } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('atelier_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      const products = await getProducts({ search: query });
      setResults(products);
      setIsLoading(false);
      setSelectedIndex(0);
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const saveRecentSearch = (text: string) => {
    const updated = [text, ...recentSearches.filter((s) => s.toLowerCase() !== text.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('atelier_recent_searches', JSON.stringify(updated));
    } catch {
      //
    }
  };

  const handleSelectProduct = (product: Product) => {
    saveRecentSearch(product.title);
    onClose();
    router.push(`/products/${product.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectProduct(results[selectedIndex]);
      } else if (query.trim()) {
        saveRecentSearch(query);
        onClose();
        router.push(`/products?search=${encodeURIComponent(query)}`);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Search container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-3xl mx-auto mt-12 sm:mt-20 px-4 z-10"
          >
            <div className="bg-white rounded-2xl shadow-floating border border-black/10 overflow-hidden">
              {/* Input row */}
              <div className="flex items-center px-6 py-4 border-b border-black/5 gap-3">
                <Search className="w-5 h-5 text-secondary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search by title, material, design, or collection..."
                  className="flex-1 bg-transparent text-base sm:text-lg text-foreground placeholder:text-secondary/60 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 text-secondary hover:text-foreground text-xs"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-secondary hover:text-foreground rounded-full hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results dropdown */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-secondary animate-pulse">
                    Searching archive catalog...
                  </div>
                ) : query && results.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-medium text-foreground">No matching essentials found</p>
                    <p className="text-xs text-secondary mt-1">
                      Try searching for &quot;speaker&quot;, &quot;watch&quot;, &quot;leather&quot;, or browse all items.
                    </p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-label text-secondary font-semibold px-3 py-1">
                      Results ({results.length})
                    </div>
                    {results.map((product, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected ? 'bg-cream text-foreground' : 'hover:bg-cream/50'
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-black/5 shrink-0">
                            <Image
                              src={product.images[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200'}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">{product.title}</h4>
                            <p className="text-xs text-secondary line-clamp-1">{product.description.replace(/<[^>]+>/g, '')}</p>
                          </div>
                          <div className="text-sm font-semibold text-foreground shrink-0">
                            {formatCurrency(product.sale_price ?? product.price)}
                          </div>
                          <ArrowRight className={`w-4 h-4 text-secondary ${isSelected ? 'opacity-100 translate-x-1' : 'opacity-0'} transition-all`} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    {recentSearches.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[11px] uppercase tracking-label text-secondary font-semibold px-3 py-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Recent Searches
                        </div>
                        <div className="flex flex-wrap gap-2 px-3 py-2">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => {
                                setQuery(term);
                              }}
                              className="px-3 py-1 text-xs rounded-full bg-cream hover:bg-neutral-200 text-foreground transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] uppercase tracking-label text-secondary font-semibold px-3 py-1">
                      Popular Collections
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-3 py-2">
                      {['Audio & Acoustics', 'Time & Horology', 'Leather & Carry', 'Living & Object'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setQuery(cat.split(' ')[0]);
                          }}
                          className="text-left text-xs font-medium py-2 px-3 rounded-lg border border-black/5 hover:border-black/20 hover:bg-cream/40 transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
