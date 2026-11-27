'use client'

import React, { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { AuthCardHeader } from '@/components/auth/AuthCardHeader'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { isValidEmail } from '@/lib/auth-constants'

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams?.get('email') || ''

  const { requestPasswordReset, isLoading, authError } = useCustomerAuth()

  const [email, setEmail] = useState(initialEmail)
  const [isSuccess, setIsSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isEmailValid = useMemo(() => isValidEmail(email), [email])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)
    if (!isEmailValid) return

    const res = await requestPasswordReset(email.trim())
    if (res.success) {
      setIsSuccess(true)
    } else {
      setLocalError(res.error || 'Failed to dispatch recovery link. Please try again.')
    }
  }

  const activeError = localError || authError

  return (
    <div className="w-full max-w-[420px] mx-auto bg-surface-card rounded-xl border border-chrome-200 shadow-card overflow-hidden">
      <AuthCardHeader
        title={isSuccess ? 'Check Your Inbox' : 'Reset Password'}
        subtitle={
          isSuccess
            ? 'Recovery instructions dispatched to your email address'
            : 'Enter your registered email to receive password recovery instructions'
        }
        badgeText="Secure Account Recovery"
      />

      <div className="p-5 sm:p-6">
        {activeError && !isSuccess ? (
          <div className="mb-4 px-3.5 py-2.5 rounded-sm bg-commerce-errorBg border border-commerce-errorText/30 text-commerce-errorText text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{activeError}</span>
          </div>
        ) : null}

        {isSuccess ? (
          <div className="text-center py-2 space-y-4">
            <div className="w-12 h-12 rounded-full bg-commerce-obdBg text-commerce-savings flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-display text-base font-bold text-ink-primary">
                Recovery Email Dispatched
              </h2>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                Check <span className="font-semibold text-ink-primary">{email.trim()}</span> for a
                password reset link and token.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email.trim())}`}
                className="w-full min-h-[44px] rounded-sm bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-gold"
              >
                <span>Open Password Reset Form</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full min-h-[44px] rounded-sm bg-obsidian-900 hover:bg-obsidian-800 text-gold-500 font-bold text-xs flex items-center justify-center transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold text-ink-primary mb-1"
                htmlFor="forgot-email"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setLocalError(null)
                  }}
                  placeholder="you@example.com"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-sm border border-chrome-300 bg-surface-canvas text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isEmailValid || isLoading}
              className={`w-full min-h-[44px] rounded-sm font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                isEmailValid && !isLoading
                  ? 'bg-obsidian-900 hover:bg-obsidian-800 text-gold-500 cursor-pointer shadow-card active:scale-[0.99]'
                  : 'bg-surface-muted text-ink-disabled cursor-not-allowed border border-chrome-200'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : isEmailValid ? (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Enter valid email to send link</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-chrome-200 text-center text-xs text-ink-secondary">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-bold text-gold-700 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[420px] rounded-xl border border-chrome-200 bg-surface-card p-8 text-center text-xs text-ink-muted">
          Loading recovery page...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  )
}
