'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box, ShoppingCart } from 'lucide-react'
import type { StorefrontProduct } from '@/lib/catalog'
import { discountPercent, formatINR, monthlyEmiPreview } from '@/lib/format'
import { useCart } from '@/components/CartContext'

const TRACKING_LABELS: Record<string, string> = {
  imei_serialized: 'IMEI Sealed',
  serial_tracked: 'Serial Tracked',
  sku_quantity: 'Hub Stocked',
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const [variantIdx, setVariantIdx] = useState(0)
  const { addItem, openCart } = useCart()

  const activeVariant = product.variants[variantIdx] ?? product.variants[0]
  const off = discountPercent(activeVariant.mrp_paise, activeVariant.price_paise)
  const lowThreshold = product.metadata.stock_details?.low_stock_threshold ?? 5
  const isLowStock = activeVariant.stock > 0 && activeVariant.stock <= lowThreshold
  const trackingMode = product.metadata.stock_details?.tracking_mode ?? 'sku_quantity'

  const handleAdd = () => {
    addItem({
      sku: activeVariant.sku,
      productHandle: product.handle,
      title: product.title,
      variantTitle: activeVariant.title,
      brand: product.metadata.brand,
      price_paise: activeVariant.price_paise,
      mrp_paise: activeVariant.mrp_paise,
      thumbnail: product.thumbnail,
      requires_open_box_delivery: product.metadata.requires_open_box_delivery,
    })
    openCart()
  }

  return (
    <article className="rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card hover:shadow-card-hover hover:border-gold-500/70 transition flex flex-col justify-between gap-4">
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
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                isLowStock
                  ? 'bg-commerce-warningBg text-commerce-warningText'
                  : 'bg-commerce-obdBg text-commerce-obdText'
              }`}
            >
              {activeVariant.stock} In Stock
            </span>
          </div>
          <div className="relative aspect-[5/4] sm:aspect-square w-full">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              loading="eager"
              sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 280px"
              className="object-contain p-3 sm:p-4 transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gold-700">
            {product.metadata.brand}
          </span>
          <span className="font-mono text-[10px] text-ink-muted whitespace-nowrap">
            {TRACKING_LABELS[trackingMode] ?? 'Verified'} · HSN {product.metadata.hsn_code}
          </span>
        </div>

        <div>
          <Link href={`/products/${product.handle}`} className="group">
            <h3 className="font-display text-base font-bold leading-snug text-ink-primary group-hover:text-gold-700 transition line-clamp-2 min-h-[2.4rem]">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-ink-muted mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(product.metadata.key_highlights ?? []).slice(0, 3).map((chip) => (
            <span
              key={chip}
              className="rounded-xs bg-surface-muted px-2 py-0.5 font-mono text-[10px] text-ink-secondary"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {product.variants.map((variant, idx) => (
            <button
              key={variant.sku}
              type="button"
              onClick={() => setVariantIdx(idx)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                idx === variantIdx
                  ? 'border-obsidian-900 bg-obsidian-900 text-ink-inverse'
                  : 'border-chrome-300 bg-surface-card text-ink-secondary hover:border-gold-500'
              }`}
            >
              {variant.title}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-chrome-200 space-y-2.5">
        <div className="space-y-0.5">
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
          <p className="font-mono text-[10px] text-ink-muted truncate">{activeVariant.sku}</p>
        </div>

        {product.metadata.emi_eligible && (
          <p className="text-[11px] font-medium text-commerce-savings tabular-nums">
            No-Cost EMI from {monthlyEmiPreview(activeVariant.price_paise)}/mo · Incl. 18% GST
          </p>
        )}

        <div className="flex items-start gap-1.5 text-[11px] text-ink-secondary bg-surface-muted/70 rounded-xs p-2">
          <Box className="h-3.5 w-3.5 text-gold-700 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            <strong>In Box:</strong> {product.metadata.in_the_box.slice(0, 3).join(', ')}
            {product.metadata.in_the_box.length > 3 ? '…' : ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-commerce-warrantyBg px-2.5 py-0.5 text-[10px] font-semibold text-commerce-warrantyText">
            {product.metadata.warranty_summary}
          </span>
          {product.metadata.requires_open_box_delivery && (
            <span className="rounded-full bg-commerce-obdBg px-2.5 py-0.5 text-[10px] font-semibold text-commerce-obdText">
              Open-Box Check
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/products/${product.handle}`}
            className="inline-flex min-h-[40px] items-center justify-center rounded-sm border border-chrome-300 bg-surface-card px-2 py-2 text-xs font-semibold text-ink-primary hover:border-obsidian-900 transition"
          >
            Specs & Box
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-sm bg-obsidian-900 px-2 py-2 text-xs font-semibold text-ink-inverse hover:bg-obsidian-700 transition"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-gold-500 shrink-0" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  )
}
