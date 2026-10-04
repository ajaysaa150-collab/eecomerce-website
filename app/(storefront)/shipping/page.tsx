import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 w-full space-y-8">
      <div>
        <span className="text-[11px] uppercase tracking-label font-bold text-secondary block mb-1">
          Policy & Fulfillment
        </span>
        <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-foreground">
          Shipping & Delivery
        </h1>
      </div>

      <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-secondary leading-relaxed space-y-6">
        <p>
          All ATELIER acquisitions are prepared and dispatched from our primary climate-controlled distribution studio in SoHo, New York. We utilize insured, carbon-neutral courier dispatches via DHL Express and FedEx Priority.
        </p>

        <h3 className="font-serif-heading text-lg font-bold text-foreground">1. Shipping Options & Rates</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Standard Courier Delivery (3–5 Business Days):</strong> Complimentary for all orders exceeding $250. Flat rate of $25 for orders beneath this threshold.</li>
          <li><strong>Atelier Express Priority (1–2 Business Days):</strong> $35 flat rate worldwide. Orders submitted before 2:00 PM EST ship same-day.</li>
        </ul>

        <h3 className="font-serif-heading text-lg font-bold text-foreground">2. Archival Packaging</h3>
        <p>
          To safeguard delicate horological calibers, anodized acoustics, and fine leathers, each piece is individually enveloped in acid-free tissue, sealed with tamper-evident serial tape, and enclosed within shock-absorbent double-walled corrugated cartons.
        </p>
      </div>
    </div>
  );
}
