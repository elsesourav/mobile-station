export function formatINR(paise: number): string {
  const rupees = Math.round(paise) / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees)
}

export function discountPercent(mrpPaise: number, pricePaise: number): number {
  if (mrpPaise <= 0 || pricePaise >= mrpPaise) return 0
  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100)
}

export function monthlyEmiPreview(pricePaise: number, months = 6): string {
  const wholeRupeePaise = Math.ceil(pricePaise / months / 100) * 100
  return formatINR(wholeRupeePaise)
}

/**
 * Strips a redundant leading brand prefix when the brand label is rendered right above the title
 * (e.g., "APPLE" + "Apple EarPods (USB-C)" -> "EarPods (USB-C)").
 */
export function formatTitleWithoutBrand(title: string, brand?: string): string {
  const cleanTitle = title.trim()
  const cleanBrand = brand?.trim()
  if (!cleanTitle || !cleanBrand) return cleanTitle

  const escaped = cleanBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const stripped = cleanTitle
    .replace(new RegExp(`^${escaped}(?:\\s+|[-–—:]+)\\s*`, 'i'), '')
    .trim()
  return stripped.length > 0 ? stripped : cleanTitle
}
