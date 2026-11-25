import {
  ALL_BRANDS,
  ALL_CATEGORIES,
  ALL_HERO_BANNERS,
  ALL_OFFERS,
  ALL_PRODUCTS,
  ALL_TRUST_BADGES,
} from '@/lib/catalog'
import { CatalogBrowser } from '@/components/CatalogBrowser'

export default function HomePage() {
  return (
    <CatalogBrowser
      products={ALL_PRODUCTS}
      categories={ALL_CATEGORIES}
      brands={ALL_BRANDS}
      heroBanners={ALL_HERO_BANNERS}
      trustBadges={ALL_TRUST_BADGES}
      offers={ALL_OFFERS}
    />
  )
}
