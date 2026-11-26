'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  CartContextValue,
  CartItem,
  CouponActionResult,
  NewCartItemInput,
} from '@mobile-station/types'
import { ALL_OFFERS } from '@/lib/catalog'
import {
  computeCartPricingSummary,
  validateCouponForSubtotal,
} from '@/lib/cart-pricing'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useOptionalBehavior } from '@/context/BehaviorContext'

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'mobile_station_cart_v1'
const COUPON_STORAGE_KEY = 'mobile_station_coupon_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const behavior = useOptionalBehavior()

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) setItems(parsed as CartItem[])
      }
      const savedCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY)
      if (savedCoupon && savedCoupon.trim()) {
        setAppliedCoupon(savedCoupon.trim().toUpperCase())
      }
    } catch {
      // Ignore storage failures cleanly
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage failures cleanly
    }
  }, [items, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    try {
      if (appliedCoupon) {
        window.localStorage.setItem(COUPON_STORAGE_KEY, appliedCoupon)
      } else {
        window.localStorage.removeItem(COUPON_STORAGE_KEY)
      }
    } catch {
      // Ignore storage failures cleanly
    }
  }, [appliedCoupon, isHydrated])

  const addItem = useCallback(
    (incomingItem: NewCartItemInput) => {
      behavior?.trackCartAdd({
        productHandle: incomingItem.productHandle,
        brand: incomingItem.brand,
      })
      setItems((prevItems) => {
        const existing = prevItems.find((item) => item.sku === incomingItem.sku)
        if (existing) {
          return prevItems.map((item) =>
            item.sku === incomingItem.sku ? { ...item, quantity: item.quantity + 1 } : item
          )
        }
        return [...prevItems, { ...incomingItem, quantity: 1 }]
      })
    },
    [behavior]
  )

  const updateQuantity = useCallback((sku: string, delta: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => (item.sku === sku ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((sku: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.sku !== sku))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setAppliedCoupon(null)
  }, [])

  const pricing = useMemo(
    () => computeCartPricingSummary(items, appliedCoupon, ALL_OFFERS),
    [items, appliedCoupon]
  )

  const applyCoupon = useCallback(
    (rawCode: string): CouponActionResult => {
      const result = validateCouponForSubtotal(pricing.subtotalPaise, rawCode, ALL_OFFERS)
      if (result.ok) {
        setAppliedCoupon(rawCode.trim().toUpperCase())
      }
      return result
    },
    [pricing.subtotalPaise]
  )

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null)
  }, [])

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        totalCount: pricing.totalCount,
        subtotalPaise: pricing.subtotalPaise,
        totalSavingsPaise: pricing.totalSavingsPaise,
        appliedCoupon: pricing.activeCouponCode,
        discountPaise: pricing.couponDiscountPaise,
        shippingPaise: pricing.shippingPaise,
        totalPaise: pricing.totalPaise,
        mrpTotalPaise: pricing.mrpTotalPaise,
        mrpSavingsPaise: pricing.mrpSavingsPaise,
        overallDiscountPercent: pricing.overallDiscountPercent,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
      <CartDrawer
        isOpen={isOpen}
        items={items}
        totalCount={pricing.totalCount}
        subtotalPaise={pricing.subtotalPaise}
        totalSavingsPaise={pricing.totalSavingsPaise}
        shippingPaise={pricing.shippingPaise}
        onClose={() => setIsOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onAddItem={addItem}
      />
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
