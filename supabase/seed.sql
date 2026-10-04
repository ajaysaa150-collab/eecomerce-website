-- SEED DATA FOR ATELIER E-COMMERCE

-- 1. SITE SETTINGS
INSERT INTO public.site_settings (
    id, site_name, tagline, logo_url, contact_email, contact_phone, business_address, currency_code, currency_symbol, tax_rate, announcement_bar_active, announcement_bar_text
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'ATELIER',
    'Minimalist Goods & High Design Essentials',
    '/images/atelier-logo.svg',
    'concierge@atelier-design.com',
    '+1 (800) 492-8172',
    '482 Mercer Street, Soho, New York, NY 10013',
    'USD',
    '$',
    8.875,
    true,
    'Complimentary express global delivery on orders exceeding $250'
) ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'Living & Object', 'living-object', 'Sculptural objects, desk accessories, and ceramic vessels crafted for enduring spaces.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop', 1),
('c0000000-0000-0000-0000-000000000002', 'Audio & Acoustics', 'audio-acoustics', 'Precision-milled sound systems with unmatched acoustic fidelity and organic materiality.', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop', 2),
('c0000000-0000-0000-0000-000000000003', 'Time & Horology', 'time-horology', 'Pure mechanical and minimalist chronographs built with surgical stainless steel.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', 3),
('c0000000-0000-0000-0000-000000000004', 'Leather & Carry', 'leather-carry', 'Vegetable-tanned full-grain leather goods designed for seamless daily transit.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. HERO SLIDES
INSERT INTO public.hero_slides (id, image_url, heading, subheading, cta_text, cta_link, sort_order, is_active) VALUES
('h0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1920&auto=format&fit=crop', 'Form Follows Silence.', 'Curated minimalist goods and tactile instruments engineered for intentional spaces.', 'Explore The New Season', '/products', 1, true),
('h0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1920&auto=format&fit=crop', 'Acoustic Mastery.', 'Wireless high-resolution sound enveloped in anodized aluminium and natural calfskin.', 'Discover Audio Systems', '/products?category=audio-acoustics', 2, true),
('h0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop', 'Archival Carry.', 'Vegetable-tanned full grain totes and weekender folios crafted in Tuscany.', 'Shop Leather Goods', '/products?category=leather-carry', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCTS & IMAGES
INSERT INTO public.products (
    id, title, slug, description, category_id, price, sale_price, sku, stock_quantity, track_inventory, allow_backorders, status, tags
) VALUES
(
    'p0000000-0000-0000-0000-000000000001',
    'Aura Spatial Wireless Speaker',
    'aura-spatial-wireless-speaker',
    '<p>The Aura Spatial Wireless Speaker combines CNC-machined aerospace-grade aluminum with hand-finished acoustically transparent wool. Engineered with dual neodymium woofers and ambient spatial tweeters for room-filling lossless playback.</p><p>Featuring Bluetooth 5.3, AirPlay 2, and lossless Wi-Fi streaming. 24-hour battery endurance on a single charge.</p>',
    'c0000000-0000-0000-0000-000000000002',
    490.00,
    null,
    'ATL-SPK-001',
    28,
    true,
    false,
    'active',
    ARRAY['audio', 'minimal', 'aluminum', 'wireless']
),
(
    'p0000000-0000-0000-0000-000000000002',
    'Chronos Bauhaus Automatic 38mm',
    'chronos-bauhaus-automatic-38mm',
    '<p>A masterclass in horological reductionism. Driven by a high-beat Japanese Miyota automatic caliber visible through a sapphire exhibition caseback. Water-resistant to 5 ATM.</p><p>Equipped with quick-release Horween leather straps and anti-reflective double-domed crystal.</p>',
    'c0000000-0000-0000-0000-000000000003',
    650.00,
    580.00,
    'ATL-WAT-002',
    14,
    true,
    false,
    'active',
    ARRAY['watch', 'automatic', 'horology', 'minimal']
),
(
    'p0000000-0000-0000-0000-000000000003',
    'Tuscan Vachetta Weekender Duffel',
    'tuscan-vachetta-weekender-duffel',
    '<p>Constructed from unlined full-grain vegetable-tanned Tuscan leather that develops a warm, bespoke patina with every journey. Features solid brass hardware and reinforced riveted grab handles.</p><p>Internal dedicated padded compartment accommodates up to 16-inch laptops with ease.</p>',
    'c0000000-0000-0000-0000-000000000004',
    780.00,
    null,
    'ATL-BAG-003',
    9,
    true,
    false,
    'active',
    ARRAY['leather', 'travel', 'duffel', 'carry']
),
(
    'p0000000-0000-0000-0000-000000000004',
    'Brutalist Cast Bronze Vessel',
    'brutalist-cast-bronze-vessel',
    '<p>Cast using traditional lost-wax processes in Kyoto, Japan. This heavy sculptural vessel stands as a solitary centerpiece or functional vessel for dried botanical arrangements.</p><p>Each individual casting bears subtle organic surface nuances and oxidizes with grace.</p>',
    'c0000000-0000-0000-0000-000000000001',
    320.00,
    null,
    'ATL-OBJ-004',
    18,
    true,
    false,
    'active',
    ARRAY['home', 'bronze', 'sculpture', 'vessel']
),
(
    'p0000000-0000-0000-0000-000000000005',
    'Studio Desk Lamp in Anodized Black',
    'studio-desk-lamp-anodized-black',
    '<p>Engineered with a counterweighted cantilever articulation and high-CRI (98+) warm-dimming LED array that mirrors circadian natural light. Smooth rotary tactile dimmer on base.</p><p>Solid machined brass counterweights and matte micro-textured powder coating.</p>',
    'c0000000-0000-0000-0000-000000000001',
    380.00,
    340.00,
    'ATL-LMP-005',
    22,
    true,
    false,
    'active',
    ARRAY['lighting', 'desk', 'design', 'minimal']
),
(
    'p0000000-0000-0000-0000-000000000006',
    'Sonic Noise-Canceling Studio Headphones',
    'sonic-noise-canceling-studio-headphones',
    '<p>Featuring custom 40mm beryllium drivers delivering electrostatic clarity and expansive dynamic headroom. Hybrid active noise cancellation filters low-frequency disturbance without coloring soundstage.</p><p>Memory foam lambskin earcups provide all-day ergonomic comfort.</p>',
    'c0000000-0000-0000-0000-000000000002',
    420.00,
    null,
    'ATL-AUD-006',
    35,
    true,
    false,
    'active',
    ARRAY['audio', 'headphones', 'bluetooth', 'lossless']
)
ON CONFLICT (id) DO NOTHING;

-- PRODUCT IMAGES
INSERT INTO public.product_images (product_id, image_url, sort_order, alt_text) VALUES
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop', 1, 'Aura Spatial Speaker Front View'),
('p0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop', 2, 'Aura Speaker Lifestyle Setting'),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop', 1, 'Chronos Watch Face View'),
('p0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop', 2, 'Chronos Watch Lifestyle Wrist'),
('p0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop', 1, 'Tuscan Leather Duffel Studio View'),
('p0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop', 2, 'Tuscan Leather Duffel Travel Angle'),
('p0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop', 1, 'Brutalist Bronze Vessel Studio'),
('p0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop', 2, 'Bronze Vessel Tabletop View'),
('p0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop', 1, 'Studio Desk Lamp Isolated'),
('p0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop', 2, 'Studio Desk Lamp Ambient Room'),
('p0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', 1, 'Sonic ANC Studio Headphones'),
('p0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop', 2, 'Sonic Headphones Lifestyle Angle')
ON CONFLICT DO NOTHING;

-- COUPONS
INSERT INTO public.coupons (id, code, type, value, min_order_amount, usage_limit, is_active) VALUES
('d0000000-0000-0000-0000-000000000001', 'WELCOME15', 'percentage', 15.00, 100.00, 500, true),
('d0000000-0000-0000-0000-000000000002', 'ATELIER50', 'fixed', 50.00, 300.00, 100, true)
ON CONFLICT (id) DO NOTHING;
