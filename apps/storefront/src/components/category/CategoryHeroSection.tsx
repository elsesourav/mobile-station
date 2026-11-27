'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { StorefrontCategory } from '@mobile-station/types'
import { CategoryIcon } from '@/components/icons/CategoryIcons'

interface CategoryHeroSectionProps {
  category: StorefrontCategory
  totalCount: number
}

/**
 * Compact obsidian category title header keeping the Top Trending product list
 * immediately visible in the top viewport without dense spec or policy cards.
 */
export function CategoryHeroSection({ category, totalCount }: CategoryHeroSectionProps) {
  return (
    <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
      <div className="page-container py-3 sm:py-4 space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-chrome-300">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-medium text-chrome-300 hover:text-gold-500 transition"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Home</span>
          </Link>
          <span className="text-chrome-400/50">/</span>
          <span className="font-semibold text-gold-500 truncate">{category.name}</span>
        </nav>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-sm bg-obsidian-800 border border-gold-500/35 text-gold-500 shrink-0">
              <CategoryIcon
                name={category.name}
                handle={category.handle}
                iconKey={category.icon}
                className="h-4 w-4"
              />
            </span>
            <h1 className="text-lg sm:text-2xl font-display font-bold text-ink-inverse truncate">
              {category.name}
            </h1>
          </div>

          <span className="rounded-full bg-obsidian-800 border border-obsidian-700 px-2.5 py-0.5 font-mono text-[11px] text-chrome-200 tabular-nums shrink-0">
            {totalCount} items
          </span>
        </div>
      </div>
    </section>
  )
}
