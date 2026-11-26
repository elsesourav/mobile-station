import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ElectronicsRootCategory, StorefrontCategory, StorefrontProduct } from '@mobile-station/types'
import {
  ALL_BRANDS,
  fetchLiveCatalogProducts,
  getCategoryByHandle,
  sortProductsByRecency,
} from '@/lib/catalog'
import { getCategoryExperienceProfile } from '@/lib/category-experience'
import { CategoryPageClient } from '@/components/CategoryPageClient'

export function buildCategoryMetadata(handle: ElectronicsRootCategory): Metadata {
  const category = getCategoryByHandle(handle)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: category.name,
    description: category.description,
  }
}

export async function renderCategoryRoutePage(handle: ElectronicsRootCategory) {
  const category = getCategoryByHandle(handle)
  if (!category) notFound()

  const catalogProducts = await fetchLiveCatalogProducts()
  const products = sortProductsByRecency(
    catalogProducts.filter((product) => product.category_handle === category.handle)
  )
  const experience = getCategoryExperienceProfile(category.handle)

  const pairingCategories: StorefrontCategory[] = experience.pairingCategoryHandles
    .map((pairingHandle) => getCategoryByHandle(pairingHandle))
    .filter((entry): entry is StorefrontCategory => Boolean(entry))

  const pairingProducts: StorefrontProduct[] = []
  for (const pairingCat of pairingCategories) {
    const items = sortProductsByRecency(
      catalogProducts.filter((product) => product.category_handle === pairingCat.handle)
    ).slice(0, 2)
    for (const item of items) {
      if (pairingProducts.length < 5) {
        pairingProducts.push(item)
      }
    }
  }

  return (
    <CategoryPageClient
      category={category}
      products={products}
      brands={ALL_BRANDS}
      experience={experience}
      pairingCategories={pairingCategories}
      pairingProducts={pairingProducts}
    />
  )
}
