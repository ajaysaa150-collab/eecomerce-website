'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, isAdmin, isLoading, signIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSecretAccess, setHasSecretAccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('secret') === 'admin' || params.get('access') === 'secret') {
        setHasSecretAccess(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAdmin && !hasSecretAccess) {
      router.replace('/');
    }
  }, [isLoading, isAdmin, hasSecretAccess, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    const res = await signIn(adminEmail, adminPassword);
    setIsSubmitting(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  // If user is not an admin, immediately redirect unauthorized access away
  if (!isLoading && !isAdmin) {
    if (!hasSecretAccess) {
      return null;
    }
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-elevated border border-black/10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-black text-white mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <h2 className="font-serif-heading text-2xl font-bold text-foreground">
              BRANDWORLD Control Center
            </h2>
            <p className="text-xs text-secondary leading-relaxed">
              {profile
                ? `Signed in as ${profile.email} (Customer account). Administrator privileges are required.`
                : 'Sign in with administrator credentials to manage products, orders, and system settings.'}
            </p>
          </div>

          {profile && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
              <span>Customer Account Active</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="font-semibold underline hover:text-amber-950"
              >
                Sign Out
              </button>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              label="Admin Email (ID)"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />

            <Input
              label="Admin Password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />

            {errorMsg && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Sign In to Admin Console
            </Button>
          </form>

          <div className="pt-3 border-t border-black/5 flex justify-center">
            <Link href="/" className="text-xs text-secondary hover:text-foreground flex items-center gap-1.5 py-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative z-10"
            >
              <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          title="Atelier Control Center"
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
