import React from 'react';
import { getSiteSettings } from '@/lib/supabase';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';

export const revalidate = 60;

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return <StorefrontShell settings={settings}>{children}</StorefrontShell>;
}
