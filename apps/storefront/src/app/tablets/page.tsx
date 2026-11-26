import type { Metadata } from 'next'
import { buildCategoryMetadata, renderCategoryRoutePage } from '@/lib/category-page'

export function generateMetadata(): Metadata {
  return buildCategoryMetadata('tablets')
}

export default function TabletsCategoryPage() {
  return renderCategoryRoutePage('tablets')
}
