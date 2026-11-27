'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { StorefrontProduct } from '@mobile-station/types'
import { formatINR } from '@/lib/format'

interface MinimalProductCardProps {
  product: StorefrontProduct
  className?: string
  compact?: boolean
}

/**
 * Minimal storefront product card showing only image, product title, selling price, and MRP.
 * Full specs, variants, warranty, and buy options open inside the product page when clicked.
 */
export function MinimalProductCard({
  product,
  className = '',
  compact = false,
}: MinimalProductCardProps) {
  const primaryVariant = product.variants[0]
  const sellingPaise = primaryVariant?.price_paise ?? 0
  const mrpPaise = primaryVariant?.mrp_paise ?? sellingPaise
  const hasDiscount = mrpPaise > sellingPaise

  return (
    <Link
      href={`/products/${product.handle}`}
      className={`group rounded-md border border-chrome-200 bg-surface-card ${
        compact ? 'p-2 sm:p-3 gap-2' : 'p-3 sm:p-3.5 gap-3'
      } shadow-card hover:shadow-card-hover hover:border-gold-500 transition flex flex-col justify-between ${className}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-surface-card">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          loading="lazy"
          sizes={
            compact
              ? '(max-width: 640px) 31vw, (max-width: 1024px) 23vw, 220px'
              : '(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 240px'
          }
          className={`object-contain ${
            compact ? 'p-1.5 sm:p-2.5' : 'p-2.5 sm:p-3'
          } transition-transform duration-300 group-hover:scale-105`}
        />
      </div>

      <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
        <h3
          className={`font-display ${
            compact
              ? 'text-[11px] sm:text-xs font-semibold leading-tight min-h-[1.85rem] sm:min-h-[2.1rem]'
              : 'text-xs sm:text-sm font-bold leading-snug min-h-[2.25rem] sm:min-h-[2.5rem]'
          } text-ink-primary group-hover:text-gold-700 transition-colors line-clamp-2`}
        >
          {product.title}
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 tabular-nums">
          <span
            className={`font-display ${
              compact ? 'text-xs sm:text-sm font-bold' : 'text-sm sm:text-base font-bold'
            } text-ink-primary`}
          >
            {formatINR(sellingPaise)}
          </span>
          {hasDiscount && (
            <span
              className={`${
                compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'
              } text-ink-muted line-through`}
            >
              {compact ? formatINR(mrpPaise) : `MRP ${formatINR(mrpPaise)}`}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
