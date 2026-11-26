'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, MapPin, Share2 } from 'lucide-react'
import type {
  ShowcaseEntryDTO,
  StorefrontCategory,
  StorefrontProduct,
} from '@mobile-station/types'
import {
  ALL_OFFERS,
  checkDeliveryServiceability,
  computeGstSplit,
  getCategoryRoute,
} from '@/lib/catalog'
import { discountPercent } from '@/lib/format'
import { buildProductGallerySlides } from '@/lib/product-gallery'
import { buildVariantSpecificationRows } from '@/lib/product-specs'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductPurchaseBox } from '@/components/product/ProductPurchaseBox'
import { ProductSpecsAccordion } from '@/components/product/ProductSpecsAccordion'
import { PdpRecommendationsSection } from '@/components/recommendations/PdpRecommendationsSection'
import { ShowcaseSpotlightSection } from '@/components/showcase/ShowcaseSpotlightSection'
import { useCart } from '@/components/CartContext'
import { useOptionalBehavior } from '@/context/BehaviorContext'

interface ProductDetailClientProps {
  product: StorefrontProduct
  category?: StorefrontCategory
  relatedProducts?: StorefrontProduct[]
  productShowcase?: ShowcaseEntryDTO[]
}

export function ProductDetailClient({
  product,
  category,
  productShowcase = [],
}: ProductDetailClientProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('842001')
  const [deliveryInfo, setDeliveryInfo] = useState(() => checkDeliveryServiceability('842001'))
  const [intraStateGst, setIntraStateGst] = useState(true)
  const [shareCopied, setShareCopied] = useState(false)

  const { addItem, updateQuantity, openCart } = useCart()
  const behavior = useOptionalBehavior()
  const trackProductView = behavior?.trackProductView

  useEffect(() => {
    trackProductView?.(product)
  }, [product, trackProductView])

  const activeVariant = product.variants[selectedVariantIdx] ?? product.variants[0]
  const discountPct = discountPercent(activeVariant.mrp_paise, activeVariant.price_paise)
  const gstBreakdown = computeGstSplit(
    activeVariant.price_paise,
    product.metadata.gst_rate_percent,
    intraStateGst
  )
  const specificationRows = buildVariantSpecificationRows(product.metadata.specs, activeVariant)

  const gallerySlides = useMemo(
    () => buildProductGallerySlides(product, category, productShowcase),
    [product, category, productShowcase]
  )

  const handleVariantChange = (nextIdx: number) => {
    setSelectedVariantIdx(nextIdx)
    const nextVariant = product.variants[nextIdx]
    if (nextVariant && quantity > nextVariant.stock) {
      setQuantity(Math.max(1, nextVariant.stock))
    }
  }

  const handleAddToCart = () => {
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
    if (quantity > 1) {
      updateQuantity(activeVariant.sku, quantity - 1)
    }
    openCart()
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const shareUrl = window.location.href
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: product.title, url: shareUrl })
        return
      } catch {
        // Fallback cleanly to copy link
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // Ignore clipboard failures
    }
  }

  return (
    <StorefrontChrome activeCategoryHandle={product.category_handle}>
      <div className="page-container py-5 sm:py-8 space-y-10">
        {/* Top Breadcrumb & Quick Share */}
        <div className="flex items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-ink-muted min-w-0"
          >
            <Link href="/" className="inline-flex items-center gap-1 hover:text-gold-700 shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link href={getCategoryRoute(category.handle)} className="hover:text-gold-700 shrink-0">
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-ink-primary font-medium truncate">{product.title}</span>
          </nav>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product link"
            className="inline-flex items-center gap-1.5 rounded-full border border-chrome-200 bg-surface-card px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-gold-500 hover:text-ink-primary transition shrink-0"
          >
            {shareCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-commerce-savings" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile/Tablet Title Above Gallery */}
        <div className="lg:hidden space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-obsidian-900 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-500">
              {product.metadata.brand}
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              {product.metadata.model_number} · HSN {product.metadata.hsn_code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-ink-primary leading-tight">
            {product.title}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">{product.subtitle}</p>
        </div>

        {/* 2-Column Sticky Gallery + Right Organized Purchase & Spec Flow */}
        <section className="grid lg:grid-cols-12 gap-6 lg:gap-9 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-[128px] self-start space-y-3">
            <ProductGallery
              title={product.title}
              slides={gallerySlides}
              discountPercent={discountPct}
              stockCount={activeVariant.stock}
              lowStockThreshold={product.metadata.stock_details?.low_stock_threshold}
            />

            <div className="rounded-md border border-chrome-200 bg-surface-card px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-ink-secondary truncate">
                <MapPin className="w-3.5 h-3.5 text-gold-700 shrink-0" />
                <span className="truncate">
                  {product.metadata.stock_details?.warehouse_hub ?? 'Muzaffarpur Flagship Hub (842001)'}
                </span>
              </span>
              <span className="font-mono text-[10.5px] font-semibold text-gold-700 shrink-0">
                {product.metadata.stock_details?.warehouse_bin ?? 'MZP-MAIN-01'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 min-w-0">
            <ProductPurchaseBox
              product={product}
              activeVariant={activeVariant}
              selectedVariantIdx={selectedVariantIdx}
              onSelectVariant={handleVariantChange}
              quantity={quantity}
              onChangeQuantity={setQuantity}
              offers={ALL_OFFERS}
              gstBreakdown={gstBreakdown}
              intraStateGst={intraStateGst}
              onToggleGstMode={() => setIntraStateGst((intra) => !intra)}
              pincode={pincode}
              onChangePincode={setPincode}
              onCheckPincode={() => setDeliveryInfo(checkDeliveryServiceability(pincode))}
              deliveryInfo={deliveryInfo}
              onAddToCart={handleAddToCart}
            />

            <ProductSpecsAccordion
              product={product}
              specificationRows={specificationRows}
            />
          </div>
        </section>

        {productShowcase.length > 0 && (
          <div className="rounded-lg border border-chrome-200 bg-surface-muted/40 overflow-hidden">
            <ShowcaseSpotlightSection
              title={`Customer Proof for ${product.title}`}
              subtitle="Verified buyer unboxings and Muzaffarpur / Pan-India impressions."
              badgeLabel="Customer Video & Buyer Proof"
              badgeKind="feedback"
              items={productShowcase}
              primaryHref="/feedback"
              primaryLabel="View All Video Reviews"
            />
          </div>
        )}

        <PdpRecommendationsSection product={product} categoryName={category?.name} />
      </div>
    </StorefrontChrome>
  )
}
