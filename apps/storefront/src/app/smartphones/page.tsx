import type { Metadata } from 'next'
import { buildCategoryMetadata, renderCategoryRoutePage } from '@/lib/category-page'

export function generateMetadata(): Metadata {
  return buildCategoryMetadata('smartphones')
}

export default function SmartphonesCategoryPage() {
  return renderCategoryRoutePage('smartphones')
}
