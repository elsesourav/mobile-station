import type {
  ShowcaseEntryDTO,
  StorefrontCategory,
  StorefrontProduct,
} from '@mobile-station/types'

export interface ProductGallerySlide {
  id: string
  src: string
  alt: string
  label: string
  isPreTransformed?: boolean
}

const HUB_VERIFY_PHOTOS_BY_CATEGORY: Record<string, { src: string; label: string }> = {
  smartphones: {
    src: 'https://res.cloudinary.com/ekbuxdbd/image/upload/f_auto,q_auto:good,w_1200,c_limit/mobile-station/store-visits/motijheel-flagship-openbox-counter',
    label: 'Motijheel Open-Box Desk',
  },
  tablets: {
    src: 'https://res.cloudinary.com/ekbuxdbd/image/upload/f_auto,q_auto:good,w_1200,c_limit/mobile-station/store-visits/motijheel-flagship-openbox-counter',
    label: 'Motijheel Inspection Desk',
  },
  laptops: {
    src: 'https://res.cloudinary.com/ekbuxdbd/image/upload/f_auto,q_auto:good,w_1200,c_limit/mobile-station/store-visits/macbook-thinkpad-enterprise-desk',
    label: 'Club Road Workstation Desk',
  },
  'accessories-storage': {
    src: 'https://res.cloudinary.com/ekbuxdbd/image/upload/f_auto,q_auto:good,w_1200,c_limit/mobile-station/store-visits/macbook-thinkpad-enterprise-desk',
    label: 'Club Road Demo Counter',
  },
  audio: {
    src: 'https://res.cloudinary.com/ekbuxdbd/image/upload/f_auto,q_auto:good,w_1200,c_limit/mobile-station/store-visits/club-road-mechanical-audio-demo-bar',
    label: 'Audio Demo Lounge',
  },
  'keyboards-mice': {
    src: 'https://res.cloudinary.com/ekbuxdbd/image/upload/f_auto,q_auto:good,w_1200,c_limit/mobile-station/store-visits/club-road-mechanical-audio-demo-bar',
    label: 'Switch & Audio Test Bar',
  },
  'power-charging': {
    src: 'https://res.cloudinary.com/ekbuxdbd/image/upload/f_auto,q_auto:good,w_1200,c_limit/mobile-station/store-visits/club-road-mechanical-audio-demo-bar',
    label: 'Club Road Power & Demo Desk',
  },
}

function buildDetailCloseUpUrl(src: string): string | null {
  if (!src.includes('res.cloudinary.com/') || !src.includes('/image/upload/')) {
    return null
  }
  const [prefix, suffix] = src.split('/image/upload/')
  if (!suffix) return null
  return `${prefix}/image/upload/c_fill,g_north,w_1000,h_1000,z_1.45,f_auto,q_auto/${suffix}`
}

/**
 * Builds an ordered, deduplicated multi-image gallery sequence for any PDP:
 * 1. Studio Hero View (`product.thumbnail`)
 * 2. Extra unique `product.images` URLs if present
 * 3. Cloudinary macro/detail close-up focus
 * 4. Category lineup image (`category.image_url`)
 * 5. Authentic product showcase / Muzaffarpur Hub verification photo
 */
export function buildProductGallerySlides(
  product: StorefrontProduct,
  category?: StorefrontCategory,
  productShowcase: readonly ShowcaseEntryDTO[] = []
): ProductGallerySlide[] {
  const slides: ProductGallerySlide[] = []
  const seenSrcs = new Set<string>()

  const pushSlide = (slide: ProductGallerySlide) => {
    if (!slide.src || seenSrcs.has(slide.src)) return
    seenSrcs.add(slide.src)
    slides.push(slide)
  }

  pushSlide({
    id: `${product.handle}-primary`,
    src: product.thumbnail,
    alt: `${product.title} — Primary View`,
    label: 'Product View',
  })

  product.images.forEach((imgUrl, index) => {
    pushSlide({
      id: `${product.handle}-extra-${index}`,
      src: imgUrl,
      alt: `${product.title} — Angle ${index + 2}`,
      label: `Angle ${index + 2}`,
    })
  })

  const detailCloseUp = buildDetailCloseUpUrl(product.thumbnail)
  if (detailCloseUp) {
    pushSlide({
      id: `${product.handle}-closeup`,
      src: detailCloseUp,
      alt: `${product.title} — Hardware & Finish Close-Up`,
      label: 'Detail Zoom',
      isPreTransformed: true,
    })
  }

  if (category?.image_url) {
    pushSlide({
      id: `${product.handle}-category`,
      src: category.image_url,
      alt: `${category.name} — Series Showcase`,
      label: `${category.name.split('&')[0].trim()} Series`,
    })
  }

  const showcaseImageEntry = productShowcase.find(
    (entry) => Boolean(entry.thumbnail_url || (entry.media_kind === 'image' && entry.media_url))
  )
  const showcaseSrc =
    showcaseImageEntry?.thumbnail_url ??
    (showcaseImageEntry?.media_kind === 'image' ? showcaseImageEntry.media_url : null)

  if (showcaseSrc) {
    pushSlide({
      id: `${product.handle}-showcase`,
      src: showcaseSrc,
      alt: `${product.title} — Verified Customer / Hub Preview`,
      label: 'Hub Verification',
      isPreTransformed: true,
    })
  } else {
    const hubFallback = HUB_VERIFY_PHOTOS_BY_CATEGORY[product.category_handle]
    if (hubFallback) {
      pushSlide({
        id: `${product.handle}-hub`,
        src: hubFallback.src,
        alt: `${product.title} — ${hubFallback.label}`,
        label: hubFallback.label,
        isPreTransformed: true,
      })
    }
  }

  return slides.slice(0, 5)
}
