'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { StorefrontProduct } from '@mobile-station/types'
import { formatINR } from '@/lib/format'

interface MinimalProductCardProps {
  product: StorefrontProduct
  className?: string
}

/**
 * Minimal storefront product card showing only image, product title, selling price, and MRP.
 * Full specs, variants, warranty, and buy options open inside the product page when clicked.
 */
export function MinimalProductCard({ product, className = '' }: MinimalProductCardProps) {
  const primaryVariant = product.variants[0]
  const sellingPaise = primaryVariant?.price_paise ?? 0
  const mrpPaise = primaryVariant?.mrp_paise ?? sellingPaise

  return (
    <Link
      href={`/products/${product.handle}`}
      className={`group rounded-md border border-chrome-200 bg-surface-card p-3 sm:p-3.5 shadow-card hover:shadow-card-hover hover:border-gold-500 transition flex flex-col justify-between gap-3 ${className}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-surface-card">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 240px"
          className="object-contain p-2.5 sm:p-3 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display text-xs sm:text-sm font-bold leading-snug text-ink-primary group-hover:text-gold-700 transition-colors line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
          {product.title}
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
          <span className="font-display text-sm sm:text-base font-bold text-ink-primary">
            {formatINR(sellingPaise)}
          </span>
          <span className="text-[11px] sm:text-xs text-ink-muted line-through">
            MRP {formatINR(mrpPaise)}
          </span>
        </div>
      </div>
    </Link>
  )
}
