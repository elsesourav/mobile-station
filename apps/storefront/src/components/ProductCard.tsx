'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import type { StorefrontProduct } from '@mobile-station/types'
import { discountPercent, formatINR, formatTitleWithoutBrand } from '@/lib/format'
import { getVariantPreviewImage } from '@/lib/product-variants'
import { useCart } from '@/components/CartContext'

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const [variantIdx, setVariantIdx] = useState(0)
  const { addItem, openCart } = useCart()

  const activeVariant = product.variants[variantIdx] ?? product.variants[0]
  const off = discountPercent(activeVariant.mrp_paise, activeVariant.price_paise)
  const isOutOfStock = activeVariant.stock <= 0
  const gstAvailable = product.metadata.gst_invoice_available === true
  const previewSrc = getVariantPreviewImage(product, activeVariant)

  const handleAdd = () => {
    addItem({
      sku: activeVariant.sku,
      productHandle: product.handle,
      title: product.title,
      variantTitle: activeVariant.title,
      brand: product.metadata.brand,
      price_paise: activeVariant.price_paise,
      mrp_paise: activeVariant.mrp_paise,
      thumbnail: previewSrc,
      requires_open_box_delivery: product.metadata.requires_open_box_delivery,
    })
    openCart()
  }

  return (
    <article className="rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card hover:shadow-card-hover hover:border-gold-500/70 transition flex flex-col justify-between gap-3.5">
      <div className="space-y-3">
        <Link
          href={`/products/${product.handle}`}
          className="block rounded-sm bg-surface-card border border-chrome-200/70 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-1 min-h-[28px]">
            {off > 0 ? (
              <span className="rounded-full bg-commerce-deal px-2.5 py-0.5 text-[10px] font-bold text-ink-inverse shadow-card">
                {off}% OFF
              </span>
            ) : (
              <span />
            )}
            {isOutOfStock && (
              <span className="rounded-full bg-commerce-errorBg px-2 py-0.5 font-mono text-[10px] font-semibold text-commerce-errorText">
                Out of Stock
              </span>
            )}
          </div>
          <div className="relative aspect-[5/4] sm:aspect-square w-full">
            <Image
              src={previewSrc}
              alt={product.title}
              fill
              loading="eager"
              sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 280px"
              className="object-contain p-3 sm:p-4 transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>

        <div className="space-y-1">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-gold-700 block">
            {product.metadata.brand}
          </span>
          <Link href={`/products/${product.handle}`} className="group block">
            <h3 className="font-display text-sm sm:text-base font-bold leading-snug text-ink-primary group-hover:text-gold-700 transition line-clamp-2 min-h-[2.4rem]">
              {formatTitleWithoutBrand(product.title, product.metadata.brand)}
            </h3>
          </Link>
          <p className="text-xs text-ink-muted line-clamp-1">{product.subtitle}</p>
        </div>

        {(product.metadata.key_highlights ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(product.metadata.key_highlights ?? []).slice(0, 2).map((chip) => (
              <span
                key={chip}
                className="rounded-xs bg-surface-muted px-2 py-0.5 font-mono text-[10px] text-ink-secondary"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((variant, idx) => (
              <button
                key={variant.sku}
                type="button"
                onClick={() => setVariantIdx(idx)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  idx === variantIdx
                    ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                    : 'border-chrome-300 bg-surface-card text-ink-secondary hover:border-gold-500'
                }`}
              >
                {variant.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-chrome-200 space-y-2.5">
        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="font-display text-lg font-bold text-ink-primary">
            {formatINR(activeVariant.price_paise)}
          </span>
          {activeVariant.mrp_paise > activeVariant.price_paise && (
            <span className="text-xs text-ink-muted line-through">
              {formatINR(activeVariant.mrp_paise)}
            </span>
          )}
        </div>

        {(gstAvailable || product.metadata.requires_open_box_delivery) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {gstAvailable && (
              <span className="rounded-full bg-commerce-warrantyBg px-2 py-0.5 text-[10px] font-semibold text-commerce-warrantyText">
                GST Invoice
              </span>
            )}
            {product.metadata.requires_open_box_delivery && (
              <span className="rounded-full bg-commerce-obdBg px-2 py-0.5 text-[10px] font-semibold text-commerce-obdText">
                Open-Box Check
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/products/${product.handle}`}
            className="inline-flex min-h-[40px] items-center justify-center rounded-sm border border-chrome-300 bg-surface-card px-2 py-2 text-xs font-semibold text-ink-primary hover:border-obsidian-900 transition"
          >
            View Details
          </Link>
          <button
            type="button"
            disabled={activeVariant.stock <= 0}
            onClick={handleAdd}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-sm bg-obsidian-900 px-2 py-2 text-xs font-semibold text-ink-inverse hover:bg-obsidian-700 disabled:opacity-45 transition"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-gold-500 shrink-0" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  )
}
