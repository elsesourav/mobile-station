import type { CartItem, StorefrontCategory, StorefrontProduct } from '@mobile-station/types'
import { formatINR } from '@/lib/format'

export interface SupportTopicOption {
  id: string
  label: string
  template: string
}

export interface SupportProductTagOption {
  handle: string
  title: string
  brand: string
  modelNumber: string
  priceFormatted: string
  sourceLabel: 'Viewing Now' | 'In Cart' | 'Recently Viewed'
}

export interface ResolvedPageWhatsAppContext {
  pageType:
    | 'product'
    | 'category'
    | 'offers'
    | 'stores'
    | 'feedback'
    | 'gallery'
    | 'search'
    | 'account'
    | 'menu'
    | 'policy'
    | 'home'
  badgeLabel: string
  contextSummary: string
  activeProduct: SupportProductTagOption | null
  activeCategoryName: string | null
  topics: readonly SupportTopicOption[]
  selectableProducts: SupportProductTagOption[]
  quickTags: readonly string[]
}

const DEFAULT_SUPPORT_TOPICS: readonly SupportTopicOption[] = [
  {
    id: 'order',
    label: 'Order / Delivery',
    template: 'I need help with an order or delivery status.',
  },
  {
    id: 'product',
    label: 'Product & Stock',
    template: 'I want to check availability, specs, or price for a product.',
  },
  {
    id: 'warranty',
    label: 'Warranty / Open-Box',
    template: 'I have a question regarding warranty or Open-Box Delivery.',
  },
  {
    id: 'gst',
    label: '18% GST Invoice',
    template: 'I need assistance with a B2B GSTIN tax invoice.',
  },
  {
    id: 'pickup',
    label: 'Muzaffarpur Pickup',
    template: 'I want to inquire about pickup at Motijheel / Club Road hub.',
  },
]

const QUICK_CONTEXT_TAGS: readonly string[] = [
  'Stock Check',
  'Need 18% GST Invoice',
  'Open-Box Delivery',
  'Same-Day Pickup (842001)',
  'No-Cost EMI Query',
]

function toProductTagOption(
  product: StorefrontProduct,
  sourceLabel: SupportProductTagOption['sourceLabel']
): SupportProductTagOption {
  const pricePaise = product.variants[0]?.price_paise ?? 0
  return {
    handle: product.handle,
    title: product.title,
    brand: product.metadata.brand,
    modelNumber: product.metadata.model_number,
    priceFormatted: formatINR(pricePaise),
    sourceLabel,
  }
}

