'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { success } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    success('Message Sent', 'Our concierge team will respond within 24 hours.');
  };

  return (
    <div className="max-w-container mx-auto px-6 sm:px-12 py-16 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[11px] uppercase tracking-label font-bold text-secondary">
            Concierge
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold text-foreground">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
            Whether inquiring about bespoke acquisitions, product care, or press, our concierge is at your disposal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Contact Info (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="luxury-card rounded-2xl p-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Atelier Soho</h4>
                  <p className="text-secondary mt-1">482 Mercer Street</p>
                  <p className="text-secondary">New York, NY 10013</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-black/5">
                <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Digital Concierge</h4>
                  <p className="text-secondary mt-1">concierge@atelier-design.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-black/5">
                <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Telephone</h4>
                  <p className="text-secondary mt-1">+1 (800) 492-8172</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="md:col-span-7">
            {isSent ? (
              <div className="luxury-card rounded-2xl p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h3 className="font-serif-heading text-2xl font-bold">Message Received</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Thank you for reaching out. A dedicated concierge will review your dispatch and reply promptly.
                </p>
                <Button variant="outline" onClick={() => setIsSent(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="luxury-card rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Input label="Subject / Inquiry Topic" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                <div>
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How may our concierge assist your collection?"
                    className="w-full text-xs p-3.5 rounded-xl border border-black/10 focus:outline-none focus:border-accent bg-white"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Transmit Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
