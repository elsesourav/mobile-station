import type { Metadata } from 'next'
import { buildCategoryMetadata, renderCategoryRoutePage } from '@/lib/category-page'

export function generateMetadata(): Metadata {
  return buildCategoryMetadata('accessories-storage')
}

export default function AccessoriesStorageCategoryPage() {
  return renderCategoryRoutePage('accessories-storage')
}
