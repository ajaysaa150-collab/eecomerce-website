# ATELIER — Production-Grade Full-Stack E-Commerce Platform

A production-grade e-commerce platform built strictly with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Supabase (Auth + Database + Storage)**, and **Razorpay** payments.

Designed with agency-level aesthetics blending Apple Store's whitespace, Aesop's editorial typography, and Linear/Vercel's precision dashboard UI.

---

## 🌟 Key Features

### 1. Storefront Experience
- **Hero Showcase**: Auto-rotating hero carousel with word-by-word staggered typography, real-time progress indicators, and shimmer CTA buttons.
- **Micro-Interactions**:
  - Add-to-cart bezier arc flying ghost image animation that flies into the header cart with spring bounce orchestration.
  - Product card dual-image crossfade on hover with slide-up quick add.
  - Heart wishlist bounce with instant color fill.
  - Scroll-triggered `whileInView` reveals with `staggerChildren`.
- **Product Catalog (PLP)**:
  - Real-time filtering by category, price range slider, and stock availability with URL search params.
  - Instant Quick View modal without page navigation.
  - Active filter chips with exit animations.
- **Product Detail Page (PDP)**:
  - High-resolution gallery with thumbnail strip, crossfade swapping, and mouse hover zoom.
  - Variant selectors with stock validation.
  - Verified customer reviews with breakdown bars and submission form.
  - JSON-LD structured data for Google Search rich snippets.
- **Cart & Slide-Over Drawer**:
  - Real-time slide-over panel with staggered items.
  - Promo code validation against Supabase `coupons` table.
  - Dynamic tax, shipping thresholds, and order calculations.
- **Multi-Step Checkout**:
  - Shipping → Payment → Review with animated step indicator.
  - Integrated Razorpay Elements with automatic sandbox/test fallback.
- **User Account Portal**:
  - Orders history with live fulfillment timeline animation.
  - Address book management.
  - Saved wishlist collection.
  - 1-click evaluation role switcher (instant testing as Customer or Admin).

### 2. Administrator Control Center (`/admin`)
- **Protected Layout**: Role-guarded area (`role = 'admin'`).
- **Dashboard**: Recharts area & bar charts, revenue trajectories, low stock alerts (< 10 units), and real-time transaction stream.
- **Product Management**: Full CRUD, image URLs, SKU inventory tracking, and draft/active toggle.
- **Order Management**: Fulfillment status dropdown (Pending → Processing → Shipped → Delivered), airway bill tracking input, and clean printable invoices.
- **Brand & Site Settings**: Admin customization without touching code (Site name, logo, announcement marquee, social channels, and hero slides).
- **SEO Control**: Global meta templates, Google Analytics GA4 tag injection, and robots.txt editor.
- **Media Library**: Storage asset manager with instant CDN link copying.
- **Analytics**: Historical growth metrics, category distributions, and client acquisition rates.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens (8px grid, Inter + Playfair Display)
- **Animation**: Framer Motion
- **Database & Auth**: Supabase (PostgreSQL with RLS, Triggers, and Storage)
- **Payment Gateway**: Razorpay (Elements & Webhooks)
- **Icons**: Lucide React
- **Data Visualization**: Recharts

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_yourKeyId
RAZORPAY_KEY_ID=rzp_test_yourKeyId
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Migration
In your Supabase project SQL Editor, run:
1. `supabase/migrations/20260101000000_init_schema.sql` (Creates all 20 tables, RLS policies, triggers, and sequences)
2. `supabase/seed.sql` (Inserts initial curated products, categories, site settings, and hero slides)

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to view the administrator panel.
