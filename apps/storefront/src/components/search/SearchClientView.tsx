'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, X } from 'lucide-react'
import type { StorefrontProduct } from '@mobile-station/types'
import { useCart } from '@/components/CartContext'
import { useOptionalBehavior } from '@/context/BehaviorContext'
import { EMPTY_BEHAVIOR_PROFILE } from '@/lib/recommendations/behavior'
import { getHomeRecommendations } from '@/lib/recommendations/engine'
import {
  buildSearchCategoryOptions,
  computeSearchResults,
  getPrimaryVariant,
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_STORAGE_KEY,
} from '@/lib/search'
import { SearchZeroQueryView } from '@/components/search/SearchZeroQueryView'
import { SearchLiveSuggestionsView } from '@/components/search/SearchLiveSuggestionsView'
import { SearchSubmittedResultsView } from '@/components/search/SearchSubmittedResultsView'
import type { SearchClientViewProps, SearchSortOption } from '@/types/search'

/**
 * Full-screen Glorov-style dedicated `/search` view featuring:
 * - Sticky top navigation bar with Back button, auto-focused Search Pill, Clear & Submit actions
 * - Zero-Query discovery view (Recent searches, Trending, Browse categories, Popular picks)
 * - Live As-You-Type view (Closest Result card, highlighted autocomplete queries, preview matches)
 * - Submitted Results Grid view (Results count, Sort selector, Category chips, ProductCard grid)
 */
