import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// GET /api/admin/customers - List all registered customers with stats
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // 1. Fetch profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // 2. Fetch orders to aggregate order count and total spent
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, email, total, created_at, payment_status');

    const ordersByUser = new Map<string, { count: number; totalSpent: number; lastOrder?: string }>();
    const ordersByEmail = new Map<string, { count: number; totalSpent: number; lastOrder?: string }>();

    if (orders && orders.length > 0) {
      for (const order of orders) {
        const orderTotal = Number(order.total) || 0;
        
        if (order.user_id) {
          const curr = ordersByUser.get(order.user_id) || { count: 0, totalSpent: 0 };
          curr.count += 1;
          curr.totalSpent += orderTotal;
          if (!curr.lastOrder || new Date(order.created_at) > new Date(curr.lastOrder)) {
            curr.lastOrder = order.created_at;
          }
          ordersByUser.set(order.user_id, curr);
        }

        if (order.email) {
          const cleanEmail = order.email.trim().toLowerCase();
          const curr = ordersByEmail.get(cleanEmail) || { count: 0, totalSpent: 0 };
          curr.count += 1;
          curr.totalSpent += orderTotal;
          if (!curr.lastOrder || new Date(order.created_at) > new Date(curr.lastOrder)) {
            curr.lastOrder = order.created_at;
          }
          ordersByEmail.set(cleanEmail, curr);
        }
      }
    }

    // Combine profile data with order statistics
    const customers = (profiles || []).map((prof) => {
      const email = (prof.email || '').trim().toLowerCase();
      const byUser = ordersByUser.get(prof.id);
      const byEmail = ordersByEmail.get(email);

      const ordersCount = Math.max(byUser?.count || 0, byEmail?.count || 0);
      const totalSpent = Math.max(byUser?.totalSpent || 0, byEmail?.totalSpent || 0);
      const lastOrder = byUser?.lastOrder || byEmail?.lastOrder || null;

      return {
        id: prof.id,
        name: prof.full_name || email.split('@')[0],
        email: prof.email,
        phone: prof.phone || null,
        role: prof.role || 'customer',
        avatar_url: prof.avatar_url || null,
        created_at: prof.created_at,
        ordersCount,
        totalSpent,
        lastOrder,
      };
    });

    return NextResponse.json({ success: true, customers });
  } catch (err: any) {
    console.error('API customers GET error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/customers - Delete a customer from Auth and Profiles
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Check if user is protected admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, role')
      .eq('id', userId)
      .single();

    if (profile?.email === 'ajaysaa789@gmail.com') {
      return NextResponse.json({ error: 'Super Admin account cannot be deleted' }, { status: 403 });
    }

    // 1. Delete from auth.users via admin API
    try {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authDeleteError) {
        console.warn('Auth admin delete user warning:', authDeleteError.message);
      }
    } catch (authErr) {
      console.warn('Auth admin delete user exception:', authErr);
    }

    // 2. Delete from public.profiles
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError);
      return NextResponse.json({ error: profileDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err: any) {
    console.error('API customers DELETE error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/customers - Reset password or update customer
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, password, full_name, phone, role } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Action: Change customer password
    if (action === 'change_password') {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      const { data, error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
      });

      if (passwordError) {
        console.error('Error changing password:', passwordError);
        return NextResponse.json({ error: passwordError.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully for user',
        user: { id: data.user.id, email: data.user.email },
      });
    }

    // Action: Update customer details (name, phone, role)
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Customer details updated',
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error('API customers PATCH error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
