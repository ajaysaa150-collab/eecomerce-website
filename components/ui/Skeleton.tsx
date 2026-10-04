import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg skeleton-shimmer overflow-hidden', className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full aspect-[4/5] rounded-xl" />
      <Skeleton className="w-1/3 h-3 mt-1" />
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-1/4 h-4" />
    </div>
  );
}
