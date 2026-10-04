import { createClient } from '@supabase/supabase-js';
import { initialProducts, initialCategories, initialHeroSlides, initialSiteSettings, initialSEOSettings } from './mockData';
import { Product, Category, HeroSlide, SiteSettings, SEOSettings, Order, Review, Coupon } from '@/types';
import { slugify, formatCurrency } from './utils';
export type { Order };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-atelier.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key-atelier-preview' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// In-memory / localStorage fallback cache for local dev persistence
let memoryOrders: Order[] = [];
let memorySubscribers: string[] = [];
let memoryReviews: Review[] = [
  {
    id: 'rev-1',
    product_id: 'p0000000-0000-0000-0000-000000000001',
    user_id: 'user-sample',
    user_name: 'Marcus Vance',
    rating: 5,
    title: 'Exquisite acoustic balance and industrial design',
    body: 'The solid aluminum chassis feels sculpted rather than assembled. Low-frequency separation is uncanny for its footprint.',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rev-2',
    product_id: 'p0000000-0000-0000-0000-000000000002',
    user_id: 'user-sample-2',
    user_name: 'Elena Rostova',
    rating: 5,
    title: 'Bauhaus perfection on the wrist',
    body: 'Remarkable accuracy from the automatic caliber. The double-domed sapphire crystal catches ambient light with zero distortion.',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

let memoryCoupons: Coupon[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    min_order_amount: 100,
    times_used: 12,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    code: 'ATELIER50',
    type: 'fixed',
    value: 50,
    min_order_amount: 300,
    times_used: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (!error && data) return data as SiteSettings;
    } catch (err) {
      console.warn('Falling back to local site settings:', err);
    }
  }
  return initialSiteSettings;
}

export async function getSEOSettings(): Promise<SEOSettings> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('seo_settings').select('*').limit(1).single();
      if (!error && data) return data as SEOSettings;
    } catch (err) {
      console.warn('Falling back to local SEO settings:', err);
    }
  }
  return initialSEOSettings;
}

// Stored custom categories cache merged with initialCategories and Supabase
export function getStoredCustomCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('atelier_custom_categories');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredCustomCategories(categories: Category[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('atelier_custom_categories', JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('atelier_categories_updated', { detail: categories }));
  } catch {}
}

export async function createCategory(catData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  const newCat: Category = {
    ...catData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now(),
    sort_order: catData.sort_order || Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('categories').insert(newCat);
    } catch (err) {
      console.warn('Supabase category insert warning:', err);
    }
  }

  const existing = getStoredCustomCategories();
  const updated = [...existing, newCat];
  saveStoredCustomCategories(updated);

  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('categories').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase category update warning:', err);
    }
  }

  const existing = getStoredCustomCategories();
  const idx = existing.findIndex((c) => c.id === id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...updates, updated_at: new Date().toISOString() };
    saveStoredCustomCategories(existing);
    return existing[idx];
  } else {
    const initCat = initialCategories.find((c) => c.id === id);
    if (initCat) {
      const updated = { ...initCat, ...updates, updated_at: new Date().toISOString() };
      saveStoredCustomCategories([...existing, updated]);
      return updated;
    }
  }
  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase category delete warning:', err);
    }
  }

  const existing = getStoredCustomCategories();
  const filtered = existing.filter((c) => c.id !== id);
  saveStoredCustomCategories(filtered);

  try {
    const deletedInitial = JSON.parse(localStorage.getItem('atelier_deleted_categories') || '[]');
    if (!deletedInitial.includes(id)) {
      deletedInitial.push(id);
      localStorage.setItem('atelier_deleted_categories', JSON.stringify(deletedInitial));
    }
    window.dispatchEvent(new CustomEvent('atelier_categories_updated'));
  } catch {}

  return true;
}

