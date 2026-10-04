'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Category } from '@/types';
import { getProducts, getCategories } from '@/lib/supabase';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import { Button } from '@/components/ui/Button';
import { Filter, X, ChevronDown, SlidersHorizontal, Loader2 } from 'lucide-react';

interface PLPClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export function PLPClient({ initialProducts, categories }: PLPClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategorySlug = searchParams.get('category') || '';
  const selectedSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('search') || '';

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [catList, setCatList] = useState<Category[]>(categories);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [displayLimit, setDisplayLimit] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const refreshProducts = async () => {
      try {
        const live = await getProducts();
        if (Array.isArray(live)) {
          setAllProducts(live);
        }
      } catch {}
    };

    const refreshCategories = async () => {
      try {
        const liveCats = await getCategories();
        if (Array.isArray(liveCats)) {
          setCatList(liveCats);
        }
      } catch {}
    };

    refreshProducts();
    refreshCategories();
    window.addEventListener('atelier_products_updated', refreshProducts);
    window.addEventListener('atelier_categories_updated', refreshCategories);
    window.addEventListener('storage', () => {
      refreshProducts();
      refreshCategories();
    });
    return () => {
      window.removeEventListener('atelier_products_updated', refreshProducts);
      window.removeEventListener('atelier_categories_updated', refreshCategories);
      window.removeEventListener('storage', () => {});
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Category
    if (selectedCategorySlug) {
      const category = catList.find((c) => c.slug === selectedCategorySlug);
      if (category) {
        list = list.filter((p) => p.category_id === category.id);
      }
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Price range
    list = list.filter((p) => {
      const price = p.sale_price ?? p.price;
      return price >= minPrice && price <= maxPrice;
    });

    // In stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock_quantity > 0);
    }

    // Sort
    if (selectedSort === 'price-low') {
      list.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    } else if (selectedSort === 'price-high') {
      list.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    } else if (selectedSort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    return list;
  }, [allProducts, catList, selectedCategorySlug, searchQuery, minPrice, maxPrice, inStockOnly, selectedSort]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(1000);
    setInStockOnly(false);
    router.push('/products');
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayLimit((prev) => prev + 4);
      setIsLoadingMore(false);
    }, 400);
  };

  const hasActiveFilters = Boolean(
    selectedCategorySlug ||
      searchQuery ||
      inStockOnly ||
      minPrice > 0 ||
      maxPrice < 1000
  );

  return (
    <div className="max-w-container mx-auto px-6 sm:px-12 py-10 w-full">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-black/5 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
            Archival Catalog
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-foreground">
            {selectedCategorySlug
              ? catList.find((c) => c.slug === selectedCategorySlug)?.name || 'Collection'
              : searchQuery
              ? `Search: "${searchQuery}"`
              : 'All Masterworks'}
          </h1>
          <p className="text-xs text-secondary mt-1">
            Showing {Math.min(displayLimit, filteredProducts.length)} of {filteredProducts.length} objects
          </p>
        </div>

        {/* Sort dropdown & Mobile filter trigger */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden h-10 px-4 rounded-lg border border-black/10 bg-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>

          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="appearance-none h-10 pl-4 pr-9 bg-white border border-black/10 rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="featured">Sort: Curated</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-secondary absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-secondary mr-1">Active filters:</span>

          {selectedCategorySlug && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-foreground text-xs font-medium border border-black/5"
            >
              {catList.find((c) => c.slug === selectedCategorySlug)?.name}
              <button onClick={() => updateParam('category', null)} className="hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          )}

          {searchQuery && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-foreground text-xs font-medium border border-black/5"
            >
              &quot;{searchQuery}&quot;
              <button onClick={() => updateParam('search', null)} className="hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          )}

          {(minPrice > 0 || maxPrice < 1000) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-foreground text-xs font-medium border border-black/5">
              ${minPrice} - ${maxPrice}
              <button
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(1000);
                }}
                className="hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-foreground text-xs font-medium border border-black/5">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-accent hover:underline ml-2 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main PLP Body: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-28 bg-white p-6 rounded-2xl border border-black/5 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs text-secondary hover:text-destructive">
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-label font-bold text-secondary mb-3">
              Categories
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => updateParam('category', null)}
                className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${
                  !selectedCategorySlug ? 'bg-cream text-foreground font-semibold' : 'text-secondary hover:text-foreground'
                }`}
              >
                All Goods
              </button>
              {catList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${
                    selectedCategorySlug === c.slug ? 'bg-cream text-foreground font-semibold' : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs uppercase tracking-label font-bold text-secondary mb-3">
              Price Range
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>${minPrice}</span>
                <span>${maxPrice}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-xs uppercase tracking-label font-bold text-secondary mb-3">
              Availability
            </h4>
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-black/20 text-accent focus:ring-accent"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area (3 cols on large = 4 total columns layout) */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-2xl border border-black/5 p-8">
              <h3 className="font-serif-heading text-2xl font-medium text-foreground mb-2">
                No items match your criteria
              </h3>
              <p className="text-xs text-secondary max-w-sm mx-auto mb-6">
                Try widening your price range or clearing category filters to view our full archive.
              </p>
              <Button variant="secondary" onClick={clearAllFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.slice(0, displayLimit).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {displayLimit < filteredProducts.length && (
                <div className="mt-12 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                  >
                    Load More Essentials
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative bg-white rounded-t-3xl p-6 shadow-floating z-10 max-h-[85vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <h3 className="font-serif-heading text-xl font-bold">Filters</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              {/* Category selector */}
              <div>
                <h4 className="text-xs uppercase tracking-label font-bold text-secondary mb-2">Category</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateParam('category', null)}
                    className={`px-3 py-1.5 text-xs rounded-full border ${
                      !selectedCategorySlug ? 'bg-foreground text-white' : 'border-black/10'
                    }`}
                  >
                    All
                  </button>
                  {catList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateParam('category', c.slug)}
                      className={`px-3 py-1.5 text-xs rounded-full border ${
                        selectedCategorySlug === c.slug ? 'bg-foreground text-white' : 'border-black/10'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max price slider */}
              <div>
                <h4 className="text-xs uppercase tracking-label font-bold text-secondary mb-2">Max Price (${maxPrice})</h4>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={25}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                Apply Filters ({filteredProducts.length})
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