export function SearchClientView({ initialProducts, categories }: SearchClientViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items: cartItems, addItem, openCart } = useCart()
  const behavior = useOptionalBehavior()

  const initialQuery = searchParams?.get('q') ?? ''
  const initialCategory = searchParams?.get('category') ?? 'all'

  const [query, setQuery] = useState<string>(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [selectedSort, setSelectedSort] = useState<SearchSortOption>('relevance')
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(initialQuery.trim()))
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const categoryOptions = useMemo(() => buildSearchCategoryOptions(categories), [categories])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored) as unknown
      if (Array.isArray(parsed)) {
        setRecentSearches(
          parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        )
      }
    } catch {
      // Ignore storage read errors safely
    }
  }, [])

  useEffect(() => {
    const q = searchParams?.get('q') ?? ''
    const cat = searchParams?.get('category') ?? 'all'
    setQuery(q)
    setSelectedCategory(cat)
    setIsSubmitted(Boolean(q.trim()))
  }, [searchParams])

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim()
    if (!clean) return
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      try {
        window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage write errors safely
      }
      return updated
    })
  }, [])

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== term.toLowerCase())
      try {
        window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage write errors safely
      }
      return updated
    })
  }, [])

  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([])
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY)
    } catch {
      // Ignore storage remove errors safely
    }
  }, [])

  const { rankedProducts, closestProduct, keywordSuggestions } = useMemo(
    () =>
      computeSearchResults(initialProducts, query, selectedCategory, selectedSort, isSubmitted),
    [initialProducts, query, selectedCategory, selectedSort, isSubmitted]
  )

  const popularPicks = useMemo(
    () =>
      getHomeRecommendations(
        initialProducts,
        behavior?.profile ?? EMPTY_BEHAVIOR_PROFILE,
        cartItems,
        {},
        6
      ).map((entry) => entry.product),
    [initialProducts, behavior?.profile, cartItems]
  )

  const pushSearchUrl = useCallback(
    (term: string, categoryHandle: string) => {
      const params = new URLSearchParams()
      if (term.trim()) params.set('q', term.trim())
      if (categoryHandle !== 'all') params.set('category', categoryHandle)
      const qs = params.toString()
      router.replace(qs ? `/search?${qs}` : '/search')
    },
    [router]
  )

  const executeSubmittedSearch = useCallback(
    (term: string, categoryOverride?: string) => {
      const clean = term.trim()
      if (!clean) return
      const activeCat = categoryOverride ?? selectedCategory
      saveRecentSearch(clean)
      behavior?.trackSearchQuery(clean)
      setIsSubmitted(true)
      pushSearchUrl(clean, activeCat)
    },
    [saveRecentSearch, behavior, selectedCategory, pushSearchUrl]
  )

  const handleSelectSuggestion = useCallback(
    (term: string, categoryOverride?: string) => {
      setQuery(term)
      executeSubmittedSearch(term, categoryOverride)
    },
    [executeSubmittedSearch]
  )

  const handleCategoryFromZeroQuery = useCallback(
    (categoryHandle: string) => {
      setSelectedCategory(categoryHandle)
      if (categoryHandle !== 'all') {
        const option = categoryOptions.find((opt) => opt.handle === categoryHandle)
        const label = option?.label ?? categoryHandle
        setQuery(label)
        executeSubmittedSearch(label, categoryHandle)
      }
    },
    [categoryOptions, executeSubmittedSearch]
  )

  const handleCategoryInResults = useCallback(
    (categoryHandle: string) => {
      setSelectedCategory(categoryHandle)
      pushSearchUrl(query, categoryHandle)
    },
    [query, pushSearchUrl]
  )

  const handleInsertIntoSearch = useCallback((term: string) => {
    setQuery(term)
    setIsSubmitted(false)
    searchInputRef.current?.focus()
  }, [])

  const handleClear = useCallback(() => {
    setQuery('')
    setSelectedCategory('all')
    setIsSubmitted(false)
    router.replace('/search')
    searchInputRef.current?.focus()
  }, [router])

  const handleBack = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.history.length > 1 &&
      (!document.referrer || document.referrer.includes(window.location.host))
    ) {
      router.back()
      return
    }
    router.push('/')
  }, [router])

  useEffect(() => {
    if (!initialQuery) {
      searchInputRef.current?.focus()
    }
  }, [initialQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleBack])

  const handleAddClosestToCart = useCallback(
    (product: StorefrontProduct) => {
      const variant = getPrimaryVariant(product)
      addItem({
        sku: variant.sku,
        productHandle: product.handle,
        title: product.title,
        variantTitle: variant.title,
        brand: product.metadata.brand,
        price_paise: variant.price_paise,
        mrp_paise: variant.mrp_paise,
        thumbnail: product.thumbnail,
        requires_open_box_delivery: product.metadata.requires_open_box_delivery,
      })
      openCart()
    },
    [addItem, openCart]
  )

  return (
    <div className="w-full min-h-screen bg-surface-canvas text-ink-primary overflow-x-clip">
      {/* 1. Sticky Top Search Navigation Header */}
      <header className="sticky top-0 z-header bg-obsidian-900 text-ink-inverse border-b border-obsidian-800 shadow-card">
        <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-2.5 flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center justify-center w-10 h-10 text-chrome-200 hover:bg-obsidian-800 hover:text-gold-500 rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              executeSubmittedSearch(query)
            }}
            role="search"
            className="flex-1 min-w-0"
          >
            <div className="flex items-center h-11 bg-obsidian-800 rounded-full border border-obsidian-700 focus-within:border-gold-500 transition-colors px-3 sm:px-4">
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gold-500 shrink-0 mr-2" />
              <input
                id="ms_search_text_field"
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsSubmitted(false)
                }}
                placeholder="Search smartphones, laptops, Sony audio, GaN chargers..."
                aria-label="Search electronics catalog"
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-ink-inverse placeholder:text-chrome-400 focus:outline-none"
                autoFocus={!initialQuery}
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search query"
                  className="p-1.5 text-chrome-400 hover:text-ink-inverse rounded-full transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          <button
            type="button"
            onClick={() => executeSubmittedSearch(query)}
            aria-label="Submit search"
            className="flex items-center justify-center w-10 h-10 text-gold-500 hover:bg-obsidian-800 rounded-full transition-colors shrink-0"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Search Body Views */}
      <main
        className={`mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-20 ${
          isSubmitted ? 'max-w-content' : 'max-w-4xl'
        }`}
      >
        {!query.trim() && (
          <SearchZeroQueryView
            recentSearches={recentSearches}
            selectedCategory={selectedCategory}
            categoryOptions={categoryOptions}
            popularPicks={popularPicks}
            onSelectSuggestion={(term) => handleSelectSuggestion(term)}
            onSelectCategory={handleCategoryFromZeroQuery}
            onRemoveRecentSearch={removeRecentSearch}
            onClearAllRecentSearches={clearAllRecentSearches}
          />
        )}

        {query.trim() && !isSubmitted && (
          <SearchLiveSuggestionsView
            query={query}
            rankedProducts={rankedProducts}
            closestProduct={closestProduct}
            keywordSuggestions={keywordSuggestions}
            onSelectSuggestion={(term) => handleSelectSuggestion(term)}
            onInsertIntoSearch={handleInsertIntoSearch}
            onExecuteSubmittedSearch={(term) => executeSubmittedSearch(term)}
            onAddClosestToCart={handleAddClosestToCart}
          />
        )}

        {query.trim() && isSubmitted && (
          <SearchSubmittedResultsView
            query={query}
            rankedProducts={rankedProducts}
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
            categoryOptions={categoryOptions}
            onSelectSort={setSelectedSort}
            onSelectCategory={handleCategoryInResults}
            onSelectRecoveryChip={(term) => handleSelectSuggestion(term, 'all')}
          />
        )}
      </main>
    </div>
  )
}
