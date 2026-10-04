import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
      <span className="font-serif-heading text-7xl sm:text-9xl font-bold text-black/10 select-none">
        404
      </span>
      <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-2">
        Object Out of Bounds
      </h2>
      <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        The piece, page, or acquisition link you sought does not exist within the current archive.
      </p>
      <Link href="/products">
        <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Return to Catalog
        </Button>
      </Link>
    </div>
  );
}
