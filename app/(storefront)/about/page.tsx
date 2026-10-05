import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-container mx-auto px-6 sm:px-12 py-16 w-full">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[11px] uppercase tracking-label font-bold text-secondary">
            Our Philosophy
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-6xl font-bold text-foreground">
            Form Follows Silence.
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Our atelier was founded in 2024 with a singular objective: to strip away the superfluous and elevate intentional living through pure materiality.
          </p>
        </div>

        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-cream border border-black/5 luxury-card">
          <Image
            src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1400"
            alt="Design Studio Atelier"
            fill
            className="object-cover"
          />
        </div>

        <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-secondary leading-relaxed space-y-6">
          <p>
            In an era defined by ephemeral fast-design and planned obsolescence, we design objects intended to endure for generations. We collaborate with master artisans in Kyoto, Tuscany, and Solingen who still practice lost-wax bronze casting, natural vegetable tanning, and hand-lapped steel horology.
          </p>
          <p>
            Every artifact is designed with rigorous geometric reductionism—inspired by Dieter Rams, the Bauhaus movement, and Japanese wabi-sabi aesthetics. We believe beauty is not something applied to an object, but something uncovered when everything non-essential is removed.
          </p>
        </div>
      </div>
    </div>
  );
}
