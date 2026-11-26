'use client'

import React, { useEffect, useState } from 'react'
import { MapPin, Truck } from 'lucide-react'
import type { DeliveryServiceabilityResult } from '@mobile-station/types'
import { checkDeliveryServiceability } from '@/lib/catalog'
import { CART_PINCODE_STORAGE_KEY } from '@/lib/cart-pricing'

interface CartPincodeBoxProps {
  onPincodeChange?: (pincode: string) => void
}

/**
 * Interactive delivery PIN code checker positioned directly between Coupon & Order Summary
 * in Glorov's cart layout, validating real Muzaffarpur hub pickup vs Pan-India courier timelines.
 */
export function CartPincodeBox({ onPincodeChange }: CartPincodeBoxProps) {
  const [activePincode, setActivePincode] = useState('')
  const [inputPincode, setInputPincode] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [deliveryResult, setDeliveryResult] = useState<DeliveryServiceabilityResult | null>(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_PINCODE_STORAGE_KEY)
      if (saved && /^\d{6}$/.test(saved.trim())) {
        const clean = saved.trim()
        setActivePincode(clean)
        setInputPincode(clean)
        setDeliveryResult(checkDeliveryServiceability(clean))
      }
    } catch {
      // Ignore storage read failures cleanly
    }
  }, [])

  const handleCheck = () => {
    const clean = inputPincode.trim()
    const evaluated = checkDeliveryServiceability(clean)
    setDeliveryResult(evaluated)
    if (!evaluated.valid) return

    setActivePincode(clean)
    setIsExpanded(false)
    try {
      window.localStorage.setItem(CART_PINCODE_STORAGE_KEY, clean)
    } catch {
      // Ignore storage write failures cleanly
    }
    onPincodeChange?.(clean)
  }

  return (
    <section
      aria-label="Delivery PIN Check"
      className="w-full rounded-md border border-chrome-200 bg-surface-card p-3.5 shadow-card space-y-2.5"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-surface-muted text-obsidian-900 flex items-center justify-center shrink-0">
          <Truck className="w-3.5 h-3.5 text-gold-700" />
        </div>

        <p className="flex-1 min-w-0 text-xs text-ink-secondary truncate">
          {activePincode && deliveryResult?.valid ? (
            <>
              <span>Deliver to </span>
              <strong className="font-mono font-bold text-ink-primary">{activePincode}</strong>
              <span className="text-commerce-savings font-semibold"> · {deliveryResult.eta}</span>
            </>
          ) : (
            <span className="text-ink-muted">Check PIN delivery ETA</span>
          )}
        </p>

        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className={`rounded-sm px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
            isExpanded
              ? 'bg-surface-muted text-ink-secondary border border-chrome-300'
              : activePincode
                ? 'bg-commerce-obdBg text-commerce-obdText border border-commerce-savings/30'
                : 'bg-obsidian-900 text-gold-500 hover:bg-obsidian-800'
          }`}
        >
          {isExpanded ? 'Close' : activePincode ? 'Change' : 'Enter PIN'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCheck()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              aria-label="Enter 6-digit Indian PIN code"
              placeholder="Enter 6-digit PIN"
              className="flex-1 min-w-0 rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 font-mono text-xs text-ink-primary placeholder:font-sans placeholder:text-ink-muted focus:border-gold-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={inputPincode.length !== 6}
              className="rounded-sm bg-obsidian-900 px-3.5 py-1.5 text-xs font-bold text-gold-500 hover:bg-obsidian-800 disabled:opacity-45 transition shrink-0"
            >
              CHECK
            </button>
          </form>

          {deliveryResult && (
            <div
              className={`flex items-start gap-1.5 rounded-xs p-2 text-[11px] font-medium ${
                deliveryResult.valid
                  ? 'bg-commerce-obdBg text-commerce-obdText'
                  : 'bg-commerce-errorBg text-commerce-errorText'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{deliveryResult.label}</span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
