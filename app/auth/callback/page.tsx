'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        const error = searchParams.get('error');
        const errorDesc = searchParams.get('error_description');

        if (error) {
          if (isMounted) {
            setStatus('error');
            setErrorMessage(errorDesc || 'Verification link is invalid or has expired.');
          }
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            if (isMounted) {
              setStatus('error');
              setErrorMessage(exchangeError.message);
            }
            return;
          }
          if (data?.session?.user && isMounted) {
            setUserEmail(data.session.user.email || '');
            setStatus('success');
            setTimeout(() => {
              router.push('/account');
            }, 3000);
            return;
          }
        }

        // Check for session in hash or existing storage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (isMounted) {
            setStatus('error');
            setErrorMessage(sessionError.message);
          }
          return;
        }

        if (session?.user && isMounted) {
          setUserEmail(session.user.email || '');
          setStatus('success');
          setTimeout(() => {
            router.push('/account');
          }, 3000);
          return;
        }

        // If neither code nor session was found immediately, wait briefly for auth listener
        const timer = setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession();
          if (isMounted) {
            if (retry?.session?.user) {
              setUserEmail(retry.session.user.email || '');
              setStatus('success');
              setTimeout(() => router.push('/account'), 3000);
            } else {
              setStatus('success');
              // Email verified on server; user can sign in now
            }
          }
        }, 1500);

        return () => clearTimeout(timer);
      } catch (err: unknown) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred during verification.');
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-elevated border border-black/5 text-center space-y-6">
        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="font-serif-heading text-2xl font-bold text-foreground">
                Verifying Your Account
              </h2>
              <p className="text-xs text-secondary leading-relaxed">
                Please wait while we confirm your email and set up your session...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-subtle">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-foreground">
                Email Confirmed!
              </h2>
              <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                Your email address {userEmail && <strong className="text-foreground font-semibold">({userEmail})</strong>} has been successfully verified. Your account is now active.
              </p>
            </div>

            <div className="p-3.5 bg-cream/60 border border-black/5 rounded-2xl text-xs text-foreground font-medium">
              Redirecting you to your account in a few seconds...
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/account" className="w-full">
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to My Account
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" size="md" className="w-full text-xs">
                  Continue Browsing Collection
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center border border-destructive/20 shadow-subtle">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-heading text-2xl font-bold text-foreground">
                Verification Failed
              </h2>
              <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'The verification link may have expired or is invalid.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/" className="w-full">
                <Button variant="primary" size="lg" className="w-full">
                  Return to Home & Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
