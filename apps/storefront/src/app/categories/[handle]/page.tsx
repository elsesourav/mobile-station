import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  ALL_BRANDS,
  ALL_CATEGORIES,
  getCategoryByHandle,
  getProductsByCategory,
} from '@/lib/catalog'
import { CategoryPageClient } from '@/components/CategoryPageClient'

export function generateStaticParams() {
  return ALL_CATEGORIES.map((c) => ({ handle: c.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const category = getCategoryByHandle(handle)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: category.name,
    description: category.description,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const category = getCategoryByHandle(handle)
  if (!category) notFound()

  const products = getProductsByCategory(category.handle)
  return <CategoryPageClient category={category} products={products} brands={ALL_BRANDS} />
}
