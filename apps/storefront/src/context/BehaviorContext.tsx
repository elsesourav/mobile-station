'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  BehaviorContextValue,
  RecommendationSignalPayload,
  RecommendationSignalType,
  StorefrontProduct,
  UserBehaviorEvent,
} from '@mobile-station/types'
import { ALL_PRODUCTS } from '@/lib/catalog'
import {
  buildBehaviorProfile,
  loadBehaviorEvents,
  MAX_STORED_EVENTS,
  saveBehaviorEvents,
} from '@/lib/recommendations/behavior'

const BehaviorContext = createContext<BehaviorContextValue | null>(null)

function createEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function sendNonBlockingTelemetry(payload: RecommendationSignalPayload): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') return
  try {
    void fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Ignore transient network errors on background telemetry
    })
  } catch {
    // Ignore telemetry serialization errors
  }
}

/**
 * Tracks implicit user browsing signals (views, category browses, search queries, cart adds)
 * with local persistence and non-blocking backend Redis popularity sync.
 */
export function BehaviorProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<UserBehaviorEvent[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = loadBehaviorEvents()
    setEvents((currentQueued) => {
      if (currentQueued.length === 0) return stored
      const seenIds = new Set(currentQueued.map((ev) => ev.id))
      const combined = [...currentQueued, ...stored.filter((ev) => !seenIds.has(ev.id))]
      return combined.slice(0, MAX_STORED_EVENTS)
    })
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    saveBehaviorEvents(events)
  }, [events, isHydrated])

  const productsByHandle = useMemo(() => {
    const map = new Map<string, StorefrontProduct>()
    for (const product of ALL_PRODUCTS) {
      map.set(product.handle, product)
    }
    return map
  }, [])

  const recordEvent = useCallback(
    (
      signalType: RecommendationSignalType,
      details: Omit<UserBehaviorEvent, 'id' | 'signalType' | 'timestamp'>
    ) => {
      const now = Date.now()
      setEvents((prev) => {
        const latest = prev[0]
        const isRapidDuplicate =
          latest &&
          latest.signalType === signalType &&
          latest.productHandle === details.productHandle &&
          latest.categoryHandle === details.categoryHandle &&
          latest.searchTerm === details.searchTerm &&
          now - latest.timestamp < 4000

        if (isRapidDuplicate) return prev

        const nextEvent: UserBehaviorEvent = {
          id: createEventId(),
          signalType,
          timestamp: now,
          ...details,
        }
        return [nextEvent, ...prev].slice(0, MAX_STORED_EVENTS)
      })

      sendNonBlockingTelemetry({
        signal_type: signalType,
        product_handle: details.productHandle,
        category_handle: details.categoryHandle,
        brand: details.brand,
        search_term: details.searchTerm,
      })
    },
    []
  )

  const trackProductView = useCallback(
    (product: StorefrontProduct) => {
      recordEvent('view', {
        productHandle: product.handle,
        categoryHandle: product.category_handle,
        brand: product.metadata.brand,
      })
    },
    [recordEvent]
  )

  const trackCategoryBrowse = useCallback(
    (categoryHandle: string) => {
      if (!categoryHandle || categoryHandle === 'all') return
      recordEvent('category_browse', { categoryHandle })
    },
    [recordEvent]
  )

  const trackSearchQuery = useCallback(
    (searchTerm: string) => {
      const clean = searchTerm.trim()
      if (clean.length < 2) return
      recordEvent('search', { searchTerm: clean })
    },
    [recordEvent]
  )

  const trackCartAdd = useCallback(
    (params: { productHandle: string; brand?: string; categoryHandle?: string }) => {
      const product = productsByHandle.get(params.productHandle)
      recordEvent('cart_add', {
        productHandle: params.productHandle,
        brand: params.brand ?? product?.metadata.brand,
        categoryHandle: params.categoryHandle ?? product?.category_handle,
      })
    },
    [productsByHandle, recordEvent]
  )

  const trackPurchase = useCallback(
    (productHandles: string[]) => {
      for (const handle of productHandles) {
        const product = productsByHandle.get(handle)
        recordEvent('purchase', {
          productHandle: handle,
          brand: product?.metadata.brand,
          categoryHandle: product?.category_handle,
        })
      }
    },
    [productsByHandle, recordEvent]
  )

  const profile = useMemo(
    () => buildBehaviorProfile(events, productsByHandle),
    [events, productsByHandle]
  )

  return (
    <BehaviorContext.Provider
      value={{
        profile,
        hasPersonalizedSignals: events.length > 0,
        trackProductView,
        trackCategoryBrowse,
        trackSearchQuery,
        trackCartAdd,
        trackPurchase,
      }}
    >
      {children}
    </BehaviorContext.Provider>
  )
}

export function useOptionalBehavior(): BehaviorContextValue | null {
  return useContext(BehaviorContext)
}

export function useBehavior(): BehaviorContextValue {
  const ctx = useContext(BehaviorContext)
  if (!ctx) throw new Error('useBehavior must be used within BehaviorProvider')
  return ctx
}
