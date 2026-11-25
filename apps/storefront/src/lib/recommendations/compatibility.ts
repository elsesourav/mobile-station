import type { StorefrontProduct } from '@mobile-station/types'
import { getTotalAvailableStock } from '@/lib/recommendations/similarity'

export interface CompatibilityCandidateMatch {
  product: StorefrontProduct
  compatibilityScore: number
  explanation: string
}

interface HandlePairingRule {
  targetHandles: string[]
  score: number
  explanation: string
}

const SPECIFIC_HANDLE_PAIRINGS: Record<string, HandlePairingRule[]> = {
  'apple-iphone-16-5g': [
    {
      targetHandles: ['spigen-ultra-hybrid-magsafe-iphone-16', 'spigen-glas-tr-ez-fit-tempered-glass'],
      score: 1.0,
      explanation: 'Custom-fitted MagSafe protection for iPhone 16',
    },
    {
      targetHandles: ['apple-20w-usbc-power-adapter', 'anker-nano-ii-65w-gan-charger'],
      score: 0.94,
      explanation: 'Fast USB-C Power Delivery charging essential',
    },
    {
      targetHandles: ['apple-airpods-pro-2-usbc', 'apple-earpods-usb-c', 'apple-watch-series-10-gps'],
      score: 0.9,
      explanation: 'Seamless Apple iOS ecosystem companion',
    },
  ],
  'apple-iphone-16-pro-5g': [
    {
      targetHandles: ['spigen-glas-tr-ez-fit-tempered-glass', 'spigen-ultra-hybrid-magsafe-iphone-16'],
      score: 0.96,
      explanation: 'Precision protection & MagSafe mounting support',
    },
    {
      targetHandles: ['apple-airpods-pro-2-usbc', 'apple-watch-series-10-gps'],
      score: 0.95,
      explanation: 'Flagship Apple Pro ecosystem pairing',
    },
    {
      targetHandles: ['apple-20w-usbc-power-adapter', 'anker-nano-ii-65w-gan-charger', 'sandisk-extreme-portable-ssd-1tb'],
      score: 0.9,
      explanation: 'ProRes USB-C external storage & PD fast charging',
    },
  ],
  'samsung-galaxy-s24-ultra-5g': [
    {
      targetHandles: ['samsung-45w-pd-super-fast-charger', 'anker-333-100w-usbc-cable'],
      score: 0.98,
      explanation: 'Official 45W Super Fast Charging PPS support',
    },
    {
      targetHandles: ['samsung-galaxy-buds3-pro', 'samsung-galaxy-watch7-bluetooth'],
      score: 0.95,
      explanation: 'Galaxy AI & Seamless Codec ecosystem pairing',
    },
    {
      targetHandles: ['portronics-luxcell-bind-20k-powerbank', 'sandisk-ultra-dual-drive-luxe-128gb'],
      score: 0.85,
      explanation: 'On-the-go power backup & USB-C OTG storage',
    },
  ],
}

/**
 * Checks strict hardware brand compatibility constraints to prevent mismatched recommendations
 * (e.g., never recommending an iPhone 16 case to Samsung or Laptop buyers).
 */
export function isCompatibleAccessory(anchor: StorefrontProduct, candidate: StorefrontProduct): boolean {
  if (anchor.handle === candidate.handle) return false
  if (getTotalAvailableStock(candidate) <= 0) return false

  const anchorBrand = anchor.metadata.brand.toLowerCase()
  const candHandle = candidate.handle

  if (candHandle === 'spigen-ultra-hybrid-magsafe-iphone-16') {
    return anchorBrand === 'apple' && anchor.category_handle === 'smartphones'
  }
  if (candHandle === 'spigen-glas-tr-ez-fit-tempered-glass') {
    return anchorBrand === 'apple' && anchor.category_handle === 'smartphones'
  }
  if (candHandle === 'apple-20w-usbc-power-adapter' || candHandle === 'apple-earpods-usb-c') {
    return anchorBrand === 'apple'
  }
  if (candHandle === 'samsung-45w-pd-super-fast-charger' || candHandle === 'samsung-galaxy-watch7-bluetooth') {
    return anchorBrand === 'samsung' || anchor.category_handle !== 'smartphones'
  }
  if (candHandle === 'apple-watch-series-10-gps') {
    return anchorBrand === 'apple'
  }
  return true
}

