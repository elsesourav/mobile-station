import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { ALL_CATEGORIES, ALL_PRODUCTS } from '@/lib/catalog'
import { SearchClientView } from '@/components/search/SearchClientView'

export const metadata: Metadata = {
  title: 'Search Electronics Catalog',
  description:
    'Search smartphones, laptops, tablets, ANC headphones, mechanical keyboards, GaN chargers, and accessories with instant specs and 18% GST billing.',
  alternates: {
    canonical: '/search',
  },
}

function SearchLoadingFallback(): React.ReactElement {
  return (
    <div className="w-full min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-6 text-center space-y-2">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-gold-700">
        Mobile Station Search
      </p>
      <p className="text-sm text-ink-muted">
        Loading factory-sealed electronics catalog...
      </p>
    </div>
  )
}

/**
 * Dedicated `/search` App Router page mirroring Glorov's Search experience.
 */
export default function SearchPage(): React.ReactElement {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchClientView initialProducts={ALL_PRODUCTS} categories={ALL_CATEGORIES} />
    </Suspense>
  )
}
