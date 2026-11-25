import type { StorefrontCategory, StorefrontProduct } from '@mobile-station/types'

export type SearchSortOption = 'relevance' | 'price_asc' | 'price_desc' | 'discount'

export interface ScoredSearchProduct {
  product: StorefrontProduct
  score: number
}

export interface SearchCategoryFilterOption {
  handle: string
  label: string
}

export interface SearchComputeResult {
  rankedProducts: StorefrontProduct[]
  closestProduct: StorefrontProduct | null
  keywordSuggestions: string[]
}

export interface SearchClientViewProps {
  initialProducts: StorefrontProduct[]
  categories: StorefrontCategory[]
}

export interface SearchZeroQueryViewProps {
  recentSearches: string[]
  selectedCategory: string
  categoryOptions: SearchCategoryFilterOption[]
  popularPicks: StorefrontProduct[]
  onSelectSuggestion: (term: string) => void
  onSelectCategory: (categoryHandle: string) => void
  onRemoveRecentSearch: (term: string) => void
  onClearAllRecentSearches: () => void
}

export interface SearchLiveSuggestionsViewProps {
  query: string
  rankedProducts: StorefrontProduct[]
  closestProduct: StorefrontProduct | null
  keywordSuggestions: string[]
  onSelectSuggestion: (term: string) => void
  onInsertIntoSearch: (term: string) => void
  onExecuteSubmittedSearch: (term: string) => void
  onAddClosestToCart: (product: StorefrontProduct) => void
}

export interface SearchSubmittedResultsViewProps {
  query: string
  rankedProducts: StorefrontProduct[]
  selectedCategory: string
  selectedSort: SearchSortOption
  categoryOptions: SearchCategoryFilterOption[]
  onSelectSort: (sort: SearchSortOption) => void
  onSelectCategory: (categoryHandle: string) => void
  onSelectRecoveryChip: (term: string) => void
}

export interface SearchNoResultsViewProps {
  query: string
  onSelectRecoveryChip: (term: string) => void
}
