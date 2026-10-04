'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { initialProducts, initialCategories } from '@/lib/mockData';
import { Product } from '@/types';
import { formatCurrency, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getCategories,
} from '@/lib/supabase';
import { COUNTRIES } from '@/context/CurrencyContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Package,
  Globe,
} from 'lucide-react';

export default function AdminProductsPage() {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categoryList, setCategoryList] = useState(initialCategories);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const loadAllProducts = useCallback(async () => {
    try {
      const live = await getProducts({ status: 'all' });
      if (live && live.length > 0) {
        setProducts(live);
      }
    } catch {}
  }, []);

  const handleToggleStatus = async (p: Product) => {
    const newStatus: 'active' | 'draft' = (p.status || 'active') === 'active' ? 'draft' : 'active';
    await updateProduct(p.id, { status: newStatus });
    await loadAllProducts();
    success(
      'Status Updated',
      `${p.title} is now ${newStatus === 'active' ? 'ACTIVE (Visible in Store)' : 'DRAFT (Hidden from Store)'}.`
    );
  };

  const loadAllCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      if (cats && cats.length > 0) {
        setCategoryList(cats);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadAllProducts();
    loadAllCategories();
    window.addEventListener('atelier_products_updated', loadAllProducts);
    window.addEventListener('atelier_categories_updated', loadAllCategories);
    return () => {
      window.removeEventListener('atelier_products_updated', loadAllProducts);
      window.removeEventListener('atelier_categories_updated', loadAllCategories);
    };
  }, [loadAllProducts, loadAllCategories]);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState(initialCategories[0].id);
  const [formPrice, setFormPrice] = useState<number | ''>(2499);
  const [formSalePrice, setFormSalePrice] = useState<number | ''>('');
  const [priceCountryCode, setPriceCountryCode] = useState<string>('IN');
  const activeCountry = COUNTRIES.find((c) => c.code === priceCountryCode) || COUNTRIES[0];

  const handlePriceCountryChange = (newCode: string) => {
    const newCountry = COUNTRIES.find((c) => c.code === newCode) || COUNTRIES[0];
    if (formPrice !== '' && !isNaN(Number(formPrice))) {
      const inUSD = Number(formPrice) / activeCountry.rate;
      const inNew = Math.round(inUSD * newCountry.rate * 100) / 100;
      setFormPrice(inNew);
    }
    if (formSalePrice !== '' && !isNaN(Number(formSalePrice))) {
      const inUSD = Number(formSalePrice) / activeCountry.rate;
      const inNew = Math.round(inUSD * newCountry.rate * 100) / 100;
      setFormSalePrice(inNew);
    }
    setPriceCountryCode(newCode);
  };

  const [formSku, setFormSku] = useState('');
  const [formStock, setFormStock] = useState(25);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('active');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || (p.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormCategoryId(initialCategories[0].id);
    setPriceCountryCode('IN');
    setFormPrice(2499);
    setFormSalePrice('');
    setFormSku('BW-NEW-' + Math.floor(100 + Math.random() * 900));
    setFormStock(20);
    setFormImageUrl('https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormDescription(p.description.replace(/<[^>]+>/g, ''));
    setFormCategoryId(p.category_id);
    setPriceCountryCode('IN');
    const inINR = Math.round(p.price * 83.5);
    setFormPrice(inINR);
    setFormSalePrice(p.sale_price ? Math.round(p.sale_price * 83.5) : '');
    setFormSku(p.sku);
    setFormStock(p.stock_quantity);
    setFormImageUrl(p.images[0]?.image_url || '');
    setFormStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSku) {
      toastError('Validation Error', 'Title and SKU are mandatory.');
      return;
    }

    const category = categoryList.find((c) => c.id === formCategoryId) || initialCategories.find((c) => c.id === formCategoryId);

    const finalPriceUSD = Math.round((Number(formPrice) / activeCountry.rate) * 100) / 100;
    const finalSalePriceUSD =
      formSalePrice !== '' ? Math.round((Number(formSalePrice) / activeCountry.rate) * 100) / 100 : null;

    if (editingProduct) {
      // Update
      const updated: Partial<Product> = {
        title: formTitle,
        slug: formSlug || slugify(formTitle),
        description: `<p>${formDescription}</p>`,
        category_id: formCategoryId,
        category,
        price: finalPriceUSD,
        sale_price: finalSalePriceUSD,
        sku: formSku,
        stock_quantity: Number(formStock),
        status: formStatus,
        images: [
          {
            id: editingProduct.images?.[0]?.id || 'img-' + Date.now(),
            product_id: editingProduct.id,
            image_url: formImageUrl || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
            sort_order: 1,
          },
        ],
        updated_at: new Date().toISOString(),
      };

      await updateProduct(editingProduct.id, updated);
      await loadAllProducts();
      success('Product Updated', `${formTitle} was successfully updated.`);
    } else {
      // Create
      const newProd: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
        title: formTitle,
        slug: formSlug || slugify(formTitle),
        description: `<p>${formDescription}</p>`,
        category_id: formCategoryId,
        category,
        price: finalPriceUSD,
        sale_price: finalSalePriceUSD,
        sku: formSku,
        stock_quantity: Number(formStock),
        track_inventory: true,
        allow_backorders: false,
        status: formStatus,
        tags: ['minimal', 'curated'],
        images: [
          {
            id: 'img-' + Date.now(),
            product_id: '',
            image_url: formImageUrl || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
            sort_order: 1,
          },
        ],
      };

      await createProduct(newProd);
      await loadAllProducts();
      success('Product Published', `${formTitle} has been added to the master collection.`);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteCandidateId) return;
    await deleteProduct(deleteCandidateId);
    await loadAllProducts();
    setDeleteCandidateId(null);
    success('Product Removed', 'The design object was removed from catalog.');
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteProduct(id);
    }
    await loadAllProducts();
    setSelectedIds([]);
    success('Bulk Delete', 'Selected products were deleted.');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Product Management
          </h2>
          <p className="text-xs text-secondary mt-1">
            Maintain catalog pricing, inventory allocation, descriptions, and media assets.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-foreground text-white shadow-sm'
              : 'bg-white text-secondary hover:text-foreground border border-black/5'
          }`}
        >
          All Objects ({products.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-success text-white shadow-sm'
              : 'bg-white text-secondary hover:text-foreground border border-black/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Active ({products.filter((p) => (p.status || 'active') === 'active').length})
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === 'draft'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'bg-white text-secondary hover:text-foreground border border-black/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-neutral-400" />
          Draft ({products.filter((p) => p.status === 'draft').length})
        </button>
      </div>

      {/* Filter / Search & Bulk Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-secondary">{selectedIds.length} selected</span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream/50 border-b border-black/5 text-secondary uppercase tracking-wider font-semibold">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-black/20"
                  />
                </th>
                <th className="p-4">Object</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} className="hover:bg-cream/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedIds((prev) =>
                            isSelected ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          );
                        }}
                        className="rounded border-black/20"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-cream border border-black/5 shrink-0">
                          <Image
                            src={p.images[0]?.image_url || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=200'}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{p.title}</p>
                          <p className="text-[11px] text-secondary font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium">{p.sku}</td>
                    <td className="p-4 text-secondary">{p.category?.name || 'Unassigned'}</td>
                    <td className="p-4 font-bold text-foreground">
                      {p.sale_price ? (
                        <span>
                          {formatCurrency(p.sale_price)}{' '}
                          <span className="text-[10px] text-secondary line-through">
                            {formatCurrency(p.price)}
                          </span>
                        </span>
                      ) : (
                        formatCurrency(p.price)
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold ${
                          p.stock_quantity < 10 ? 'text-destructive font-bold' : 'text-foreground'
                        }`}
                      >
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        title={`Click to switch to ${p.status === 'active' ? 'Draft (Hide from user side)' : 'Active (Show on user side)'}`}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                          p.status === 'active'
                            ? 'bg-success/10 text-success border-success/30 hover:bg-success/20'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'active' ? 'bg-success' : 'bg-neutral-400'
                          }`}
                        />
                        <span>{p.status || 'active'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className="p-1.5 text-secondary hover:text-foreground rounded-md hover:bg-black/5"
                          title={p.status === 'active' ? 'Make Draft (Hide)' : 'Make Active (Publish)'}
                        >
                          <Eye className={`w-3.5 h-3.5 ${p.status === 'active' ? 'text-success' : 'text-neutral-400'}`} />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-secondary hover:text-foreground rounded-md hover:bg-black/5"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidateId(p.id)}
                          className="p-1.5 text-secondary hover:text-destructive rounded-md hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Object' : 'Publish New Design Object'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product Title"
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              if (!editingProduct) setFormSlug(slugify(e.target.value));
            }}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="URL Slug"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              required
            />
            <Input
              label="SKU Identifier"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="w-full text-xs h-10 px-3 rounded-lg border border-black/10 bg-white"
            >
              {categoryList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country Selection for Pricing */}
          <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-black/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5">
              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  Select Country for Price Setting
                </label>
                <p className="text-[11px] text-secondary">
                  Choose country/currency to set your product price accurately.
                </p>
              </div>
              <select
                value={priceCountryCode}
                onChange={(e) => handlePriceCountryChange(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-black/15 bg-white font-medium shadow-2xs"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency} - {c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={`Regular Price (${activeCountry.symbol} ${activeCountry.currency})`}
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
              <Input
                label={`Sale Price (${activeCountry.symbol} ${activeCountry.currency})`}
                type="number"
                value={formSalePrice}
                onChange={(e) => setFormSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <Input
                label="Stock Quantity"
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                required
              />
            </div>

            {/* Live Cross-Country Currency Preview */}
            <div className="pt-2 border-t border-black/5 flex flex-wrap items-center gap-2 text-[11px] text-secondary">
              <span className="font-semibold text-foreground">Global Preview:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-black/10 font-medium">
                Base USD: ${(formPrice && !isNaN(Number(formPrice)) ? Number(formPrice) / activeCountry.rate : 0).toFixed(2)}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-black/10 font-medium">
                🇮🇳 India: ₹{Math.round((formPrice && !isNaN(Number(formPrice)) ? Number(formPrice) / activeCountry.rate : 0) * 83.5).toLocaleString()}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-black/10 font-medium">
                🇺🇸 USA: ${(formPrice && !isNaN(Number(formPrice)) ? Number(formPrice) / activeCountry.rate : 0).toFixed(2)}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-black/10 font-medium">
                🇬🇧 UK: £{((formPrice && !isNaN(Number(formPrice)) ? Number(formPrice) / activeCountry.rate : 0) * 0.79).toFixed(2)}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-black/10 font-medium">
                🇪🇺 Europe: €{((formPrice && !isNaN(Number(formPrice)) ? Number(formPrice) / activeCountry.rate : 0) * 0.92).toFixed(2)}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-black/10 font-medium">
                🇦🇪 UAE: د.إ{((formPrice && !isNaN(Number(formPrice)) ? Number(formPrice) / activeCountry.rate : 0) * 3.67).toFixed(2)}
              </span>
            </div>
          </div>

          <Input
            label="Primary Image URL"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
            placeholder="https://..."
            required
          />

          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1.5">
              Product Description
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
              placeholder="Enter product narrative, material composition, and design details..."
              required
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-cream/70 border border-black/5 text-xs">
            <span className="font-semibold text-foreground">Publication Status</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormStatus('active')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  formStatus === 'active' ? 'bg-success text-white' : 'bg-white border text-secondary'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setFormStatus('draft')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  formStatus === 'draft' ? 'bg-neutral-800 text-white' : 'bg-white border text-secondary'
                }`}
              >
                Draft
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteCandidateId)}
        onClose={() => setDeleteCandidateId(null)}
        title="Confirm Removal"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-secondary leading-relaxed">
            Are you certain you wish to delete this archival piece? This action permanently removes the record and its variants.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteCandidateId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
