'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, MapPin, ShieldCheck, X } from 'lucide-react'
import type { CartItem } from '@mobile-station/types'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { CART_PINCODE_STORAGE_KEY } from '@/lib/cart-pricing'
import { readStoredAccountProfile } from '@/lib/account'
import { formatINR } from '@/lib/format'
import { buildWhatsAppChatUrl } from '@/components/support/WhatsAppSupportWidget'

interface CartCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: readonly CartItem[]
  totalPaise: number
  appliedCoupon: string | null
  onOrderConfirmed: () => void
}

/**
 * Self-contained checkout confirmation & hub pickup sheet eliminating 404 transitions
 * and pre-filling saved customer PIN / GSTIN details cleanly.
 */
export function CartCheckoutModal({
  isOpen,
  onClose,
  items,
  totalPaise,
  appliedCoupon,
  onOrderConfirmed,
}: CartCheckoutModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [pincode, setPincode] = useState('')
  const [fulfillment, setFulfillment] = useState<'delivery' | 'motijheel' | 'club-road'>('delivery')
  const [gstin, setGstin] = useState('')
  const [placedRef, setPlacedRef] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const savedProfile = readStoredAccountProfile()
    if (savedProfile) {
      setCustomerName((prev) => prev || savedProfile.fullName)
      setPhone((prev) => prev || savedProfile.phone)
      setGstin((prev) => prev || savedProfile.gstin)
      setPincode((prev) => prev || savedProfile.pincode)
    } else {
      try {
        const cartPin = window.localStorage.getItem(CART_PINCODE_STORAGE_KEY)
        if (cartPin) setPincode((prev) => prev || cartPin)
      } catch {
        // Ignore storage read fallback
      }
    }
    setPlacedRef(null)
  }, [isOpen])

  if (!isOpen) return null

  const whatsappNum =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || MOBILE_STATION_BRAND.support.whatsappNumber

  const hubSummary =
    fulfillment === 'motijheel'
      ? 'Self-Pickup: Motijheel Flagship (842001)'
      : fulfillment === 'club-road'
        ? 'Self-Pickup: Club Road Express (842002)'
        : `Insured Delivery to PIN ${pincode || 'Unspecified'}`

  const whatsappOrderUrl = buildWhatsAppChatUrl(
    whatsappNum,
    [
      `Order Confirmation Request — ${MOBILE_STATION_BRAND.name}`,
      `Customer: ${customerName || 'Guest'} (${phone || 'No phone'})`,
      hubSummary,
      gstin ? `B2B GSTIN: ${gstin}` : undefined,
      appliedCoupon ? `Coupon: ${appliedCoupon}` : undefined,
      `Items: ${items.map((i) => `${i.quantity}x ${i.title} (${i.variantTitle})`).join(', ')}`,
      `Total Payable: ${formatINR(totalPaise)}`,
    ]
      .filter(Boolean)
      .join('\n')
  )

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault()
    const orderCode = `MS-${Date.now().toString().slice(-6)}`
    setPlacedRef(orderCode)
    onOrderConfirmed()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Checkout and Dispatch Confirmation"
      onClick={onClose}
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-obsidian-950/65 backdrop-blur-xs p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90dvh] rounded-t-lg sm:rounded-lg bg-surface-card border border-chrome-200 shadow-modal overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3.5 bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            <h3 className="font-display text-base font-bold text-ink-inverse">
              {placedRef ? 'Order Reserved' : 'Express Checkout & GST Details'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-chrome-300 hover:bg-obsidian-800 hover:text-gold-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {placedRef ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-commerce-obdBg text-commerce-savings flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs font-bold text-gold-700">REF {placedRef}</p>
              <h4 className="font-display text-lg font-bold text-ink-primary">
                Order Desk Request Logged
              </h4>
              <p className="text-xs text-ink-secondary max-w-sm mx-auto">
                Our Muzaffarpur hub desk will verify IMEI/serial allocation and share Razorpay link /
                Open-Box OTP updates to +91 {phone || 'your contact'}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-sm bg-commerce-whatsapp hover:bg-commerce-whatsappDark px-4 py-2 text-xs font-bold text-ink-inverse transition"
              >
                Send Reference on WhatsApp
              </a>
              <Link
                href="/"
                onClick={onClose}
                className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-sm border border-chrome-300 bg-surface-canvas px-4 py-2 text-xs font-bold text-ink-primary hover:border-gold-500 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmOrder} className="p-4 sm:p-5 overflow-y-auto ms-scrollbar space-y-3.5 text-xs">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">Full Name *</span>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Buyer name"
                  className="w-full min-h-[40px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-ink-primary">10-Digit Mobile *</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full min-h-[40px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 font-mono text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-ink-primary flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold-700" />
                <span>Dispatch / Hub Pickup Option</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'delivery', label: 'Pan-India Courier' },
                  { id: 'motijheel', label: 'Motijheel (842001)' },
                  { id: 'club-road', label: 'Club Road (842002)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setFulfillment(opt.id as 'delivery' | 'motijheel' | 'club-road')
                    }
                    className={`min-h-[40px] rounded-sm border px-2.5 py-1.5 font-semibold transition ${
                      fulfillment === opt.id
                        ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                        : 'border-chrome-300 bg-surface-canvas text-ink-secondary hover:border-gold-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {fulfillment === 'delivery' && (
                <label className="space-y-1">
                  <span className="font-semibold text-ink-primary">Delivery PIN Code *</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit PIN"
                    className="w-full min-h-[40px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 font-mono text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                  />
                </label>
              )}

              <label className={`space-y-1 ${fulfillment !== 'delivery' ? 'sm:col-span-2' : ''}`}>
                <span className="font-semibold text-ink-primary flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gold-700" />
                  <span>15-Char B2B GSTIN (Optional)</span>
                </span>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="Optional for 18% GST credit"
                  className="w-full min-h-[40px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 font-mono text-sm uppercase text-ink-primary focus:border-gold-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="rounded-sm bg-surface-muted p-3 flex items-center justify-between tabular-nums">
              <span className="font-semibold text-ink-secondary">Total Order Payable</span>
              <strong className="font-display text-lg font-bold text-ink-primary">
                {formatINR(totalPaise)}
              </strong>
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-sm bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
            >
              Confirm Order ({formatINR(totalPaise)})
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
