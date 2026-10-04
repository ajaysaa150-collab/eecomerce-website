import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initialProducts } from '@/lib/mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Convert any product ID starting with 'p' to standard hex uuid prefix 'a' so postgres uuid type doesn't error
function normalizeUUID(id?: string | null): string | null {
  if (!id) return null;
  // If valid UUID format but starts with non-hex like 'p'
  if (/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(id)) {
    if (id.startsWith('p') || id.startsWith('P')) {
      return 'a' + id.slice(1);
    }
    return id;
  }
  return null;
}

// Map mockData products for easy title lookup
const productTitleMap = new Map<string, string>();
initialProducts.forEach((p) => {
  productTitleMap.set(p.id, p.title);
  if (p.id.startsWith('p')) {
    productTitleMap.set('a' + p.id.slice(1), p.title);
  }
});

// GET /api/reviews?productId=xxx - Get reviews for a product or all reviews
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, reviews: [] });
    }

    let query = supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });

    if (productId) {
      const normId = normalizeUUID(productId) || productId;
      // Search matching both original and normalized
      query = query.or(`product_id.eq.${productId},product_id.eq.${normId}`);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.warn('Reviews GET warning:', error.message);
      return NextResponse.json({ success: true, reviews: [] });
    }

    return NextResponse.json({ success: true, reviews: reviews || [] });
  } catch (err: any) {
    console.error('Reviews GET error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/reviews - Submit a new product review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      product_id,
      product_title,
      user_id,
      user_name,
      rating,
      title,
      body: reviewBody,
      is_verified,
    } = body;

    if (!product_id || !title || !reviewBody || !rating) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Determine normalized UUID for product_id
    const dbProductId = normalizeUUID(product_id) || product_id;

    // Check if user_id is a valid UUID (if guest or demo, store as null in user_id, but user_name is preserved)
    const dbUserId = (user_id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(user_id))
      ? user_id
      : null;

    const resolvedProductTitle = product_title || productTitleMap.get(product_id) || productTitleMap.get(dbProductId) || 'Masterwork Product';

    const insertPayload = {
      product_id: dbProductId,
      product_title: resolvedProductTitle,
      user_id: dbUserId,
      user_name: user_name || 'Verified Collector',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      title: title.trim(),
      body: reviewBody.trim(),
      is_verified: is_verified ?? true,
      created_at: new Date().toISOString(),
    };

    const { data: newReview, error: insertError } = await supabaseAdmin
      .from('reviews')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      console.error('Reviews POST insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: newReview });
  } catch (err: any) {
    console.error('Reviews POST exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
