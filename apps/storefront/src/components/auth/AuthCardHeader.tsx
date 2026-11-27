import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'

interface AuthCardHeaderProps {
  title: string
  subtitle: string
  badgeText?: string
  stepSlot?: React.ReactNode
}

/**
 * Shared dark Obsidian card header ensuring metallic silver STATION wordmark contrast
 * across Sign In, 2-Step Sign Up, Forgot Password, and Reset Password views.
 */
export function AuthCardHeader({
  title,
  subtitle,
  badgeText = '256-Bit SSL Encrypted',
  stepSlot,
}: AuthCardHeaderProps): React.ReactElement {
  return (
    <div className="bg-obsidian-900 text-ink-inverse px-5 pt-6 pb-5 text-center border-b border-obsidian-800">
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-sm px-2 py-1 transition-transform hover:scale-[1.02] mb-3 focus:outline-none focus:ring-2 focus:ring-gold-500"
      >
        <Image
          src="/brand/mobile-station-wordmark.png"
          alt="Mobile Station"
          width={168}
          height={42}
          className="h-8 sm:h-9 w-auto object-contain"
          priority
        />
      </Link>

      <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-inverse tracking-tight">
        {title}
      </h1>
      <p className="text-xs text-chrome-300 mt-1">{subtitle}</p>

      {stepSlot ? <div className="mt-4">{stepSlot}</div> : null}

      {badgeText ? (
        <div className="mt-3 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-obsidian-800 border border-obsidian-700 text-[10px] font-semibold text-gold-500">
            <Lock className="w-3 h-3 shrink-0" />
            <span>{badgeText}</span>
          </span>
        </div>
      ) : null}
    </div>
  )
}