export async function getCategories(): Promise<Category[]> {
  let supabaseCategories: Category[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        supabaseCategories = data as Category[];
      }
    } catch (err) {
      console.warn('Falling back to local categories:', err);
    }
  }

  const customCategories = getStoredCustomCategories();
  let deletedIds: string[] = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_categories') || '[]');
  } catch {}

  const mergedMap = new Map<string, Category>();

  // 1. Initial categories
  initialCategories.forEach((c) => {
    if (!deletedIds.includes(c.id)) {
      mergedMap.set(c.id, c);
    }
  });

  // 2. Custom categories from admin
  customCategories.forEach((c) => {
    if (!deletedIds.includes(c.id)) {
      mergedMap.set(c.id, c);
    }
  });

  // 3. Supabase live categories
  supabaseCategories.forEach((c) => {
    if (!deletedIds.includes(c.id)) {
      mergedMap.set(c.id, c);
    }
  });

  const result = Array.from(mergedMap.values());
  return result;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as HeroSlide[];
    } catch (err) {
      console.warn('Falling back to local hero slides:', err);
    }
  }
  return initialHeroSlides;
}

// Stored custom products cache merged with initialProducts and Supabase
export function getStoredCustomProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('atelier_custom_products');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredCustomProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('atelier_custom_products', JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('atelier_products_updated', { detail: products }));
  } catch {}
}

export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const newProduct: Product = {
    ...productData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'p-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images:
      productData.images && productData.images.length > 0
        ? productData.images
        : [
            {
              id: 'img-' + Date.now(),
              product_id: '',
              image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
              sort_order: 1,
            },
          ],
  };

  if (isSupabaseConfigured()) {
    try {
      const { images, category, variants, options, ...prodRecord } = newProduct;
      const { data, error } = await supabase.from('products').insert(prodRecord).select().single();
      if (!error && data && images && images.length > 0) {
        try {
          await supabase.from('product_images').insert(
            images.map((img, idx) => ({
              product_id: data.id,
              image_url: img.image_url,
              sort_order: idx + 1,
              alt_text: newProduct.title,
            }))
          );
        } catch {}
      }
    } catch (err) {
      console.warn('Supabase product insert error:', err);
    }
  }

  const existing = getStoredCustomProducts();
  const updated = [newProduct, ...existing];
  saveStoredCustomProducts(updated);

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const { images, category, variants, options, ...prodRecord } = updates as any;
      await supabase.from('products').update(prodRecord).eq('id', id);
    } catch (err) {
      console.warn('Supabase product update error:', err);
    }
  }

  const existing = getStoredCustomProducts();
  const idx = existing.findIndex((p) => p.id === id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...updates, updated_at: new Date().toISOString() };
    saveStoredCustomProducts(existing);
    return existing[idx];
  } else {
    const initProd = initialProducts.find((p) => p.id === id);
    if (initProd) {
      const updated = { ...initProd, ...updates, updated_at: new Date().toISOString() };
      saveStoredCustomProducts([updated, ...existing]);
      return updated;
    }
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase product delete error:', err);
    }
  }

  const existing = getStoredCustomProducts();
  const filtered = existing.filter((p) => p.id !== id);
  saveStoredCustomProducts(filtered);

  try {
    const deletedInitial = JSON.parse(localStorage.getItem('atelier_deleted_products') || '[]');
    if (!deletedInitial.includes(id)) {
      deletedInitial.push(id);
      localStorage.setItem('atelier_deleted_products', JSON.stringify(deletedInitial));
    }
    window.dispatchEvent(new CustomEvent('atelier_products_updated'));
  } catch {}

  return true;
}

