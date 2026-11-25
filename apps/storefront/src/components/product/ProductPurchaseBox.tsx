'use client'

import { MapPin, PackageCheck, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import type {
  DeliveryServiceabilityResult,
  GstSplitBreakdown,
  StorefrontProduct,
  StorefrontVariant,
} from '@mobile-station/types'
import { formatINR, monthlyEmiPreview } from '@/lib/format'

interface ProductPurchaseBoxProps {
  product: StorefrontProduct
  activeVariant: StorefrontVariant
  selectedVariantIdx: number
  onSelectVariant: (variantIndex: number) => void
  gstBreakdown: GstSplitBreakdown
  intraStateGst: boolean
  onToggleGstMode: () => void
  pincode: string
  onChangePincode: (nextPincode: string) => void
  onCheckPincode: () => void
  deliveryInfo: DeliveryServiceabilityResult
  onAddToCart: () => void
}

export function ProductPurchaseBox({
  product,
  activeVariant,
  selectedVariantIdx,
  onSelectVariant,
  gstBreakdown,
  intraStateGst,
  onToggleGstMode,
  pincode,
  onChangePincode,
  onCheckPincode,
  deliveryInfo,
  onAddToCart,
}: ProductPurchaseBoxProps) {
  return (
    <div className="lg:col-span-7 space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-obsidian-900 px-3 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold-500">
            {product.metadata.brand} Official
          </span>
          <span className="font-mono text-xs text-ink-muted">
            Model {product.metadata.model_number} · HSN {product.metadata.hsn_code}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-primary">
          {product.title}
        </h1>
        <p className="text-sm text-ink-secondary">{product.description}</p>
      </div>

      {/* Pricing & 18% GST Split Box */}
      <div className="rounded-md border border-chrome-200 bg-surface-card p-4 space-y-3 shadow-card">
        <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
          <span className="font-display text-2xl sm:text-3xl font-bold text-ink-primary">
            {formatINR(activeVariant.price_paise)}
          </span>
          {activeVariant.mrp_paise > activeVariant.price_paise && (
            <span className="text-sm text-ink-muted line-through">
              MRP {formatINR(activeVariant.mrp_paise)}
            </span>
          )}
          <span className="text-xs font-semibold text-commerce-savings">
            Inclusive of {product.metadata.gst_rate_percent}% GST
          </span>
        </div>

        {product.metadata.emi_eligible && (
          <p className="text-xs font-semibold text-commerce-savings tabular-nums">
            No-Cost EMI starts at {monthlyEmiPreview(activeVariant.price_paise)}/month
          </p>
        )}

        <div className="rounded-xs bg-surface-muted p-3 text-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-ink-primary">
              GST Invoice Tax Split (B2B ITC Eligible)
            </span>
            <button
              type="button"
              onClick={onToggleGstMode}
              className="font-mono text-[10px] font-semibold text-gold-700 hover:underline"
            >
              Switch to {intraStateGst ? 'Inter-State IGST' : 'Bihar Intra-State CGST+SGST'}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink-secondary tabular-nums">
            <span>Taxable: {formatINR(gstBreakdown.taxablePaise)}</span>
            {intraStateGst ? (
              <>
                <span>CGST 9%: {formatINR(gstBreakdown.cgstPaise)}</span>
                <span>SGST 9%: {formatINR(gstBreakdown.sgstPaise)}</span>
              </>
            ) : (
              <span>IGST 18%: {formatINR(gstBreakdown.igstPaise)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Variant Selector */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Select Configuration ({activeVariant.sku})
        </p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant, index) => (
            <button
              key={variant.sku}
              type="button"
              onClick={() => onSelectVariant(index)}
              className={`rounded-sm border px-3 py-2 text-xs font-semibold transition ${
                index === selectedVariantIdx
                  ? 'border-obsidian-900 bg-obsidian-900 text-gold-500 shadow-card'
                  : 'border-chrome-300 bg-surface-card text-ink-primary hover:border-gold-500'
              }`}
            >
              {variant.title} · {formatINR(variant.price_paise)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onAddToCart}
          className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-sm bg-gold-500 px-6 py-3 text-sm font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart — {formatINR(activeVariant.price_paise)}</span>
        </button>
      </div>

      {/* Pincode Delivery Serviceability Check */}
      <div className="rounded-md border border-chrome-200 bg-surface-card p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
          <Truck className="h-4 w-4 text-gold-700" />
          <span>Check Pan-India Delivery &amp; Muzaffarpur Hub Pickup</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => onChangePincode(e.target.value)}
            aria-label="Enter 6-digit Indian PIN code"
            placeholder="Enter PIN (e.g. 842001)"
            className="flex-1 min-w-0 rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 font-mono text-xs text-ink-primary focus:border-gold-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onCheckPincode}
            className="rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-obsidian-700 transition shrink-0"
          >
            Check
          </button>
        </div>
        <div
          className={`flex items-start gap-2 text-xs rounded-xs p-2.5 ${
            deliveryInfo.valid
              ? 'bg-commerce-obdBg text-commerce-obdText'
              : 'bg-commerce-errorBg text-commerce-errorText'
          }`}
        >
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{deliveryInfo.label}</p>
            {deliveryInfo.eta && <p className="text-[11px] mt-0.5">{deliveryInfo.eta}</p>}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-commerce-warrantyBg px-3 py-1 text-xs font-semibold text-commerce-warrantyText">
          <ShieldCheck className="h-3.5 w-3.5" />
          {product.metadata.warranty_summary}
        </span>
        {product.metadata.requires_open_box_delivery && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-commerce-obdBg px-3 py-1 text-xs font-semibold text-commerce-obdText">
            <PackageCheck className="h-3.5 w-3.5" />
            Open-Box Inspection Verified
          </span>
        )}
      </div>
    </div>
  )
}
