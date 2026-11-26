'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
import type { CartMilestoneNode, StorefrontOffer } from '@mobile-station/types'
import { ALL_OFFERS } from '@/lib/catalog'
import { buildCartMilestoneRoadmap } from '@/lib/cart-pricing'
import { formatINR } from '@/lib/format'

interface CartMilestoneBarProps {
  subtotalPaise: number
  appliedCoupon: string | null
  offers?: readonly StorefrontOffer[]
  onOpenOffers?: () => void
  onApplyCoupon?: (code: string) => void
  onNotice?: (message: string) => void
  hideViewOffersLink?: boolean
  className?: string
}

/**
 * Dynamic milestone savings & free-shipping progress meter mirroring Glorov's
 * FreeShippingProgressBar position at the top of the cart items column.
 */
export function CartMilestoneBar({
  subtotalPaise,
  appliedCoupon,
  offers = ALL_OFFERS,
  onOpenOffers,
  onApplyCoupon,
  onNotice,
  hideViewOffersLink = false,
  className = '',
}: CartMilestoneBarProps) {
  const roadmap = buildCartMilestoneRoadmap(subtotalPaise, appliedCoupon, offers)

  const handleNodeClick = (node: CartMilestoneNode) => {
    if (!node.isReached) {
      const needed = Math.max(0, node.minSpendPaise - subtotalPaise)
      onNotice?.(`Add ${formatINR(needed)} more to unlock ${node.title}.`)
      return
    }
    if (node.type === 'free_shipping') {
      onNotice?.('Free Insured Express Shipping is active on your cart.')
      return
    }
    if (node.isApplied) {
      onNotice?.(`${node.code} is already active on this order.`)
      return
    }
    onApplyCoupon?.(node.code)
  }

  return (
    <div
      onClick={onOpenOffers}
      className={`w-full rounded-md border border-chrome-200 bg-surface-card px-3.5 py-2.5 shadow-card select-none transition-colors hover:border-gold-500 ${
        onOpenOffers ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-secondary truncate">
          <span>{roadmap.prefix}</span>
          <strong className="font-bold text-ink-primary">{roadmap.highlight}</strong>
        </p>

        {!hideViewOffersLink && onOpenOffers && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenOffers()
            }}
            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-gold-700 hover:underline shrink-0"
          >
            <span>View Offers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="relative w-full h-7 mt-1.5 flex items-center">
        <div className="absolute left-3.5 right-3.5 h-[3px] bg-chrome-200 rounded-full" />
        <div
          className="absolute left-3.5 h-[3px] bg-gold-500 rounded-full transition-all duration-300"
          style={{
            width: `calc(${roadmap.progressFraction} * (100% - 28px))`,
          }}
        />

        {roadmap.nodes.map((node) => {
          const isRightEdge = node.positionFraction >= 0.99
          const badgeTone = node.isApplied
            ? 'bg-obsidian-900 text-gold-500 border-obsidian-900'
            : node.isUpgrade
              ? 'bg-gold-500 text-obsidian-950 border-gold-600'
              : node.isReached
                ? 'bg-commerce-savings text-ink-inverse border-commerce-savings'
                : 'bg-surface-card text-ink-primary border-chrome-300'

          return (
            <button
              key={node.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(node)
              }}
              title={`${node.title} (Min ${formatINR(node.minSpendPaise)})`}
              className={`absolute z-10 cursor-pointer transition-transform active:scale-90 ${
                isRightEdge ? 'right-0' : '-translate-x-1/2'
              }`}
              style={
                isRightEdge
                  ? undefined
                  : { left: `calc(14px + ${node.positionFraction} * (100% - 28px))` }
              }
            >
              <span
                className={`min-w-[28px] h-[24px] px-1 rounded-full border flex items-center justify-center font-mono text-[8.5px] font-bold leading-none transition-colors ${badgeTone}`}
              >
                {node.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
