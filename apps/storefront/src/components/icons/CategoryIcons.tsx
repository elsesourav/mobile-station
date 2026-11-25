import React from 'react'

export interface CategoryIconSvgProps {
  className?: string
  'aria-hidden'?: boolean
}

/**
 * Custom hardware grid icon for "All Tech" / "All Electronics".
 */
export function AllTechIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" fillOpacity="0.16" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect
        x="13.5"
        y="13.5"
        width="7.5"
        height="7.5"
        rx="3.75"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <circle cx="17.25" cy="17.25" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Custom flagship smartphone silhouette with dynamic island, side buttons, and gesture bar.
 */
export function SmartphonesIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect x="6.5" y="2.25" width="11" height="19.5" rx="2.6" fill="currentColor" fillOpacity="0.14" />
      <rect x="9.75" y="4.35" width="4.5" height="1.3" rx="0.65" fill="currentColor" stroke="none" />
      <line x1="10" y1="19.25" x2="14" y2="19.25" />
      <line x1="5" y1="7" x2="5" y2="9" />
      <line x1="5" y1="10.75" x2="5" y2="13" />
      <line x1="19" y1="8.25" x2="19" y2="11.25" />
    </svg>
  )
}

/**
 * Custom tablet & stylus icon distinguishing tablets cleanly from smartphones.
 */
export function TabletsIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect x="2.5" y="4" width="14.5" height="16" rx="2.2" fill="currentColor" fillOpacity="0.14" />
      <circle cx="9.75" cy="6.2" r="0.65" fill="currentColor" stroke="none" />
      <line x1="7.75" y1="17.75" x2="11.75" y2="17.75" />
      <path
        d="M19.75 5.25a1 1 0 0 1 2 0v11.1l-1 2.4-1-2.4V5.25Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <line x1="19.75" y1="8" x2="21.75" y2="8" />
    </svg>
  )
}

/**
 * Custom ultrabook/laptop silhouette with notch display and flared deck.
 */
export function LaptopsIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect x="4" y="4" width="16" height="11" rx="1.6" fill="currentColor" fillOpacity="0.14" />
      <rect x="10.25" y="4" width="3.5" height="1.15" rx="0.45" fill="currentColor" stroke="none" />
      <path
        d="M4 15 2.1 18.2c-.2.35.05.8.45.8h18.9c.4 0 .65-.45.45-.8L20 15"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <line x1="9.75" y1="17.1" x2="14.25" y2="17.1" />
    </svg>
  )
}

/**
 * Custom ANC headphones & acoustic equalizer icon for Audio & TWS.
 */
export function AudioIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <path d="M4.5 13v-1.75a7.5 7.5 0 0 1 15 0V13" />
      <rect x="2.75" y="12.5" width="4" height="7" rx="1.75" fill="currentColor" fillOpacity="0.18" />
      <rect x="17.25" y="12.5" width="4" height="7" rx="1.75" fill="currentColor" fillOpacity="0.18" />
      <line x1="10" y1="14.5" x2="10" y2="17.5" />
      <line x1="12" y1="13" x2="12" y2="19" />
      <line x1="14" y1="14.5" x2="14" y2="17.5" />
    </svg>
  )
}

/**
 * Custom mechanical keyboard + wireless mouse dual icon for Keyboards & Mice.
 */
export function KeyboardsMiceIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect x="2" y="6.25" width="13.5" height="11.5" rx="2" fill="currentColor" fillOpacity="0.14" />
      <line x1="4.75" y1="9.25" x2="6" y2="9.25" />
      <line x1="8.1" y1="9.25" x2="9.4" y2="9.25" />
      <line x1="11.5" y1="9.25" x2="12.75" y2="9.25" />
      <line x1="4.75" y1="12" x2="6" y2="12" />
      <line x1="8.1" y1="12" x2="9.4" y2="12" />
      <line x1="11.5" y1="12" x2="12.75" y2="12" />
      <line x1="5.25" y1="14.75" x2="12.25" y2="14.75" />
      <rect x="17.25" y="6.75" width="4.75" height="10.5" rx="2.375" fill="currentColor" fillOpacity="0.16" />
      <line x1="19.625" y1="8.85" x2="19.625" y2="10.85" />
    </svg>
  )
}

/**
 * Custom GaN fast charger & USB-C power delivery icon for Power & GaN.
 */
export function PowerGaNIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <line x1="9.25" y1="2.75" x2="9.25" y2="5.75" />
      <line x1="14.75" y1="2.75" x2="14.75" y2="5.75" />
      <rect x="5.5" y="5.75" width="13" height="13.25" rx="2.75" fill="currentColor" fillOpacity="0.14" />
      <path d="M12.6 8.8 9.6 12.6h2.45l-.65 3.4 3-3.8h-2.45l.65-3.4Z" fill="currentColor" stroke="none" />
      <line x1="10" y1="19" x2="14" y2="19" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
    </svg>
  )
}

