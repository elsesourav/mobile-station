'use client'

import React from 'react'
import { MinimalProductCard } from '@/components/catalog/MinimalProductCard'
import { SearchNoResultsView } from '@/components/search/SearchNoResultsView'
import type { SearchSortOption, SearchSubmittedResultsViewProps } from '@/types/search'

/**
 * Full submitted search results grid with results count, sort selector,
 * horizontally scrollable category filter pills, and clean MinimalProductCard grid.
 */
export function SearchSubmittedResultsView({
  query,
  rankedProducts,
  selectedCategory,
  selectedSort,
  categoryOptions,
  onSelectSort,
  onSelectCategory,
  onSelectRecoveryChip,
}: SearchSubmittedResultsViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Category Filter Chips stay accessible even if a category narrow yields 0 items */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-chrome-200">
        <div className="text-sm text-ink-primary">
          <span className="font-bold">{rankedProducts.length}</span> results for &ldquo;
          <span className="font-bold text-gold-700">{query}</span>&rdquo;
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <label htmlFor="search-sort-select" className="text-xs text-ink-muted">
            Sort by:
          </label>
          <select
            id="search-sort-select"
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value as SearchSortOption)}
            className="px-3 py-1.5 text-xs font-semibold rounded-sm border border-chrome-300 bg-surface-card text-ink-primary focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 ms-scrollbar-x">
        {categoryOptions.map((cat) => {
          const isSelected = selectedCategory === cat.handle
          return (
            <button
              key={cat.handle}
              type="button"
              onClick={() => onSelectCategory(cat.handle)}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-obsidian-900 text-gold-500 border-obsidian-900 font-bold'
                  : 'bg-surface-card text-ink-primary border-chrome-200 font-medium hover:border-gold-500'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {rankedProducts.length === 0 ? (
        <SearchNoResultsView query={query} onSelectRecoveryChip={onSelectRecoveryChip} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {rankedProducts.map((product) => (
            <MinimalProductCard key={product.handle} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
