'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { Upload, Copy, Trash2, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: string;
}

export default function AdminMediaPage() {
  const { success } = useToast();
  const [mediaList, setMediaList] = useState<MediaFile[]>([
    {
      id: 'm-1',
      url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000',
      name: 'aura-speaker-primary.jpg',
      size: '1.4 MB',
    },
    {
      id: 'm-2',
      url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000',
      name: 'bauhaus-chronos-wrist.jpg',
      size: '2.1 MB',
    },
    {
      id: 'm-3',
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000',
      name: 'vachetta-weekender.jpg',
      size: '1.8 MB',
    },
    {
      id: 'm-4',
      url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000',
      name: 'hero-minimal-chair.jpg',
      size: '3.2 MB',
    },
    {
      id: 'm-5',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000',
      name: 'bronze-vessel-studio.jpg',
      size: '1.2 MB',
    },
    {
      id: 'm-6',
      url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000',
      name: 'studio-desk-lamp.jpg',
      size: '1.9 MB',
    },
  ]);

  const [inputUrl, setInputUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    const newMedia: MediaFile = {
      id: 'm-' + Date.now(),
      url: inputUrl,
      name: 'asset-' + Date.now() + '.jpg',
      size: '1.5 MB',
    };
    setMediaList([newMedia, ...mediaList]);
    setInputUrl('');
    success('Media Added', 'Image registered in storage library.');
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success('URL Copied', 'Public CDN image URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    success('Asset Deleted', 'Media asset removed.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Media Asset Library
          </h2>
          <p className="text-xs text-secondary mt-1">
            Supabase Storage bucket assets, resolution inspection, and public CDN links.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <form
        onSubmit={handleAddMedia}
        className="bg-white p-6 rounded-2xl border-2 border-dashed border-black/15 shadow-subtle flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="p-3 bg-cream rounded-xl text-foreground shrink-0">
          <Upload className="w-5 h-5" />
        </div>
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Paste public image URL or Supabase Storage link to register..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full text-xs h-10 px-4 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Register Asset
        </Button>
      </form>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {mediaList.map((m) => {
          const isCopied = copiedId === m.id;
          return (
            <div
              key={m.id}
              className="luxury-card rounded-2xl overflow-hidden group flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-cream">
                <Image src={m.url} alt={m.name} fill className="object-cover" />
              </div>

              <div className="p-2.5 bg-white border-t border-black/5 flex items-center justify-between text-xs">
                <div className="truncate mr-2">
                  <p className="font-semibold text-[11px] truncate text-foreground">{m.name}</p>
                  <p className="text-[10px] text-secondary">{m.size}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyUrl(m.id, m.url)}
                    className="p-1.5 rounded hover:bg-black/5 text-secondary hover:text-foreground transition-colors"
                    title="Copy URL"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteMedia(m.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-secondary hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
