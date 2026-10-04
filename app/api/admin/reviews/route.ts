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

// Map mockData products for easy title/image lookup
const productMap = new Map<string, { title: string; image?: string; slug?: string }>();
initialProducts.forEach((p) => {
  productMap.set(p.id, { title: p.title, image: p.images[0]?.image_url, slug: p.slug });
  // Also map UUID normalized version if starts with p
  if (p.id.startsWith('p')) {
    productMap.set('a' + p.id.slice(1), { title: p.title, image: p.images[0]?.image_url, slug: p.slug });
  }
});

// GET /api/admin/reviews - Retrieve all product reviews
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin reviews:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enhance reviews with product title, product image, and slug
    const enhancedReviews = (reviews || []).map((rev) => {
      const prodInfo = productMap.get(rev.product_id);
      return {
        id: rev.id,
        product_id: rev.product_id,
        product_title: rev.product_title || prodInfo?.title || 'Luxury Masterwork Object',
        product_image: prodInfo?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300',
        product_slug: prodInfo?.slug || '',
        user_id: rev.user_id,
        user_name: rev.user_name || 'Anonymous Client',
        rating: rev.rating || 5,
        title: rev.title || 'Masterwork perspective',
        body: rev.body || '',
        is_verified: rev.is_verified ?? false,
        created_at: rev.created_at,
      };
    });

    return NextResponse.json({ success: true, reviews: enhancedReviews });
  } catch (err: any) {
    console.error('Admin reviews GET exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/reviews?reviewId=xxx - Delete a review
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Review removed successfully' });
  } catch (err: any) {
    console.error('Admin reviews DELETE exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// PATCH /api/admin/reviews - Toggle verification or edit
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, is_verified, rating, title, body: reviewBody } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const updates: Record<string, any> = {};
    if (is_verified !== undefined) updates.is_verified = is_verified;
    if (rating !== undefined) updates.rating = rating;
    if (title !== undefined) updates.title = title;
    if (reviewBody !== undefined) updates.body = reviewBody;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    console.error('Admin reviews PATCH exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
