'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Smartphone,
  User,
} from 'lucide-react'
import { AuthCardHeader } from '@/components/auth/AuthCardHeader'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import {
  evaluatePasswordStrength,
  formatCustomerInitials,
  isValidEmail,
  isValidIndianMobile,
  normalizePhoneDigits,
  sanitizeRedirectPath,
  validateSignupStep1,
} from '@/lib/auth-constants'

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams?.get('redirect')
  const redirectTarget = sanitizeRedirectPath(redirectParam)

  const { register, isAuthenticated, isHydrated, isLoading, authError, clearError } =
    useCustomerAuth()

  const [step, setStep] = useState<1 | 2>(1)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirectTarget)
    }
  }, [isHydrated, isAuthenticated, redirectTarget, router])

  const step1Hint = useMemo(
    () => validateSignupStep1({ firstName, lastName, email, phone }),
    [firstName, lastName, email, phone]
  )
  const isStep1Valid = step1Hint === null

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password])
  const isPasswordValid = password.length >= 8
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password

  const step2Hint = useMemo(() => {
    if (!isPasswordValid) return 'Password must be at least 8 characters'
    if (!isConfirmValid) return 'Passwords must match'
    if (!agreeTerms) return 'Accept Terms & Privacy Policy'
    return null
  }, [isPasswordValid, isConfirmValid, agreeTerms])
  const isStep2Valid = step2Hint === null

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)
    if (!isStep1Valid) {
      setLocalError(step1Hint)
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)

    if (!isStep1Valid) {
      setStep(1)
      setLocalError(step1Hint)
      return
    }

    if (!isPasswordValid) {
      setLocalError('Password must be at least 8 characters long.')
      return
    }

    if (!isConfirmValid) {
      setLocalError('Passwords do not match.')
      return
    }

    if (!agreeTerms) {
      setLocalError('Please accept our Terms of Service & Privacy Policy.')
      return
    }

    const res = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
    })

    if (res.success) {
      const params = new URLSearchParams({
        registered: 'true',
        email: email.trim().toLowerCase(),
      })
      if (redirectParam) params.set('redirect', redirectParam)
      router.push(`/auth/login?${params.toString()}`)
    } else {
      setLocalError(res.error || 'Could not create account. Please try again.')
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
        title="Create Account"
        subtitle={
          step === 1 ? 'Step 1 of 2 — Personal Details' : 'Step 2 of 2 — Set Your Password'
        }
        stepSlot={
          <div className="flex items-center justify-center gap-2 max-w-[140px] mx-auto">
            <button
              type="button"
              onClick={() => setStep(1)}
              aria-label="Step 1: Personal Details"
              className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                step === 1 ? 'bg-gold-500' : 'bg-gold-500/60'
              }`}
            />
            <div
              aria-label="Step 2: Set Password"
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step === 2 ? 'bg-gold-500' : 'bg-obsidian-700'
              }`}
            />
          </div>
        }
      />

      <div className="p-5 sm:p-6">
        {activeError ? (
          <div className="mb-4 px-3.5 py-2.5 rounded-sm bg-commerce-errorBg border border-commerce-errorText/30 text-commerce-errorText text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{activeError}</span>
          </div>
        ) : null}

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  className="block text-xs font-bold text-ink-primary mb-1"
                  htmlFor="signup-firstName"
                >
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="signup-firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value)
                      setLocalError(null)
                    }}
                    placeholder="Aarav"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-sm border border-chrome-300 bg-surface-canvas text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-ink-primary mb-1"
                  htmlFor="signup-lastName"
                >
                  Last Name *
                </label>
                <input
                  id="signup-lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    setLocalError(null)
                  }}
                  placeholder="Kumar"
                  className="w-full min-h-[44px] px-3 py-2 rounded-sm border border-chrome-300 bg-surface-canvas text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold text-ink-primary mb-1"
                htmlFor="signup-email"
              >
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
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
              {email && !isValidEmail(email) ? (
                <p className="text-[11px] text-commerce-errorText mt-1">
                  Enter a valid email address (e.g., name@domain.com)
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-primary" htmlFor="signup-phone">
                  Mobile Phone *
                </label>
                {phone.length === 10 && isValidIndianMobile(phone) ? (
                  <span className="text-[11px] font-bold text-commerce-savings inline-flex items-center gap-0.5">
                    <Check className="w-3 h-3" />
                    <span>Valid</span>
                  </span>
                ) : null}
              </div>
              <div className="flex">
                <span className="inline-flex items-center gap-1 px-3 rounded-l-sm border border-r-0 border-chrome-300 bg-surface-muted font-mono text-xs font-bold text-ink-secondary">
                  <Smartphone className="w-3.5 h-3.5 text-ink-muted" />
                  <span>+91</span>
                </span>
                <input
                  id="signup-phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(normalizePhoneDigits(e.target.value))
                    setLocalError(null)
                  }}
                  placeholder="9876543210"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-r-sm border border-chrome-300 bg-surface-canvas font-mono text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isStep1Valid}
              className={`w-full min-h-[44px] rounded-sm font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                isStep1Valid
                  ? 'bg-obsidian-900 hover:bg-obsidian-800 text-gold-500 cursor-pointer shadow-card active:scale-[0.99]'
                  : 'bg-surface-muted text-ink-disabled cursor-not-allowed border border-chrome-200'
              }`}
            >
              {isStep1Valid ? (
                <>
                  <span>Continue to Set Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>{step1Hint || 'Fill details to continue'}</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="px-3.5 py-2.5 rounded-sm bg-surface-canvas border border-chrome-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-obsidian-900 text-gold-500 flex items-center justify-center font-display font-bold text-xs shrink-0">
                  {formatCustomerInitials({ firstName, lastName, email })}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink-primary truncate">
                    {firstName} {lastName}
                  </p>
                  <p className="text-[11px] text-ink-muted truncate">{email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-bold text-gold-700 hover:underline shrink-0 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div>
              <label
                className="block text-xs font-bold text-ink-primary mb-1"
                htmlFor="signup-password"
              >
                Password (min 8 chars) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password ? (
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
                    Strength: <span className="font-bold text-ink-primary">{passwordStrength.label}</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className="text-xs font-bold text-ink-primary"
                  htmlFor="signup-confirm-password"
                >
                  Confirm Password *
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
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setLocalError(null)
                  }}
                  placeholder="••••••••"
                  className={`w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-sm border bg-surface-canvas text-sm text-ink-primary placeholder:text-ink-disabled focus:bg-surface-card focus:outline-none focus:ring-2 transition ${
                    confirmPassword && !isConfirmValid
                      ? 'border-commerce-errorText focus:ring-commerce-errorText'
                      : 'border-chrome-300 focus:ring-gold-500 focus:border-gold-500'
                  }`}
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-chrome-300 text-obsidian-900 focus:ring-gold-500 cursor-pointer accent-obsidian-900"
                />
                <span className="text-[11px] text-ink-secondary leading-relaxed">
                  I agree to the{' '}
                  <Link
                    href="/policies/terms-and-conditions"
                    className="font-bold text-gold-700 hover:underline"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/policies/privacy-policy"
                    className="font-bold text-gold-700 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] px-4 rounded-sm border border-chrome-300 bg-surface-canvas text-ink-primary font-bold text-xs hover:bg-surface-muted transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={!isStep2Valid || isLoading}
                className={`flex-1 min-h-[44px] rounded-sm font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  isStep2Valid && !isLoading
                    ? 'bg-gold-500 hover:bg-gold-600 text-obsidian-950 cursor-pointer shadow-gold active:scale-[0.99]'
                    : 'bg-surface-muted text-ink-disabled cursor-not-allowed border border-chrome-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : isStep2Valid ? (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span className="truncate px-2">{step2Hint || 'Complete fields to register'}</span>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-chrome-200 text-center text-xs text-ink-secondary">
          Already have an account?{' '}
          <Link
            href={`/auth/login${
              redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''
            }`}
            className="font-bold text-gold-700 hover:underline inline-flex items-center gap-1"
          >
            <span>Sign in here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[420px] rounded-xl border border-chrome-200 bg-surface-card p-8 text-center text-xs text-ink-muted">
          Loading registration wizard...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  )
}
