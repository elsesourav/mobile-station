import Image from 'next/image'
import Link from 'next/link'
import {
  BatteryCharging,
  FileText,
  Headphones,
  Keyboard,
  Laptop,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Store,
  Tablet,
} from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import categoriesData from '../../../../data/taxonomy/categories.json'
import brandsData from '../../../../data/taxonomy/brands.json'
import announcementsData from '../../../../data/storefront/announcements.json'
import heroBannersData from '../../../../data/storefront/hero-banners.json'
import trustBadgesData from '../../../../data/storefront/trust-badges.json'
import catalogSeed from '../../../../data/catalog/products-seed.json'
import { discountPercent, formatINR, monthlyEmiPreview } from '@/lib/format'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Keyboard,
  BatteryCharging,
  ShieldCheck,
}

const TRUST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'shield-check': ShieldCheck,
  'package-check': PackageCheck,
  'file-text': FileText,
  store: Store,
}

export default function HomePage() {
  const leadHero = heroBannersData[0]
  const featuredProducts = catalogSeed.products.slice(0, 8)

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-ink-primary">
      {/* Top Announcement & Trust Strip */}
      <div className="bg-obsidian-950 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gold-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-obsidian-950">
              {announcementsData[0]?.badge}
            </span>
            <span className="text-chrome-200">{announcementsData[0]?.text}</span>
          </div>
          <div className="flex items-center gap-1.5 text-chrome-400">
            <MapPin className="h-3.5 w-3.5 text-gold-500" />
            <span>
              {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.state} (
              {MOBILE_STATION_BRAND.flagshipLocation.pincode}) · Pan-India Shipping
            </span>
          </div>
        </div>
      </div>

      {/* Obsidian Brand Header */}
      <header className="sticky top-0 z-header bg-obsidian-900 text-ink-inverse border-b border-obsidian-800 shadow-card">
        <div className="page-container h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src={MOBILE_STATION_BRAND.assets.icon}
              alt="MS emblem"
              width={44}
              height={22}
              className="h-7 w-auto object-contain"
              priority
            />
            <Image
              src={MOBILE_STATION_BRAND.assets.wordmark}
              alt="Mobile Station"
              width={210}
              height={24}
              className="h-5 sm:h-6 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 rounded-sm bg-obsidian-800 border border-obsidian-700 px-3 py-2">
            <Search className="h-4 w-4 text-chrome-400 shrink-0" />
            <input
              type="search"
              readOnly
              aria-label="Search electronics"
              placeholder="Search iPhone 16, MacBook Air M3, Keychron, 65W GaN charger..."
              className="w-full bg-transparent text-sm text-ink-inverse placeholder:text-chrome-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-flex items-center rounded-full border border-obsidian-700 bg-obsidian-800 px-3 py-1 text-xs text-chrome-200">
              18% GST Invoice
            </span>
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-gold-500 px-4 py-2 text-xs font-semibold text-obsidian-950 hover:bg-gold-600 transition"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart (0)</span>
            </button>
          </div>
        </div>

        {/* Category Mega-Nav Strip */}
        <nav
          aria-label="Primary categories"
          className="bg-obsidian-800 border-t border-obsidian-700/60"
        >
          <div className="page-container flex items-center gap-5 overflow-x-auto no-scrollbar py-2.5 text-xs font-medium text-chrome-200">
            {categoriesData.root_categories.map((cat) => (
              <Link
                key={cat.id}
                href={`#${cat.handle}`}
                className="whitespace-nowrap hover:text-gold-500 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
          <div className="page-container py-12 md:py-16 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-xs font-semibold text-gold-500">
                {leadHero.tag}
              </span>
              <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-ink-inverse">
                {leadHero.title}
              </h1>
              <p className="text-base text-chrome-300 max-w-2xl">{leadHero.subtitle}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#catalog"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-gold-500 px-6 py-2.5 text-sm font-semibold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
                >
                  {leadHero.cta_text}
                </a>
                <a
                  href="#categories"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-chrome-400/40 bg-obsidian-800 px-5 py-2.5 text-sm font-medium text-ink-inverse hover:border-gold-500 transition"
                >
                  Explore 7 Tech Categories
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl bg-obsidian-800 p-6 ms-gold-ring space-y-4">
                <div className="flex items-center justify-between text-xs text-chrome-400 font-mono">
                  <span>BIHAR FLAGSHIP + PAN-INDIA HUB</span>
                  <span className="text-gold-500">OPEN 10AM–8PM</span>
                </div>
                <div className="space-y-1">
                  <p className="font-display text-lg font-bold text-ink-inverse">
                    {MOBILE_STATION_BRAND.flagshipLocation.name}
                  </p>
                  <p className="text-sm text-chrome-300">
                    {MOBILE_STATION_BRAND.flagshipLocation.addressLine1},{' '}
                    {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
                    {MOBILE_STATION_BRAND.flagshipLocation.state} –{' '}
                    {MOBILE_STATION_BRAND.flagshipLocation.pincode}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="rounded-sm bg-obsidian-900 p-3 border border-obsidian-700">
                    <p className="text-chrome-400">Open-Box Delivery</p>
                    <p className="font-semibold text-ink-inverse mt-0.5">Orders ₹25,000+</p>
                  </div>
                  <div className="rounded-sm bg-obsidian-900 p-3 border border-obsidian-700">
                    <p className="text-chrome-400">B2B Tax Credit</p>
                    <p className="font-semibold text-ink-inverse mt-0.5">18% GST Invoice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Compliance Ribbon */}
        <section className="bg-surface-card border-b border-chrome-200">
          <div className="page-container py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadgesData.map((badge) => {
              const Icon = TRUST_ICONS[badge.icon_key] ?? ShieldCheck
              return (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 rounded-md border border-chrome-200 bg-surface-canvas p-4"
                >
                  <div className="rounded-sm bg-obsidian-900 p-2 text-gold-500 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-sm font-bold text-ink-primary">
                      {badge.title}
                    </h2>
                    <p className="text-xs text-ink-muted mt-1">{badge.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 7-Pillar Category Grid */}
        <section id="categories" className="page-container py-10 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Shop by Electronics Category</h2>
              <p className="text-sm text-ink-muted">
                7 device & peripheral verticals with HSN-verified 18% GST invoicing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {categoriesData.root_categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] ?? Smartphone
              return (
                <div
                  id={cat.handle}
                  key={cat.id}
                  className="rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card hover:shadow-card-hover hover:border-gold-500 transition flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-obsidian-900 text-gold-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] text-ink-muted">
                      HSN {cat.default_hsn}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold leading-snug">{cat.name}</h3>
                  <p className="text-xs text-ink-muted line-clamp-2">{cat.subtitle}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Featured Catalog Seed Grid */}
        <section id="catalog" className="page-container pb-12 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-bold">Featured Hardware & Accessories</h2>
            <p className="text-sm text-ink-muted">
              Prepared multi-variant catalog ready for Medusa v2 & Meilisearch indexing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => {
              const primaryVariant = product.variants[0]
              const off = discountPercent(primaryVariant.mrp_paise, primaryVariant.price_paise)
              return (
                <article
                  key={product.handle}
                  className="rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card hover:shadow-card-hover transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gold-700">
                        {product.metadata.brand}
                      </span>
                      {off > 0 && (
                        <span className="rounded-full bg-commerce-deal px-2 py-0.5 text-[10px] font-bold text-white">
                          {off}% OFF
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-base font-bold leading-snug">
                      {product.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                      {(product.metadata.key_highlights ?? []).slice(0, 3).map((chip) => (
                        <span
                          key={chip}
                          className="rounded-xs bg-surface-muted px-2 py-0.5 font-mono text-[10px] text-ink-secondary"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {product.variants.map((variant) => (
                        <span
                          key={variant.sku}
                          className="rounded-full border border-chrome-300 px-2.5 py-0.5 text-[11px] text-ink-secondary"
                        >
                          {variant.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-chrome-200 space-y-2">
                    <div className="flex items-baseline gap-2 tabular-nums">
                      <span className="font-display text-lg font-bold text-ink-primary">
                        {formatINR(primaryVariant.price_paise)}
                      </span>
                      {primaryVariant.mrp_paise > primaryVariant.price_paise && (
                        <span className="text-xs text-ink-muted line-through">
                          {formatINR(primaryVariant.mrp_paise)}
                        </span>
                      )}
                    </div>
                    {product.metadata.emi_eligible && (
                      <p className="text-[11px] font-medium text-commerce-savings tabular-nums">
                        No-Cost EMI from {monthlyEmiPreview(primaryVariant.price_paise)}/mo
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-commerce-warrantyBg px-2.5 py-0.5 text-[10px] font-semibold text-commerce-warrantyText">
                        {product.metadata.warranty_summary}
                      </span>
                      {product.metadata.requires_open_box_delivery && (
                        <span className="rounded-full bg-commerce-obdBg px-2.5 py-0.5 text-[10px] font-semibold text-commerce-obdText">
                          Open-Box Check
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Authorized Brand Strip */}
        <section className="bg-surface-card border-t border-chrome-200 py-8">
          <div className="page-container space-y-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
              Authorized Brands & Genuine Hardware Ecosystem
            </h2>
            <div className="flex flex-wrap gap-2">
              {brandsData.brands.map((brand) => (
                <span
                  key={brand.handle}
                  className="rounded-sm border border-chrome-200 bg-surface-canvas px-3 py-1.5 text-xs font-semibold text-ink-primary"
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-obsidian-950 text-chrome-300 border-t border-obsidian-800 py-8">
        <div className="page-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-display font-bold text-ink-inverse">
              {MOBILE_STATION_BRAND.name}
            </p>
            <p className="text-chrome-400 mt-1">
              {MOBILE_STATION_BRAND.flagshipLocation.addressLine1},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.state} –{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.pincode}
            </p>
          </div>
          <p className="text-chrome-400">
            Separated Architecture: Supabase DB · Upstash Redis · Cloudinary CDN · S3/R2 Vault · Meilisearch · Resend · Sentry
          </p>
        </div>
      </footer>
    </div>
  )
}
