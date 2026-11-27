'use client'

import React, { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'
import { AuthCardHeader } from '@/components/auth/AuthCardHeader'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { evaluatePasswordStrength, isValidEmail } from '@/lib/auth-constants'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams?.get('email') || ''
  const tokenParam = searchParams?.get('token') || ''

  const { customer, isAuthenticated, resetPassword, isLoading, authError } = useCustomerAuth()

  const [email, setEmail] = useState(emailParam || customer?.email || '')
  const [token, setToken] = useState(tokenParam)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const effectiveEmail = (email || customer?.email || '').trim()
  const isEmailValid = isValidEmail(effectiveEmail)
  const passwordStrength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword])
  const isPasswordValid = newPassword.length >= 8
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === newPassword
  const hasTokenOrSession = Boolean(token.trim()) || isAuthenticated

  const formStatusHint = useMemo(() => {
    if (!isEmailValid) return 'Please enter a valid email address'
    if (!hasTokenOrSession) return 'Paste reset token from your email link'
    if (!isPasswordValid) return 'Password must be at least 8 characters'
    if (!isConfirmValid) return 'Passwords must match'
    return null
  }, [isEmailValid, hasTokenOrSession, isPasswordValid, isConfirmValid])

  const isFormValid = formStatusHint === null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)
    if (!isFormValid) {
      setLocalError(formStatusHint)
      return
    }

    const res = await resetPassword(effectiveEmail, newPassword, token.trim() || undefined)
    if (res.success) {
      router.push(`/auth/login?reset=success&email=${encodeURIComponent(effectiveEmail)}`)
    } else {
      setLocalError(res.error || 'Failed to update password. Check your reset token.')
    }
  }

  const strengthBarColors: Record<number, string> = {
    1: 'bg-commerce-errorText',
    2: 'bg-commerce-warningText',
    3: 'bg-gold-500',
    4: 'bg-commerce-savings',
  }

  const activeError = localError || authError

  return (
    <div className="w-full max-w-[420px] mx-auto bg-surface-card rounded-xl border border-chrome-200 shadow-card overflow-hidden">
      <AuthCardHeader
        title="Create New Password"
        subtitle="Set a strong password of at least 8 characters to secure your account"
        badgeText="Encrypted Credential Update"
      />

      <div className="p-5 sm:p-6">
        {activeError ? (
          <div className="mb-4 px-3.5 py-2.5 rounded-sm bg-commerce-errorBg border border-commerce-errorText/30 text-commerce-errorText text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{activeError}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold text-ink-primary mb-1"
              htmlFor="reset-email"
            >
              Account Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reset-email"
                type="email"
                required
                readOnly={Boolean(emailParam) || isAuthenticated}
                value={effectiveEmail}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-sm border border-chrome-300 text-sm transition ${
                  emailParam || isAuthenticated
                    ? 'bg-surface-muted text-ink-secondary cursor-not-allowed'
                    : 'bg-surface-canvas text-ink-primary focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500'
                }`}
              />
            </div>
          </div>

          {!isAuthenticated ? (
            <div>
              <label
                className="block text-xs font-bold text-ink-primary mb-1"
                htmlFor="reset-token"
              >
                Recovery Token (from reset link)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="reset-token"
                  type="text"
                  required={!isAuthenticated}
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value)
                    setLocalError(null)
                  }}
                  placeholder="Paste token from email link"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-sm border border-chrome-300 bg-surface-canvas font-mono text-xs text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition"
                />
              </div>
            </div>
          ) : null}

          <div>
            <label
              className="block text-xs font-bold text-ink-primary mb-1"
              htmlFor="reset-new-password"
            >
              New Password (min 8 chars)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-sm border border-chrome-300 bg-surface-canvas text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink-primary cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword ? (
              <div className="mt-2">
                <div className="flex gap-1.5 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= passwordStrength.score
                          ? strengthBarColors[passwordStrength.score]
                          : 'bg-chrome-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-ink-secondary">
                  Strength:{' '}
                  <span className="font-bold text-ink-primary">{passwordStrength.label}</span>
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                className="text-xs font-bold text-ink-primary"
                htmlFor="reset-confirm-password"
              >
                Confirm New Password
              </label>
              {isConfirmValid ? (
                <span className="text-[11px] font-bold text-commerce-savings inline-flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                  <span>Match</span>
                </span>
              ) : null}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-sm border bg-surface-canvas text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 transition ${
                  confirmPassword && !isConfirmValid
                    ? 'border-commerce-errorText focus:ring-commerce-errorText'
                    : 'border-chrome-300 focus:ring-gold-500 focus:border-gold-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full min-h-[44px] rounded-sm font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mt-2 ${
              isFormValid && !isLoading
                ? 'bg-obsidian-900 hover:bg-obsidian-800 text-gold-500 cursor-pointer shadow-card active:scale-[0.99]'
                : 'bg-surface-muted text-ink-disabled cursor-not-allowed border border-chrome-200'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : isFormValid ? (
              <>
                <span>Update Password &amp; Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>{formStatusHint || 'Fill details to reset password'}</span>
            )}
          </button>
        </form>

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

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[420px] rounded-xl border border-chrome-200 bg-surface-card p-8 text-center text-xs text-ink-muted">
          Loading reset form...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
