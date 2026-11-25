import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, CheckCircle2, FileText, PackageCheck, ShieldCheck } from 'lucide-react'
import { StorefrontChrome } from '@/components/StorefrontChrome'

const POLICIES: Record<
  string,
  {
    title: string
    badge: string
    summary: string
    points: string[]
  }
> = {
  warranty: {
    title: '100% Official Brand Authorized Warranty',
    badge: 'BRAND AUTHORIZED CARE',
    summary:
      'Every smartphone, tablet, laptop, monitor, audio gear, and accessory sold by Mobile Station is factory-sealed Indian retail unit covered directly by official brand service networks across India.',
    points: [
      'Zero grey-market or imported unsealed units.',
      'Valid tax invoice printed with HSN code and device IMEI / Serial Number.',
      'Authorized service coverage for Apple, Samsung, Vivo, Oppo, OnePlus, Nothing, Google, Sony, Lenovo, ASUS, HP, Logitech, Keychron, and SanDisk.',
      '7-day replacement window from our Muzaffarpur Hub in case of certified DOA hardware defect.',
    ],
  },
  'open-box-delivery': {
    title: 'Insured Open-Box Delivery Policy',
    badge: 'SAFE TECH VERIFICATION',
    summary:
      'High-value smartphones, tablets, and laptops (orders ₹25,000+) undergo an assisted doorstep unboxing check before OTP handover so you never take on transit damage risk.',
    points: [
      'Inspect outer tamper-evident seal and factory retail seal with the delivery executive.',
      'Verify physical screen condition, camera glass, and IMEI / Serial match on invoice.',
      'Confirm included inbox accessories (charger/cable/S Pen) before sharing OTP.',
      'Complete courier transit insurance backed by unboxing proof archive.',
    ],
  },
  'gst-invoicing': {
    title: '18% GST Tax Invoice & B2B Input Tax Credit',
    badge: 'B2B GSTIN READY',
    summary:
      'All prices displayed on Mobile Station are inclusive of GST (default 18% across mobiles, computers, audio, and chargers). Registered Indian businesses can enter their 15-digit GSTIN to claim full Input Tax Credit.',
    points: [
      'Automatic CGST (9%) + SGST (9%) split for Bihar deliveries (842001/842002 hub dispatch).',
      'Automatic IGST (18%) split for all inter-state deliveries across India.',
      'Instant downloadable PDF GST Tax Invoice stored securely in private S3/R2 storage.',
      'Compliant HSN reporting (8517 mobiles, 8471 laptops/tablets/peripherals, 8518 audio, 8504 chargers).',
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const policy = POLICIES[slug]
  if (!policy) return { title: 'Policy Not Found' }
  return {
    title: policy.title,
    description: policy.summary,
  }
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const policy = POLICIES[slug]
  if (!policy) notFound()

  const Icon =
    slug === 'open-box-delivery'
      ? PackageCheck
      : slug === 'gst-invoicing'
        ? FileText
        : ShieldCheck

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
              <Icon className="h-3.5 w-3.5" />
              {policy.badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
            {policy.title}
          </h1>
          <p className="text-sm text-chrome-300 max-w-2xl">{policy.summary}</p>
        </div>
      </section>

      <section className="page-container py-8 max-w-4xl">
        <div className="rounded-md border border-chrome-200 bg-surface-card p-6 shadow-card space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-primary">
            Standard Operating Guarantees
          </h2>
          <ul className="space-y-3 text-sm text-ink-secondary">
            {policy.points.map((pt) => (
              <li key={pt} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-commerce-savings shrink-0 mt-1" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-chrome-200 flex flex-wrap gap-3">
            <Link
              href="/policies/warranty"
              className="rounded-sm border border-chrome-300 px-3 py-1.5 text-xs font-semibold hover:border-gold-500"
            >
              Brand Warranty
            </Link>
            <Link
              href="/policies/open-box-delivery"
              className="rounded-sm border border-chrome-300 px-3 py-1.5 text-xs font-semibold hover:border-gold-500"
            >
              Open-Box Delivery
            </Link>
            <Link
              href="/policies/gst-invoicing"
              className="rounded-sm border border-chrome-300 px-3 py-1.5 text-xs font-semibold hover:border-gold-500"
            >
              18% GST B2B Credit
            </Link>
          </div>
        </div>
      </section>
    </StorefrontChrome>
  )
}
