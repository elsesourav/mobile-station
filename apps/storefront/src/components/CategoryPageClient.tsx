'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Box, CheckCircle2, ShieldCheck } from 'lucide-react'
import type {
  StorefrontBrand,
  StorefrontCategory,
  StorefrontProduct,
} from '@mobile-station/types'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ProductCard } from '@/components/ProductCard'

const TRACKING_DESC: Record<string, string> = {
  imei_serialized: 'IMEI Serialized · Insured Open-Box Check',
  serial_tracked: 'Serial Number Verified at Dispatch',
  sku_quantity: 'Ready Stock at Muzaffarpur Flagship & Club Road Hubs',
}

interface CategoryPageClientProps {
  category: StorefrontCategory
  products: StorefrontProduct[]
  brands: StorefrontBrand[]
}

export function CategoryPageClient({ category, products, brands }: CategoryPageClientProps) {
  const [selectedSub, setSelectedSub] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const subScopedProducts = useMemo(() => {
    if (selectedSub === 'all') return products
    return products.filter((p) => p.subcategory_handle === selectedSub)
  }, [products, selectedSub])

  const availableBrands = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>()
    for (const product of subScopedProducts) {
      const rawBrand = product.metadata.brand.trim()
      const key = rawBrand.toLowerCase()
      const existing = counts.get(key)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(key, { name: rawBrand, count: 1 })
      }
    }

    const ordered: { handle: string; name: string; count: number }[] = []
    for (const brand of brands) {
      const entry = counts.get(brand.name.toLowerCase())
      if (entry) {
        ordered.push({ handle: brand.handle, name: brand.name, count: entry.count })
        counts.delete(brand.name.toLowerCase())
      }
    }
    for (const [key, entry] of counts.entries()) {
      ordered.push({ handle: key, name: entry.name, count: entry.count })
    }
    return ordered
  }, [subScopedProducts, brands])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return subScopedProducts.filter((p) => {
      if (
        selectedBrand !== 'all' &&
        p.metadata.brand.toLowerCase() !== selectedBrand.toLowerCase()
      ) {
        return false
      }
      if (!q) return true
      return [p.title, p.subtitle, p.metadata.brand, p.metadata.model_number]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [subScopedProducts, selectedBrand, searchQuery])

  const tracking = category.inventory_policy?.tracking_mode ?? 'sku_quantity'

  return (
    <StorefrontChrome
      activeCategoryHandle={category.handle}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Category Header Banner */}
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-8 sm:py-10 grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-chrome-300 hover:text-gold-500 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Electronics</span>
            </Link>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
              {category.name}
            </h1>
            <p className="text-sm text-chrome-300 max-w-2xl">{category.description}</p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-md sm:rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-gold-500">
                HSN {category.default_hsn} · {category.gst_rate_percent}% GST Invoice
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md sm:rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1.5 sm:py-1 leading-snug text-chrome-200">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-commerce-savings" />
                <span>{TRACKING_DESC[tracking]}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md sm:rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 text-chrome-300">
                <Box className="h-3.5 w-3.5 shrink-0 text-gold-500" />
                <span>{category.inventory_policy?.return_window_days ?? 7}-Day Replacement Window</span>
              </span>
            </div>
          </div>

          {category.image_url && (
            <div className="md:col-span-4">
              <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-lg bg-surface-card ms-gold-ring">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 340px"
                  className="object-contain p-3"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="page-container py-8 space-y-6">
        <div className="space-y-3">
          {/* Subcategory Tabs */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedSub('all')
                setSelectedBrand('all')
              }}
              className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                selectedSub === 'all'
                  ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                  : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
              }`}
            >
              All {category.name} ({products.length})
            </button>
            {category.subcategories.map((sub) => {
              const count = products.filter((p) => p.subcategory_handle === sub.handle).length
              if (count === 0) return null
              const active = selectedSub === sub.handle
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSub(active ? 'all' : sub.handle)
                    setSelectedBrand('all')
                  }}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                      : 'border-chrome-200 bg-surface-card text-ink-secondary hover:border-gold-500'
                  }`}
                >
                  {sub.name} ({count})
                </button>
              )
            })}
          </div>

          {/* Brand Filter Pills (Based on Available Products in Category) */}
          {availableBrands.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  selectedBrand === 'all'
                    ? 'border-obsidian-900 bg-obsidian-900 text-ink-inverse'
                    : 'border-chrome-200 bg-surface-card text-ink-primary'
                }`}
              >
                All Brands
              </button>
              {availableBrands.map((brand) => {
                const active = selectedBrand.toLowerCase() === brand.name.toLowerCase()
                return (
                  <button
                    key={brand.handle}
                    type="button"
                    onClick={() => setSelectedBrand(active ? 'all' : brand.name)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      active
                        ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                        : 'border-chrome-200 bg-surface-card text-ink-primary hover:border-gold-500'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 text-commerce-savings" />
                    <span>{brand.name}</span>
                    <span className="font-mono text-[10px] opacity-75">({brand.count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-ink-muted">
          Showing {filtered.length} authentic units in {category.name}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </section>
    </StorefrontChrome>
  )
}
