import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/hooks/useToast';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WishlistProvider } from '@/hooks/useWishlist';
import { FlyingCartGhost } from '@/components/ui/FlyingCartGhost';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0F0F11',
};

export const metadata: Metadata = {
  title: 'BRANDWORLD | Curated Minimalist Goods & High Design Essentials',
  description: 'Precision-engineered modern luxury essentials, meticulously crafted for modern living and intentional spaces.',
  keywords: ['luxury design', 'minimalist', 'audio', 'horology', 'leather goods'],
  openGraph: {
    title: 'BRANDWORLD | High Design Essentials',
    description: 'Precision-engineered modern luxury essentials.',
    url: 'https://brandworld-design.com',
    siteName: 'BRANDWORLD',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

import { CurrencyProvider } from '@/context/CurrencyContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-accent selection:text-white">
        <ToastProvider>
          <CurrencyProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <FlyingCartGhost />
                  {children}
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </CurrencyProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
