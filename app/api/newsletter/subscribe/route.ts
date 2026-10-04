import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const ADMIN_NOTIFICATION_EMAIL = 'ajaysaa789@gmail.com';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    let email = '';
    try {
      const body = await req.json();
      email = (body?.email || '').trim().toLowerCase();
    } catch {
      try {
        const rawText = await req.text();
        const body = JSON.parse(rawText.replace(/^\uFEFF/, '').trim());
        email = (body?.email || '').trim().toLowerCase();
      } catch (parseErr: any) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON request payload.', details: parseErr?.message },
          { status: 400 }
        );
      }
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 1. Generate unique 20% off coupon code for this subscriber
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const couponCode = `JOIN20-${uniqueSuffix}`;

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Persist subscriber and new 20% coupon in Supabase
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('subscribers').insert({
          email,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Supabase subscribers insert warning:', dbErr);
      }

      try {
        await supabaseAdmin.from('coupons').insert({
          code: couponCode,
          type: 'percentage',
          value: 20,
          min_order_amount: 0,
          usage_limit: 1,
          times_used: 0,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      } catch (couponErr) {
        console.warn('Supabase coupons insert warning:', couponErr);
      }
    }

    // 3. Dispatch Email Notification to ajaysaa789@gmail.com
    let emailSent = false;
    let deliveryMethod = 'none';

    // Method A: Nodemailer (Direct Gmail SMTP if configured in Vercel environment)
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"BRANDWORLD Studio" <${smtpUser}>`,
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `✨ New VIP Subscriber (20% Coupon: ${couponCode})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 28px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #0d0d10; color: #ededed;">
              <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
                <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
                  Private Releases Dispatch
                </span>
                <h1 style="color: #ffffff; font-size: 22px; margin: 12px 0 4px 0; font-weight: 700;">New Subscriber Joined</h1>
                <p style="color: #a3a3a3; font-size: 13px; margin: 0;">A new user has joined the Private Releases atelier list.</p>
              </div>

              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #a3a3a3; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Customer Email</p>
                <p style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff; font-weight: 600;">
                  <a href="mailto:${email}" style="color: #fbbf24; text-decoration: none;">${email}</a>
                </p>

                <p style="margin: 0 0 6px 0; font-size: 11px; color: #a3a3a3; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Generated 20% Privilege Coupon</p>
                <p style="margin: 0; font-family: monospace; font-size: 20px; color: #34d399; font-weight: 700; letter-spacing: 2px;">
                  ${couponCode} <span style="font-size: 13px; font-weight: normal; color: #a3a3a3;">(20% OFF)</span>
                </p>

                <p style="margin: 16px 0 0 0; font-size: 12px; color: #737373;">
                  Timestamp: <strong style="color: #d4d4d4;">${timestamp} (IST)</strong>
                </p>
              </div>

              <p style="color: #737373; font-size: 11px; margin: 0; text-align: center;">
                BRANDWORLD Commerce Engine · Automated Dispatch Notification
              </p>
            </div>
          `,
        });
        emailSent = true;
        deliveryMethod = 'nodemailer';
      } catch (smtpErr) {
        console.warn('Nodemailer SMTP dispatch error:', smtpErr);
      }
    }

    // Method B: FormSubmit HTTP dispatch
    if (!emailSent) {
      try {
        const originUrl = req.nextUrl.origin || 'https://brandworld.atelier';
        const fsRes = await fetch(`https://formsubmit.co/ajax/${ADMIN_NOTIFICATION_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Referer': originUrl,
          },
          body: JSON.stringify({
            _subject: `✨ New VIP Subscriber (20% Code: ${couponCode})`,
            _template: 'table',
            _captcha: 'false',
            Subscriber_Email: email,
            Generated_20Percent_Coupon: couponCode,
            Discount: '20% OFF',
            Platform: 'BRANDWORLD Studio - Private Releases',
            Subscribed_At: `${timestamp} (IST)`,
            Message: `New customer subscribed.\nEmail: ${email}\nGenerated 20% Coupon: ${couponCode}\nTime: ${timestamp}`,
          }),
        });
        const fsData = await fsRes.json().catch(() => null);
        if (fsData?.success) {
          emailSent = true;
          deliveryMethod = 'formsubmit';
        }
      } catch (fsErr) {
        console.warn('FormSubmit dispatch error:', fsErr);
      }
    }

    // Method C: Web3Forms fallback if access key is set
    if (!emailSent && process.env.WEB3FORMS_ACCESS_KEY) {
      try {
        const w3Res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: process.env.WEB3FORMS_ACCESS_KEY,
            subject: `✨ New VIP Subscriber (20% Code: ${couponCode})`,
            from_name: 'BRANDWORLD Studio',
            email: email,
            coupon_code: couponCode,
            discount: '20% OFF',
            message: `New subscriber: ${email}. 20% Coupon Code: ${couponCode}.`,
          }),
        });
        const w3Data = await w3Res.json().catch(() => null);
        if (w3Data?.success) {
          emailSent = true;
          deliveryMethod = 'web3forms';
        }
      } catch (w3Err) {
        console.warn('Web3Forms dispatch error:', w3Err);
      }
    }

    return NextResponse.json({
      success: true,
      couponCode,
      discount: 20,
      emailSent,
      deliveryMethod,
      message: `Welcome to Private Releases. Your exclusive 20% off code is ${couponCode}.`,
      notified: ADMIN_NOTIFICATION_EMAIL,
    });
  } catch (error: any) {
    console.error('Newsletter subscription route error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