export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  status?: 'active' | 'draft' | 'archived' | 'all';
}): Promise<Product[]> {
  let supabaseProducts: Product[] = [];
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('products').select('*, category:categories(*), images:product_images(*), variants:product_variants(*)');
      if (options?.categorySlug) {
        query = query.eq('categories.slug', options.categorySlug);
      }
      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        supabaseProducts = data as unknown as Product[];
      }
    } catch (err) {
      console.warn('Falling back to local products:', err);
    }
  }

  // Merge custom products created via Admin, initialProducts, and Supabase
  const customProducts = getStoredCustomProducts();
  let deletedIds: string[] = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem('atelier_deleted_products') || '[]');
  } catch {}

  const mergedMap = new Map<string, Product>();

  // 1. Initial mock products
  initialProducts.forEach((p) => {
    if (!deletedIds.includes(p.id)) {
      mergedMap.set(p.id, p);
    }
  });

  // 2. Custom admin products (takes precedence over mock products)
  customProducts.forEach((p) => {
    if (!deletedIds.includes(p.id)) {
      mergedMap.set(p.id, p);
    }
  });

  // 3. Supabase live products
  supabaseProducts.forEach((p) => {
    if (!deletedIds.includes(p.id)) {
      mergedMap.set(p.id, p);
    }
  });

  let result = Array.from(mergedMap.values());

  // Filter by status:
  // - If options.status === 'all', return all products (admin view)
  // - If options.status is provided, match that status
  // - If options.status is omitted, default to 'active' for storefront
  if (options?.status && options.status !== 'all') {
    result = result.filter((p) => (p.status || 'active') === options.status);
  } else if (!options?.status) {
    result = result.filter((p) => (p.status || 'active') === 'active');
  }

  if (options?.categorySlug) {
    const customCats = getStoredCustomCategories();
    const allCats = [...customCats, ...initialCategories];
    const category = allCats.find((c) => c.slug === options.categorySlug);
    if (category) {
      result = result.filter((p) => p.category_id === category.id);
    }
  }

  if (options?.categoryId) {
    result = result.filter((p) => p.category_id === options.categoryId);
  }

  if (options?.search) {
    const s = options.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(s)))
    );
  }

  if (options?.sortBy) {
    if (options.sortBy === 'price-low') {
      result.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    } else if (options.sortBy === 'price-high') {
      result.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    } else if (options.sortBy === 'rating') {
      result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (options.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    }
  } else {
    // Show newest first by default so newly added products are at the front
    result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  }

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export async function getProductBySlug(rawSlug: string, allowDraft: boolean = false): Promise<Product | null> {
  if (!rawSlug) return null;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  let candidate: Product | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), variants:product_variants(*), options:product_options(*, values:product_option_values(*))')
        .or(`slug.eq.${slug},slug.ilike.${slug}%`)
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        candidate = data as unknown as Product;
      }
    } catch (err) {
      console.warn('Falling back to local product query:', err);
    }
  }

  if (!candidate) {
    // Helper matching function
    const matchProduct = (p: Product) => {
      const pSlug = (p.slug || '').toLowerCase().trim();
      const pId = (p.id || '').toLowerCase().trim();
      const pTitleSlug = slugify(p.title || '').toLowerCase().trim();

      return (
        pSlug === slug ||
        pId === slug ||
        pTitleSlug === slug ||
        (pSlug.length > 0 && pSlug.startsWith(slug)) ||
        (slug.length > 0 && slug.startsWith(pSlug)) ||
        (pTitleSlug.length > 0 && pTitleSlug.startsWith(slug)) ||
        (slug.length > 0 && slug.startsWith(pTitleSlug)) ||
        (pSlug.length > 0 && pSlug.includes(slug)) ||
        (pTitleSlug.length > 0 && pTitleSlug.includes(slug))
      );
    };

    // 1. Check stored custom products
    const custom = getStoredCustomProducts();
    const foundCustom = custom.find(matchProduct);
    if (foundCustom) {
      candidate = foundCustom;
    } else {
      // 2. Check initial products
      const foundInitial = initialProducts.find(matchProduct);
      if (foundInitial) candidate = foundInitial;
    }
  }

  if (!candidate) return null;

  // If product is in draft status, only allow if allowDraft is true
  if ((candidate.status || 'active') === 'draft' && !allowDraft) {
    return null;
  }

  return candidate;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  // 1. Try to fetch from API route
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          return data.reviews as Review[];
        }
      }
    } catch (err) {
      console.warn('API review fetch warning:', err);
    }
  }

  // 2. Direct Supabase query fallback
  if (isSupabaseConfigured()) {
    try {
      const normId = productId.startsWith('p') ? 'a' + productId.slice(1) : productId;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .or(`product_id.eq.${productId},product_id.eq.${normId}`)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Review[];
    } catch (err) {
      console.warn('Falling back to local reviews:', err);
    }
  }

  return memoryReviews.filter((r) => r.product_id === productId || r.product_id === (productId.startsWith('p') ? 'a' + productId.slice(1) : productId));
}

