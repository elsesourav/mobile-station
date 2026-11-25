import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  ALL_PRODUCTS,
  getCategoryByHandle,
  getProductByHandle,
  getProductsByCategory,
} from '@/lib/catalog'
import { fetchShowcaseFeed } from '@/lib/showcase'
import { ProductDetailClient } from '@/components/ProductDetailClient'

export const revalidate = 30

export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = getProductByHandle(handle)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.title,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = getProductByHandle(handle)
  if (!product) notFound()

  const category = getCategoryByHandle(product.category_handle)
  const related = getProductsByCategory(product.category_handle)
    .filter((p) => p.handle !== product.handle)
    .slice(0, 4)
  const { items: productShowcase } = await fetchShowcaseFeed({
    product_handle: product.handle,
    limit: 3,
  })

  return (
    <ProductDetailClient
      product={product}
      category={category}
      relatedProducts={related}
      productShowcase={productShowcase}
    />
  )
}
