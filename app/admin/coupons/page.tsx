'use client';

import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { Plus, Tag, Trash2, CheckCircle2, Percent, DollarSign, RefreshCw, AlertTriangle, Globe } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';

export default function AdminCouponsPage() {
  const { currentCountry, availableCountries, setCountry } = useCurrency();
  const { success, error: toastError } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number | string>(15);
  const [minOrder, setMinOrder] = useState<number | string>(100);
  const [usageLimit, setUsageLimit] = useState<number | string>(200);

  // Deletion state
  const [deleteCandidate, setDeleteCandidate] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      } else {
        toastError('Failed to load coupons', data.error || 'Server error');
      }
    } catch (err: any) {
      toastError('Connection Error', err?.message || 'Could not fetch coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toastError('Validation Error', 'Promo code is required.');
      return;
    }

    if (!value || Number(value) <= 0) {
      toastError('Validation Error', 'Enter a valid discount value greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          type,
          value: Number(value),
          min_order_amount: Number(minOrder) || 0,
          usage_limit: usageLimit ? Number(usageLimit) : null,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.coupon) {
        setCoupons((prev) => [data.coupon, ...prev]);
        setIsModalOpen(false);
        success('Promo Code Created', `Code "${data.coupon.code}" is now live and working in checkout.`);
        setCode('');
        setValue(15);
        setMinOrder(100);
        setUsageLimit(200);
      } else {
        toastError('Creation Failed', data.error || 'Failed to create promo code');
      }
    } catch (err: any) {
      toastError('Error', err?.message || 'Failed to save promo code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    const updatedStatus = !c.is_active;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: c.id,
          is_active: updatedStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, is_active: updatedStatus } : item))
        );
        success(
          updatedStatus ? 'Coupon Activated' : 'Coupon Deactivated',
          `Promo code "${c.code}" is now ${updatedStatus ? 'active' : 'inactive'}.`
        );
      } else {
        toastError('Update Failed', data.error || 'Could not update coupon');
      }
    } catch (err: any) {
      toastError('Error', err?.message || 'Could not update coupon status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(deleteCandidate.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((item) => item.id !== deleteCandidate.id));
        success('Coupon Removed', `Code "${deleteCandidate.code}" has been deleted.`);
        setDeleteCandidate(null);
      } else {
        toastError('Delete Failed', data.error || 'Could not delete coupon');
      }
    } catch (err: any) {
      toastError('Error', err?.message || 'Failed to remove coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-heading text-2xl font-bold text-foreground">
              Promotional Coupons & Codes
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cream text-foreground border border-black/10">
              {coupons.length} Codes
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Manage percentage and fixed currency incentive codes. All codes created here immediately work in the storefront cart and checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCoupons}
            disabled={isLoading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
            className="text-xs"
          >
            Create Promo Code
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/10 shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-secondary mx-auto mb-3" />
            <p className="text-xs font-medium text-secondary">Loading promo codes from database...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center">
            <Tag className="w-8 h-8 text-secondary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No Promo Codes</h3>
            <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
              Create your first promotional discount code to offer savings to customers.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-xs"
            >
              Create Promo Code
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-cream/50 border-b border-black/5 text-secondary uppercase tracking-wider font-semibold">
                  <th className="p-4">Promo Code</th>
                  <th className="p-4">Discount Type</th>
                  <th className="p-4">Benefit</th>
                  <th className="p-4">Min. Spend</th>
                  <th className="p-4">Usage Count</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground tracking-wider flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-accent" />
                      {c.code}
                    </td>
                    <td className="p-4 uppercase text-secondary font-medium">
                      {c.type === 'percentage' ? 'Percentage (%)' : `Fixed (${currentCountry.symbol} ${currentCountry.currency})`}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `-${formatCurrency(c.value)}`}
                    </td>
                    <td className="p-4 text-secondary">
                      {c.min_order_amount > 0 ? formatCurrency(c.min_order_amount) : 'No Minimum'}
                    </td>
                    <td className="p-4 text-secondary font-medium">
                      {c.times_used || 0}{' '}
                      {c.usage_limit ? (
                        <span className="text-[10px] text-black/40">/ {c.usage_limit} limit</span>
                      ) : (
                        <span className="text-[10px] text-black/40">(unlimited)</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          c.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-black/10 text-secondary hover:bg-black/15'
                        }`}
                        title="Click to toggle active status"
                      >
                        {c.is_active && <CheckCircle2 className="w-3 h-3" />}
                        {c.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(c)}
                          className="text-[11px] h-7 px-2"
                        >
                          {c.is_active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteCandidate(c)}
                          className="text-[11px] h-7 px-2 text-destructive hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Promo Code"
        description="Configure an active promotional incentive code that customers can redeem in their cart and checkout."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Target Country & Currency Info */}
          <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-black/5 text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span className="font-medium text-secondary">Target Country & Currency:</span>
            </div>
            <select
              value={currentCountry.code}
              onChange={(e) => setCountry(e.target.value)}
              className="text-xs font-semibold px-2 py-1 rounded-lg border border-black/10 bg-white cursor-pointer focus:outline-none focus:border-accent"
            >
              {availableCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.symbol} {c.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
              Promo Code String <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VIP20, SUMMER50, WELCOME"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono uppercase tracking-wider px-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as 'percentage' | 'fixed';
                  setType(newType);
                  if (newType === 'fixed' && value === 15) {
                    setValue(currentCountry.currency === 'INR' ? 500 : 25);
                  }
                }}
                className="w-full text-xs px-3 h-10 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-accent font-medium"
              >
                <option value="percentage">Percentage (%) Discount</option>
                <option value="fixed">Fixed Currency ({currentCountry.symbol} {currentCountry.currency}) Off</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
                Benefit Value {type === 'percentage' ? '(%)' : `(${currentCountry.symbol} ${currentCountry.currency})`} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  max={type === 'percentage' ? 100 : 1000000}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={`w-full text-xs px-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent ${type === 'fixed' ? 'pl-8' : ''}`}
                  placeholder={type === 'percentage' ? 'e.g. 20' : `e.g. ${currentCountry.currency === 'INR' ? '500' : '25'}`}
                />
                {type === 'fixed' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">
                    {currentCountry.symbol}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
                Min. Spend Requirement ({currentCountry.symbol} {currentCountry.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
                  placeholder="0 for no minimum"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">
                  {currentCountry.symbol}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
                Max Usage Limit
              </label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full text-xs px-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
                placeholder="Total redemptions allowed"
              />
            </div>
          </div>

          <div className="p-3 bg-cream/50 rounded-xl border border-black/5 text-[11px] text-secondary space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Rule Preview:</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-black/10 font-semibold text-foreground flex items-center gap-1">
                <span>{currentCountry.flag}</span>
                <span>{currentCountry.currency} ({currentCountry.symbol})</span>
              </span>
            </div>
            <p>
              Customer gets{' '}
              <strong className="text-foreground">
                {type === 'percentage'
                  ? `${value || 0}% off`
                  : `${currentCountry.symbol}${value || 0} ${currentCountry.currency} off`}
              </strong>{' '}
              when spending at least{' '}
              <strong className="text-foreground">
                {minOrder && Number(minOrder) > 0
                  ? `${currentCountry.symbol}${minOrder} ${currentCountry.currency}`
                  : 'any amount'}
              </strong>
              .
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Publish Promo Code'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={Boolean(deleteCandidate)}
          onClose={() => setDeleteCandidate(null)}
          title="Delete Promo Code"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  Delete Code "{deleteCandidate.code}"?
                </p>
                <p className="text-red-700 text-[11px] mt-0.5">
                  Customers will no longer be able to redeem this coupon in the checkout or cart.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
