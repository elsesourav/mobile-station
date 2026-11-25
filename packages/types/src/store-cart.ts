export interface CartItem {
  sku: string
  productHandle: string
  title: string
  variantTitle: string
  brand: string
  price_paise: number
  mrp_paise: number
  thumbnail: string
  quantity: number
  requires_open_box_delivery: boolean
}

export type NewCartItemInput = Omit<CartItem, 'quantity'>

export interface CartSummaryMetrics {
  totalCount: number
  subtotalPaise: number
  totalSavingsPaise: number
}

export interface CartContextValue extends CartSummaryMetrics {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (incomingItem: NewCartItemInput) => void
  updateQuantity: (sku: string, delta: number) => void
  removeItem: (sku: string) => void
}
