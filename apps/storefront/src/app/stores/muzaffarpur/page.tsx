import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Clock, MapPin, PackageCheck, ShieldCheck, Store } from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { fetchShowcaseFeed } from '@/lib/showcase'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { ShowcaseSpotlightSection } from '@/components/ShowcaseSection'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Muzaffarpur Flagship Hub & Tech Centers',
  description:
    'Visit Mobile Station at Motijheel (842001) & Club Road (842002) in Muzaffarpur, Bihar for instant pickup, open-box testing, and authorized warranty assistance.',
}

export default async function MuzaffarpurHubPage() {
  const { items: storeVisitItems } = await fetchShowcaseFeed({
    entry_type: 'store_visit',
    limit: 3,
  })
  return (
    <StorefrontChrome>
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-8 sm:py-12 space-y-3">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-chrome-300 hover:text-gold-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500">
              <Store className="h-3.5 w-3.5" />
              BIHAR BRICK & MORTAR FLAGSHIP
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
            {MOBILE_STATION_BRAND.name} — Muzaffarpur Hubs
          </h1>
          <p className="text-sm text-chrome-300 max-w-2xl">
            Every online order across India is backed by our physical inventory vaults and inspection desks at Motijheel Road (842001) and Club Road (842002) in Muzaffarpur, Bihar.
          </p>
        </div>
      </section>

      <section className="page-container py-8 grid md:grid-cols-2 gap-5">
        <article className="rounded-md border border-chrome-200 bg-surface-card p-6 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-obsidian-900 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500">
              PRIMARY HUB · 842001
            </span>
            <span className="text-xs font-semibold text-commerce-savings whitespace-nowrap">
              Same-Day Pickup Ready
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-ink-primary">
            {MOBILE_STATION_BRAND.flagshipLocation.name}
          </h2>
          <p className="text-sm text-ink-secondary flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gold-700 shrink-0 mt-0.5" />
            <span>
              {MOBILE_STATION_BRAND.flagshipLocation.addressLine1},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.city},{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.state} –{' '}
              {MOBILE_STATION_BRAND.flagshipLocation.pincode}
            </span>
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="rounded-sm bg-surface-muted p-3 space-y-1">
              <p className="font-semibold text-ink-primary flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold-700" /> Store Hours
              </p>
              <p className="text-ink-muted">Mon–Sun: 10:00 AM – 8:30 PM IST</p>
            </div>
            <div className="rounded-sm bg-surface-muted p-3 space-y-1">
              <p className="font-semibold text-ink-primary flex items-center gap-1.5">
                <PackageCheck className="h-3.5 w-3.5 text-commerce-savings" /> IMEI Inspection
              </p>
              <p className="text-ink-muted">Verify box seal & GST bill at counter</p>
            </div>
          </div>
        </article>

        <article className="rounded-md border border-chrome-200 bg-surface-card p-6 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-obsidian-900 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500">
              EXPERIENCE CENTER · 842002
            </span>
            <span className="text-xs font-semibold text-commerce-savings whitespace-nowrap">
              Audio & Peripherals Desk
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-ink-primary">
            Mobile Station Club Road Tech Center
          </h2>
          <p className="text-sm text-ink-secondary flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gold-700 shrink-0 mt-0.5" />
            <span>
              Club Road, Mithanpura Sector, Muzaffarpur, Bihar – 842002
            </span>
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="rounded-sm bg-surface-muted p-3 space-y-1">
              <p className="font-semibold text-ink-primary flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold-700" /> Store Hours
              </p>
              <p className="text-ink-muted">Tue–Sun: 10:30 AM – 8:00 PM IST</p>
            </div>
            <div className="rounded-sm bg-surface-muted p-3 space-y-1">
              <p className="font-semibold text-ink-primary flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-commerce-warrantyText" /> Switch & Audio Demo
              </p>
              <p className="text-ink-muted">Try Keychron, Sony ANC & GaN gear live</p>
            </div>
          </div>
        </article>
      </section>

      <div className="border-t border-chrome-200 bg-surface-muted/40">
        <ShowcaseSpotlightSection
          title="Recent Store Visits &amp; Open-Box Desk Highlights"
          subtitle="Live customer pickups, sealed IMEI checks, and Keychron / Sony audio demos from Motijheel (842001) &amp; Club Road (842002)."
          badgeLabel="Live Hub Gallery"
          badgeKind="gallery"
          items={storeVisitItems}
          primaryHref="/gallery"
          primaryLabel="Open Full Store Gallery"
          secondaryHref="/feedback"
          secondaryLabel="Customer Video Feedback"
        />
      </div>
    </StorefrontChrome>
  )
}
