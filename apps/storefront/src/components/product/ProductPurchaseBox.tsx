'use client'

import { useState } from 'react'
import {
  Check,
  ChevronDown,
  Copy,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
} from 'lucide-react'
import type {
  DeliveryServiceabilityResult,
  GstSplitBreakdown,
  StorefrontOffer,
  StorefrontProduct,
  StorefrontVariant,
} from '@mobile-station/types'
import { discountPercent, formatINR, monthlyEmiPreview } from '@/lib/format'
import { ProductVariantSelector } from '@/components/product/ProductVariantSelector'

interface ProductPurchaseBoxProps {
  product: StorefrontProduct
  activeVariant: StorefrontVariant
  selectedVariantIdx: number
  onSelectVariant: (variantIndex: number) => void
  quantity: number
  onChangeQuantity: (nextQuantity: number) => void
  offers: readonly StorefrontOffer[]
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
  quantity,
  onChangeQuantity,
  offers,
  gstBreakdown,
  intraStateGst,
  onToggleGstMode,
  pincode,
  onChangePincode,
  onCheckPincode,
  deliveryInfo,
  onAddToCart,
}: ProductPurchaseBoxProps) {
  const [showGstDetails, setShowGstDetails] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const savingsPaise = Math.max(0, activeVariant.mrp_paise - activeVariant.price_paise)
  const off = discountPercent(activeVariant.mrp_paise, activeVariant.price_paise)
  const isAvailable = activeVariant.stock > 0

  const handleCopyOffer = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Ignore clipboard permission fallback
    }
    setCopiedCode(code)
    window.setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Desktop Product Header (Mobile renders above gallery) */}
      <div className="hidden lg:block space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-obsidian-900 px-3 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-gold-500">
            {product.metadata.brand} Official
          </span>
          <span className="font-mono text-xs text-ink-muted">
            Model {product.metadata.model_number} · HSN {product.metadata.hsn_code}
          </span>
        </div>
        <h1 className="text-2xl xl:text-3xl font-display font-bold text-ink-primary leading-tight">
          {product.title}
        </h1>
        <p className="text-sm text-ink-secondary">{product.subtitle}</p>
      </div>

      {/* Pricing & Concise 18% GST Disclosure Card */}
      <div className="rounded-md border border-chrome-200 bg-surface-card p-4 space-y-2.5 shadow-card">
        <div className="flex flex-wrap items-baseline gap-2.5 tabular-nums">
          <span className="font-display text-2xl sm:text-3xl font-bold text-ink-primary">
            {formatINR(activeVariant.price_paise)}
          </span>
          {activeVariant.mrp_paise > activeVariant.price_paise && (
            <span className="text-sm text-ink-muted line-through">
              MRP {formatINR(activeVariant.mrp_paise)}
            </span>
          )}
          {off > 0 && (
            <span className="rounded-full bg-commerce-obdBg px-2.5 py-0.5 font-mono text-xs font-bold text-commerce-savings">
              Save {formatINR(savingsPaise)} ({off}% OFF)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-ink-muted">
            Inclusive of {product.metadata.gst_rate_percent}% GST
            {product.metadata.emi_eligible && (
              <strong className="ml-2 text-commerce-savings font-semibold">
                · No-Cost EMI {monthlyEmiPreview(activeVariant.price_paise)}/mo
              </strong>
            )}
          </span>

          <button
            type="button"
            onClick={() => setShowGstDetails((v) => !v)}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-gold-700 hover:underline"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>B2B GST Split</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showGstDetails ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {showGstDetails && (
          <div className="rounded-xs bg-surface-muted p-3 text-xs space-y-1.5 border border-chrome-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-ink-primary">
                GST Input Tax Credit Breakdown
              </span>
              <button
                type="button"
                onClick={onToggleGstMode}
                className="font-mono text-[10.5px] font-semibold text-gold-700 hover:underline"
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
        )}
      </div>

      {/* Organized Configuration Selector */}
      <ProductVariantSelector
        variants={product.variants}
        selectedVariantIdx={selectedVariantIdx}
        onSelectVariant={onSelectVariant}
      />

      {/* Quantity Stepper + Primary Add to Cart Console */}
      <div className="flex items-stretch gap-2 sm:gap-3 pt-1 min-w-0">
        <div
          aria-label="Select quantity"
          className="inline-flex items-center rounded-sm border border-chrome-300 bg-surface-card shrink-0"
        >
          <button
            type="button"
            onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-8 sm:w-10 h-11 sm:h-12 flex items-center justify-center text-ink-primary hover:bg-surface-muted disabled:opacity-40 transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 sm:w-8 text-center font-mono text-xs sm:text-sm font-bold text-ink-primary tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onChangeQuantity(Math.min(Math.max(1, activeVariant.stock), quantity + 1))}
            disabled={!isAvailable || quantity >= activeVariant.stock}
            aria-label="Increase quantity"
            className="w-8 sm:w-10 h-11 sm:h-12 flex items-center justify-center text-ink-primary hover:bg-surface-muted disabled:opacity-40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          disabled={!isAvailable}
          onClick={onAddToCart}
          className="flex-1 min-w-0 inline-flex min-h-[44px] sm:min-h-[48px] items-center justify-center gap-1.5 sm:gap-2 rounded-sm bg-gold-500 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 disabled:opacity-50 active:scale-[0.99] transition"
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {isAvailable
              ? `Add to Cart — ${formatINR(activeVariant.price_paise * quantity)}`
              : 'Currently Out of Stock'}
          </span>
        </button>
      </div>

      {/* Compact Active Store Offers Carousel */}
      {offers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-bold text-ink-primary">
              <Tag className="w-3.5 h-3.5 text-gold-700" />
              <span>Available Offers</span>
            </span>
            {copiedCode && (
              <span className="font-mono text-[11px] font-semibold text-commerce-savings">
                Copied {copiedCode}
              </span>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 ms-scrollbar-x">
            {offers.map((offer) => {
              const copied = copiedCode === offer.code
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => handleCopyOffer(offer.code)}
                  className="shrink-0 w-[215px] rounded-md border border-chrome-200 bg-surface-card p-2.5 text-left hover:border-gold-500 transition shadow-card"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="rounded-xs bg-obsidian-900 px-2 py-0.5 font-mono text-[10px] font-bold text-gold-500">
                      {offer.code}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold-700">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </span>
                  </div>
                  <p className="font-display text-xs font-bold text-ink-primary mt-1.5 truncate">
                    {offer.title}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Pincode Serviceability Checker */}
      <div className="rounded-md border border-chrome-200 bg-surface-card p-3.5 space-y-2.5 shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
          <Truck className="h-4 w-4 text-gold-700 shrink-0" />
          <span>Delivery &amp; Muzaffarpur Hub Pickup Check</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => onChangePincode(e.target.value)}
            aria-label="Enter 6-digit Indian PIN code"
            placeholder="PIN (e.g. 842001)"
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

      {/* Compact Trust Badges */}
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
