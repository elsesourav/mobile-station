import type { Metadata } from 'next'
import { buildCategoryMetadata, renderCategoryRoutePage } from '@/lib/category-page'

export function generateMetadata(): Metadata {
  return buildCategoryMetadata('keyboards-mice')
}

export default function KeyboardsMiceCategoryPage() {
  return renderCategoryRoutePage('keyboards-mice')
}
