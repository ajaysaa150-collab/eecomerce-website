'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // KPI metrics
  const stats = [
    {
      title: 'Total Revenue',
      value: '$128,490',
      change: '+18.4%',
      positive: true,
      icon: DollarSign,
      sub: 'vs. previous 30 days',
    },
    {
      title: 'Total Orders',
      value: '264',
      change: '+12.1%',
      positive: true,
      icon: ShoppingBag,
      sub: 'vs. previous 30 days',
    },
    {
      title: 'Active Clients',
      value: '1,420',
      change: '+8.6%',
      positive: true,
      icon: Users,
      sub: 'vs. previous 30 days',
    },
    {
      title: 'Avg Order Value',
      value: '$486.70',
      change: '-1.8%',
      positive: false,
      icon: TrendingUp,
      sub: 'vs. previous 30 days',
    },
  ];

  // Recharts Revenue Area Data
  const chartData30d = [
    { date: 'Sep 02', revenue: 2400, orders: 5 },
    { date: 'Sep 06', revenue: 3800, orders: 8 },
    { date: 'Sep 10', revenue: 3100, orders: 6 },
    { date: 'Sep 14', revenue: 5200, orders: 11 },
    { date: 'Sep 18', revenue: 4700, orders: 9 },
    { date: 'Sep 22', revenue: 6400, orders: 13 },
    { date: 'Sep 26', revenue: 7800, orders: 16 },
    { date: 'Sep 30', revenue: 8900, orders: 18 },
    { date: 'Oct 02', revenue: 9400, orders: 19 },
  ];

  // Top Selling Products Bar Data
  const topProductsData = [
    { name: 'Aura Speaker', units: 78 },
    { name: 'Bauhaus 38mm', units: 54 },
    { name: 'Tuscan Duffel', units: 42 },
    { name: 'Studio Lamp', units: 36 },
    { name: 'Bronze Vessel', units: 28 },
  ];

  // Recent Orders
  const recentOrders = [
    { id: 'ORD-10042', customer: 'Arthur Dent', email: 'arthur@galaxy.org', items: 2, total: 970, status: 'processing', date: 'Just now' },
    { id: 'ORD-10041', customer: 'Elena Rostova', email: 'elena@rostova.com', items: 1, total: 490, status: 'processing', date: '25 mins ago' },
    { id: 'ORD-10040', customer: 'Marcus Vance', email: 'marcus@vance.io', items: 1, total: 650, status: 'shipped', date: '2 hours ago' },
    { id: 'ORD-10039', customer: 'Clara Oswald', email: 'clara@tardis.co', items: 3, total: 1420, status: 'delivered', date: 'Yesterday' },
    { id: 'ORD-10038', customer: 'Julian Hayes', email: 'j.hayes@minimal.com', items: 1, total: 320, status: 'delivered', date: '2 days ago' },
  ];

  // Low Stock Alerts (< 10 units)
  const lowStockProducts = [
    { title: 'Tuscan Vachetta Weekender Duffel', sku: 'ATL-BAG-003', stock: 9, category: 'Leather & Carry' },
    { title: 'Chronos Bauhaus Automatic (Black)', sku: 'ATL-WAT-002-BLK', stock: 8, category: 'Time & Horology' },
    { title: 'Chronos Bauhaus Automatic (Cognac)', sku: 'ATL-WAT-002-COG', stock: 6, category: 'Time & Horology' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-black/10 shadow-subtle flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-secondary mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">{s.title}</span>
                <div className="p-2 rounded-lg bg-cream text-foreground">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="font-serif-heading text-3xl font-bold text-foreground">
                  {s.value}
                </span>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <span
                    className={`font-semibold flex items-center ${
                      s.positive ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {s.positive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {s.change}
                  </span>
                  <span className="text-secondary">{s.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid: Revenue Area Chart (2 cols) & Top Products (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/10 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-foreground">
                Revenue Trajectory
              </h3>
              <p className="text-xs text-secondary">Aggregated gross order volume</p>
            </div>

            {/* Range Toggle */}
            <div className="flex items-center bg-cream rounded-lg p-1 text-xs font-semibold">
              {(['7d', '30d', '90d', '1y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    timeRange === r ? 'bg-white text-foreground shadow-sm' : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData30d}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Gross Revenue']}
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-black/5">
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Top Selling Units
            </h3>
            <p className="text-xs text-secondary">Ranked by volume this period</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} tickLine={false} width={80} />
                <Tooltip
                  formatter={(val: any) => [`${val} units sold`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="units" fill="#1A1A1A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders (2 cols) & Low Stock Alerts (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-foreground">
                Recent Orders
              </h3>
              <p className="text-xs text-secondary">Latest inbound purchase transactions</p>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                View All Orders
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 text-secondary uppercase tracking-wider font-semibold">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-foreground">{ord.id}</td>
                    <td className="py-3">
                      <p className="font-medium text-foreground">{ord.customer}</p>
                      <p className="text-secondary text-[11px]">{ord.email}</p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'delivered'
                            ? 'bg-success/10 text-success'
                            : ord.status === 'shipped'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-foreground">
                      {formatCurrency(ord.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Low Stock Alerts
            </h3>
          </div>

          <p className="text-xs text-secondary">
            The following master items have fallen beneath the reserve safety threshold of 10 units.
          </p>

          <div className="space-y-3">
            {lowStockProducts.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground truncate max-w-[180px]">
                    {p.title}
                  </h4>
                  <span className="text-xs font-bold text-destructive px-2 py-0.5 rounded bg-white border border-destructive/20">
                    {p.stock} units
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-secondary">
                  <span className="font-mono">{p.sku}</span>
                  <Link
                    href="/admin/products"
                    className="text-accent hover:underline font-semibold"
                  >
                    Replenish
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link href="/admin/products">
              <Button variant="secondary" size="sm" className="w-full">
                Manage All Inventory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
