'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, Role } from '@/types';
import { useToast } from './useToast';

// Recognized admin email addresses
const ADMIN_EMAILS = ['ajaysaa789@gmail.com', 'admin@atelier.com'];
const ADMIN_PASSWORD = 'jujharsingh';

interface AuthResult {
  success: boolean;
  requireConfirmation?: boolean;
  notConfirmed?: boolean;
  alreadyExists?: boolean;
  email?: string;
  error?: string;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const { success, error: toastError } = useToast();

  useEffect(() => {
    // 1. Initial check for persisted demo/admin profile
    try {
      const saved = localStorage.getItem('atelier_demo_user');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }

    // 2. Supabase auth session listener
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email || '');
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          try {
            localStorage.removeItem('atelier_demo_user');
            window.dispatchEvent(new CustomEvent('atelier_auth_changed', { detail: null }));
          } catch {}
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  const fetchSupabaseProfile = async (userId: string, email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isAdminEmail = ADMIN_EMAILS.includes(cleanEmail);

      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        const userProfile = data as Profile;
        // If this is an authorized admin email, ensure the role is set to 'admin'
        if (isAdminEmail && userProfile.role !== 'admin') {
          userProfile.role = 'admin';
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        }
        setProfile(userProfile);
        try {
          localStorage.setItem('atelier_demo_user', JSON.stringify(userProfile));
          window.dispatchEvent(new CustomEvent('atelier_auth_changed', { detail: userProfile }));
        } catch {}
      } else {
        // Fallback profile if row not created yet
        const newProf: Profile = {
          id: userId,
          email: cleanEmail,
          full_name: isAdminEmail ? 'Admin' : (email.split('@')[0] || 'User'),
          role: isAdminEmail ? 'admin' : 'customer',
          avatar_url: isAdminEmail
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
            : undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert(newProf);
        } catch {}

        setProfile(newProf);
        try {
          localStorage.setItem('atelier_demo_user', JSON.stringify(newProf));
          window.dispatchEvent(new CustomEvent('atelier_auth_changed', { detail: newProf }));
        } catch {}
      }
    } catch (err) {
      console.warn('Error fetching Supabase profile:', err);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured()) {
      try {
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: cleanEmail,
          options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        });

        if (error) {
          toastError('Resend Failed', error.message);
          return { success: false, error: error.message };
        }

