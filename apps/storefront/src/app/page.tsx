import categoriesData from '../../../../data/taxonomy/categories.json'
import brandsData from '../../../../data/taxonomy/brands.json'
import announcementsData from '../../../../data/storefront/announcements.json'
import heroBannersData from '../../../../data/storefront/hero-banners.json'
import trustBadgesData from '../../../../data/storefront/trust-badges.json'
import offersData from '../../../../data/storefront/offers.json'
import catalogSeed from '../../../../data/catalog/products-seed.json'
import {
  CatalogBrowser,
  type StorefrontBrand,
  type StorefrontCategory,
  type StorefrontHeroBanner,
  type StorefrontProduct,
} from '@/components/CatalogBrowser'

export default function HomePage() {
  return (
    <CatalogBrowser
      products={catalogSeed.products as StorefrontProduct[]}
      categories={categoriesData.root_categories as StorefrontCategory[]}
      brands={brandsData.brands as StorefrontBrand[]}
      heroBanners={heroBannersData as StorefrontHeroBanner[]}
      announcements={announcementsData}
      trustBadges={trustBadgesData}
      offers={offersData}
    />
  )
}
