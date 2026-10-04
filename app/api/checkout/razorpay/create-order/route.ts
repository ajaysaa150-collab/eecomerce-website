import { NextResponse } from 'next/server';
import { razorpayInstance } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'USD', receipt } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    // Amount in subunits (e.g. cents/paise)
    const amountInSubunits = Math.round(amount * 100);

    const isLiveKey =
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_ID.startsWith('rzp_') &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_SECRET.includes('preview');

    if (isLiveKey) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInSubunits,
          currency: currency.toUpperCase(),
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: {
            platform: 'ATELIER E-Commerce',
          },
        });
        return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
      } catch (err: any) {
        console.warn('Razorpay order creation fallback:', err?.message);
      }
    }

    // Simulated sandbox order for preview or local environments
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    return NextResponse.json({
      orderId: mockOrderId,
      amount: amountInSubunits,
      currency: currency.toUpperCase(),
      isSandbox: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error creating order' }, { status: 500 });
  }
}
