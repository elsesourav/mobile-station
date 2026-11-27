'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgePercent,
  Camera,
  ChevronRight,
  CreditCard,
  Film,
  Lock,
  MapPin,
  Package,
  PackageCheck,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  User,
} from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { ALL_CATEGORIES, ALL_PRODUCTS, getCategoryRoute } from '@/lib/catalog'
import { formatINR } from '@/lib/format'
import {
  getProfileInitials,
  readStoredAccountProfile,
  type CustomerAccountProfile,
} from '@/lib/account'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { CategoryIcon } from '@/components/icons/CategoryIcons'
import { useCart } from '@/components/CartContext'
import type { LucideIcon } from 'lucide-react'

interface MenuServiceLinkItem {
  id: string
  href: string
  label: string
  description: string
  icon: LucideIcon
  badge?: string
}

const ACCOUNT_SERVICE_LINKS: readonly MenuServiceLinkItem[] = [
  {
    id: 'orders',
    href: '/account#orders',
    label: 'Orders & Invoices',
    description: 'IMEI receipts, Shiprocket tracking & 18% GST PDFs',
    icon: Package,
  },
  {
    id: 'profile',
    href: '/account#settings',
    label: 'Profile & GSTIN',
    description: 'Saved delivery PIN, address & B2B GSTIN',
    icon: User,
  },
  {
    id: 'offers',
    href: '/offers',
    label: 'Offers & Bank EMI',
    description: 'Promo codes, exchange bonus & No-Cost EMI tiers',
    icon: BadgePercent,
    badge: 'Live',
  },
  {
    id: 'search',
    href: '/search',
    label: 'Search Catalog',
    description: 'Filter by RAM, SSD, GaN wattage & price',
    icon: Search,
  },
]

const ELECTRONICS_SERVICE_LINKS: readonly MenuServiceLinkItem[] = [
  {
    id: 'hubs',
    href: '/stores/muzaffarpur',
    label: 'Muzaffarpur Flagship Hubs',
    description: 'Same-day pickup at Motijheel (842001) & Club Road (842002)',
    icon: MapPin,
  },
  {
    id: 'obd',
    href: '/policies/open-box-delivery',
    label: 'Open-Box Delivery Protection',
    description: 'Inspect device seal & IMEI before OTP confirmation',
    icon: PackageCheck,
  },
  {
    id: 'warranty',
    href: '/policies/warranty',
    label: 'Official Brand Warranty',
    description: 'Authorized Indian retail warranty & service center help',
    icon: ShieldCheck,
  },
  {
    id: 'gst',
    href: '/policies/gst-invoicing',
    label: '18% GST Business Tax Credit',
    description: 'Claim ITC with GSTIN-enabled invoices on eligible SKUs',
    icon: Receipt,
  },
  {
    id: 'privacy',
    href: '/policies/privacy-policy',
    label: 'Privacy & Data Policy',
    description: 'DPDP 2023 compliance, GSTIN protection & invoice security',
    icon: Lock,
  },
  {
    id: 'terms',
    href: '/policies/terms-and-conditions',
    label: 'Terms & Return Rules',
    description: 'Sales terms, DOA windows & Razorpay refund timelines',
    icon: Scale,
  },
  {
    id: 'feedback',
    href: '/feedback',
    label: 'Customer Video Reviews',
    description: 'Verified buyer unboxings & real customer proof',
    icon: Film,
  },
  {
    id: 'gallery',
    href: '/gallery',
    label: 'Store Visit Gallery',
    description: 'Tour our Motijheel & Club Road demonstration desks',
    icon: Camera,
  },
]

/**
 * Full-page Menu, Account Shortcuts, Department Grid & Electronics Services hub (`/menu`),
 * replacing slide-over navigation drawers with a dedicated Amazon/Croma-inspired destination.
 */
