import type { ReactNode } from 'react'
import type {
  ShowcaseCategory,
  ShowcaseEntryDTO,
  ShowcaseEntryType,
  ShowcaseHubLocation,
  ShowcaseSummaryStats,
  StorefrontAnnouncement,
  StorefrontHeroBanner,
} from '@mobile-station/types'

export interface ShowcaseQueryOptions {
  entry_type?: ShowcaseEntryType
  product_handle?: string
  featured?: boolean
  limit?: number
}

export interface ShowcaseFeedResult {
  items: ShowcaseEntryDTO[]
  stats: ShowcaseSummaryStats
  source: 'backend' | 'seed'
}

export type FeedbackMediaFilterTab = 'all' | 'video' | 'written'
export type GalleryHubFilterTab = 'all' | 'motijheel-842001' | 'club-road-842002'

export type PublicReviewCategory = Extract<
  ShowcaseCategory,
  'written_review' | 'in_store_pickup' | 'open_box_check'
>

export interface FeedbackSubmissionFormState {
  author_name: string
  author_city: string
  title: string
  quote_or_caption: string
  rating: number
  hub_location: ShowcaseHubLocation
  category: PublicReviewCategory
  product_title: string
}

export interface FeedbackSubmissionAlert {
  ok: boolean
  message: string
}

export interface SpecificationRow {
  key: string
  label: string
  formattedValue: string
}

export interface HeaderScrollState {
  isTopNavVisible: boolean
  isBottomNavVisible: boolean
  showIcons: boolean
  showAnnouncement: boolean
  isAtTop: boolean
  selectedCategory: string
}

export interface HeaderScrollContextValue extends HeaderScrollState {
  setSelectedCategory: (category: string) => void
  resetHeaderScroll: () => void
  isMobileMenuOpen: boolean
  openMobileMenu: () => void
  closeMobileMenu: () => void
}

export interface StorefrontShellProps {
  children: ReactNode
  activeCategoryHandle?: string
  searchValue?: string
  onSearchChange?: (query: string) => void
  onCategorySelect?: (handle: string) => void
  showAnnouncementBar?: boolean
}

export interface AnnouncementBarProps {
  enabled?: boolean
  items?: StorefrontAnnouncement[]
  speedSeconds?: number
  pauseOnHover?: boolean
  className?: string
}

export interface StorefrontHeaderProps {
  activeCategoryHandle?: string
  searchValue?: string
  onSearchChange?: (query: string) => void
  onCategorySelect?: (handle: string) => void
  onSearchSubmit: (event: React.FormEvent) => void
  onOpenMobileMenu?: () => void
  className?: string
}

export interface StorefrontFooterProps {
  className?: string
}

export interface MobileMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeCategoryHandle?: string
  onCategorySelect?: (handle: string) => void
}

export interface MobileBottomNavProps {
  activeCategoryHandle?: string
  onOpenMobileMenu: () => void
  alwaysVisible?: boolean
  className?: string
}

export interface RotatingSearchPlaceholderProps {
  keywords: readonly string[]
  isDesktop?: boolean
  visible: boolean
  isPaused?: boolean
}

export interface HeroSpotlightSliderProps {
  heroBanners: StorefrontHeroBanner[]
  activeHeroIdx?: number
  onSelectHero?: (index: number) => void
  autoPlayIntervalMs?: number
  className?: string
}
