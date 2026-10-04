-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT NOT NULL DEFAULT 'ATELIER',
    tagline TEXT NOT NULL DEFAULT 'Curated Minimalist Goods & High Design Essentials',
    logo_url TEXT NOT NULL DEFAULT '/logo.svg',
    logo_inverted_url TEXT,
    favicon_url TEXT,
    contact_email TEXT NOT NULL DEFAULT 'concierge@atelier-design.com',
    contact_phone TEXT NOT NULL DEFAULT '+1 (800) 492-8172',
    business_address TEXT NOT NULL DEFAULT '482 Mercer Street, Soho, New York, NY 10013',
    currency_code TEXT NOT NULL DEFAULT 'USD',
    currency_symbol TEXT NOT NULL DEFAULT '$',
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 8.87,
    tax_inclusive BOOLEAN NOT NULL DEFAULT false,
    announcement_bar_active BOOLEAN NOT NULL DEFAULT true,
    announcement_bar_text TEXT DEFAULT 'Complimentary global express shipping on all orders over $250',
    announcement_bar_link TEXT DEFAULT '/products',
    announcement_bar_color TEXT DEFAULT '#1A1A1A',
    social_instagram TEXT DEFAULT 'https://instagram.com',
    social_facebook TEXT DEFAULT 'https://facebook.com',
    social_twitter TEXT DEFAULT 'https://twitter.com',
    social_tiktok TEXT DEFAULT 'https://tiktok.com',
    social_youtube TEXT DEFAULT 'https://youtube.com',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SEO SETTINGS
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meta_title_template TEXT NOT NULL DEFAULT '{Page Title} | ATELIER Luxury Essentials',
    default_meta_description TEXT NOT NULL DEFAULT 'Discover precision-engineered modern luxury essentials, meticulously crafted for modern living.',
    og_default_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
    ga_tracking_id TEXT,
    fb_pixel_id TEXT,
    search_console_meta TEXT,
    robots_txt TEXT DEFAULT 'User-agent: *' || E'\n' || 'Allow: /' || E'\n' || 'Disallow: /admin' || E'\n' || 'Sitemap: https://atelier-design.com/sitemap.xml',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PAGE SEO
CREATE TABLE IF NOT EXISTS public.page_seo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug TEXT UNIQUE NOT NULL,
    meta_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    og_image_url TEXT
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    price NUMERIC(10,2) NOT NULL,
    sale_price NUMERIC(10,2),
    sale_start TIMESTAMPTZ,
    sale_end TIMESTAMPTZ,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    track_inventory BOOLEAN NOT NULL DEFAULT true,
    allow_backorders BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active')),
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    alt_text TEXT
);

-- 8. PRODUCT OPTIONS
CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- 9. PRODUCT OPTION VALUES
CREATE TABLE IF NOT EXISTS public.product_option_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- 10. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    price NUMERIC(10,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    option_values JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United States',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sequence for Order Number
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 10001;

-- 12. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || nextval('order_number_seq')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    shipping_method TEXT NOT NULL DEFAULT 'Standard Delivery',
    shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    coupon_code TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    razorpay_payment_id TEXT,
    tracking_number TEXT,
    tracking_carrier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    variant_info JSONB,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(10,2) NOT NULL
);

-- 14. ORDER TIMELINE
CREATE TABLE IF NOT EXISTS public.order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    usage_limit INT,
    per_customer_limit INT DEFAULT 1,
    times_used INT NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    applicable_products UUID[] DEFAULT ARRAY[]::UUID[],
    applicable_categories UUID[] DEFAULT ARRAY[]::UUID[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. HERO SLIDES
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    heading TEXT NOT NULL,
    subheading TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Explore Collection',
    cta_link TEXT NOT NULL DEFAULT '/products',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 19. WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 20. MEDIA
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    size INT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_modtime BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_settings_modtime BEFORE UPDATE ON public.seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- TRIGGER TO DECREMENT INVENTORY ON ORDER ITEM INSERT
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.product_id AND track_inventory = true;
    
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE public.product_variants
        SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
        WHERE id = NEW.variant_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION decrement_product_stock();

-- TRIGGER TO INCREMENT COUPON USAGE
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coupon_code IS NOT NULL THEN
        UPDATE public.coupons
        SET times_used = times_used + 1
        WHERE code = NEW.coupon_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_coupon_usage
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION FOR ADMIN CHECK
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PUBLIC READ POLICIES
CREATE POLICY "Public profiles can be viewed by anyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write site_settings" ON public.site_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Public read seo_settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Admin write seo_settings" ON public.seo_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Public read page_seo" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "Admin write page_seo" ON public.page_seo FOR ALL USING (public.is_admin());

CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin write product images" ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product options" ON public.product_options FOR SELECT USING (true);
CREATE POLICY "Admin write product options" ON public.product_options FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product option values" ON public.product_option_values FOR SELECT USING (true);
CREATE POLICY "Admin write product option values" ON public.product_option_values FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admin write product variants" ON public.product_variants FOR ALL USING (public.is_admin());

CREATE POLICY "Users read own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin write orders" ON public.orders FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read order timeline" ON public.order_timeline FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_timeline.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admin write order timeline" ON public.order_timeline FOR ALL USING (public.is_admin());

CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Auth users insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin delete reviews" ON public.reviews FOR DELETE USING (public.is_admin());

CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin write coupons" ON public.coupons FOR ALL USING (public.is_admin());

CREATE POLICY "Public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read subscribers" ON public.subscribers FOR SELECT USING (public.is_admin());

CREATE POLICY "Public read hero slides" ON public.hero_slides FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin write hero slides" ON public.hero_slides FOR ALL USING (public.is_admin());

CREATE POLICY "Users read own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Admin write media" ON public.media FOR ALL USING (public.is_admin());