        success('Confirmation Sent', `A new verification email has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to resend confirmation email';
        toastError('Resend Error', msg);
        return { success: false, error: msg };
      }
    }

    success('Confirmation Sent', `A simulated verification email has been sent to ${cleanEmail}.`);
    return { success: true };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isAdminCredentials = ADMIN_EMAILS.includes(cleanEmail) && password === ADMIN_PASSWORD;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          await fetchSupabaseProfile(data.user.id, data.user.email || cleanEmail);
          setIsLoading(false);
          const isAdm = ADMIN_EMAILS.includes(cleanEmail);
          success('Welcome Back', isAdm ? 'Logged in as Administrator.' : 'You are now signed in.');
          closeAuthModal();
          return { success: true };
        }

        if (error) {
          setIsLoading(false);
          const msg = error.message;
          const isUnconfirmed =
            msg.toLowerCase().includes('email not confirmed') ||
            msg.toLowerCase().includes('not confirmed') ||
            (error as any).code === 'email_not_confirmed';

          if (isUnconfirmed) {
            toastError('Email Not Confirmed', 'Please verify your email address before signing in.');
            return {
              success: false,
              notConfirmed: true,
              email: cleanEmail,
              error: 'Your email has not been verified yet. Please check your email inbox and click the confirmation link before logging in.',
            };
          }

          // Fallback for primary verified admin credentials
          if (isAdminCredentials) {
            const adminProf: Profile = {
              id: 'e4ae97eb-8861-400e-9d2a-4328d5b0754f',
              email: cleanEmail,
              full_name: 'Admin',
              role: 'admin',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            try {
              await supabase.from('profiles').upsert(adminProf);
            } catch {}

            setProfile(adminProf);
            try {
              localStorage.setItem('atelier_demo_user', JSON.stringify(adminProf));
            } catch {}

            success('Welcome Back, Admin', 'Logged in as Administrator.');
            closeAuthModal();
            return { success: true };
          }

          toastError('Authentication Failed', msg || 'Invalid email or password');
          return { success: false, error: msg || 'Invalid email or password' };
        }
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        toastError('Authentication Error', msg);
        return { success: false, error: msg };
      }
    }

    // Offline / unconfigured fallback: Only allow authorized master admin credentials, block arbitrary accounts
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);

    if (isAdminCredentials) {
      const adminProf: Profile = {
        id: 'usr-admin-main',
        email: cleanEmail,
        full_name: 'Admin',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(adminProf);
      try {
        localStorage.setItem('atelier_demo_user', JSON.stringify(adminProf));
        window.dispatchEvent(new CustomEvent('atelier_auth_changed', { detail: adminProf }));
      } catch {}
      success('Welcome Back, Admin', 'Signed in as Administrator.');
      closeAuthModal();
      return { success: true };
    }

    // Disallow arbitrary fake logins
    toastError(
      'Authentication Database Offline',
      'Supabase environment variables are missing on Vercel. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Settings.'
    );
    return {
      success: false,
      error: 'Authentication database is not configured. Please set Supabase environment variables in Vercel.',
    };
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        });
        setIsLoading(false);

        if (error) {
          const isAlreadyRegistered =
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already exists') ||
            error.message.toLowerCase().includes('user already');

          if (isAlreadyRegistered) {
            toastError('Account Exists', 'An account with this email already exists. Please log in.');
            return {
              success: false,
              alreadyExists: true,
              email: cleanEmail,
              error: 'An account with this email already exists. Please log in.',
            };
          }

          toastError('Sign Up Failed', error.message);
          return { success: false, error: error.message };
        }

        // In Supabase, if an email already exists, identities is returned as empty array []
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          toastError('Account Exists', 'An account with this email already exists. Please log in.');
          return {
            success: false,
            alreadyExists: true,
            email: cleanEmail,
            error: 'An account with this email already exists. Please log in.',
          };
        }

        // Email confirmation is required when session is null or confirmed_at is null
        if (data?.user && !data.session) {
          // Do NOT automatically log them in! They must verify first.
          success('Confirmation Email Sent', `We have sent a verification email to ${cleanEmail}.`);
          return {
            success: true,
            requireConfirmation: true,
            email: cleanEmail,
          };
        }

        // Only if email confirmation is disabled on Supabase and an active session was generated:
        if (data?.session && data?.user) {
          await fetchSupabaseProfile(data.user.id, cleanEmail);
          success('Account Created', 'Welcome to your account.');
          closeAuthModal();
          return { success: true };
        }

        return {
          success: true,
          requireConfirmation: true,
          email: cleanEmail,
        };
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Sign up error occurred';
        toastError('Sign Up Failed', msg);
        return { success: false, error: msg };
      }
    }

    // If Supabase is unconfigured, reject signups with informative notification
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    toastError(
      'Authentication Database Offline',
      'Supabase environment variables are missing on Vercel. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Settings.'
    );
    return {
      success: false,
      error: 'Authentication database is not configured. Please set Supabase environment variables in Vercel.',
    };
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setProfile(null);
    try {
      localStorage.removeItem('atelier_demo_user');
      localStorage.removeItem('atelier_cart');

      // Clear all user-specific cached items (wishlists, saved addresses, etc.)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('atelier_wishlist_') || k.startsWith('atelier_addresses_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      window.dispatchEvent(new CustomEvent('atelier_auth_changed', { detail: null }));
    } catch {}
    setIsLoading(false);
    success('Signed Out', 'You have been signed out successfully.');

    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const user = profile ? { id: profile.id, email: profile.email } : null;
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        resendConfirmationEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
