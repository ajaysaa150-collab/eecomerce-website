import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ADMIN_NOTIFICATION_EMAIL = 'ajaysaa789@gmail.com';

export async function POST(req: NextRequest) {
  try {
    let email = '';
    const rawText = await req.text();
    try {
      const cleanText = rawText.replace(/^\uFEFF/, '').trim();
      const body = JSON.parse(cleanText);
      email = (body.email || '').trim().toLowerCase();
    } catch (parseErr: any) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.', rawText, details: parseErr?.message },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 1. Save to Supabase subscribers table if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('subscribers').insert({
          email,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Supabase subscribers insert warning:', dbErr);
      }
    }

    // 2. Send email notification to ajaysaa789@gmail.com
    let emailSent = false;

    // A) If SMTP / Gmail App credentials are provided in environment
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
          subject: `✨ New Private Releases Subscriber: ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #fafafa;">
              <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">New Private Releases Subscription</h2>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                A new visitor has subscribed to the <strong>Private Releases</strong> journal on <strong>BRANDWORLD</strong>.
              </p>
              
              <div style="background-color: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Subscriber Email</p>
                <p style="margin: 0; font-size: 18px; color: #111; font-weight: 600;">
                  <a href="mailto:${email}" style="color: #111; text-decoration: none;">${email}</a>
                </p>
                <p style="margin: 12px 0 0 0; font-size: 12px; color: #777;">
                  Subscribed At: <strong>${timestamp} (IST)</strong>
                </p>
              </div>

              <p style="color: #888; font-size: 11px; margin-bottom: 0;">
                This notification was automatically dispatched by BRANDWORLD Commerce Engine.
              </p>
            </div>
          `,
        });
        emailSent = true;
      } catch (smtpErr) {
        console.warn('Nodemailer SMTP dispatch error:', smtpErr);
      }
    }

    // B) Guaranteed fallback delivery via FormSubmit to ajaysaa789@gmail.com
    try {
      const fsRes = await fetch(`https://formsubmit.co/ajax/${ADMIN_NOTIFICATION_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'http://localhost:3000',
        },
        body: JSON.stringify({
          _subject: `✨ New Private Releases Subscriber: ${email}`,
          _template: 'table',
          _captcha: 'false',
          Subscriber_Email: email,
          Platform: 'BRANDWORLD Studio - Private Releases',
          Subscribed_At: `${timestamp} (IST)`,
          Message: `A new customer has subscribed to the Private Releases journal.\n\nSubscriber: ${email}\nTime: ${timestamp}`,
        }),
      });
      const fsData = await fsRes.json().catch(() => null);
      if (fsData?.success) {
        emailSent = true;
      }
    } catch (fsErr) {
      console.warn('FormSubmit dispatch error:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to BRANDWORLD Private Releases.',
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
