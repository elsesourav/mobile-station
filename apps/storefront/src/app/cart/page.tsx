import type { Metadata } from 'next'
import { CartPageClient } from '@/components/cart/CartPageClient'

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description:
    'Review your Mobile Station cart, apply promo codes, check PIN delivery & Muzaffarpur pickup options, and proceed cleanly to checkout.',
}

export default function CartPage() {
  return <CartPageClient />
}
