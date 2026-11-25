'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight, Clock, Flame, LayoutGrid, Sparkles, TrendingUp, X } from 'lucide-react'
import { formatINR } from '@/lib/format'
import {
  getPrimaryVariant,
  getProductBestDiscountPercent,
  TRENDING_TECH_SEARCHES,
} from '@/lib/search'
import type { SearchZeroQueryViewProps } from '@/types/search'

/**
 * Glorov View 1: Zero-Query discovery view showing Recent Searches, Trending Tech Searches,
 * Browse by Category chips, and Popular Electronics Picks.
 */
export function SearchZeroQueryView({
  recentSearches,
  selectedCategory,
  categoryOptions,
  popularPicks,
  onSelectSuggestion,
  onSelectCategory,
  onRemoveRecentSearch,
  onClearAllRecentSearches,
}: SearchZeroQueryViewProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Recent Searches */}
      {recentSearches.length > 0 && (
        <section aria-labelledby="recent-searches-title">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm font-bold text-ink-primary">
              <Clock className="w-4 h-4 text-ink-muted" />
              <h2 id="recent-searches-title">Recent Searches</h2>
            </div>
            <button
              type="button"
              onClick={onClearAllRecentSearches}
              className="text-xs font-semibold text-gold-700 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <div
                key={term}
                onClick={() => onSelectSuggestion(term)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card border border-chrome-200 text-xs text-ink-primary hover:border-gold-500 transition-colors cursor-pointer group"
              >
                <Clock className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                <span className="max-w-[160px] truncate">{term}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveRecentSearch(term)
                  }}
                  aria-label={`Remove ${term}`}
                  className="p-0.5 text-ink-muted hover:text-ink-primary rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Trending Tech Searches */}
      <section aria-labelledby="trending-searches-title">
        <div className="flex items-center gap-1.5 text-sm font-bold text-ink-primary mb-3">
          <Flame className="w-4 h-4 text-commerce-deal" />
          <h2 id="trending-searches-title">Trending Electronics Searches</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_TECH_SEARCHES.map((trend) => (
            <button
              key={trend}
              type="button"
              onClick={() => onSelectSuggestion(trend)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card border border-chrome-200 text-xs font-medium text-ink-primary hover:border-obsidian-900 hover:bg-surface-muted active:scale-95 transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-gold-700 shrink-0" />
              <span>{trend}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Browse by Category */}
      <section aria-labelledby="browse-category-title">
        <div className="flex items-center gap-1.5 text-sm font-bold text-ink-primary mb-3">
          <LayoutGrid className="w-4 h-4 text-gold-700" />
          <h2 id="browse-category-title">Browse by Category</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryOptions.map((cat) => {
            const isSelected = selectedCategory === cat.handle
            return (
              <button
                key={cat.handle}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.handle)
                  if (cat.handle !== 'all') {
                    onSelectSuggestion(cat.label)
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-obsidian-900 border-obsidian-900 text-gold-500'
                    : 'bg-surface-card border-chrome-200 text-ink-primary hover:border-gold-500'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-gold-500 shrink-0" />}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 4. Popular Electronics Picks */}
      <section aria-labelledby="popular-picks-title">
        <div className="flex items-center gap-1.5 text-sm font-bold text-ink-primary mb-3">
          <Sparkles className="w-4 h-4 text-gold-700" />
          <h2 id="popular-picks-title">Popular Electronics Picks</h2>
        </div>
        <div className="space-y-2">
          {popularPicks.map((product) => {
            const activeVariant = getPrimaryVariant(product)
            const off = getProductBestDiscountPercent(product)

            return (
              <Link
                key={product.handle}
                href={`/products/${product.handle}`}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-card border border-chrome-200 hover:border-obsidian-900 transition-colors group shadow-card"
              >
                <div className="relative w-[58px] h-[58px] rounded-md overflow-hidden bg-surface-card shrink-0 border border-chrome-200">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    sizes="58px"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] font-bold text-gold-700 uppercase tracking-wider block">
                    {product.metadata.brand} · {product.category_handle.replace('-', ' ')}
                  </span>
                  <h3 className="font-display font-bold text-[13.5px] text-ink-primary truncate group-hover:text-gold-700 transition-colors leading-snug">
                    {product.title}
                  </h3>
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
                      <span className="text-[9.5px] font-extrabold text-commerce-errorText bg-commerce-errorBg px-1.5 py-0.5 rounded leading-none">
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
    </div>
  )
}
