'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { initialCategories } from '@/lib/mockData';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { slugify } from '@/lib/utils';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} from '@/lib/supabase';

export default function AdminCategoriesPage() {
  const { success } = useToast();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadAllCategories = useCallback(async () => {
    try {
      const live = await getCategories();
      if (live && live.length > 0) {
        setCategories(live);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadAllCategories();
    window.addEventListener('atelier_categories_updated', loadAllCategories);
    return () => window.removeEventListener('atelier_categories_updated', loadAllCategories);
  }, [loadAllCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(cat.image_url);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name,
        slug: slug || slugify(name),
        description,
        image_url: imageUrl,
      });
      await loadAllCategories();
      success('Category Updated', `${name} updated successfully.`);
    } else {
      await createCategory({
        name,
        slug: slug || slugify(name),
        description,
        image_url: imageUrl,
        sort_order: categories.length + 1,
      });
      await loadAllCategories();
      success('Category Created', `${name} has been created.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    await loadAllCategories();
    success('Category Removed', 'Category was removed.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Category Architecture
          </h2>
          <p className="text-xs text-secondary mt-1">
            Define navigational groupings, cover imagery, and hierarchy.
          </p>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="luxury-card rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-[4/3] w-full bg-cream">
              <Image src={cat.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800'} alt={cat.name} fill unoptimized className="object-cover" />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-foreground mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-secondary">/{cat.slug}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 text-secondary hover:text-foreground rounded hover:bg-black/5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-secondary hover:text-destructive rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingCategory) setSlug(slugify(e.target.value));
            }}
            required
          />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <Input label="Cover Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