export function resolvePageWhatsAppContext(params: {
  pathname: string
  searchQuery?: string
  allProducts: readonly StorefrontProduct[]
  allCategories: readonly StorefrontCategory[]
  recentlyViewedHandles: readonly string[]
  cartItems: readonly CartItem[]
}): ResolvedPageWhatsAppContext {
  const cleanPath = params.pathname || '/'
  const productByHandle = new Map(params.allProducts.map((p) => [p.handle, p]))
  const categoryByHandle = new Map(params.allCategories.map((c) => [c.handle, c]))

  const selectableProducts: SupportProductTagOption[] = []
  const seenHandles = new Set<string>()

  let activeProduct: SupportProductTagOption | null = null
  let activeCategoryName: string | null = null
  let pageType: ResolvedPageWhatsAppContext['pageType'] = 'home'
  let badgeLabel = 'Storefront Support'
  let contextSummary = 'General Catalog & Muzaffarpur Flagship Help'
  let topics: readonly SupportTopicOption[] = DEFAULT_SUPPORT_TOPICS

  if (cleanPath.startsWith('/products/')) {
    const handle = cleanPath.replace('/products/', '').split('/')[0] ?? ''
    const matchedProduct = productByHandle.get(handle)
    if (matchedProduct) {
      pageType = 'product'
      activeProduct = toProductTagOption(matchedProduct, 'Viewing Now')
      activeCategoryName = categoryByHandle.get(matchedProduct.category_handle)?.name ?? null
      badgeLabel = 'Product Page Context'
      contextSummary = `${matchedProduct.title} · ${activeProduct.priceFormatted}`
      selectableProducts.push(activeProduct)
      seenHandles.add(matchedProduct.handle)

      topics = [
        {
          id: 'pdp_stock',
          label: 'Stock & Offer Price',
          template: `Please confirm hub availability, best price, and delivery time for ${matchedProduct.title}.`,
        },
        {
          id: 'pdp_obd',
          label: 'Open-Box & Seal Check',
          template: `Can you confirm sealed Indian warranty & Open-Box IMEI/Serial check for ${matchedProduct.title}?`,
        },
        {
          id: 'pdp_gst',
          label: '18% GST B2B Quote',
          template: `I want to buy ${matchedProduct.title} with a GSTIN B2B invoice. Can you help?`,
        },
        {
          id: 'pdp_compat',
          label: 'Specs & Accessories',
          template: `Can you recommend compatible chargers/accessories for ${matchedProduct.title}?`,
        },
      ]
    }
  } else if (cleanPath.startsWith('/offers')) {
    pageType = 'offers'
    badgeLabel = 'Offers & EMI Desk'
    contextSummary = 'Category Coupons (GEAR5 / TECH10) & No-Cost EMI'
    topics = [
      {
        id: 'offers_code',
        label: 'Promo Code Help',
        template: 'I want to check promo code eligibility (GEAR5 / TECH10) for my order.',
      },
      {
        id: 'offers_emi',
        label: 'No-Cost EMI Inquiry',
        template: 'Can you share Zero-Down / No-Cost EMI card & UPI options?',
      },
      ...DEFAULT_SUPPORT_TOPICS.slice(3),
    ]
  } else if (cleanPath.startsWith('/stores/muzaffarpur')) {
    pageType = 'stores'
    badgeLabel = 'Muzaffarpur Hubs'
    contextSummary = 'Motijheel (842001) & Club Road (842002)'
    topics = [
      {
        id: 'store_motijheel',
        label: 'Motijheel Flagship (842001)',
        template: 'I want to visit or schedule same-day pickup at Motijheel Flagship Hub (842001).',
      },
      {
        id: 'store_clubroad',
        label: 'Club Road Center (842002)',
        template: 'I want to check ready demo stock at Club Road Express Center (842002).',
      },
      ...DEFAULT_SUPPORT_TOPICS.slice(2, 4),
    ]
  } else if (cleanPath.startsWith('/feedback') || cleanPath.startsWith('/gallery')) {
    pageType = cleanPath.startsWith('/feedback') ? 'feedback' : 'gallery'
    badgeLabel = cleanPath.startsWith('/feedback') ? 'Customer Reviews Desk' : 'Store Visit Gallery'
    contextSummary =
      cleanPath.startsWith('/feedback')
        ? 'Verified Open-Box & Buyer Reviews'
        : 'Motijheel & Club Road Demo Desks'
  } else if (cleanPath.startsWith('/search')) {
    pageType = 'search'
    badgeLabel = 'Search Assistance'
    const q = params.searchQuery?.trim()
    contextSummary = q ? `Searching for "${q}"` : 'Catalog Search Helper'
    if (q) {
      topics = [
        {
          id: 'search_find',
          label: `Find "${q.slice(0, 22)}"`,
          template: `I was searching for "${q}" — can you confirm stock, price, or alternatives?`,
        },
        ...DEFAULT_SUPPORT_TOPICS.slice(1),
      ]
    }
  } else if (cleanPath.startsWith('/account')) {
    pageType = 'account'
    badgeLabel = 'Account & Order Help'
    contextSummary = 'Profile, Saved Addresses & Order Tracking'
  } else if (cleanPath.startsWith('/menu')) {
    pageType = 'menu'
    badgeLabel = 'Services & Hub Desk'
    contextSummary = 'Orders, GSTIN Billing & Local Hub Support'
  } else if (cleanPath.startsWith('/policies')) {
    pageType = 'policy'
    badgeLabel = 'Policy Clarification'
    contextSummary = cleanPath.replace('/policies/', '').replace(/-/g, ' ').toUpperCase()
  } else {
    const legacyCat = cleanPath.startsWith('/categories/')
      ? cleanPath.replace('/categories/', '').split('/')[0] ?? ''
      : ''
    const topSegment = cleanPath.replace(/^\/+/, '').split('/')[0] ?? ''
    const catHandle = legacyCat || topSegment
    const matchedCat = catHandle ? categoryByHandle.get(catHandle) : undefined
    if (matchedCat) {
      pageType = 'category'
      activeCategoryName = matchedCat.name
      badgeLabel = 'Category Browsing'
      contextSummary = matchedCat.name
      topics = [
        {
          id: 'cat_best',
          label: `Recommend in ${matchedCat.name.split('&')[0].trim()}`,
          template: `I am browsing ${matchedCat.name} and need a recommendation for my budget.`,
        },
        {
          id: 'cat_stock',
          label: 'Same-Day Hub Stock',
          template: `Which ${matchedCat.name} models are in stock right now at Muzaffarpur Hub?`,
        },
        ...DEFAULT_SUPPORT_TOPICS.slice(2),
      ]
    }
  }

  for (const cartItem of params.cartItems) {
    if (seenHandles.has(cartItem.productHandle)) continue
    const found = productByHandle.get(cartItem.productHandle)
    if (found) {
      selectableProducts.push(toProductTagOption(found, 'In Cart'))
      seenHandles.add(found.handle)
    }
  }

  for (const viewedHandle of params.recentlyViewedHandles) {
    if (seenHandles.has(viewedHandle)) continue
    const found = productByHandle.get(viewedHandle)
    if (found) {
      selectableProducts.push(toProductTagOption(found, 'Recently Viewed'))
      seenHandles.add(found.handle)
    }
  }

  return {
    pageType,
    badgeLabel,
    contextSummary,
    activeProduct,
    activeCategoryName,
    topics,
    selectableProducts: selectableProducts.slice(0, 5),
    quickTags: QUICK_CONTEXT_TAGS,
  }
}
