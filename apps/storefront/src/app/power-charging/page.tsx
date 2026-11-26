import type { Metadata } from 'next'
import { buildCategoryMetadata, renderCategoryRoutePage } from '@/lib/category-page'

export function generateMetadata(): Metadata {
  return buildCategoryMetadata('power-charging')
}

export default function PowerChargingCategoryPage() {
  return renderCategoryRoutePage('power-charging')
}
