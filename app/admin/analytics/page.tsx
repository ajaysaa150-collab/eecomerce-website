'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const revenueHistory = [
    { month: 'Apr', revenue: 42000, orders: 86 },
    { month: 'May', revenue: 58000, orders: 114 },
    { month: 'Jun', revenue: 51000, orders: 98 },
    { month: 'Jul', revenue: 74000, orders: 142 },
    { month: 'Aug', revenue: 89000, orders: 178 },
    { month: 'Sep', revenue: 104000, orders: 215 },
    { month: 'Oct', revenue: 128490, orders: 264 },
  ];

  const categoryShare = [
    { name: 'Audio & Acoustics', value: 42, color: '#2563EB' },
    { name: 'Time & Horology', value: 28, color: '#1A1A1A' },
    { name: 'Leather & Carry', value: 18, color: '#6B6B6B' },
    { name: 'Living & Object', value: 12, color: '#A3A39E' },
  ];

  const customerAcquisition = [
    { week: 'W1', clients: 45 },
    { week: 'W2', clients: 68 },
    { week: 'W3', clients: 92 },
    { week: 'W4', clients: 124 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="font-serif-heading text-2xl font-bold text-foreground">
          Business Intelligence & Analytics
        </h2>
        <p className="text-xs text-secondary mt-1">
          Historical growth trajectories, unit volumes, and category distributions.
        </p>
      </div>

      {/* Trajectory Area Chart */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/10 shadow-subtle space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-black/5">
          <div>
            <h3 className="font-serif-heading text-lg font-bold text-foreground">
              Long-Term Revenue Growth
            </h3>
            <p className="text-xs text-secondary">Historical monthly revenue (USD)</p>
          </div>
          <span className="text-xs font-bold text-success flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +205% Year-to-Date
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueHistory}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), 'Gross Volume']}
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={3}
                fill="url(#analyticsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Category Breakdown (Pie) & Customer Acquisition (Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-subtle space-y-4">
          <h3 className="font-serif-heading text-lg font-bold text-foreground pb-2 border-b border-black/5">
            Category Contribution
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryShare}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {categoryShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}% of Gross`, 'Share']}
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryShare.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-secondary">{c.name} ({c.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Acquisition */}
        <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-subtle space-y-4">
          <h3 className="font-serif-heading text-lg font-bold text-foreground pb-2 border-b border-black/5">
            Weekly Client Acquisition
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerAcquisition}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} new collectors`, 'Acquired']}
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="clients" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-secondary leading-relaxed">
            Consistent week-over-week acceleration in client onboarding driven by the seasonal release campaign.
          </p>
        </div>
      </div>
    </div>
  );
}
