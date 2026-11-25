import {
  ALL_BRANDS,
  ALL_CATEGORIES,
  ALL_HERO_BANNERS,
  ALL_PRODUCTS,
} from '@/lib/catalog'
import { fetchShowcaseFeed } from '@/lib/showcase'
import { CatalogBrowser } from '@/components/CatalogBrowser'

export const revalidate = 30

export default async function HomePage() {
  const { items: featuredShowcase, stats: showcaseStats } = await fetchShowcaseFeed({
    featured: true,
    limit: 3,
  })

  return (
    <CatalogBrowser
      products={ALL_PRODUCTS}
      categories={ALL_CATEGORIES}
      brands={ALL_BRANDS}
      heroBanners={ALL_HERO_BANNERS}
      featuredShowcase={featuredShowcase}
      showcaseStats={showcaseStats}
    />
  )
}
