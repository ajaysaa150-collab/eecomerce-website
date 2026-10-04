'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Users,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface AdminReview {
  id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  product_slug: string;
  user_id?: string | null;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const { success, error: toastError } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Deletion modal state
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        toastError('Failed to load reviews', data.error || 'Server error');
      }
    } catch (err: any) {
      toastError('Connection Error', err?.message || 'Could not fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleVerified = async (rev: AdminReview) => {
    const updatedStatus = !rev.is_verified;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: rev.id, is_verified: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === rev.id ? { ...r, is_verified: updatedStatus } : r))
        );
        success(
          updatedStatus ? 'Marked Verified' : 'Marked Unverified',
          `Review is now ${updatedStatus ? 'verified buyer' : 'standard'}.`
        );
      } else {
        toastError('Update Failed', data.error || 'Failed to update review status');
      }
    } catch (err: any) {
      toastError('Error', err?.message || 'Could not update verification status');
    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews?reviewId=${encodeURIComponent(reviewToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
        success('Review Deleted', 'The product review has been permanently removed.');
        setReviewToDelete(null);
      } else {
        toastError('Delete Failed', data.error || 'Failed to remove review');
      }
    } catch (err: any) {
      toastError('Error', err?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter calculations
  const filtered = reviews.filter((r) => {
    const query = search.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(query) ||
      r.body.toLowerCase().includes(query) ||
      r.user_name.toLowerCase().includes(query) ||
      r.product_title.toLowerCase().includes(query);

    const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter, 10);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && r.is_verified) ||
      (statusFilter === 'unverified' && !r.is_verified);

    return matchesSearch && matchesRating && matchesStatus;
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : '5.0';
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const verifiedCount = reviews.filter((r) => r.is_verified).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-heading text-2xl font-bold text-foreground">
              Customer Product Reviews
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              {totalReviews} Total
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Real customer ratings, verified buyer feedback, and archive testimonials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Users className="w-3.5 h-3.5" />
              Customer Directory
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReviews}
            disabled={isLoading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Total Reviews
            </span>
            <MessageSquare className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{totalReviews}</p>
          <p className="text-[11px] text-secondary mt-1">Across all products</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Average Rating
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-foreground">{avgRating}</p>
            <span className="text-xs text-secondary font-medium">/ 5.0</span>
          </div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(Number(avgRating))
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-black/15'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              5-Star Reviews
            </span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{fiveStarCount}</p>
          <p className="text-[11px] text-secondary mt-1">
            {totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0}% of total
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Verified Buyers
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{verifiedCount}</p>
          <p className="text-[11px] text-secondary mt-1">
            {totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 0}% authenticated
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-subtle flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reviews by customer, product, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as any)}
            className="text-xs h-10 px-3 rounded-xl border border-black/10 bg-white text-foreground focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">★★★★★ 5 Stars</option>
            <option value="4">★★★★☆ 4 Stars</option>
            <option value="3">★★★☆☆ 3 Stars</option>
            <option value="2">★★☆☆☆ 2 Stars</option>
            <option value="1">★☆☆☆☆ 1 Star</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs h-10 px-3 rounded-xl border border-black/10 bg-white text-foreground focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Buyers Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-black/10 p-16 text-center shadow-subtle">
          <RefreshCw className="w-6 h-6 animate-spin text-secondary mx-auto mb-3" />
          <p className="text-xs font-medium text-secondary">Loading product reviews...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/10 p-16 text-center shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center mb-3">
            <MessageSquare className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Reviews Found</h3>
          <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
            {search || ratingFilter !== 'all' || statusFilter !== 'all'
              ? 'No reviews match your current filters. Try resetting search criteria.'
              : 'No customer reviews have been submitted yet. Product reviews submitted on the storefront will appear here.'}
          </p>
          {(search || ratingFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-xs"
              onClick={() => {
                setSearch('');
                setRatingFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-black/10 shadow-subtle hover:border-black/20 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              {/* Left Column: Product info thumbnail & review details */}
              <div className="flex items-start gap-4 flex-1">
                {/* Product thumbnail */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream shrink-0 border border-black/5">
                  <Image
                    src={rev.product_image}
                    alt={rev.product_title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Product title & link */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                      Product:
                    </span>
                    {rev.product_slug ? (
                      <Link
                        href={`/products/${rev.product_slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-foreground hover:text-accent flex items-center gap-1 transition-colors"
                      >
                        {rev.product_title}
                        <ExternalLink className="w-3 h-3 text-secondary" />
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        {rev.product_title}
                      </span>
                    )}
                  </div>

                  {/* Rating Stars and Title */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-black/15'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {rev.title}
                    </span>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs text-foreground/80 leading-relaxed font-sans pr-2">
                    "{rev.body}"
                  </p>

                  {/* Author, date, verified status */}
                  <div className="flex items-center gap-3 text-[11px] text-secondary pt-1 flex-wrap">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      By: {rev.user_name}
                    </span>
                    <span>•</span>
                    <span>{formatDate(rev.created_at)}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleToggleVerified(rev)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        rev.is_verified
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-black/5 text-secondary hover:bg-black/10'
                      }`}
                      title="Click to toggle verified status"
                    >
                      {rev.is_verified && <CheckCircle2 className="w-3 h-3" />}
                      {rev.is_verified ? 'Verified Buyer' : 'Unverified'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center md:flex-col gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-black/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleVerified(rev)}
                  className="text-xs whitespace-nowrap"
                >
                  {rev.is_verified ? 'Unverify' : 'Mark Verified'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewToDelete(rev)}
                  className="text-xs text-destructive hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reviewToDelete && (
        <Modal
          isOpen={Boolean(reviewToDelete)}
          onClose={() => setReviewToDelete(null)}
          title="Delete Customer Review"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Are you sure you want to delete this review?</p>
                <p className="text-red-700 mt-0.5">
                  This action cannot be undone. The review by "{reviewToDelete.user_name}" on "{reviewToDelete.product_title}" will be permanently removed.
                </p>
              </div>
            </div>

            <div className="p-3 bg-cream/40 rounded-xl border border-black/5 space-y-1">
              <p className="font-semibold text-foreground">"{reviewToDelete.title}"</p>
              <p className="text-secondary italic">"{reviewToDelete.body}"</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmDeleteReview}
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
