import type { Metadata } from 'next'
import { buildCategoryMetadata, renderCategoryRoutePage } from '@/lib/category-page'

export function generateMetadata(): Metadata {
  return buildCategoryMetadata('audio')
}

export default function AudioCategoryPage() {
  return renderCategoryRoutePage('audio')
}
