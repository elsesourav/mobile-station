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
