'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AccountLayoutClient } from '@/components/storefront/AccountLayoutClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { Plus, MapPin, Trash2, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { useCurrency, COUNTRIES } from '@/context/CurrencyContext';
import { lookupPostalCode } from '@/lib/postalLookup';

interface AddressItem {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, profile } = useAuth();
  const { success } = useToast();
  const { currentCountry } = useCurrency();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const userKey = user?.id || profile?.id || (user?.email ? user.email.toLowerCase() : profile?.email ? profile.email.toLowerCase() : null);
  const storageKey = userKey ? `atelier_addresses_${userKey}` : null;

  const loadAddresses = useCallback(() => {
    if (!storageKey) {
      setAddresses([]);
      setIsLoaded(true);
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        setAddresses([]);
      }
    } catch {
      setAddresses([]);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    loadAddresses();
    window.addEventListener('atelier_auth_changed', loadAddresses);
    return () => window.removeEventListener('atelier_auth_changed', loadAddresses);
  }, [loadAddresses]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newCountry, setNewCountry] = useState(currentCountry?.name || 'India');
  const [isLookingUpZip, setIsLookingUpZip] = useState(false);
  const [zipLookupStatus, setZipLookupStatus] = useState<string | null>(null);

  const handleZipChange = async (val: string) => {
    setNewZip(val);
    const clean = val.trim();
    const isIndia = newCountry.toLowerCase().includes('india');

    if ((isIndia && clean.length === 6) || (!isIndia && clean.length >= 5)) {
      setIsLookingUpZip(true);
      setZipLookupStatus(null);
      const selectedCountryObj = COUNTRIES.find((c) => c.name.toLowerCase() === newCountry.toLowerCase());
      const countryCode = selectedCountryObj?.code || (isIndia ? 'IN' : 'US');
      const res = await lookupPostalCode(clean, countryCode);
      setIsLookingUpZip(false);

      if (res.success && (res.district || res.city)) {
        setNewCity(res.district || res.city || '');
        if (res.state) setNewState(res.state);
        setZipLookupStatus(`Auto-detected: ${res.district || res.city}, ${res.state}`);
      }
    } else {
      setZipLookupStatus(null);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: AddressItem = {
      id: 'addr-' + Date.now(),
      name: newName,
      line1: newLine1,
      city: newCity,
      state: newState,
      zip: newZip,
      country: newCountry,
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }
    setIsModalOpen(false);
    success('Address Added', 'New delivery destination saved.');
    setNewName('');
    setNewLine1('');
    setNewCity('');
    setNewState('');
    setNewZip('');
    setZipLookupStatus(null);
  };

  const setDefault = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }
    success('Default Updated', 'Primary shipping address has been updated.');
  };

  const removeAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <AccountLayoutClient>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-heading text-2xl font-bold text-foreground">
              Saved Addresses
            </h2>
            <p className="text-xs text-secondary mt-1">
              Locations saved for rapid expedited checkout.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="luxury-card rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cream mx-auto flex items-center justify-center text-secondary/60">
              <MapPin className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="font-serif-heading text-lg font-bold text-foreground">No Saved Addresses</h3>
            <p className="text-xs text-secondary leading-relaxed">
              You haven&apos;t saved any delivery destinations yet. Add your primary address for instant expedited checkout.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Primary Address
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`luxury-card rounded-2xl p-6 relative flex flex-col justify-between ${
                  a.isDefault ? 'border-accent/40 ring-1 ring-accent/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm text-foreground">{a.name}</span>
                    {a.isDefault && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-accent/10 text-accent">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">{a.line1}</p>
                  <p className="text-xs text-secondary leading-relaxed">
                    {a.city}, {a.state} {a.zip}
                  </p>
                  <p className="text-xs text-secondary">{a.country}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-xs">
                  {!a.isDefault ? (
                    <button
                      onClick={() => setDefault(a.id)}
                      className="text-secondary hover:text-accent font-medium text-[11px]"
                    >
                      Set as default
                    </button>
                  ) : (
                    <span className="text-success font-medium flex items-center gap-1 text-[11px]">
                      <Check className="w-3 h-3" /> Active Default
                    </span>
                  )}

                  <button
                    onClick={() => removeAddress(a.id)}
                    className="text-secondary hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <Input
            label="Recipient Full Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Marcus Vance"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-label text-secondary">
              Country / Region
            </label>
            <select
              value={newCountry}
              onChange={(e) => {
                setNewCountry(e.target.value);
                setZipLookupStatus(null);
              }}
              className="w-full px-3.5 py-3 rounded-xl border border-black/10 bg-white text-xs font-medium text-foreground focus:ring-1 focus:ring-accent outline-none shadow-subtle cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Street Address"
            value={newLine1}
            onChange={(e) => setNewLine1(e.target.value)}
            placeholder="House/Flat No., Street, Area"
            required
          />

          <div className="relative">
            <Input
              label={newCountry.toLowerCase().includes('india') ? 'PIN Code' : 'ZIP / Postal Code'}
              value={newZip}
              onChange={(e) => handleZipChange(e.target.value)}
              placeholder={newCountry.toLowerCase().includes('india') ? '6-digit PIN (e.g. 110001)' : 'Postal Code'}
              required
            />
            {isLookingUpZip && (
              <div className="absolute right-3 top-8 flex items-center gap-1.5 text-[11px] text-accent font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Detecting...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="City / District"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="City / District"
              required
            />
            <Input
              label="State / Province"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              placeholder="State / Province"
              required
            />
          </div>

          {zipLookupStatus && (
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{zipLookupStatus}</span>
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full mt-2">
            Save Address
          </Button>
        </form>
      </Modal>
    </AccountLayoutClient>
  );
}
