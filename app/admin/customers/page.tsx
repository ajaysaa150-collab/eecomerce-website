'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import {
  Search,
  UserCheck,
  Mail,
  Phone,
  KeyRound,
  Trash2,
  RefreshCw,
  Star,
  Eye,
  EyeOff,
  AlertTriangle,
  UserX,
  ShoppingBag,
  ExternalLink,
  Shield,
  CheckCircle,
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  avatar_url?: string | null;
  created_at: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder?: string | null;
  notes?: string;
}

export default function AdminCustomersPage() {
  const { success, error: toastError } = useToast();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');

  // Customer profile details modal
  const [activeCustomer, setActiveCustomer] = useState<CustomerRecord | null>(null);

  // Password reset modal state
  const [passwordCustomer, setPasswordCustomer] = useState<CustomerRecord | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Deletion modal state
  const [deleteCustomer, setDeleteCustomer] = useState<CustomerRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      } else {
        toastError('Failed to load customers', data.error || 'Server error');
      }
    } catch (err: any) {
      toastError('Connection Error', err?.message || 'Could not fetch customer records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openPasswordModal = (c: CustomerRecord) => {
    setPasswordCustomer(c);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordCustomer) return;

    if (!newPassword || newPassword.length < 6) {
      toastError('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError('Mismatch', 'New password and confirmation password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordCustomer.id,
          action: 'change_password',
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success(
          'Password Changed',
          `Password for ${passwordCustomer.email} has been updated successfully.`
        );
        setPasswordCustomer(null);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toastError('Reset Failed', data.error || 'Could not update password');
      }
    } catch (err: any) {
      toastError('Error', err?.message || 'Failed to update customer password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteCustomer) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/customers?userId=${encodeURIComponent(deleteCustomer.id)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();

      if (data.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== deleteCustomer.id));
        success('Customer Deleted', `${deleteCustomer.email} has been removed.`);
        setDeleteCustomer(null);
      } else {
        toastError('Delete Failed', data.error || 'Could not delete customer');
      }
    } catch (err: any) {
      toastError('Error', err?.message || 'Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || c.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalRegistered = customers.length;
  const totalCustomerSpend = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const activeShoppersCount = customers.filter((c) => c.ordersCount > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-heading text-2xl font-bold text-foreground">
              Customer Directory
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cream text-foreground border border-black/10">
              {totalRegistered} Registered
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Manage registered customer accounts, reset passwords, delete profiles, and review client activity.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reviews Link */}
          <Link href="/admin/reviews">
            <Button variant="primary" size="sm" className="gap-2 text-xs bg-foreground text-white hover:bg-black">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Customer Reviews
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            disabled={isLoading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Registered Accounts
            </span>
            <UserCheck className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{totalRegistered}</p>
          <p className="text-[11px] text-secondary mt-1">
            {customers.filter((c) => c.role === 'customer').length} customers,{' '}
            {customers.filter((c) => c.role === 'admin').length} admin
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Active Shoppers
            </span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{activeShoppersCount}</p>
          <p className="text-[11px] text-secondary mt-1">Placed at least one order</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Total Client Spend
            </span>
            <span className="text-xs font-bold text-accent">LTV</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalCustomerSpend)}</p>
          <p className="text-[11px] text-secondary mt-1">Cumulative order value</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-subtle flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs h-10 px-3 rounded-xl border border-black/10 bg-white text-foreground focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-secondary mx-auto mb-3" />
            <p className="text-xs font-medium text-secondary">Loading registered customers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <UserX className="w-8 h-8 text-secondary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No Customers Found</h3>
            <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
              {search || roleFilter !== 'all'
                ? 'No registered customers match your current filter criteria.'
                : 'No users have registered on the system yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-cream/50 border-b border-black/5 text-secondary uppercase tracking-wider font-semibold">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((c) => {
                  const isSuperAdmin = c.email === 'ajaysaa789@gmail.com';
                  return (
                    <tr key={c.id} className="hover:bg-cream/30 transition-colors">
                      {/* Customer Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-cream border border-black/10 flex items-center justify-center font-bold text-foreground text-xs shrink-0 uppercase">
                            {c.name ? c.name.slice(0, 2) : c.email.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{c.name}</p>
                            <p className="text-secondary text-[11px] truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.role === 'admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-cream text-foreground border border-black/10'
                          }`}
                        >
                          {c.role === 'admin' && <Shield className="w-3 h-3 text-purple-700" />}
                          {c.role}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="p-4 text-secondary">
                        {c.phone ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-secondary" />
                            {c.phone}
                          </span>
                        ) : (
                          <span className="text-black/30 italic text-[11px]">Not provided</span>
                        )}
                      </td>

                      {/* Orders Count */}
                      <td className="p-4">
                        <span className="font-semibold text-foreground">{c.ordersCount}</span>
                        {c.ordersCount > 0 && (
                          <span className="text-[10px] text-secondary ml-1">orders</span>
                        )}
                      </td>

                      {/* Lifetime Spend */}
                      <td className="p-4">
                        <span className="font-bold text-foreground">
                          {formatCurrency(c.totalSpent)}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-secondary text-[11px]">
                        {formatDate(c.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Profile Details */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveCustomer(c)}
                            className="text-[11px] h-8 px-2.5"
                            title="View Customer Profile"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Profile
                          </Button>

                          {/* Password Reset */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPasswordModal(c)}
                            className="text-[11px] h-8 px-2.5 text-blue-700 hover:bg-blue-50 hover:border-blue-200"
                            title="Reset / Change Customer Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1" />
                            Password
                          </Button>

                          {/* Delete Customer */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSuperAdmin}
                            onClick={() => setDeleteCustomer(c)}
                            className={`text-[11px] h-8 px-2.5 ${
                              isSuperAdmin
                                ? 'opacity-40 cursor-not-allowed text-secondary'
                                : 'text-destructive hover:bg-red-50 hover:border-red-200'
                            }`}
                            title={isSuperAdmin ? 'Super Admin cannot be deleted' : 'Delete Customer Account'}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {passwordCustomer && (
        <Modal
          isOpen={Boolean(passwordCustomer)}
          onClose={() => setPasswordCustomer(null)}
          title="Change Customer Password"
          maxWidth="md"
        >
          <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">
                  Set New Password for {passwordCustomer.name || 'User'}
                </p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Account Email: <span className="font-bold">{passwordCustomer.email}</span>
                </p>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs pl-3 pr-10 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-secondary hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs px-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPasswordCustomer(null)}
                disabled={isUpdatingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isUpdatingPassword}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCustomer && (
        <Modal
          isOpen={Boolean(deleteCustomer)}
          onClose={() => setDeleteCustomer(null)}
          title="Delete Customer Account"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  Delete {deleteCustomer.name || deleteCustomer.email}?
                </p>
                <p className="text-red-700 text-[11px] mt-0.5">
                  This action will permanently delete their account credentials and user profile from the database.
                </p>
              </div>
            </div>

            <div className="p-3 bg-cream/40 rounded-xl border border-black/5 space-y-1">
              <p className="text-foreground">
                <span className="font-bold">Name:</span> {deleteCustomer.name}
              </p>
              <p className="text-foreground">
                <span className="font-bold">Email:</span> {deleteCustomer.email}
              </p>
              <p className="text-foreground">
                <span className="font-bold">Total Orders:</span> {deleteCustomer.ordersCount}
              </p>
              <p className="text-foreground">
                <span className="font-bold">Lifetime Spent:</span>{' '}
                {formatCurrency(deleteCustomer.totalSpent)}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteCustomer(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete Account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Profile Details Modal */}
      {activeCustomer && (
        <Modal
          isOpen={Boolean(activeCustomer)}
          onClose={() => setActiveCustomer(null)}
          title={`Customer: ${activeCustomer.name || activeCustomer.email}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Quick overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-cream/40 border border-black/5">
              <div>
                <span className="font-bold text-secondary uppercase text-[10px]">Role</span>
                <p className="font-bold text-foreground capitalize mt-0.5">
                  {activeCustomer.role}
                </p>
              </div>
              <div>
                <span className="font-bold text-secondary uppercase text-[10px]">Total Orders</span>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {activeCustomer.ordersCount}
                </p>
              </div>
              <div>
                <span className="font-bold text-secondary uppercase text-[10px]">Lifetime Spend</span>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {formatCurrency(activeCustomer.totalSpent)}
                </p>
              </div>
              <div>
                <span className="font-bold text-secondary uppercase text-[10px]">Member Since</span>
                <p className="text-secondary font-medium mt-0.5">
                  {formatDate(activeCustomer.created_at)}
                </p>
              </div>
            </div>

            {/* Profile Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-black/10 bg-white">
              <div>
                <span className="font-bold text-secondary text-[11px] block">Full Name</span>
                <p className="text-foreground font-semibold mt-0.5">
                  {activeCustomer.name || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="font-bold text-secondary text-[11px] block">Email Address</span>
                <p className="text-foreground font-semibold mt-0.5">
                  {activeCustomer.email}
                </p>
              </div>
              <div>
                <span className="font-bold text-secondary text-[11px] block">Phone Number</span>
                <p className="text-foreground font-semibold mt-0.5">
                  {activeCustomer.phone || 'No phone recorded'}
                </p>
              </div>
              <div>
                <span className="font-bold text-secondary text-[11px] block">User ID</span>
                <p className="text-secondary font-mono text-[10px] truncate mt-0.5">
                  {activeCustomer.id}
                </p>
              </div>
            </div>

            {/* Link to reviews & orders */}
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-amber-950 text-xs">
                  Inspect Product Reviews by Customers
                </span>
              </div>
              <Link href="/admin/reviews">
                <Button variant="outline" size="sm" className="text-xs bg-white">
                  Go to Reviews
                </Button>
              </Link>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = activeCustomer;
                  setActiveCustomer(null);
                  openPasswordModal(target);
                }}
                className="text-blue-700"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1" />
                Change Password
              </Button>
              <Button variant="primary" size="sm" onClick={() => setActiveCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