/**
 * Custom MagSafe protective case & smartwatch icon for Cases & Watch / Accessories.
 */
export function CasesWatchIcon({
  className = 'w-5 h-5',
  'aria-hidden': ariaHidden = true,
}: CategoryIconSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={className}
    >
      <rect x="2.25" y="4.5" width="9.5" height="15" rx="2" fill="currentColor" fillOpacity="0.14" />
      <rect x="3.85" y="6.1" width="2.8" height="2.8" rx="0.7" />
      <circle cx="7" cy="12.75" r="2.05" />
      <line x1="7" y1="15.75" x2="7" y2="16.75" />
      <rect x="14" y="6.75" width="7.75" height="10.5" rx="2.2" fill="currentColor" fillOpacity="0.16" />
      <path d="M15.75 6.75V4.25a1 1 0 0 1 1-1h2.25a1 1 0 0 1 1 1v2.5" />
      <path d="M15.75 17.25v2.5a1 1 0 0 0 1 1h2.25a1 1 0 0 0 1-1v-2.5" />
      <line x1="22.5" y1="10.25" x2="22.5" y2="12.75" />
      <path d="M17.85 10.25V12l1.25.75" />
    </svg>
  )
}

const ICON_BY_HANDLE: Record<string, React.ComponentType<CategoryIconSvgProps>> = {
  all: AllTechIcon,
  smartphones: SmartphonesIcon,
  tablets: TabletsIcon,
  laptops: LaptopsIcon,
  audio: AudioIcon,
  'keyboards-mice': KeyboardsMiceIcon,
  'power-charging': PowerGaNIcon,
  'accessories-storage': CasesWatchIcon,
}

const ICON_BY_KEY: Record<string, React.ComponentType<CategoryIconSvgProps>> = {
  LayoutGrid: AllTechIcon,
  Smartphone: SmartphonesIcon,
  Tablet: TabletsIcon,
  Laptop: LaptopsIcon,
  Headphones: AudioIcon,
  Keyboard: KeyboardsMiceIcon,
  BatteryCharging: PowerGaNIcon,
  ShieldCheck: CasesWatchIcon,
}

/**
 * Resolves the appropriate custom SVG icon component based on category name, handle, or icon key.
 */
export function resolveCategoryIcon({
  name,
  handle,
  iconKey,
}: {
  name?: string
  handle?: string
  iconKey?: string
}): React.ComponentType<CategoryIconSvgProps> {
  const normalizedHandle = handle?.trim().toLowerCase() ?? ''
  if (normalizedHandle && ICON_BY_HANDLE[normalizedHandle]) {
    return ICON_BY_HANDLE[normalizedHandle]
  }

  const normalizedName = name?.trim().toLowerCase() ?? ''
  if (normalizedName) {
    if (normalizedName.includes('all')) return AllTechIcon
    if (normalizedName.includes('mobile') || normalizedName.includes('smartphone')) {
      return SmartphonesIcon
    }
    if (normalizedName.includes('tablet') || normalizedName.includes('e-reader')) {
      return TabletsIcon
    }
    if (normalizedName.includes('laptop') || normalizedName.includes('monitor')) {
      return LaptopsIcon
    }
    if (
      normalizedName.includes('audio') ||
      normalizedName.includes('tws') ||
      normalizedName.includes('earphone') ||
      normalizedName.includes('headphone')
    ) {
      return AudioIcon
    }
    if (
      normalizedName.includes('keyboard') ||
      normalizedName.includes('mice') ||
      normalizedName.includes('mouse')
    ) {
      return KeyboardsMiceIcon
    }
    if (
      normalizedName.includes('power') ||
      normalizedName.includes('gan') ||
      normalizedName.includes('charger') ||
      normalizedName.includes('cable')
    ) {
      return PowerGaNIcon
    }
    if (
      normalizedName.includes('case') ||
      normalizedName.includes('watch') ||
      normalizedName.includes('storage') ||
      normalizedName.includes('wearable')
    ) {
      return CasesWatchIcon
    }
  }

  if (iconKey && ICON_BY_KEY[iconKey]) {
    return ICON_BY_KEY[iconKey]
  }

  return SmartphonesIcon
}

export interface CategoryIconProps extends CategoryIconSvgProps {
  name?: string
  handle?: string
  iconKey?: string
}

/**
 * Renders a semantic custom SVG icon matched to the category's name/handle.
 */
export function CategoryIcon({
  name,
  handle,
  iconKey,
  className,
  'aria-hidden': ariaHidden = true,
}: CategoryIconProps) {
  const Icon = resolveCategoryIcon({ name, handle, iconKey })
  return <Icon className={className} aria-hidden={ariaHidden} />
}