export async function addProductReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  let createdReview: Review = {
    ...review,
    id: 'rev-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  // 1. Try to save via /api/reviews for guaranteed server persistence
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.review) {
          createdReview = data.review as Review;
        }
      }
    } catch (err) {
      console.warn('API review post warning:', err);
    }
  } else if (isSupabaseConfigured()) {
    // 2. Direct Supabase fallback
    try {
      const normId = review.product_id.startsWith('p') ? 'a' + review.product_id.slice(1) : review.product_id;
      const { data, error } = await supabase.from('reviews').insert({ ...review, product_id: normId }).select().single();
      if (!error && data) createdReview = data as Review;
    } catch (err) {
      console.warn('Falling back to local review add:', err);
    }
  }

  memoryReviews.unshift(createdReview);
  return createdReview;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Please enter a coupon code' };
  }

  let coupon: Coupon | undefined;

  // 1. Try to fetch from API route if running in browser
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          coupon = data.coupons.find(
            (c: Coupon) => (c.code || '').trim().toUpperCase() === cleanCode
          );
        }
      }
    } catch (err) {
      console.warn('API coupon fetch warning:', err);
    }
  }

  // 2. Direct Supabase query fallback
  if (!coupon && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', cleanCode)
        .single();
      if (!error && data) coupon = data as Coupon;
    } catch (err) {
      console.warn('Coupon Supabase error, falling back:', err);
    }
  }

  // 3. In-memory / localStorage fallback
  if (!coupon) {
    try {
      const localCoupons = JSON.parse(localStorage.getItem('atelier_coupons') || '[]');
      coupon = localCoupons.find((c: Coupon) => (c.code || '').trim().toUpperCase() === cleanCode);
    } catch {}
    if (!coupon) {
      coupon = memoryCoupons.find((c) => (c.code || '').trim().toUpperCase() === cleanCode);
    }
  }

  if (!coupon) {
    return { valid: false, message: `Promo code "${cleanCode}" is invalid.` };
  }

  if (!coupon.is_active) {
    return { valid: false, message: `Promo code "${cleanCode}" is no longer active.` };
  }

  if (coupon.usage_limit && coupon.times_used !== undefined && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, message: `Promo code "${cleanCode}" has reached its usage limit.` };
  }

  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      message: `Minimum order amount of ${formatCurrency(coupon.min_order_amount)} required to use "${coupon.code}" (current: ${formatCurrency(subtotal)}).`,
    };
  }

  return { valid: true, coupon };
}

export async function createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
  const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const { items, ...orderRecord } = orderData;

  let createdOrder: Order = {
    ...orderData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ord-' + Date.now(),
    order_number: orderNumber,
    payment_method: orderData.payment_method || 'cod',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const payload: any = {
        ...orderRecord,
        payment_method: orderData.payment_method || 'cod',
      };

      const { data, error } = await supabase.from('orders').insert(payload).select().single();
      if (!error && data) {
        createdOrder = { ...data, items: items || [] } as Order;

        // Try to insert items into order_items if valid UUID
        if (items && items.length > 0) {
          try {
            const validItems = items
              .filter((it) => it.product_id && it.product_id.startsWith('p'))
              .map((it) => ({
                order_id: data.id,
                product_id: it.product_id,
                variant_id: it.variant_id || null,
                title: it.title,
                quantity: it.quantity,
                unit_price: it.unit_price,
                line_total: it.line_total,
              }));

            if (validItems.length > 0) {
              await supabase.from('order_items').insert(validItems);
            }
          } catch {
            // Ignore sub-table failure
          }
        }
      } else if (error) {
        console.warn('Supabase order insert warning:', error.message);
      }
    } catch (err) {
      console.warn('Failed to insert order into Supabase, saving locally:', err);
    }
  }

  memoryOrders.unshift(createdOrder);
  try {
    const existing = JSON.parse(localStorage.getItem('atelier_orders') || '[]');
    existing.unshift(createdOrder);
    localStorage.setItem('atelier_orders', JSON.stringify(existing));
  } catch {}

  return createdOrder;
}

