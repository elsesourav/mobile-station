'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react'
import { AuthCardHeader } from '@/components/auth/AuthCardHeader'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { isValidEmail, sanitizeRedirectPath } from '@/lib/auth-constants'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams?.get('redirect')
  const registeredParam = searchParams?.get('registered') === 'true'
  const resetParam = searchParams?.get('reset') === 'success'
  const initialEmail = searchParams?.get('email') || ''
  const redirectTarget = sanitizeRedirectPath(redirectParam)

  const {
    login,
    requestPasswordReset,
    isAuthenticated,
    isHydrated,
    isLoading,
    authError,
    clearError,
  } = useCustomerAuth()

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState(initialEmail)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotSubmitting, setForgotSubmitting] = useState(false)

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirectTarget)
    }
  }, [isHydrated, isAuthenticated, redirectTarget, router])

  const isEmailValid = isValidEmail(email)
  const isPasswordValid = password.length >= 1
  const isFormValid = isEmailValid && isPasswordValid

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)
    if (!isFormValid) return

    const res = await login(email.trim(), password)
    if (res.success) {
      router.push(redirectTarget)
    } else {
      setLocalError(res.error || 'Invalid email or password.')
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setForgotError(null)
    const targetEmail = forgotEmail.trim()
    if (!isValidEmail(targetEmail)) {
      setForgotError('Please enter a valid email address.')
      return
    }

    setForgotSubmitting(true)
    const res = await requestPasswordReset(targetEmail)
    setForgotSubmitting(false)
    if (res.success) {
      setForgotSuccess(true)
    } else {
      setForgotError(res.error || 'Failed to dispatch recovery link.')
    }
  }

  const activeError = localError || authError

  return (
    <>
      <div className="w-full max-w-[420px] mx-auto bg-surface-card rounded-xl border border-chrome-200 shadow-card overflow-hidden">
        <AuthCardHeader
          title="Welcome Back"
          subtitle="Sign in to track IMEI invoices, GSTIN profiles & orders"
        />

        <div className="p-5 sm:p-6">
          {redirectParam ? (
            <div className="mb-4 px-3.5 py-2.5 rounded-sm bg-commerce-warrantyBg border border-chrome-200 text-commerce-warrantyText text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                {redirectParam.includes('checkout')
                  ? 'Sign in to proceed to checkout.'
                  : redirectParam.includes('account')
                    ? 'Sign in to manage your orders & 18% GST profile.'
                    : 'Sign in to continue.'}
              </span>
            </div>
          ) : null}

          {registeredParam ? (
            <div className="mb-4 px-3.5 py-2.5 rounded-sm bg-commerce-obdBg border border-commerce-savings/30 text-commerce-obdText text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-commerce-savings" />
              <div>
                <p className="font-bold">Registration Successful!</p>
                <p className="text-[11px] mt-0.5">
                  Account created for <span className="font-semibold">{initialEmail || 'you'}</span>.
                  Enter your password below to sign in.
                </p>
              </div>
            </div>
          ) : null}

          {resetParam ? (
            <div className="mb-4 px-3.5 py-2.5 rounded-sm bg-commerce-obdBg border border-commerce-savings/30 text-commerce-obdText text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-commerce-savings" />
              <div>
                <p className="font-bold">Password Updated Successfully!</p>
                <p className="text-[11px] mt-0.5">You can now sign in with your new password.</p>
              </div>
            </div>
          ) : null}

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
                htmlFor="login-email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-primary" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setForgotSuccess(false)
                    setForgotError(null)
                    setShowForgotModal(true)
                  }}
                  className="text-[11px] font-semibold text-gold-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setLocalError(null)
                  }}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-sm border border-chrome-300 bg-surface-canvas text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink-primary cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  <span>Signing in...</span>
                </>
              ) : isFormValid ? (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Fill email &amp; password to sign in</span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-chrome-200 text-center text-xs text-ink-secondary">
            New to Mobile Station?{' '}
            <Link
              href={`/auth/signup${
                redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''
              }`}
              className="font-bold text-gold-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Create an account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {showForgotModal ? (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-modal-title"
        >
          <div className="relative w-full max-w-[380px] bg-surface-card rounded-xl shadow-modal border border-chrome-200 overflow-hidden">
            <div className="bg-obsidian-900 text-ink-inverse px-5 py-4 flex items-center justify-between border-b border-obsidian-800">
              <div>
                <h2 id="forgot-password-modal-title" className="font-display text-base font-bold">
                  Reset Password
                </h2>
                <p className="text-[11px] text-chrome-300 mt-0.5">
                  We&apos;ll send a recovery link to your registered email
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-obsidian-800 hover:bg-obsidian-700 flex items-center justify-center text-chrome-300 hover:text-ink-inverse transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {forgotSuccess ? (
                <div className="text-center py-2 space-y-3">
                  <div className="w-11 h-11 rounded-full bg-commerce-obdBg text-commerce-savings flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-ink-primary">
                    Instructions Dispatched
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Check <span className="font-semibold text-ink-primary">{forgotEmail}</span> for
                    your secure password reset link.
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      href={`/auth/reset-password?email=${encodeURIComponent(forgotEmail.trim())}`}
                      className="w-full min-h-[40px] rounded-sm bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Already have a reset token? Update Password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="w-full min-h-[40px] rounded-sm bg-obsidian-900 hover:bg-obsidian-800 text-gold-500 font-bold text-xs transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotError ? (
                    <div className="px-3 py-2 rounded-sm bg-commerce-errorBg text-commerce-errorText text-xs font-medium">
                      {forgotError}
                    </div>
                  ) : null}

                  <div>
                    <label
                      className="block text-xs font-bold text-ink-primary mb-1"
                      htmlFor="modal-forgot-email"
                    >
                      Registered Email
                    </label>
                    <input
                      id="modal-forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-sm border border-chrome-300 bg-surface-canvas text-sm text-ink-primary focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full min-h-[44px] rounded-sm bg-obsidian-900 hover:bg-obsidian-800 text-gold-500 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-60"
                  >
                    {forgotSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Instructions</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 border-t border-chrome-200 text-center">
                    <Link
                      href={`/auth/forgot-password${
                        forgotEmail ? `?email=${encodeURIComponent(forgotEmail)}` : ''
                      }`}
                      className="text-[11px] font-semibold text-ink-secondary hover:text-gold-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open dedicated recovery page</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default function LoginPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[420px] rounded-xl border border-chrome-200 bg-surface-card p-8 text-center text-xs text-ink-muted">
          Loading sign-in experience...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
