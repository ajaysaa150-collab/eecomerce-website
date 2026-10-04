export type Role = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  logo_url: string;
  logo_inverted_url?: string | null;
  favicon_url?: string | null;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  currency_code: string;
  currency_symbol: string;
  tax_rate: number;
  tax_inclusive: boolean;
  announcement_bar_active: boolean;
  announcement_bar_text?: string | null;
  announcement_bar_link?: string | null;
  announcement_bar_color?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  social_tiktok?: string | null;
  social_youtube?: string | null;
  updated_at: string;
}

export interface SEOSettings {
  id: string;
  meta_title_template: string;
  default_meta_description: string;
  og_default_image_url: string;
  ga_tracking_id?: string | null;
  fb_pixel_id?: string | null;
  search_console_meta?: string | null;
  robots_txt?: string | null;
  updated_at: string;
}

export interface PageSEO {
  id: string;
  page_slug: string;
  meta_title: string;
  meta_description: string;
  og_image_url?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id?: string | null;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price?: number | null;
  stock_quantity: number;
  option_values: { option_name: string; value: string }[];
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  alt_text?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category?: Category;
  price: number;
  sale_price?: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
  sku: string;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  status: 'draft' | 'active';
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  tags: string[];
  images: ProductImage[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  title: string;
  variant_info?: { [key: string]: string } | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  note: string;
  created_by?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  email: string;
  shipping_address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billing_address?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code?: string | null;
  payment_method?: 'razorpay' | 'cod' | string;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  razorpay_payment_id?: string | null;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
  notes?: string | null;
  items?: OrderItem[];
  timeline?: OrderTimeline[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  usage_limit?: number | null;
  per_customer_limit?: number | null;
  times_used: number;
  valid_from?: string | null;
  valid_to?: string | null;
  applicable_products?: string[];
  applicable_categories?: string[];
  is_active: boolean;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  uploaded_by?: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedOptions?: { [key: string]: string };
  maxStock: number;
}
