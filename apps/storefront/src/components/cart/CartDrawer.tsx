'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import type { CartItem } from '@mobile-station/types'
import { formatINR } from '@/lib/format'

interface CartDrawerProps {
  isOpen: boolean
  items: CartItem[]
  totalCount: number
  subtotalPaise: number
  totalSavingsPaise: number
  onClose: () => void
  onUpdateQuantity: (sku: string, delta: number) => void
  onRemoveItem: (sku: string) => void
}

export function CartDrawer({
  isOpen,
  items,
  totalCount,
  subtotalPaise,
  totalSavingsPaise,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-drawer flex justify-end bg-obsidian-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
    >
      <div className="flex h-full w-full max-w-md flex-col bg-surface-card shadow-modal border-l border-chrome-200">
        <div className="flex items-center justify-between bg-obsidian-900 px-4 py-4 text-ink-inverse border-b border-obsidian-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-gold-500" />
            <h2 className="font-display text-base font-bold text-ink-inverse">
              Your Tech Cart ({totalCount})
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart drawer"
            onClick={onClose}
            className="rounded-sm p-1.5 text-chrome-300 hover:bg-obsidian-800 hover:text-ink-inverse"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="h-10 w-10 mx-auto text-chrome-400" />
              <p className="font-display text-base font-bold text-ink-primary">Your cart is empty</p>
              <p className="text-xs text-ink-muted max-w-xs mx-auto">
                Add smartphones, audio gear, laptops, or accessories to review GST pricing and
                dispatch options.
              </p>
              <Link
                href="/"
                onClick={onClose}
                className="inline-flex rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold text-obsidian-950"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.sku}
                className="flex gap-3 rounded-md border border-chrome-200 bg-surface-canvas p-3"
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-xs border border-chrome-200 bg-surface-card object-contain p-1"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.productHandle}`}
                      onClick={onClose}
                      className="font-display text-xs font-bold text-ink-primary hover:text-gold-700 line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => onRemoveItem(item.sku)}
                      className="text-ink-muted hover:text-commerce-errorText p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">{item.variantTitle}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-display text-sm font-bold text-ink-primary tabular-nums">
                      {formatINR(item.price_paise * item.quantity)}
                    </span>
                    <div className="inline-flex items-center rounded-sm border border-chrome-300 bg-surface-card">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => onUpdateQuantity(item.sku, -1)}
                        className="p-1.5 text-ink-secondary hover:text-ink-primary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 font-mono text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => onUpdateQuantity(item.sku, 1)}
                        className="p-1.5 text-ink-secondary hover:text-ink-primary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-chrome-200 bg-surface-card p-4 pb-5 space-y-2.5">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-ink-secondary">
                <span>Subtotal (Incl. 18% GST)</span>
                <span className="font-display font-bold text-base text-ink-primary tabular-nums">
                  {formatINR(subtotalPaise)}
                </span>
              </div>
              {totalSavingsPaise > 0 && (
                <div className="flex justify-between text-commerce-savings font-medium">
                  <span>Instant MRP Savings</span>
                  <span className="tabular-nums">- {formatINR(totalSavingsPaise)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xs bg-commerce-obdBg px-3 py-2 text-[11px] font-medium text-commerce-obdText">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>B2B GSTIN Input Tax Credit & Insured Courier Enabled</span>
            </div>
            <p className="font-mono text-[10px] text-center text-ink-muted">
              Promo Codes: TECH500 · DESK1000 · FREESHIP
            </p>
            <Link
              href="/offers"
              onClick={onClose}
              className="w-full inline-flex min-h-[42px] items-center justify-center rounded-sm bg-gold-500 px-4 py-2 text-xs font-bold text-obsidian-950 hover:bg-gold-600 transition"
            >
              View &amp; Apply Promo Codes
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
