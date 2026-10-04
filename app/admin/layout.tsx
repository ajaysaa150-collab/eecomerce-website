import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  title: 'BRANDWORLD Studio Control & Admin Center',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
