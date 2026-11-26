import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
  ALL_CATEGORIES,
  getCategoryByHandle,
  getCategoryRoute,
} from '@/lib/catalog'

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

export default async function LegacyCategoryRedirectPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const category = getCategoryByHandle(handle)
  if (!category) notFound()
  permanentRedirect(getCategoryRoute(category.handle))
}
