import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Coupon } from '@/types';

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

const DEFAULT_COUPONS: Omit<Coupon, 'id' | 'created_at'>[] = [
  {
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    min_order_amount: 100,
    usage_limit: 500,
    times_used: 12,
    is_active: true,
  },
  {
    code: 'ATELIER50',
    type: 'fixed',
    value: 50,
    min_order_amount: 300,
    usage_limit: 200,
    times_used: 5,
    is_active: true,
  },
];

// GET /api/admin/coupons - List all coupons
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, coupons: DEFAULT_COUPONS });
    }

    const { data: existing, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Coupons fetch error:', error.message);
      return NextResponse.json({ success: true, coupons: DEFAULT_COUPONS });
    }

    // Seed default coupons if database is empty
    if (!existing || existing.length === 0) {
      try {
        const toInsert = DEFAULT_COUPONS.map((c) => ({
          ...c,
          created_at: new Date().toISOString(),
        }));
        const { data: seeded } = await supabaseAdmin.from('coupons').insert(toInsert).select();
        return NextResponse.json({ success: true, coupons: seeded || DEFAULT_COUPONS });
      } catch (seedErr) {
        console.warn('Failed to seed default coupons:', seedErr);
        return NextResponse.json({ success: true, coupons: DEFAULT_COUPONS });
      }
    }

    return NextResponse.json({ success: true, coupons: existing });
  } catch (err: any) {
    console.error('API coupons GET exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/coupons - Create new promo code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value, min_order_amount, usage_limit, is_active } = body;

    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return NextResponse.json({ error: 'Promo code is required.' }, { status: 400 });
    }

    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      return NextResponse.json({ error: 'Valid discount value is required.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing.' }, { status: 500 });
    }

    const newCoupon = {
      code: cleanCode,
      type: type === 'fixed' ? 'fixed' : 'percentage',
      value: Number(value),
      min_order_amount: Number(min_order_amount) || 0,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      times_used: 0,
      is_active: is_active ?? true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert(newCoupon)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `Promo code "${cleanCode}" already exists.` }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, coupon: data });
  } catch (err: any) {
    console.error('API coupons POST exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// PATCH /api/admin/coupons - Update or toggle coupon active status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_active, value, min_order_amount, usage_limit } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const updates: Record<string, any> = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (value !== undefined) updates.value = Number(value);
    if (min_order_amount !== undefined) updates.min_order_amount = Number(min_order_amount);
    if (usage_limit !== undefined) updates.usage_limit = usage_limit ? Number(usage_limit) : null;

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, coupon: data });
  } catch (err: any) {
    console.error('API coupons PATCH exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/coupons?id=xxx - Delete a coupon
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    console.error('API coupons DELETE exception:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
