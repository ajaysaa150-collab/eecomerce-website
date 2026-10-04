'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { getOrders, updateOrderStatus } from '@/lib/supabase';
import {
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  Printer,
  CheckCircle2,
  Calendar,
  Banknote,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

interface MockOrder {
  id: string;
  order_number: string;
  date: string;
  customer_name: string;
  customer_email: string;
  items_count: number;
  total: number;
  payment_method: 'cod' | 'razorpay' | string;
  payment_status: 'paid' | 'pending' | 'refunded';
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  tracking_carrier?: string;
  address: string;
  items: { title: string; qty: number; price: number }[];
}

export default function AdminOrdersPage() {
  const { success } = useToast();
  const [orders, setOrders] = useState<MockOrder[]>([
    {
      id: 'ord-10043',
      order_number: 'ORD-10043',
      date: '2026-10-02',
      customer_name: 'Julian Hayes',
      customer_email: 'julian@atelier-living.com',
      items_count: 1,
      total: 490,
      payment_method: 'cod',
      payment_status: 'pending',
      fulfillment_status: 'processing',
      tracking_number: 'DHL-COD-8821',
      tracking_carrier: 'DHL Express',
      address: '142 Sullivan Street, Soho, New York, NY 10012',
      items: [{ title: 'Aura Spatial Wireless Speaker', qty: 1, price: 490 }],
    },
    {
      id: 'ord-10042',
      order_number: 'ORD-10042',
      date: '2026-10-02',
      customer_name: 'Arthur Dent',
      customer_email: 'arthur@galaxy.org',
      items_count: 2,
      total: 970,
      payment_method: 'razorpay',
      payment_status: 'paid',
      fulfillment_status: 'processing',
      tracking_number: '',
      tracking_carrier: 'DHL Express',
      address: '42 Hitchhiker Way, London, UK',
      items: [
        { title: 'Aura Spatial Wireless Speaker', qty: 1, price: 490 },
        { title: 'Sonic Noise-Canceling Studio Headphones', qty: 1, price: 420 },
      ],
    },
    {
      id: 'ord-10041',
      order_number: 'ORD-10041',
      date: '2026-10-02',
      customer_name: 'Elena Rostova',
      customer_email: 'elena@rostova.com',
      items_count: 1,
      total: 490,
      payment_method: 'razorpay',
      payment_status: 'paid',
      fulfillment_status: 'processing',
      tracking_number: 'DHL-992104',
      tracking_carrier: 'DHL Express',
      address: '482 Mercer St, Apt 4B, New York, NY 10013',
      items: [{ title: 'Aura Spatial Wireless Speaker', qty: 1, price: 490 }],
    },
    {
      id: 'ord-10040',
      order_number: 'ORD-10040',
      date: '2026-10-01',
      customer_name: 'Marcus Vance',
      customer_email: 'marcus@vance.io',
      items_count: 1,
      total: 650,
      payment_method: 'cod',
      payment_status: 'paid',
      fulfillment_status: 'shipped',
      tracking_number: 'FDX-774021',
      tracking_carrier: 'FedEx Priority',
      address: '77 Post St, San Francisco, CA 94108',
      items: [{ title: 'Chronos Bauhaus Automatic 38mm', qty: 1, price: 650 }],
    },
    {
      id: 'ord-10039',
      order_number: 'ORD-10039',
      date: '2026-09-29',
      customer_name: 'Clara Oswald',
      customer_email: 'clara@tardis.co',
      items_count: 3,
      total: 1420,
      payment_method: 'razorpay',
      payment_status: 'paid',
      fulfillment_status: 'delivered',
      tracking_number: 'DHL-883921',
      tracking_carrier: 'DHL Express',
      address: '10 Downing St, London, UK',
      items: [
        { title: 'Tuscan Vachetta Weekender Duffel', qty: 1, price: 780 },
        { title: 'Studio Desk Lamp in Anodized Black', qty: 1, price: 340 },
        { title: 'Brutalist Cast Bronze Vessel', qty: 1, price: 320 },
      ],
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [activeOrder, setActiveOrder] = useState<MockOrder | null>(null);
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');

  // Fetch live orders on mount to include newly submitted COD and online orders
  useEffect(() => {
    getOrders().then((live) => {
      if (live && live.length > 0) {
        const liveMapped: MockOrder[] = live.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          date: o.created_at ? o.created_at.split('T')[0] : 'Today',
          customer_name: o.shipping_address?.fullName || o.email.split('@')[0],
          customer_email: o.email,
          items_count: o.items?.length || 1,
          total: o.total,
          payment_method: o.payment_method || 'cod',
          payment_status: (o.payment_status as any) || 'pending',
          fulfillment_status: (o.fulfillment_status as any) || 'processing',
          tracking_number: o.tracking_number || '',
          tracking_carrier: o.tracking_carrier || 'DHL Express',
          address: o.shipping_address
            ? `${o.shipping_address.addressLine1}, ${o.shipping_address.city}, ${o.shipping_address.state}`
            : 'Atelier Soho Concierge',
          items:
            o.items?.map((it) => ({
              title: it.title,
              qty: it.quantity,
              price: it.unit_price,
            })) || [{ title: 'Atelier Archive Selection', qty: 1, price: o.total }],
        }));

        setOrders((prev) => {
          const ids = new Set(prev.map((p) => p.order_number));
          const newOnes = liveMapped.filter((l) => !ids.has(l.order_number));
          return [...newOnes, ...prev];
        });
      }
    });
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || o.fulfillment_status === statusFilter;

    const matchesPayment =
      paymentFilter === 'all' || o.payment_method === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const openOrderDetail = (ord: MockOrder) => {
    setActiveOrder(ord);
    setCarrierInput(ord.tracking_carrier || 'DHL Express');
    setTrackingInput(ord.tracking_number || '');
  };

  const handleUpdateStatus = async (newStatus: MockOrder['fulfillment_status']) => {
    if (!activeOrder) return;
    const updated: MockOrder = {
      ...activeOrder,
      fulfillment_status: newStatus,
      tracking_carrier: carrierInput,
      tracking_number: trackingInput,
    };
    setOrders(orders.map((o) => (o.id === activeOrder.id ? updated : o)));
    setActiveOrder(updated);

    await updateOrderStatus(activeOrder.id, {
      fulfillment_status: newStatus,
      tracking_carrier: carrierInput,
      tracking_number: trackingInput,
    });

    success('Order Updated', `Status changed to ${newStatus.toUpperCase()}`);
  };

  const handleSaveTracking = async () => {
    if (!activeOrder) return;
    const updated: MockOrder = {
      ...activeOrder,
      tracking_carrier: carrierInput,
      tracking_number: trackingInput,
    };
    setOrders(orders.map((o) => (o.id === activeOrder.id ? updated : o)));
    setActiveOrder(updated);

    await updateOrderStatus(activeOrder.id, {
      fulfillment_status: activeOrder.fulfillment_status,
      tracking_carrier: carrierInput,
      tracking_number: trackingInput,
    });

    success('Tracking Updated', `Tracking details saved: ${trackingInput || 'No tracking'}`);
  };

  const updateOrderPaymentAndFulfillment = async (
    orderId: string,
    newPayStatus: MockOrder['payment_status']
  ) => {
    // Automatically synchronize fulfillment status:
    // Mark as collected ('paid') -> automatically becomes 'delivered'
    // Revert collection ('pending') -> automatically reverts back to 'processing'
    const newFulfillmentStatus: MockOrder['fulfillment_status'] =
      newPayStatus === 'paid' ? 'delivered' : 'processing';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, payment_status: newPayStatus, fulfillment_status: newFulfillmentStatus }
          : o
      )
    );

    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) =>
        prev
          ? {
              ...prev,
              payment_status: newPayStatus,
              fulfillment_status: newFulfillmentStatus,
            }
          : null
      );
    }

    await updateOrderStatus(orderId, {
      payment_status: newPayStatus,
      fulfillment_status: newFulfillmentStatus,
    });

    success(
      'Order Status Synchronized',
      newPayStatus === 'paid'
        ? 'Order marked as Collected — Delivered on Admin & Customer portals.'
        : 'Collection reverted — Order back in Processing on Admin & Customer portals.'
    );
  };

  const handleUpdatePaymentStatus = async (newPayStatus: MockOrder['payment_status']) => {
    if (!activeOrder) return;
    await updateOrderPaymentAndFulfillment(activeOrder.id, newPayStatus);
  };

  const exportCSV = () => {
    const header = 'Order,Date,Customer,Email,Total,Payment_Method,Payment_Status,Fulfillment\n';
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.order_number}","${o.date}","${o.customer_name}","${o.customer_email}",${o.total},"${o.payment_method}","${o.payment_status}","${o.fulfillment_status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${Date.now()}.csv`;
    a.click();
    success('CSV Exported', 'Orders exported to CSV file.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
        <div>
          <h2 className="font-serif-heading text-2xl font-bold text-foreground">
            Order Fulfillment Center
          </h2>
          <p className="text-xs text-secondary mt-1">
            Track transactions, assign carrier airway bills, and export fulfillment records.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export CSV Records
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by order #, customer, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 h-10 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-black/10 text-xs bg-white focus:outline-none focus:border-accent"
            >
              <option value="all">All Fulfillment</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Banknote className="w-3.5 h-3.5 text-secondary" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-black/10 text-xs bg-white focus:outline-none focus:border-accent"
            >
              <option value="all">All Payment Types</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="razorpay">Razorpay Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream/50 border-b border-black/5 text-secondary uppercase tracking-wider font-semibold">
                <th className="p-4">Order #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Objects</th>
                <th className="p-4">Payment Method & Status</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-cream/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-foreground">{ord.order_number}</td>
                  <td className="p-4 text-secondary">{ord.date}</td>
                  <td className="p-4">
                    <p className="font-semibold text-foreground">{ord.customer_name}</p>
                    <p className="text-[11px] text-secondary">{ord.customer_email}</p>
                  </td>
                  <td className="p-4 text-secondary">{ord.items_count}</td>
                  <td className="p-4">
                    {ord.payment_method === 'cod' ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <Banknote className="w-3 h-3" />
                        <span>COD ({ord.payment_status === 'paid' ? 'Collected' : 'Pending'})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success">
                        <CreditCard className="w-3 h-3" />
                        <span>Online ({ord.payment_status})</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.fulfillment_status === 'delivered'
                          ? 'bg-success/10 text-success'
                          : ord.fulfillment_status === 'shipped'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.fulfillment_status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-foreground">{formatCurrency(ord.total)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {ord.payment_status === 'pending' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderPaymentAndFulfillment(ord.id, 'paid');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-[11px] font-bold tracking-tight transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                          title="Mark Collected -> Automatically sets to Delivered"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Collect</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderPaymentAndFulfillment(ord.id, 'pending');
                          }}
                          className="px-2 py-1 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          title="Revert Collection -> Automatically sets back to Processing"
                        >
                          <RotateCcw className="w-3 h-3 text-neutral-500" />
                          <span>Revert</span>
                        </button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openOrderDetail(ord)}>
                        Manage
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <Modal
          isOpen={Boolean(activeOrder)}
          onClose={() => setActiveOrder(null)}
          title={`Order Management: ${activeOrder.order_number}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-cream/40 border border-black/5">
              <div>
                <span className="font-bold text-foreground block mb-1">Customer Profile</span>
                <p className="font-medium text-foreground">{activeOrder.customer_name}</p>
                <p className="text-secondary">{activeOrder.customer_email}</p>
              </div>
              <div>
                <span className="font-bold text-foreground block mb-1">Shipping Address</span>
                <p className="text-secondary">{activeOrder.address}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 border border-black/5 rounded-xl p-4 bg-white">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-2">
                Order Items ({activeOrder.items.length})
              </h4>
              <div className="divide-y divide-black/5">
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{it.title}</p>
                      <p className="text-secondary text-[11px]">Qty: {it.qty}</p>
                    </div>
                    <span className="font-bold">{formatCurrency(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method & Collection Details */}
            <div className="p-4 rounded-xl border border-black/10 bg-cream/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Payment Protocol
                </span>
                <span className="font-mono font-bold text-sm text-foreground">
                  {formatCurrency(activeOrder.total)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {activeOrder.payment_method === 'cod' ? (
                    <>
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-foreground">Cash on Delivery (COD)</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-foreground">Razorpay Online Gateway</span>
                    </>
                  )}
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    activeOrder.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeOrder.payment_status === 'paid' ? 'Paid / Collected' : 'Payment Pending'}
                </span>
              </div>

              <div className="pt-2 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-foreground">
                    {activeOrder.payment_status === 'paid'
                      ? '✓ Cash / Payment Collected — Auto-Delivered'
                      : activeOrder.payment_method === 'cod'
                      ? `Courier will collect ${formatCurrency(activeOrder.total)} upon parcel handover.`
                      : 'Payment confirmation awaiting collection.'}
                  </p>
                  <p className="text-[10px] text-secondary">
                    {activeOrder.payment_status === 'paid'
                      ? 'Fulfillment is set to DELIVERED on both Admin and User sides.'
                      : 'Marking collected will automatically switch fulfillment to DELIVERED.'}
                  </p>
                </div>

                {activeOrder.payment_status === 'pending' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleUpdatePaymentStatus('paid')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 text-xs py-1.5 shadow-sm"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Mark as Collected (Auto-Deliver)
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdatePaymentStatus('pending')}
                    className="text-xs shrink-0 py-1.5 text-amber-800 border-amber-300 hover:bg-amber-50"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Revert Collection (To Processing)
                  </Button>
                )}
              </div>
            </div>

            {/* Fulfillment Status Controls & Tracking */}
            <div className="p-4 rounded-xl border border-black/10 bg-white space-y-4">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Carrier Dispatch & Tracking
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-secondary block mb-1">Carrier</label>
                  <input
                    type="text"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-black/10"
                    placeholder="DHL Express / FedEx"
                  />
                </div>
                <div>
                  <label className="text-secondary block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-black/10"
                    placeholder="Tracking airway bill #"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveTracking}
                  className="text-xs"
                >
                  Save Tracking Details
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant={activeOrder.fulfillment_status === 'processing' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus('processing')}
                >
                  Mark Processing
                </Button>
                <Button
                  size="sm"
                  variant={activeOrder.fulfillment_status === 'shipped' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus('shipped')}
                >
                  Mark Shipped
                </Button>
                <Button
                  size="sm"
                  variant={activeOrder.fulfillment_status === 'delivered' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus('delivered')}
                >
                  Mark Delivered
                </Button>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Invoice
              </Button>
              <Button variant="primary" size="sm" onClick={() => setActiveOrder(null)}>
                Close Manager
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
