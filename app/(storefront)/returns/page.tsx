import React from 'react';

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 w-full space-y-8">
      <div>
        <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
          Assurances
        </span>
        <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-foreground">
          Exchanges & Returns
        </h1>
      </div>

      <div className="text-xs sm:text-sm text-secondary leading-relaxed space-y-6">
        <p>
          We stand unconditionally behind the engineering integrity and aesthetic merit of every piece. If an acquisition does not harmonize with your space or expectations, you may return it within 30 days of confirmed delivery for a full refund or archival exchange.
        </p>
        <p>
          Items must remain in pristine, unaltered condition with original tags, certificates of authenticity, and packaging intact. Return shipping is prepaid and provided by our concierge upon request.
        </p>
      </div>
    </div>
  );
}
