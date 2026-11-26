import type { Metadata } from 'next'
import { buildCategoryMetadata, renderCategoryRoutePage } from '@/lib/category-page'

export function generateMetadata(): Metadata {
  return buildCategoryMetadata('laptops')
}

export default function LaptopsCategoryPage() {
  return renderCategoryRoutePage('laptops')
}
