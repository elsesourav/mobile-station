import type { Metadata } from 'next'
import { ALL_OFFERS, ALL_PRODUCTS } from '@/lib/catalog'
import { OffersPageClient } from '@/components/OffersPageClient'

export const metadata: Metadata = {
  title: 'Active Promo Codes & Offers',
  description:
    'Save with TECH500, DESK10, FREESHIP, No-Cost EMI, and 18% GST Business Tax Credit on genuine electronics.',
}

export default function OffersPage() {
  const dealProducts = ALL_PRODUCTS.filter((p) =>
    ['audio', 'keyboards-mice', 'power-charging', 'accessories-storage'].includes(
      p.category_handle
    )
  ).slice(0, 8)

  return <OffersPageClient offers={ALL_OFFERS} dealProducts={dealProducts} />
}
