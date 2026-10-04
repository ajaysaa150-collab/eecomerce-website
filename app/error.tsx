'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="font-serif-heading text-3xl font-bold text-foreground mb-2">
        An Unexpected Interrupt Occurred
      </h2>
      <p className="text-xs text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        {error.message || 'We were unable to complete your archival request. Our engineering team has been notified.'}
      </p>
      <Button variant="primary" onClick={() => reset()}>
        Retry Operation
      </Button>
    </div>
  );
}
