'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Share2 } from 'lucide-react'
import type {
  DeliveryServiceabilityResult,
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
import { discountPercent, formatTitleWithoutBrand } from '@/lib/format'
import { buildProductGallerySlides } from '@/lib/product-gallery'
import { buildVariantSpecificationRows } from '@/lib/product-specs'
import {
  buildActiveVariantProductTitle,
  getVariantPreviewImage,
  getVariantVisualKey,
} from '@/lib/product-variants'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductPurchaseBox } from '@/components/product/ProductPurchaseBox'
import { ProductSpecsAccordion } from '@/components/product/ProductSpecsAccordion'
import { MobileStickyPurchaseBar } from '@/components/product/MobileStickyPurchaseBar'
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

const PDP_STICKY_CART_SCROLL_Y = 180

export function ProductDetailClient({
  product,
  category,
  productShowcase = [],
}: ProductDetailClientProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryServiceabilityResult | null>(null)
  const [intraStateGst, setIntraStateGst] = useState(true)
  const [shareCopied, setShareCopied] = useState(false)
  const [showStickyPurchaseBar, setShowStickyPurchaseBar] = useState(false)

  const { addItem, updateQuantity, openCart } = useCart()
  const behavior = useOptionalBehavior()
  const trackProductView = behavior?.trackProductView

  useEffect(() => {
    trackProductView?.(product)
  }, [product, trackProductView])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let rafId: number | null = null

    const updateStickyBar = () => {
      const scrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0)
      const nextVisible = scrollY > PDP_STICKY_CART_SCROLL_Y
      setShowStickyPurchaseBar((prev) => (prev === nextVisible ? prev : nextVisible))
    }

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        updateStickyBar()
      })
    }

    updateStickyBar()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  const activeVariant = product.variants[selectedVariantIdx] ?? product.variants[0]
  const activeTitle = buildActiveVariantProductTitle(product, activeVariant)
  const discountPct = discountPercent(activeVariant.mrp_paise, activeVariant.price_paise)
  const gstBreakdown = computeGstSplit(
    activeVariant.price_paise,
    product.metadata.gst_rate_percent,
    intraStateGst
  )
  const specificationRows = buildVariantSpecificationRows(product.metadata.specs, activeVariant)

  const visualKey = getVariantVisualKey(product, activeVariant)
  const gallerySlides = useMemo(
    () => buildProductGallerySlides(product, activeVariant),
    [product, activeVariant]
  )

  const handleVariantChange = (nextIdx: number) => {
    setSelectedVariantIdx(nextIdx)
    const nextVariant = product.variants[nextIdx]
    if (nextVariant && quantity > nextVariant.stock) {
      setQuantity(Math.max(1, nextVariant.stock))
    }
  }

  const handlePincodeChange = (nextValue: string) => {
    setPincode(nextValue)
    if (!nextValue.trim()) {
      setDeliveryInfo(null)
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
      thumbnail: getVariantPreviewImage(product, activeVariant),
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
        await navigator.share({ title: activeTitle, url: shareUrl })
        return
      } catch {
        // Fallback to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // Ignore clipboard permission failures
    }
  }

  const stickySublabel =
    product.variants.length > 1
      ? `${activeVariant.title} · ${product.title}`
      : product.title

  return (
    <StorefrontChrome
      activeCategoryHandle={product.category_handle}
      suppressBottomNav={showStickyPurchaseBar}
    >
      <div className="page-container py-5 sm:py-8 space-y-10">
        {/* Clean Breadcrumb & Share Action */}
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
            <span className="text-ink-primary font-medium truncate">{activeTitle}</span>
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
          <span className="inline-block rounded-full bg-obsidian-900 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-500">
            {product.metadata.brand}
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-ink-primary leading-tight">
            {formatTitleWithoutBrand(activeTitle, product.metadata.brand)}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">{product.subtitle}</p>
        </div>

        {/* 2-Column Sticky Gallery + Clean Right Purchase & Specs Console */}
        <section className="grid lg:grid-cols-12 gap-6 lg:gap-9 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-[128px] self-start">
            <ProductGallery
              title={activeTitle}
              slides={gallerySlides}
              visualKey={visualKey}
              discountPercent={discountPct}
              stockCount={activeVariant.stock}
            />
          </div>

          <div className="lg:col-span-7 space-y-6 min-w-0">
            <ProductPurchaseBox
              product={product}
              activeTitle={activeTitle}
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
              onChangePincode={handlePincodeChange}
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
              subtitle="Verified buyer reviews and unboxing moments."
              badgeLabel="Verified Customer Proof"
              badgeKind="feedback"
              items={productShowcase}
              primaryHref="/feedback"
              primaryLabel="View All Reviews"
            />
          </div>
        )}

        <PdpRecommendationsSection product={product} categoryName={category?.name} />
      </div>

      <MobileStickyPurchaseBar
        visible={showStickyPurchaseBar}
        sublabel={stickySublabel}
        pricePaise={activeVariant.price_paise * quantity}
        mrpPaise={activeVariant.mrp_paise * quantity}
        discountPercent={discountPct}
        isAvailable={activeVariant.stock > 0}
        onAddToCart={handleAddToCart}
      />
    </StorefrontChrome>
  )
}
