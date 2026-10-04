'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Mail, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    signIn,
    signUp,
    resendConfirmationEmail,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'confirmation-sent'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [isAlreadyExists, setIsAlreadyExists] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Sync mode when modal opens or authModalMode changes
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg('');
    setIsUnconfirmed(false);
    setIsAlreadyExists(false);
    setResendStatus(null);
  }, [authModalMode, isAuthModalOpen]);

  const handleResend = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address to resend confirmation.');
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    const res = await resendConfirmationEmail(email);
    setIsResending(false);
    if (res.success) {
      setResendStatus('Verification email resent successfully! Please check your inbox.');
    } else {
      setErrorMsg(res.error || 'Failed to resend verification email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsUnconfirmed(false);
    setIsAlreadyExists(false);
    setResendStatus(null);

    if (mode === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        if (res.notConfirmed) {
          setIsUnconfirmed(true);
        }
        if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } else if (mode === 'signup') {
      if (!fullName) {
        setErrorMsg('Please enter your full name');
        return;
      }
      const res = await signUp(email, password, fullName);
      if (!res.success) {
        if (res.alreadyExists) {
          setIsAlreadyExists(true);
        } else if (res.notConfirmed) {
          setIsUnconfirmed(true);
        }
        if (res.error) {
          setErrorMsg(res.error);
        }
      } else if (res.requireConfirmation) {
        setMode('confirmation-sent');
        setErrorMsg('');
      }
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} maxWidth="md">
      <div className="flex flex-col">
        {mode === 'confirmation-sent' ? (
          /* Confirmation Sent Screen */
          <div className="text-center py-3 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center border border-amber-500/20 shadow-subtle">
              <Mail className="w-8 h-8 text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif-heading text-2xl font-bold text-foreground">
                Verify Your Email
              </h3>
              <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                A verification link has been sent to{' '}
                <span className="font-semibold text-foreground underline">{email}</span>.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account activation link sent</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                Please check your inbox (including your spam / junk folder) and click the link to confirm your account.
                <strong className="block mt-1 text-amber-900">
                  You will not be able to log in until your email is verified.
                </strong>
              </p>
            </div>

            {resendStatus && (
              <p className="text-xs text-success font-medium bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                {resendStatus}
              </p>
            )}

            {errorMsg && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full text-xs"
                disabled={isResending}
                onClick={handleResend}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Resending Verification Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full text-xs"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setIsUnconfirmed(false);
                  setResendStatus(null);
                }}
              >
                Proceed to Sign In
              </Button>
            </div>
          </div>
        ) : (
          /* Sign In & Sign Up Form */
          <>
            {/* Header Tabs */}
            <div className="flex border-b border-black/5 mb-6">
              <button
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setIsUnconfirmed(false);
                  setResendStatus(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${
                  mode === 'signin'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-secondary hover:text-foreground'
                }`}
              >
                Sign In Login
              </button>
              <button
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setIsUnconfirmed(false);
                  setResendStatus(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${
                  mode === 'signup'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-secondary hover:text-foreground'
                }`}
              >
                Sign In Create
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {/* Unconfirmed Email Callout */}
              {isUnconfirmed && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-200">
                  <div className="flex items-start gap-2 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Email Verification Required</p>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Your account cannot be accessed until your email address has been verified. Please check your inbox for the confirmation email.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-amber-200/60">
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResend}
                      className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isResending ? 'Resending...' : 'Resend Verification Email'}
                    </button>
                    {resendStatus && (
                      <span className="text-[10px] text-emerald-700 font-medium">Email sent!</span>
                    )}
                  </div>
                </div>
              )}

              {/* Account Already Exists Callout */}
              {isAlreadyExists && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-200">
                  <div className="flex items-start gap-2 text-blue-950">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Account Already Exists</p>
                      <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                        An account with the email <strong className="underline">{email}</strong> already exists. Please log in with your password.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end border-t border-blue-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setIsAlreadyExists(false);
                        setErrorMsg('');
                      }}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1 py-0.5"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* General error message */}
              {errorMsg && !isUnconfirmed && !isAlreadyExists && (
                <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg">
                  {errorMsg}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {mode === 'signin' ? 'Sign In Login' : 'Sign In Create'}
              </Button>
            </form>

            <p className="mt-4 text-center text-[11px] text-secondary">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
