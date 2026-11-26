'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpLeft,
  BadgeCheck,
  ChevronRight,
  Eye,
  Search,
  ShoppingCart,
  Zap,
} from 'lucide-react'
import { formatINR, formatTitleWithoutBrand } from '@/lib/format'
import {
  getPrimaryVariant,
  getProductBestDiscountPercent,
  getTotalProductStock,
} from '@/lib/search'
import { SearchNoResultsView } from '@/components/search/SearchNoResultsView'
import type { SearchLiveSuggestionsViewProps } from '@/types/search'

function HighlightedText({ text, query }: { text: string; query: string }): React.ReactElement {
  if (!query.trim()) return <span>{text}</span>

  const cleanQ = query.trim().toLowerCase()
  const index = text.toLowerCase().indexOf(cleanQ)
  if (index < 0) return <span>{text}</span>

  const before = text.substring(0, index)
  const match = text.substring(index, index + cleanQ.length)
  const after = text.substring(index + cleanQ.length)

  return (
    <span>
      {before}
      <strong className="font-extrabold text-gold-700">{match}</strong>
      {after}
    </span>
  )
}

/**
 * Glorov View 2: Live as-you-type search suggestions combining Closest Result card with quick actions,
 * substring-highlighted autocomplete queries with insert arrows, and matching products preview list.
 */
