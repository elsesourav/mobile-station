'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartContextValue, CartItem, NewCartItemInput } from '@mobile-station/types'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useOptionalBehavior } from '@/context/BehaviorContext'

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'mobile_station_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const behavior = useOptionalBehavior()

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) setItems(parsed as CartItem[])
      }
    } catch {
      // Ignore storage failures cleanly
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage failures cleanly
    }
  }, [items])

  const addItem = (incomingItem: NewCartItemInput) => {
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
  }

  const updateQuantity = (sku: string, delta: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => (item.sku === sku ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (sku: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.sku !== sku))
  }

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )
  const subtotalPaise = useMemo(
    () => items.reduce((sum, item) => sum + item.price_paise * item.quantity, 0),
    [items]
  )
  const totalSavingsPaise = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Math.max(0, item.mrp_paise - item.price_paise) * item.quantity,
        0
      ),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotalPaise,
        totalSavingsPaise,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
      <CartDrawer
        isOpen={isOpen}
        items={items}
        totalCount={totalCount}
        subtotalPaise={subtotalPaise}
        totalSavingsPaise={totalSavingsPaise}
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