export function MenuHubClient() {
  const { totalCount, subtotalPaise } = useCart()
  const [profile, setProfile] = useState<CustomerAccountProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProfile(readStoredAccountProfile())
    setHydrated(true)
  }, [])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of ALL_PRODUCTS) {
      counts[item.category_handle] = (counts[item.category_handle] ?? 0) + 1
    }
    return counts
  }, [])

  const initials = getProfileInitials(profile)
  const preferredHubLabel =
    profile?.preferredHub === 'club-road-842002'
      ? 'Club Road Center (842002)'
      : 'Motijheel Flagship (842001)'

  return (
    <StorefrontChrome>
      {/* Top Customer & Hub Summary Banner */}
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-5 sm:py-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gold-500 text-obsidian-950 font-display font-bold text-base flex items-center justify-center shrink-0">
                {hydrated && profile ? initials : <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-gold-500">
                  {MOBILE_STATION_BRAND.name} Hub &amp; Services
                </p>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-inverse truncate">
                  {hydrated && profile ? `Hello, ${profile.fullName}` : 'All Services, Orders & Tech Menu'}
                </h1>
                <p className="text-xs text-chrome-300 truncate mt-0.5">
                  {hydrated && profile
                    ? `${profile.email} · ${preferredHubLabel}`
                    : 'Access your orders, 18% GST profile, categories & local support desks.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/account"
                className="flex-1 sm:flex-initial inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm bg-gold-500 px-4 py-2 text-xs font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>{hydrated && profile ? 'Manage Profile' : 'Sign In / Profile'}</span>
              </Link>
              <Link
                href="/cart"
                className="flex-1 sm:flex-initial inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm border border-obsidian-700 bg-obsidian-800 px-4 py-2 text-xs font-semibold text-ink-inverse hover:border-gold-500 hover:text-gold-500 transition"
              >
                <ShoppingCart className="w-4 h-4 text-gold-500 shrink-0" />
                <span>
                  Cart ({totalCount})
                  {totalCount > 0 ? ` · ${formatINR(subtotalPaise)}` : ''}
                </span>
              </Link>
            </div>
          </div>

          {hydrated && profile && (profile.gstin || profile.pincode) && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-obsidian-700 px-3 py-1 text-chrome-200">
                <MapPin className="w-3.5 h-3.5 text-gold-500" />
                <span>Default PIN: {profile.pincode}</span>
              </span>
              {profile.gstin && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 text-gold-500">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>GSTIN Saved: {profile.gstin}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="page-container py-6 sm:py-9 space-y-8">
        {/* 1. Account, Orders & Offers Shortcuts */}
        <section aria-labelledby="menu-account-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="menu-account-heading"
              className="font-display text-base sm:text-lg font-bold text-ink-primary"
            >
              Account, Orders &amp; Quick Actions
            </h2>
            <Link
              href="/account"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
            >
              <span>Open Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ACCOUNT_SERVICE_LINKS.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-md border border-chrome-200 bg-surface-card p-3.5 shadow-card hover:border-gold-500 transition min-h-[76px]"
                >
                  <div className="w-10 h-10 rounded-sm bg-obsidian-900 text-gold-500 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-display text-sm font-bold text-ink-primary group-hover:text-gold-700 transition truncate">
                        {item.label}
                      </span>
                      {item.badge ? (
                        <span className="rounded-full bg-commerce-obdBg px-2 py-0.5 font-mono text-[9.5px] font-bold text-commerce-obdText shrink-0">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-ink-muted shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 2. Shop Electronics by Department */}
        <section aria-labelledby="menu-departments-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="menu-departments-heading"
              className="font-display text-base sm:text-lg font-bold text-ink-primary"
            >
              Shop Electronics Departments
            </h2>
            <span className="font-mono text-[11px] font-semibold text-ink-muted">
              {ALL_CATEGORIES.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALL_CATEGORIES.map((category) => {
              const count = categoryCounts[category.handle] ?? 0
              return (
                <Link
                  key={category.id}
                  href={getCategoryRoute(category.handle)}
                  className="group flex flex-col justify-between gap-2.5 rounded-md border border-chrome-200 bg-surface-card p-3.5 shadow-card hover:border-gold-500 transition min-h-[104px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 rounded-sm bg-surface-muted text-obsidian-900 group-hover:bg-obsidian-900 group-hover:text-gold-500 flex items-center justify-center transition shrink-0">
                      <CategoryIcon
                        name={category.name}
                        handle={category.handle}
                        iconKey={category.icon}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-ink-muted tabular-nums">
                      {count} items
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-ink-primary group-hover:text-gold-700 transition truncate">
                      {category.name}
                    </p>
                    <p className="text-[11px] text-ink-muted truncate mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 3. Services, Hubs & Customer Protection */}
        <section aria-labelledby="menu-services-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="menu-services-heading"
              className="font-display text-base sm:text-lg font-bold text-ink-primary"
            >
              Services, Hubs &amp; Buyer Protection
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-commerce-warrantyBg px-2.5 py-0.5 font-mono text-[10px] font-bold text-commerce-warrantyText">
              <CreditCard className="w-3 h-3" />
              Authorized Dealer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ELECTRONICS_SERVICE_LINKS.map((service) => {
              const Icon = service.icon
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group flex items-center justify-between gap-3 rounded-md border border-chrome-200 bg-surface-card p-3.5 shadow-card hover:border-gold-500 transition min-h-[68px]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-sm bg-surface-muted text-gold-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-ink-primary group-hover:text-gold-700 transition truncate">
                        {service.label}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-muted shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </StorefrontChrome>
  )
}
