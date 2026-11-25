'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Box, CheckCircle2 } from 'lucide-react'
import type {
  ShowcaseEntryDTO,
  StorefrontCategory,
  StorefrontProduct,
} from '@mobile-station/types'
import { checkDeliveryServiceability, computeGstSplit } from '@/lib/catalog'
import { discountPercent } from '@/lib/format'
import { buildVariantSpecificationRows } from '@/lib/product-specs'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductPurchaseBox } from '@/components/product/ProductPurchaseBox'
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
  const [pincode, setPincode] = useState('842001')
  const [deliveryInfo, setDeliveryInfo] = useState(() => checkDeliveryServiceability('842001'))
  const [intraStateGst, setIntraStateGst] = useState(true)
  const { addItem, openCart } = useCart()
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
    openCart()
  }

  return (
    <StorefrontChrome activeCategoryHandle={product.category_handle}>
      <div className="page-container py-6 sm:py-8 space-y-10">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-ink-muted"
        >
          <Link href="/" className="inline-flex items-center gap-1 hover:text-gold-700">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/categories/${category.handle}`} className="hover:text-gold-700">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-ink-primary font-medium truncate">{product.title}</span>
        </nav>

        <section className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="overflow-hidden rounded-lg border border-chrome-200 bg-surface-card shadow-card">
              <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
                {discountPct > 0 ? (
                  <span className="rounded-full bg-commerce-deal px-3 py-1 text-xs font-bold text-ink-inverse">
                    {discountPct}% OFF
                  </span>
                ) : (
                  <span />
                )}
                <span className="rounded-full bg-commerce-obdBg px-3 py-1 font-mono text-[11px] font-semibold text-commerce-obdText">
                  {activeVariant.stock} In Stock
                </span>
              </div>
              <div className="relative aspect-square w-full">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain p-5 sm:p-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-sm border border-chrome-200 bg-surface-card p-3">
                <p className="font-mono text-[10px] text-ink-muted uppercase">Hub Location</p>
                <p className="font-semibold text-ink-primary mt-0.5 truncate">
                  {product.metadata.stock_details?.warehouse_hub ?? 'Muzaffarpur Hub'}
                </p>
              </div>
              <div className="rounded-sm border border-chrome-200 bg-surface-card p-3">
                <p className="font-mono text-[10px] text-ink-muted uppercase">Warehouse Bin</p>
                <p className="font-mono font-semibold text-gold-700 mt-0.5 truncate">
                  {product.metadata.stock_details?.warehouse_bin ?? 'MZP-MAIN-01'}
                </p>
              </div>
            </div>
          </div>

          <ProductPurchaseBox
            product={product}
            activeVariant={activeVariant}
            selectedVariantIdx={selectedVariantIdx}
            onSelectVariant={setSelectedVariantIdx}
            gstBreakdown={gstBreakdown}
            intraStateGst={intraStateGst}
            onToggleGstMode={() => setIntraStateGst((intra) => !intra)}
            pincode={pincode}
            onChangePincode={setPincode}
            onCheckPincode={() => setDeliveryInfo(checkDeliveryServiceability(pincode))}
            deliveryInfo={deliveryInfo}
            onAddToCart={handleAddToCart}
          />
        </section>

        <section className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-5 rounded-md border border-chrome-200 bg-surface-card p-5 space-y-3 shadow-card">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-gold-700" />
              <h2 className="font-display text-lg font-bold">What’s in the Retail Box</h2>
            </div>
            <ul className="space-y-2 text-xs text-ink-secondary">
              {product.metadata.in_the_box.map((boxItem) => (
                <li key={boxItem} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-commerce-savings shrink-0 mt-0.5" />
                  <span>{boxItem}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7 rounded-md border border-chrome-200 bg-surface-card p-5 space-y-3 shadow-card">
            <h2 className="font-display text-lg font-bold">Technical Specifications</h2>
            <div className="divide-y divide-chrome-200 border border-chrome-200 rounded-sm overflow-hidden">
              {specificationRows.map((specRow) => (
                <div
                  key={specRow.key}
                  className="ms-spec-row grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center"
                >
                  <span className="col-span-5 font-mono text-ink-muted break-words">
                    {specRow.label}
                  </span>
                  <span className="col-span-7 font-medium text-ink-primary break-words">
                    {specRow.formattedValue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {productShowcase.length > 0 && (
          <div className="rounded-lg border border-chrome-200 bg-surface-muted/40 overflow-hidden">
            <ShowcaseSpotlightSection
              title={`Verified Customer Feedback for ${product.title}`}
              subtitle="Recorded unboxings and Muzaffarpur / Pan-India buyer impressions."
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
