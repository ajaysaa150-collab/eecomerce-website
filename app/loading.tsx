import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-2 border-black/10 border-t-foreground rounded-full animate-spin mb-4" />
      <span className="font-serif-heading text-sm text-secondary tracking-widest uppercase">
        Loading Atelier Archive...
      </span>
    </div>
  );
}
