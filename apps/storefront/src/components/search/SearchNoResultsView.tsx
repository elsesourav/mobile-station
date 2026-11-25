'use client'

import React from 'react'
import { SearchX } from 'lucide-react'
import { RECOVERY_SEARCH_CHIPS } from '@/lib/search'
import type { SearchNoResultsViewProps } from '@/types/search'

/**
 * Empty / No Results state matching Glorov's circular illustration and recovery suggestion chips.
 */
export function SearchNoResultsView({ query, onSelectRecoveryChip }: SearchNoResultsViewProps) {
  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto animate-fadeIn">
      <div className="w-20 h-20 mx-auto rounded-full bg-obsidian-900 text-gold-500 flex items-center justify-center mb-4 shadow-card">
        <SearchX className="w-10 h-10" />
      </div>

      <h3 className="font-display text-base font-extrabold text-ink-primary mb-2">
        No Electronics Found for &ldquo;{query}&rdquo;
      </h3>

      <p className="text-xs text-ink-muted mb-6 leading-relaxed">
        Try searching by brand, model number, or choose one of our top electronics categories:
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {RECOVERY_SEARCH_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelectRecoveryChip(chip)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-card border border-chrome-200 text-ink-primary hover:border-obsidian-900 hover:bg-surface-muted transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
