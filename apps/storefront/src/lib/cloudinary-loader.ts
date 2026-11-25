'use client'

import type { ImageLoaderProps } from 'next/image'

const TRIM_HANDLES = [
  'samsung-galaxy-a35-5g',
  'apple-iphone-16-pro-5g',
  'samsung-galaxy-s24-ultra-5g',
  'apple-ipad-air-m2-11',
  'apple-ipad-10th-gen',
  'apple-macbook-air-13-m3',
  'samsung-galaxy-watch7-bluetooth',
  'categories/tablets',
  'categories/laptops',
]

/**
 * Custom Next.js Image loader serving Cloudinary URLs directly from edge CDN
 * without routing high-res cutouts through Next's /_next/image Node proxy.
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.includes('res.cloudinary.com/') && src.includes('/image/upload/')) {
    const [prefix, suffix] = src.split('/image/upload/')
    const shouldTrim = TRIM_HANDLES.some((slug) => suffix.includes(slug))
    const q = quality ? `q_${quality}` : 'q_auto'
    const transforms = shouldTrim
      ? `e_trim:10/f_auto,${q},w_${width},c_limit`
      : `f_auto,${q},w_${width},c_limit`
    return `${prefix}/image/upload/${transforms}/${suffix}`
  }
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}w=${width}`
}
