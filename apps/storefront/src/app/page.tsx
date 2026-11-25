import {
  ALL_BRANDS,
  ALL_CATEGORIES,
  ALL_HERO_BANNERS,
  ALL_OFFERS,
  ALL_PRODUCTS,
  ALL_TRUST_BADGES,
} from '@/lib/catalog'
import { fetchShowcaseFeed } from '@/lib/showcase'
import { CatalogBrowser } from '@/components/CatalogBrowser'

export const revalidate = 30

export default async function HomePage() {
  const { items: featuredShowcase } = await fetchShowcaseFeed({ featured: true, limit: 3 })

  return (
    <CatalogBrowser
      products={ALL_PRODUCTS}
      categories={ALL_CATEGORIES}
      brands={ALL_BRANDS}
      heroBanners={ALL_HERO_BANNERS}
      trustBadges={ALL_TRUST_BADGES}
      offers={ALL_OFFERS}
      featuredShowcase={featuredShowcase}
    />
  )
}
