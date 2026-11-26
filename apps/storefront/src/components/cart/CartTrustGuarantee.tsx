'use client'

import React from 'react'
import { PackageCheck, Receipt, ShieldCheck } from 'lucide-react'

/**
 * Compact 3-pillar buyer trust strip matching Glorov's CartTransitGuarantee position.
 */
export function CartTrustGuarantee() {
  return (
    <div className="w-full rounded-md border border-chrome-200 bg-surface-card px-3 py-2.5 shadow-card">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-ink-secondary">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-700 shrink-0" />
          <span>IMEI Sealed</span>
        </span>
        <span className="text-chrome-300" aria-hidden="true">•</span>
        <span className="inline-flex items-center gap-1">
          <PackageCheck className="w-3.5 h-3.5 text-commerce-savings shrink-0" />
          <span>Open-Box Delivery</span>
        </span>
        <span className="text-chrome-300" aria-hidden="true">•</span>
        <span className="inline-flex items-center gap-1">
          <Receipt className="w-3.5 h-3.5 text-commerce-warrantyText shrink-0" />
          <span>18% GST Invoice</span>
        </span>
      </div>
    </div>
  )
}
