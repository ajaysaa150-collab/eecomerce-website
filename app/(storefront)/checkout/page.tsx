'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  Lock,
  ShoppingBag,
  Info,
  Banknote,
  CheckCircle2,
  Loader2,
  Tag,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createOrder, validateCoupon } from '@/lib/supabase';
import { loadRazorpayScript } from '@/lib/razorpay';
import { useCurrency, COUNTRIES } from '@/context/CurrencyContext';
import { lookupPostalCode } from '@/lib/postalLookup';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, tax, total, coupon, setCoupon, clearCart } = useCart();
  const { profile, openAuthModal } = useAuth();
  const { success, error: toastError } = useToast();
  const { currentCountry, setCountry, formatPrice } = useCurrency();

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLookingUpZip, setIsLookingUpZip] = useState(false);
  const [zipLookupStatus, setZipLookupStatus] = useState<string | null>(null);

  // Shipping Form State
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: currentCountry?.name || 'India',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        email: prev.email || profile.email || '',
        phone: prev.phone || profile.phone || '',
      }));
    }
  }, [profile]);

  // Checkout coupon input
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  React.useEffect(() => {
    try {
      const savedCoupons = JSON.parse(localStorage.getItem('atelier_coupons') || '[]');
      if (Array.isArray(savedCoupons) && savedCoupons.length > 0 && !coupon && !checkoutCouponCode) {
        const latestCode = savedCoupons[0]?.code;
        if (latestCode) {
          setCheckoutCouponCode(latestCode);
        }
      }
    } catch {}
  }, [coupon]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCouponCode.trim()) return;
    setIsApplyingCoupon(true);
    const res = await validateCoupon(checkoutCouponCode, subtotal);
    setIsApplyingCoupon(false);

    if (res.valid && res.coupon) {
      setCoupon(res.coupon);
      setCheckoutCouponCode('');
      success('Promo Code Applied', `Discount code "${res.coupon.code}" has been applied to your total.`);
    } else {
      toastError('Coupon Error', res.message || 'Invalid promotion code');
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    success('Coupon Removed', 'Promo code removed from order.');
  };

  const handleZipChange = async (val: string) => {
    handleInputChange('zip', val);
    const clean = val.trim();
    const isIndia = formData.country.toLowerCase().includes('india') || currentCountry.code === 'IN';

    if ((isIndia && clean.length === 6) || (!isIndia && clean.length >= 5)) {
      setIsLookingUpZip(true);
      setZipLookupStatus(null);
      const selectedCountryObj = COUNTRIES.find((c) => c.name.toLowerCase() === formData.country.toLowerCase());
      const countryCode = selectedCountryObj?.code || (isIndia ? 'IN' : 'US');
      const res = await lookupPostalCode(clean, countryCode);
      setIsLookingUpZip(false);

      if (res.success && (res.district || res.city)) {
        setFormData((prev) => ({
          ...prev,
          city: res.district || res.city || prev.city,
          state: res.state || prev.state,
        }));
        setZipLookupStatus(`Auto-detected: ${res.district || res.city}, ${res.state}`);
      } else {
        setZipLookupStatus(null);
      }
    } else {
      setZipLookupStatus(null);
    }
  };

  // Shipping Method & Payment Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const shippingCost = shippingMethod === 'express' ? 35 : shipping;
  const calculatedTotal = Math.max(0, subtotal - discount + shippingCost + tax);

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toastError('Account Required', 'Please sign in or create an account to proceed with your order.');
      openAuthModal('signin');
      return;
    }
    if (!formData.fullName || !formData.email || !formData.addressLine1 || !formData.city || !formData.zip) {
      toastError('Required Fields', 'Please complete all required shipping fields.');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toastError('Account Required', 'Please sign in or create an account to proceed with payment.');
      openAuthModal('signin');
      return;
    }
    setStep('review');
  };

  const handleFinalOrder = async () => {
    if (!profile) {
      toastError('Login Required', 'You must be signed in to place an order.');
      openAuthModal('signin');
      return;
    }

    setIsProcessing(true);

    // 1. CASH ON DELIVERY (COD) WORKFLOW
    if (paymentMethod === 'cod') {
      try {
        await new Promise((r) => setTimeout(r, 600)); // tactile pause
        await finalizeOrder(null, 'cod');
      } catch (err: any) {
        toastError('Order Placement Failed', err?.message || 'Failed to place Cash on Delivery order.');
        setIsProcessing(false);
      }
      return;
    }

    // 2. ONLINE PAYMENT (RAZORPAY) WORKFLOW
    try {
      const res = await fetch('/api/checkout/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculatedTotal,
          currency: 'USD',
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const data = await res.json();
      const razorpayOrderId = data.orderId;

      const isScriptLoaded = await loadRazorpayScript();

      if (isScriptLoaded && typeof window !== 'undefined' && (window as any).Razorpay && !data.isSandbox) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_preview12345',
          amount: data.amount,
          currency: data.currency,
          name: 'Atelier Studio',
          description: `Order Payment (${items.length} items)`,
          image: '/logo.svg',
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            await finalizeOrder(response.razorpay_payment_id, 'razorpay');
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#1A1A1A',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toastError('Payment Declined', response.error?.description || 'Payment failed.');
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Test / Sandbox mode direct simulation
        await new Promise((r) => setTimeout(r, 1200));
        await finalizeOrder(`pay_test_${Date.now()}`, 'razorpay');
      }
    } catch (err: any) {
      toastError('Checkout Exception', err?.message || 'Failed to complete order.');
      setIsProcessing(false);
    }
  };

  const finalizeOrder = async (paymentId: string | null, method: 'cod' | 'razorpay') => {
    if (!profile) {
      toastError('Login Required', 'Please sign in to place this order.');
      openAuthModal('signin');
      setIsProcessing(false);
      return;
    }

    const isCOD = method === 'cod';

    const created = await createOrder({
      email: formData.email,
      user_id: profile.id,
      shipping_address: formData,
      billing_address: formData,
      shipping_method: shippingMethod === 'express' ? 'White-Glove Express Courier' : 'Standard Delivery',
      shipping_cost: shippingCost,
      subtotal,
      discount_amount: discount,
      tax_amount: tax,
      total: calculatedTotal,
      coupon_code: coupon?.code || null,
      payment_method: isCOD ? 'cod' : 'razorpay',
      payment_status: isCOD ? 'pending' : 'paid',
      fulfillment_status: 'processing',
      razorpay_payment_id: paymentId,
      notes: isCOD
        ? `Cash on Delivery (COD) - Collect ${formatCurrency(calculatedTotal)} in cash upon delivery`
        : 'Paid in full via Razorpay gateway',
      items: items.map((i) => ({
        id: 'item-' + Math.random().toString(36).substring(2),
        order_id: '',
        product_id: i.productId,
        variant_id: i.variantId || null,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.price,
        line_total: i.price * i.quantity,
      })),
    });

    clearCart();
    setIsProcessing(false);

    if (isCOD) {
      success('Order Registered', `COD Order ${created.order_number} confirmed. Pay ${formatCurrency(calculatedTotal)} on delivery.`);
    } else {
      success('Order Confirmed', `Order ${created.order_number} has been placed successfully.`);
    }

    router.push(
      `/order-confirmation?orderNumber=${created.order_number}&id=${created.id}&method=${isCOD ? 'cod' : 'online'}&total=${calculatedTotal}`
    );
  };

  if (items.length === 0) {
    return (
      <div className="max-w-container mx-auto px-6 py-20 text-center">
        <h2 className="font-serif-heading text-2xl font-bold mb-2">No Items in Order Bag</h2>
        <p className="text-xs text-secondary mb-6">Please add items to your bag prior to checkout.</p>
        <Button variant="primary" onClick={() => router.push('/products')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  const steps = [
    { id: 'shipping', label: '1. Shipping' },
    { id: 'payment', label: '2. Payment' },
    { id: 'review', label: '3. Review' },
  ];

  return (
    <div className="max-w-container mx-auto px-6 sm:px-12 py-10 w-full">
      {/* Account Authentication Required Banner if not signed in */}
      {!profile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8 p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Account Login Required to Purchase
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                  Mandatory
                </span>
              </h3>
              <p className="text-xs text-secondary mt-1 max-w-xl leading-relaxed">
                You must be logged in to complete your order. This ensures your purchase history, invoices, and live tracking are securely attached to your personal account.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openAuthModal('signup')}
              className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100/50"
            >
              Create Account
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => openAuthModal('signin')}
              className="text-xs shadow-sm"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              Sign In Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step Indicator Progress Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/10 -translate-y-1/2 z-0" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-foreground -translate-y-1/2 z-0 transition-all duration-300"
            style={{
              width: step === 'shipping' ? '0%' : step === 'payment' ? '50%' : '100%',
            }}
          />

          {steps.map((s, idx) => {
            const isCompleted =
              (step === 'payment' && idx === 0) ||
              (step === 'review' && (idx === 0 || idx === 1));
            const isCurrent = step === s.id;

            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-foreground text-white'
                      : isCurrent
                      ? 'bg-foreground text-white ring-4 ring-black/10'
                      : 'bg-white text-secondary border border-black/15'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] uppercase tracking-label font-bold mt-2 ${
                    isCurrent ? 'text-foreground' : 'text-secondary'
                  }`}
                >
                  {s.label.split('. ')[1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Step Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mobile Quick Coupon Bar */}
          <div className="lg:hidden p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                Have a Promo Code / VIP Coupon?
              </span>
              {coupon && (
                <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  Applied
                </span>
              )}
            </div>
            {coupon ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold text-xs">{coupon.code} (-{formatPrice(discount)})</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-neutral-400 hover:text-destructive p-1 cursor-pointer"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={checkoutCouponCode}
                  onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. JOIN20-XXXX or WELCOME15"
                  className="flex-1 h-9 px-3 rounded-lg border border-black/15 bg-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-accent"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isApplyingCoupon}
                  className="h-9 px-4 text-xs font-bold bg-black text-white shrink-0 cursor-pointer"
                >
                  Apply
                </Button>
              </form>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* 1. SHIPPING STEP */}
            {step === 'shipping' && (
              <motion.form
                key="shipping-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleShippingSubmit}
                className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h2 className="font-serif-heading text-2xl font-bold text-foreground">
                    Shipping & Delivery Address
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    Provide the destination address for secure courier fulfillment.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                  {/* Country Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-label text-secondary">
                      Country / Region
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        handleInputChange('country', selectedName);
                        const found = COUNTRIES.find((c) => c.name === selectedName);
                        if (found) {
                          setCountry(found.code);
                        }
                        setZipLookupStatus(null);
                      }}
                      className="w-full px-3.5 py-3 rounded-xl border border-black/10 bg-white text-xs font-medium text-foreground focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all shadow-subtle cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.currency} {c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Street Address (Line 1)"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      placeholder="House/Flat No., Building, Street Name"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Apartment, Suite, Unit, Landmark (Optional)"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder="e.g. Near Central Park"
                    />
                  </div>

                  {/* Postal / PIN code with auto-fetch */}
                  <div className="relative">
                    <Input
                      label={formData.country.toLowerCase().includes('india') ? 'PIN Code' : 'ZIP / Postal Code'}
                      value={formData.zip}
                      onChange={(e) => handleZipChange(e.target.value)}
                      placeholder={formData.country.toLowerCase().includes('india') ? '6-digit PIN code (e.g. 110001)' : 'ZIP Code'}
                      required
                    />
                    {isLookingUpZip && (
                      <div className="absolute right-3 top-8 flex items-center gap-1.5 text-[11px] text-accent font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting...</span>
                      </div>
                    )}
                  </div>

                  <Input
                    label="City / District"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City / District"
                    required
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="State / Province"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State / Province"
                      required
                    />
                    {zipLookupStatus && (
                      <p className="mt-1.5 text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{zipLookupStatus}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping Method Selector */}
                <div className="pt-4 border-t border-black/5">
                  <h3 className="text-xs uppercase tracking-label font-bold text-secondary mb-3">
                    Shipping Method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setShippingMethod('standard')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        shippingMethod === 'standard'
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-black/10 hover:border-black/25'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>Standard Courier</span>
                        <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
                      </div>
                      <p className="text-[11px] text-secondary mt-1">3–5 business days delivery</p>
                    </div>

                    <div
                      onClick={() => setShippingMethod('express')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        shippingMethod === 'express'
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-black/10 hover:border-black/25'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>White-Glove Express Priority</span>
                        <span>{formatPrice(35)}</span>
                      </div>
                      <p className="text-[11px] text-secondary mt-1">Next-business-day air delivery</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    leftIcon={!profile ? <Lock className="w-4 h-4" /> : undefined}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {!profile ? 'Sign In to Continue' : 'Continue to Payment'}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* 2. PAYMENT STEP */}
            {step === 'payment' && (
              <motion.form
                key="payment-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePaymentSubmit}
                className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-black/5">
                  <div>
                    <h2 className="font-serif-heading text-2xl font-bold text-foreground">
                      Select Payment Method
                    </h2>
                    <p className="text-xs text-secondary mt-1">
                      Choose your preferred payment method: Cash on Delivery or Secure Online Gateway.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Option 1: Cash on Delivery (COD) */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative ${
                      paymentMethod === 'cod'
                        ? 'border-accent bg-accent/[0.03] ring-1 ring-accent shadow-subtle'
                        : 'border-black/10 hover:border-black/20 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            paymentMethod === 'cod' ? 'bg-accent text-white' : 'bg-black/5 text-foreground'
                          }`}
                        >
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Zero Advance
                            </span>
                          </div>
                          <p className="text-xs text-secondary mt-0.5">
                            Pay physical cash or courier UPI at your doorstep upon package arrival.
                          </p>
                        </div>
                      </div>

                      <div className="pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            paymentMethod === 'cod' ? 'border-accent bg-accent' : 'border-black/20'
                          }`}
                        >
                          {paymentMethod === 'cod' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'cod' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-black/5 space-y-2 text-xs"
                      >
                        <div className="p-3 bg-cream/70 rounded-xl border border-black/5 flex items-center justify-between">
                          <span className="text-secondary font-medium">Cash to Hand Over Upon Delivery:</span>
                          <span className="text-sm font-bold text-foreground font-mono">
                            {formatCurrency(calculatedTotal)}
                          </span>
                        </div>
                        <ul className="text-[11px] text-secondary space-y-1 pl-1 list-disc list-inside">
                          <li>No advance online transaction or card details required.</li>
                          <li>Official stamped invoice and tracking receipt provided upon handover.</li>
                          <li>Inspect package seals before handing over cash.</li>
                        </ul>
                      </motion.div>
                    )}
                  </div>

                  {/* Option 2: Razorpay Online Gateway */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative ${
                      paymentMethod === 'razorpay'
                        ? 'border-accent bg-accent/[0.03] ring-1 ring-accent shadow-subtle'
                        : 'border-black/10 hover:border-black/20 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            paymentMethod === 'razorpay' ? 'bg-accent text-white' : 'bg-black/5 text-foreground'
                          }`}
                        >
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              Online Payment (Razorpay)
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent text-white">
                              Cards & UPI
                            </span>
                          </div>
                          <p className="text-xs text-secondary mt-0.5">
                            Instant checkout via Credit/Debit Cards, UPI, NetBanking, or Apple Pay.
                          </p>
                        </div>
                      </div>

                      <div className="pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            paymentMethod === 'razorpay' ? 'border-accent bg-accent' : 'border-black/20'
                          }`}
                        >
                          {paymentMethod === 'razorpay' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'razorpay' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-black/5 text-xs text-secondary"
                      >
                        <p className="text-[11px] leading-relaxed">
                          Secure PCI-DSS Level 1 compliant checkout modal with 256-bit encryption. All transactions processed instantly.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-black/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('shipping')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to Shipping
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Review
                  </Button>
                </div>
              </motion.form>
            )}

            {/* 3. REVIEW STEP */}
            {step === 'review' && (
              <motion.div
                key="review-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h2 className="font-serif-heading text-2xl font-bold text-foreground">
                    Final Order Verification
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    Please review your shipping and order specifications prior to confirmation.
                  </p>
                </div>

                {/* Shipping & Payment summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-cream/40 border border-black/5 text-xs">
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Delivering To:</span>
                    <p className="text-secondary">{formData.fullName}</p>
                    <p className="text-secondary">{formData.addressLine1}</p>
                    {formData.addressLine2 && <p className="text-secondary">{formData.addressLine2}</p>}
                    <p className="text-secondary">{formData.city}, {formData.state} {formData.zip}</p>
                    <p className="text-secondary">{formData.country}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Payment & Shipping:</span>
                    <p className="text-secondary">Shipping: {shippingMethod === 'express' ? 'Express Priority Courier' : 'Standard Delivery'}</p>
                    <p className="text-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                      {paymentMethod === 'cod' ? (
                        <>
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Cash on Delivery (COD)</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-accent" />
                          <span>Razorpay Online Gateway</span>
                        </>
                      )}
                    </p>
                    {paymentMethod === 'cod' && (
                      <p className="text-emerald-700 font-semibold text-[11px] mt-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                        Prepare exact cash: {formatCurrency(calculatedTotal)}
                      </p>
                    )}
                    <p className="text-secondary mt-1">Contact: {formData.email}</p>
                  </div>
                </div>

                {/* Items brief */}
                <div className="space-y-3 divide-y divide-black/5">
                  {items.map((i) => (
                    <div key={i.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-cream border border-black/5 shrink-0">
                          <Image src={i.image} alt={i.title} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{i.title}</p>
                          <p className="text-[11px] text-secondary">Qty: {i.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold">{formatCurrency(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-black/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('payment')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Edit Payment
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    isLoading={isProcessing}
                    onClick={handleFinalOrder}
                    className="shadow-floating"
                    leftIcon={!profile ? <Lock className="w-4 h-4" /> : undefined}
                    rightIcon={paymentMethod === 'cod' ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  >
                    {!profile
                      ? 'Sign In to Complete Purchase'
                      : paymentMethod === 'cod'
                      ? `Confirm COD Order (${formatCurrency(calculatedTotal)})`
                      : `Place Order & Pay ${formatCurrency(calculatedTotal)}`}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="luxury-card rounded-2xl p-6 space-y-4">
            <h3 className="font-serif-heading text-lg font-bold text-foreground pb-3 border-b border-black/5">
              Order Breakdown
            </h3>

            {/* Promo / Coupon Code Section */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-neutral-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  Have a Promo Code / VIP Coupon?
                </span>
                {coupon && (
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Applied
                  </span>
                )}
              </label>

              {coupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-emerald-300 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-mono font-bold text-xs text-foreground tracking-wider">{coupon.code}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}% discount applied (-${formatPrice(discount)})`
                          : `${formatPrice(coupon.value)} off applied`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-md text-neutral-400 hover:text-destructive hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={checkoutCouponCode}
                    onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. JOIN20-XXXX or WELCOME15"
                    className="flex-1 h-9 px-3 rounded-lg border border-black/15 bg-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-accent"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={isApplyingCoupon}
                    className="h-9 px-4 text-xs font-bold bg-black text-white hover:bg-neutral-800 shrink-0 cursor-pointer"
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="text-foreground font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-secondary">
                <span>Shipping ({shippingMethod})</span>
                <span>{shippingCost === 0 ? 'Complimentary' : formatCurrency(shippingCost)}</span>
              </div>

              <div className="flex justify-between text-secondary">
                <span>Estimated Sales Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold text-foreground pt-4 border-t border-black/5">
                <span>Total Due</span>
                <span>{formatCurrency(calculatedTotal)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cream/70 border border-black/5 text-[11px] text-secondary flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
              <span>
                Orders are processed and verified immediately. You will receive an email tracking confirmation upon dispatch.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
