'use client';

import React, { useState } from 'react';
import { initialSiteSettings, initialHeroSlides } from '@/lib/mockData';
import { SiteSettings, HeroSlide } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { Save, Plus, Trash2, Edit2, Sliders, Palette, Globe, Megaphone } from 'lucide-react';
import Image from 'next/image';

export default function AdminSettingsPage() {
  const { success } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [slides, setSlides] = useState<HeroSlide[]>(initialHeroSlides);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (field: keyof SiteSettings, val: any) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('Settings Applied', 'Brand settings and hero slides updated across storefront.');
    }, 600);
  };

  const deleteSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    success('Slide Removed', 'Hero slide removed from carousel.');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-black/10">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Brand Identity & Store Settings
          </h2>
          <p className="text-xs text-secondary mt-1">
            Real-time customization of headers, footers, announcements, currencies, and hero slides.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSaveAll}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Configuration
        </Button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* 1. Brand Identity */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <Palette className="w-4 h-4 text-accent" />
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Brand Identity & Typography
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Site Name / Logo Text"
              value={settings.site_name}
              onChange={(e) => handleFieldChange('site_name', e.target.value)}
              required
            />
            <Input
              label="Brand Tagline"
              value={settings.tagline}
              onChange={(e) => handleFieldChange('tagline', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Logo URL"
              value={settings.logo_url}
              onChange={(e) => handleFieldChange('logo_url', e.target.value)}
            />
            <Input
              label="Favicon URL"
              value={settings.favicon_url || ''}
              onChange={(e) => handleFieldChange('favicon_url', e.target.value)}
            />
          </div>
        </div>

        {/* 2. Announcement Bar */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-accent" />
              <h3 className="font-serif-heading text-lg font-bold text-foreground">
                Announcement Marquee Bar
              </h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_bar_active}
                onChange={(e) => handleFieldChange('announcement_bar_active', e.target.checked)}
                className="rounded text-accent focus:ring-accent"
              />
              <span>Display Bar</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Announcement Text"
                value={settings.announcement_bar_text || ''}
                onChange={(e) => handleFieldChange('announcement_bar_text', e.target.value)}
              />
            </div>
            <Input
              label="Background Hex (#1A1A1A)"
              value={settings.announcement_bar_color || '#1A1A1A'}
              onChange={(e) => handleFieldChange('announcement_bar_color', e.target.value)}
            />
          </div>
        </div>

        {/* 3. Hero Carousel Slides */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent" />
              <h3 className="font-serif-heading text-lg font-bold text-foreground">
                Homepage Hero Slides ({slides.length})
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-black/10 bg-cream/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black shrink-0">
                    <Image src={s.image_url} alt={s.heading} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{s.heading}</h4>
                    <p className="text-xs text-secondary line-clamp-1">{s.subheading}</p>
                    <span className="text-[10px] text-accent font-semibold">{s.cta_text} → {s.cta_link}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteSlide(s.id)}
                  className="p-2 text-secondary hover:text-destructive rounded-lg hover:bg-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Contact & Socials */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <Globe className="w-4 h-4 text-accent" />
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Contact & Social Channels
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Concierge Email"
              value={settings.contact_email}
              onChange={(e) => handleFieldChange('contact_email', e.target.value)}
            />
            <Input
              label="Telephone"
              value={settings.contact_phone}
              onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
            />
            <Input
              label="Physical Studio Address"
              value={settings.business_address}
              onChange={(e) => handleFieldChange('business_address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Instagram URL"
              value={settings.social_instagram || ''}
              onChange={(e) => handleFieldChange('social_instagram', e.target.value)}
            />
            <Input
              label="Twitter / X URL"
              value={settings.social_twitter || ''}
              onChange={(e) => handleFieldChange('social_twitter', e.target.value)}
            />
            <Input
              label="Facebook URL"
              value={settings.social_facebook || ''}
              onChange={(e) => handleFieldChange('social_facebook', e.target.value)}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