function getCategoryCrossSellScore(
  anchor: StorefrontProduct,
  candidate: StorefrontProduct
): { score: number; explanation: string } | null {
  const anchorBrand = anchor.metadata.brand.toLowerCase()
  const candBrand = candidate.metadata.brand.toLowerCase()
  const candCat = candidate.category_handle
  const candSub = candidate.subcategory_handle
  const brandMatchBonus = anchorBrand === candBrand ? 0.12 : 0

  switch (anchor.category_handle) {
    case 'smartphones': {
      if (candSub === 'gan-fast-chargers' || candSub === 'charging-cables-hdmi') {
        return { score: 0.78 + brandMatchBonus, explanation: 'Fast PD charging essential (brick not always included)' }
      }
      if (candSub === 'tws-earbuds' || candSub === 'neckbands') {
        return { score: 0.76 + brandMatchBonus, explanation: `${candidate.metadata.brand} wireless audio companion` }
      }
      if (candSub === 'power-banks' || candSub === 'smartwatches-wearables') {
        return { score: 0.7 + brandMatchBonus, explanation: 'Daily carry & smart connectivity upgrade' }
      }
      if (candSub === 'phone-cases-covers' || candSub === 'screen-protectors') {
        return { score: 0.85, explanation: 'Shield display & frame from day-one drops' }
      }
      return null
    }

    case 'laptops': {
      if (candSub === 'usbc-hubs-docks') {
        return { score: 0.94, explanation: 'Expand HDMI, SD, Ethernet & USB-A ports' }
      }
      if (candSub === 'ssds-pen-drives-sd') {
        return { score: 0.89, explanation: 'High-speed NVMe backup & project transfer' }
      }
      if (candSub === 'wireless-gaming-mice' || candSub === 'mechanical-keyboards') {
        return { score: 0.84, explanation: 'Ergonomic precision upgrade for desk productivity' }
      }
      if (candCat === 'audio' && (candSub === 'over-ear-headphones' || candSub === 'tws-earbuds')) {
        return { score: 0.78 + brandMatchBonus, explanation: 'Studio ANC focus for calls and deep work' }
      }
      if (candSub === 'gan-fast-chargers' && candidate.handle.includes('65w')) {
        return { score: 0.86, explanation: 'Compact 65W GaN travel charger for laptops' }
      }
      if (candSub === 'monitors' && anchor.subcategory_handle !== 'monitors') {
        return { score: 0.76, explanation: 'Dual-display 180Hz workstation monitor' }
      }
      return null
    }

    case 'tablets': {
      if (candSub === 'mechanical-keyboards' || candSub === 'wireless-gaming-mice' || candSub === 'keyboard-mouse-combos') {
        return { score: 0.84, explanation: 'Turn your tablet into a portable workstation' }
      }
      if (candSub === 'usbc-hubs-docks' || candSub === 'gan-fast-chargers') {
        return { score: 0.82 + brandMatchBonus, explanation: 'USB-C display output & fast charging' }
      }
      if (candCat === 'audio') {
        return { score: 0.74 + brandMatchBonus, explanation: 'Crisp wireless audio for media & study' }
      }
      return null
    }

    case 'keyboards-mice': {
      if (anchor.subcategory_handle === 'mechanical-keyboards' && candSub === 'wireless-gaming-mice') {
        return { score: 0.92, explanation: 'Complete wireless precision keyboard + mouse desk rig' }
      }
      if (anchor.subcategory_handle === 'wireless-gaming-mice' && candSub === 'mechanical-keyboards') {
        return { score: 0.92, explanation: 'Pair your mouse with hot-swappable mechanical keys' }
      }
      if (candSub === 'usbc-hubs-docks' || candSub === 'monitors') {
        return { score: 0.79, explanation: 'Desktop productivity setup expansion' }
      }
      return null
    }

    case 'audio': {
      if (candSub === 'gan-fast-chargers' || candSub === 'power-banks' || candSub === 'charging-cables-hdmi') {
        return { score: 0.8 + brandMatchBonus, explanation: 'Keep your wireless audio topped up anywhere' }
      }
      return null
    }

    case 'power-charging': {
      if (anchor.subcategory_handle === 'gan-fast-chargers' && candSub === 'charging-cables-hdmi') {
        return { score: 0.94, explanation: '100W E-Marker rated cable unlocks full charger speed' }
      }
      if (anchor.subcategory_handle === 'power-banks' && candSub === 'charging-cables-hdmi') {
        return { score: 0.91, explanation: 'Braided fast-charge cable for your power bank' }
      }
      if (anchor.subcategory_handle === 'charging-cables-hdmi' && candSub === 'gan-fast-chargers') {
        return { score: 0.92, explanation: 'High-efficiency GaN wall brick companion' }
      }
      return null
    }

    default: {
      if (candSub === 'gan-fast-chargers' || candSub === 'charging-cables-hdmi' || candSub === 'ssds-pen-drives-sd') {
        return { score: 0.7, explanation: 'Popular everyday USB-C & storage essential' }
      }
      return null
    }
  }
}

/**
 * Returns compatibility-verified accessories ordered by pairing score, filtering out incompatible
 * ecosystem items and handles already present in cart.
 */
export function getCompatibleAccessoriesForProduct(
  anchor: StorefrontProduct,
  allProducts: StorefrontProduct[],
  excludedHandles: Set<string>,
  limit = 4
): CompatibilityCandidateMatch[] {
  const candidates = new Map<string, CompatibilityCandidateMatch>()
  const explicitRules = SPECIFIC_HANDLE_PAIRINGS[anchor.handle] ?? []

  for (const product of allProducts) {
    if (excludedHandles.has(product.handle)) continue
    if (!isCompatibleAccessory(anchor, product)) continue

    let matchedScore = 0
    let matchedReason = ''

    for (const rule of explicitRules) {
      if (rule.targetHandles.includes(product.handle) && rule.score > matchedScore) {
        matchedScore = rule.score
        matchedReason = rule.explanation
      }
    }

    const categoryMatch = getCategoryCrossSellScore(anchor, product)
    if (categoryMatch && categoryMatch.score > matchedScore) {
      matchedScore = categoryMatch.score
      matchedReason = categoryMatch.explanation
    }

    if (matchedScore > 0 && matchedReason) {
      candidates.set(product.handle, {
        product,
        compatibilityScore: matchedScore,
        explanation: matchedReason,
      })
    }
  }

  return Array.from(candidates.values())
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit)
}