export async function getOrders(): Promise<Order[]> {
  let supabaseOrders: Order[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        supabaseOrders = data as Order[];
      }
    } catch (err) {
      console.warn('Failed to fetch orders from Supabase:', err);
    }
  }

  let localOrders: Order[] = [];
  try {
    const local = localStorage.getItem('atelier_orders');
    if (local) {
      localOrders = JSON.parse(local);
    }
  } catch {}

  // Merge Supabase orders and local orders, prioritizing Supabase live status
  const mergedMap = new Map<string, Order>();
  localOrders.forEach((ord) => mergedMap.set(ord.order_number, ord));
  supabaseOrders.forEach((ord) => mergedMap.set(ord.order_number, ord));
  memoryOrders.forEach((ord) => {
    if (!mergedMap.has(ord.order_number)) mergedMap.set(ord.order_number, ord);
  });

  const result = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  );

  return result;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .single();
      if (!error && data) return data as Order;
    } catch (err) {
      console.warn('Supabase getOrderById error:', err);
    }
  }

  try {
    const local = localStorage.getItem('atelier_orders');
    if (local) {
      const parsed: Order[] = JSON.parse(local);
      const found = parsed.find((o) => o.id === orderId || o.order_number === orderId);
      if (found) return found;
    }
  } catch {}

  return memoryOrders.find((o) => o.id === orderId || o.order_number === orderId) || null;
}

export async function updateOrderStatus(
  orderId: string,
  updates: {
    fulfillment_status?: string;
    payment_status?: string;
    tracking_carrier?: string;
    tracking_number?: string;
  }
): Promise<{ success: boolean; order?: Order; error?: string }> {
  let updatedOrder: Order | undefined;

  // 1. Call server API route with service role key for guaranteed persistence
  try {
    const res = await fetch('/api/admin/orders/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, updates }),
    });
    const resData = await res.json();
    if (resData.success && resData.order) {
      updatedOrder = resData.order as Order;
    }
  } catch (err) {
    console.warn('Failed to update order via API route:', err);
  }

  // 2. Direct Supabase update as fallback
  if (!updatedOrder && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .select()
        .single();

      if (!error && data) {
        updatedOrder = data as Order;
      }
    } catch (err) {
      console.warn('Supabase direct update warning:', err);
    }
  }

  // 3. Update localStorage cache
  try {
    const local = localStorage.getItem('atelier_orders');
    if (local) {
      const parsed: Order[] = JSON.parse(local);
      const idx = parsed.findIndex((o) => o.id === orderId || o.order_number === orderId);
      if (idx !== -1) {
        parsed[idx] = { ...parsed[idx], ...updates, updated_at: new Date().toISOString() } as Order;
        localStorage.setItem('atelier_orders', JSON.stringify(parsed));
        if (!updatedOrder) updatedOrder = parsed[idx];
      }
    }
  } catch {}

  // 4. Update in-memory orders
  const memIdx = memoryOrders.findIndex((o) => o.id === orderId || o.order_number === orderId);
  if (memIdx !== -1) {
    memoryOrders[memIdx] = { ...memoryOrders[memIdx], ...updates, updated_at: new Date().toISOString() } as Order;
    if (!updatedOrder) updatedOrder = memoryOrders[memIdx];
  }

  // 5. Broadcast real-time event across all tabs and open storefront views
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('atelier_order_updated', {
        detail: { orderId, updates, updatedOrder },
      })
    );
  }

  return { success: true, order: updatedOrder };
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Dispatch through API route to send email notification to ajaysaa789@gmail.com
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (data.success) {
        if (!memorySubscribers.includes(cleanEmail)) {
          memorySubscribers.push(cleanEmail);
        }
        return { success: true, message: data.message || 'Thank you for subscribing to Private Releases.' };
      }
    } catch (err) {
      console.warn('API subscription dispatch warning:', err);
    }
  }

  // 2. Direct Supabase insert fallback
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('subscribers').insert({ email: cleanEmail });
      if (!error) return { success: true, message: 'Thank you for subscribing to Private Releases.' };
    } catch (err) {
      console.warn('Newsletter Supabase error:', err);
    }
  }

  if (!memorySubscribers.includes(cleanEmail)) {
    memorySubscribers.push(cleanEmail);
  }
  return { success: true, message: 'Thank you for subscribing to Private Releases.' };
}
