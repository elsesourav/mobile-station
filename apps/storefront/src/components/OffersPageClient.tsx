'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Copy, Sparkles, Tag } from 'lucide-react'
import type { StorefrontOffer, StorefrontProduct } from '@/lib/catalog'
import { formatINR } from '@/lib/format'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductCard } from '@/components/ProductCard'

export function OffersPageClient({
  offers,
  dealProducts,
}: {
  offers: StorefrontOffer[]
  dealProducts: StorefrontProduct[]
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      setCopiedCode(code)
    }
  }

  return (
    <StorefrontChrome>
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-8 sm:py-12 space-y-3">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-chrome-300 hover:text-gold-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500">
              <Sparkles className="h-3 w-3" />
              VERIFIED PROMO & NO-COST EMI DEALS
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
            Active Electronics Coupons & Bank Offers
          </h1>
          <p className="text-sm text-chrome-300 max-w-2xl">
            Combine instant Mobile Station coupon codes with No-Cost EMI and 18% GST Business Input Tax Credit across sealed phones, audio, and accessories.
          </p>
        </div>
      </section>

      <section className="page-container py-8 space-y-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer, idx) => (
            <div
              key={offer.id}
              className={`rounded-md border border-chrome-200 bg-surface-card p-5 shadow-card flex flex-col justify-between gap-4 ${
                offers.length % 2 === 1 && idx === offers.length - 1
                  ? 'sm:col-span-2 lg:col-span-1'
                  : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 font-mono text-xs font-bold text-gold-700">
                    <Tag className="h-3.5 w-3.5" />
                    {offer.code}
                  </span>
                  {offer.min_cart_paise && (
                    <span className="font-mono text-[11px] text-ink-muted">
                      Min Order {formatINR(offer.min_cart_paise)}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-lg font-bold text-ink-primary">{offer.title}</h2>
                <p className="text-xs text-ink-secondary">{offer.description}</p>
              </div>

              <button
                type="button"
                onClick={() => copyCode(offer.code)}
                className="w-full inline-flex min-h-[40px] items-center justify-center gap-2 rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-obsidian-700 transition"
              >
                {copiedCode === offer.code ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-gold-500" />
                    <span>Copied {offer.code}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-gold-500" />
                    <span>Copy Promo Code</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold">Top Discounted Accessories & Audio</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dealProducts.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        </div>
      </section>
    </StorefrontChrome>
  )
}
