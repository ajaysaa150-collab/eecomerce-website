'use client';

import React, { useState } from 'react';
import { initialSEOSettings } from '@/lib/mockData';
import { SEOSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { Save, Globe, Search, Code, CheckCircle2 } from 'lucide-react';

export default function AdminSEOPage() {
  const { success } = useToast();
  const [seo, setSeo] = useState<SEOSettings>(initialSEOSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (field: keyof SEOSettings, val: any) => {
    setSeo((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('SEO Rules Updated', 'Global meta tags and robots.txt updated.');
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-black/10">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Search Engine Optimization (SEO)
          </h2>
          <p className="text-xs text-secondary mt-1">
            Global search index templates, analytics tracking pixels, and robots.txt policies.
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
          Save SEO Config
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Global Meta */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <Search className="w-4 h-4 text-accent" />
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Global Meta Rules
            </h3>
          </div>

          <Input
            label="Meta Title Template"
            value={seo.meta_title_template}
            onChange={(e) => handleFieldChange('meta_title_template', e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1.5">
              Default Meta Description
            </label>
            <textarea
              rows={3}
              value={seo.default_meta_description}
              onChange={(e) => handleFieldChange('default_meta_description', e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
              required
            />
          </div>

          <Input
            label="OpenGraph Default Share Image URL"
            value={seo.og_default_image_url}
            onChange={(e) => handleFieldChange('og_default_image_url', e.target.value)}
            required
          />
        </div>

        {/* Analytics & Verification */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <Code className="w-4 h-4 text-accent" />
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Analytics & Verification Tags
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Google Analytics (GA4) Tag ID"
              placeholder="G-XXXXXXX"
              value={seo.ga_tracking_id || ''}
              onChange={(e) => handleFieldChange('ga_tracking_id', e.target.value)}
            />
            <Input
              label="Facebook Pixel ID"
              placeholder="1234567890"
              value={seo.fb_pixel_id || ''}
              onChange={(e) => handleFieldChange('fb_pixel_id', e.target.value)}
            />
          </div>
        </div>

        {/* Robots.txt */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-4">
          <h3 className="font-serif-heading text-lg font-bold text-foreground">
            Robots.txt Directives
          </h3>
          <textarea
            rows={5}
            value={seo.robots_txt || ''}
            onChange={(e) => handleFieldChange('robots_txt', e.target.value)}
            className="w-full font-mono text-xs p-4 rounded-xl border border-black/10 bg-cream/30 focus:outline-none focus:border-accent"
          />
        </div>
      </form>
    </div>
  );
}
