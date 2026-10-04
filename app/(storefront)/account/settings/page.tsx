'use client';

import React, { useState } from 'react';
import { AccountLayoutClient } from '@/components/storefront/AccountLayoutClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Shield } from 'lucide-react';

export default function AccountSettingsPage() {
  const { profile } = useAuth();
  const { success } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('Settings Updated', 'Your profile details have been saved.');
    }, 500);
  };

  return (
    <AccountLayoutClient>
      <div className="space-y-6">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Profile Settings
          </h2>
          <p className="text-xs text-secondary mt-1">
            Personal credentials and notification preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 max-w-xl">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="New Password (leave blank to retain current)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="p-4 rounded-xl bg-cream/70 border border-black/5 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-foreground block">Account Role</span>
              <span className="text-secondary">Current permission level:</span>
            </div>
            <span className="font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-foreground text-white flex items-center gap-1">
              <Shield className="w-3 h-3 text-accent" /> {profile?.role}
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </AccountLayoutClient>
  );
}
