import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-canvas text-ink-primary antialiased">
      <div className="w-full max-w-[440px] mx-auto px-4 pt-5 sm:pt-7">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-gold-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Mobile Station</span>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center py-5 sm:py-8 px-3 sm:px-6">
        {children}
      </main>

      <footer className="w-full max-w-[440px] mx-auto px-4 pb-6 pt-2 text-center text-[11px] text-ink-muted flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/policies/privacy-policy" className="hover:text-ink-primary transition-colors">
          Privacy Policy
        </Link>
        <Link
          href="/policies/terms-and-conditions"
          className="hover:text-ink-primary transition-colors"
        >
          Terms &amp; Conditions
        </Link>
        <Link href="/policies/gst-invoicing" className="hover:text-ink-primary transition-colors">
          18% GST Support
        </Link>
      </footer>
    </div>
  )
}