export function SearchLiveSuggestionsView({
  query,
  rankedProducts,
  closestProduct,
  keywordSuggestions,
  onSelectSuggestion,
  onInsertIntoSearch,
  onExecuteSubmittedSearch,
  onAddClosestToCart,
}: SearchLiveSuggestionsViewProps) {
  if (rankedProducts.length === 0) {
    return <SearchNoResultsView query={query} onSelectRecoveryChip={onSelectSuggestion} />
  }

  const closestVariant = closestProduct ? getPrimaryVariant(closestProduct) : null
  const closestOff = closestProduct ? getProductBestDiscountPercent(closestProduct) : 0
  const closestStock = closestProduct ? getTotalProductStock(closestProduct) : 0
  const secondaryMatches = rankedProducts
    .filter((p) => p.handle !== closestProduct?.handle)
    .slice(0, 4)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* A. Featured Closest Result / Best Match Card */}
      {closestProduct && closestVariant && (
        <section aria-labelledby="closest-result-title">
          <div className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-ink-primary tracking-tight mb-2">
            <BadgeCheck className="w-4 h-4 text-gold-700" />
            <h2 id="closest-result-title">Closest Result / Best Match</h2>
          </div>

          <div className="bg-surface-card rounded-xl border border-chrome-200 hover:border-obsidian-900 p-3.5 sm:p-4 transition-colors shadow-card">
            <div className="flex gap-3.5 sm:gap-4 items-center">
              <div className="relative w-[96px] h-[96px] sm:w-[108px] sm:h-[108px] rounded-lg overflow-hidden bg-surface-card shrink-0 border border-chrome-200">
                <Image
                  src={closestProduct.thumbnail}
                  alt={closestProduct.title}
                  fill
                  sizes="108px"
                  className="object-contain p-2"
                />
                {closestOff >= 10 && (
                  <span className="absolute top-0 left-0 bg-obsidian-900 text-gold-500 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-br-sm flex items-center gap-0.5 leading-none">
                    <Zap className="w-2.5 h-2.5 shrink-0" />
                    <span>Best Deal</span>
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-gold-700 uppercase tracking-wider">
                    {closestProduct.metadata.brand} · {closestProduct.category_handle.replace('-', ' ')}
                  </span>
                  {closestStock > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-commerce-obdText bg-commerce-obdBg px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-commerce-savings inline-block" />
                      In Stock
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-[15px] sm:text-base text-ink-primary line-clamp-2 leading-snug">
                  {formatTitleWithoutBrand(closestProduct.title, closestProduct.metadata.brand)}
                </h3>

                <p className="font-mono text-[11px] text-ink-muted mt-0.5 truncate">
                  {closestProduct.metadata.model_number}
                  {closestProduct.metadata.key_highlights?.[0]
                    ? ` · ${closestProduct.metadata.key_highlights.slice(0, 2).join(' · ')}`
                    : ''}
                </p>

                <div className="flex flex-wrap items-baseline gap-1.5 mt-1.5 tabular-nums">
                  <span className="font-display font-extrabold text-base sm:text-lg text-ink-primary leading-none">
                    {formatINR(closestVariant.price_paise)}
                  </span>
                  {closestVariant.mrp_paise > closestVariant.price_paise && (
                    <>
                      <span className="text-xs text-ink-muted line-through font-medium leading-none">
                        {formatINR(closestVariant.mrp_paise)}
                      </span>
                      {closestOff > 0 && (
                        <span className="text-[9.5px] font-extrabold text-commerce-errorText bg-commerce-errorBg px-1.5 py-0.5 rounded leading-none">
                          {closestOff}% OFF
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-chrome-200/70">
              <Link
                href={`/products/${closestProduct.handle}`}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 py-2 px-3 rounded-full border border-obsidian-900 text-xs font-bold text-ink-primary hover:bg-surface-muted transition-colors active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">View Details</span>
              </Link>

              <button
                type="button"
                onClick={() => onAddClosestToCart(closestProduct)}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-obsidian-900 text-ink-inverse text-xs font-bold hover:bg-obsidian-700 transition-colors active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* B. Autocomplete Keyword Suggestions */}
      {keywordSuggestions.length > 0 && (
        <section aria-labelledby="search-suggestions-title" className="pt-1">
          <h3
            id="search-suggestions-title"
            className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2"
          >
            Search Suggestions
          </h3>
          <div className="divide-y divide-chrome-200/70 border-t border-b border-chrome-200/70">
            {keywordSuggestions.map((keyword) => (
              <div
                key={keyword}
                onClick={() => onSelectSuggestion(keyword)}
                className="flex items-center justify-between py-2.5 px-1 hover:bg-surface-muted/70 rounded-md transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Search className="w-4 h-4 text-ink-muted shrink-0" />
                  <span className="text-sm text-ink-primary truncate">
                    <HighlightedText text={keyword} query={query} />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onInsertIntoSearch(keyword)
                  }}
                  title="Insert into search"
                  aria-label={`Insert ${keyword} into search box`}
                  className="p-1.5 text-ink-muted hover:text-ink-primary rounded-full hover:bg-surface-muted transition-colors shrink-0"
                >
                  <ArrowUpLeft className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* C. Matching Products Preview List */}
      {secondaryMatches.length > 0 && (
        <section aria-labelledby="matching-products-title" className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <h3
              id="matching-products-title"
              className="text-xs font-bold uppercase tracking-wider text-ink-muted"
            >
              Matching Products ({rankedProducts.length})
            </h3>
            <button
              type="button"
              onClick={() => onExecuteSubmittedSearch(query)}
              className="text-xs font-bold text-gold-700 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {secondaryMatches.map((product) => {
              const activeVariant = getPrimaryVariant(product)
              const off = getProductBestDiscountPercent(product)

              return (
                <Link
                  key={product.handle}
                  href={`/products/${product.handle}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-card border border-chrome-200 hover:border-obsidian-900 transition-colors group"
                >
                  <div className="relative w-14 h-14 rounded-md overflow-hidden bg-surface-card shrink-0 border border-chrome-200">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      sizes="56px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[10px] font-bold text-gold-700 uppercase tracking-wider block">
                      {product.metadata.brand} · {product.category_handle.replace('-', ' ')}
                    </span>
                    <h4 className="font-display font-bold text-[13.5px] text-ink-primary truncate group-hover:text-gold-700 transition-colors leading-snug">
                      {formatTitleWithoutBrand(product.title, product.metadata.brand)}
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-0.5 tabular-nums">
                      <span className="font-display font-extrabold text-sm text-ink-primary">
                        {formatINR(activeVariant.price_paise)}
                      </span>
                      {activeVariant.mrp_paise > activeVariant.price_paise && (
                        <span className="text-[11px] text-ink-muted line-through font-medium">
                          {formatINR(activeVariant.mrp_paise)}
                        </span>
                      )}
                      {off > 0 && (
                        <span className="text-[9px] font-extrabold text-commerce-errorText bg-commerce-errorBg px-1.5 py-0.5 rounded leading-none">
                          {off}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-obsidian-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* D. Quick button to view full submitted grid */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onExecuteSubmittedSearch(query)}
          className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-obsidian-900 hover:bg-obsidian-700 text-ink-inverse text-sm font-bold transition-colors shadow-card cursor-pointer"
        >
          <span>See all {rankedProducts.length} results</span>
          <ArrowRight className="w-4 h-4 text-gold-500" />
        </button>
      </div>
    </div>
  )
}
