import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  PackageCheck,
  RotateCcw,
  Scale,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import {
  estimateMarkdownReadingMinutes,
  extractMarkdownToc,
  type LegalCategory,
} from '@mobile-station/types'
import { fetchLegalDocumentBySlug, fetchPublishedLegalDocuments } from '@/lib/legal'
import { StorefrontChrome } from '@/components/StorefrontChrome'
import { MarkdownArticle } from '@/components/legal/MarkdownArticle'

export const dynamic = 'force-dynamic'

function getCategoryIcon(category: LegalCategory) {
  switch (category) {
    case 'privacy':
      return Lock
    case 'warranty':
      return ShieldCheck
    case 'shipping':
      return PackageCheck
    case 'tax_gst':
      return FileText
    case 'returns':
      return RotateCcw
    default:
      return Scale
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const policy = await fetchLegalDocumentBySlug(slug)
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
  const [policy, { items: allPolicies }] = await Promise.all([
    fetchLegalDocumentBySlug(slug),
    fetchPublishedLegalDocuments(),
  ])

  if (!policy) notFound()

  const Icon = getCategoryIcon(policy.category)
  const tocItems = extractMarkdownToc(policy.content_markdown)
  const readingMins = estimateMarkdownReadingMinutes(policy.content_markdown)

  return (
    <StorefrontChrome>
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-7 sm:py-10 space-y-3">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-chrome-300 hover:text-gold-500 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500 uppercase">
              <Icon className="h-3.5 w-3.5" />
              {policy.badge}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-obsidian-800 border border-obsidian-700 px-2.5 py-0.5 font-mono text-[10.5px] text-chrome-200">
              {policy.version_label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
            {policy.title}
          </h1>

          <p className="text-sm text-chrome-300 max-w-3xl leading-relaxed">{policy.summary}</p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono text-chrome-400">
            {policy.effective_date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold-500" />
                <span>Effective {policy.effective_date}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold-500" />
              <span>{readingMins} min read</span>
            </span>
          </div>
        </div>
      </section>

      <section className="page-container py-6 sm:py-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <article className="lg:col-span-8 rounded-md border border-chrome-200 bg-surface-card p-5 sm:p-8 shadow-card">
            <MarkdownArticle markdown={policy.content_markdown} />
          </article>

          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-32">
            {tocItems.length > 0 && (
              <div className="rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card space-y-2.5">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink-muted">
                  On This Page
                </h2>
                <nav aria-label="Section outline" className="space-y-1.5">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-xs hover:text-gold-700 transition-colors ${
                        item.level === 3
                          ? 'pl-3 text-ink-muted'
                          : 'font-semibold text-ink-primary'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className="rounded-md border border-chrome-200 bg-surface-card p-4 shadow-card space-y-3">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink-muted">
                All Legal &amp; Policy Guides
              </h2>
              <div className="flex flex-col gap-1.5">
                {allPolicies.map((item) => {
                  const active = item.slug === policy.slug
                  return (
                    <Link
                      key={item.slug}
                      href={`/policies/${item.slug}`}
                      className={`rounded-sm border px-3 py-2 text-xs transition flex items-center justify-between gap-2 ${
                        active
                          ? 'border-obsidian-900 bg-obsidian-900 font-semibold text-gold-500'
                          : 'border-chrome-200 bg-surface-canvas text-ink-primary hover:border-gold-500'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      <span
                        className={`font-mono text-[10px] shrink-0 ${
                          active ? 'text-chrome-300' : 'text-ink-muted'
                        }`}
                      >
                        {item.version_label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </StorefrontChrome>
  )
}
