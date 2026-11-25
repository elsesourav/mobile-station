'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  User,
} from 'lucide-react'
import {
  indianGstinSchema,
  indianPhoneSchema,
  indianPincodeSchema,
} from '@mobile-station/types'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { useCart } from '@/components/CartContext'
import { formatINR } from '@/lib/format'
import { StorefrontChrome } from '@/components/StorefrontChrome'

const ACCOUNT_STORAGE_KEY = 'mobile_station_account_v1'

type PreferredHub = 'motijheel-842001' | 'club-road-842002'
type AuthMode = 'signin' | 'register'

export interface CustomerAccountProfile {
  fullName: string
  email: string
  phone: string
  pincode: string
  cityAddress: string
  gstin: string
  businessName: string
  preferredHub: PreferredHub
  signedInAt: string
}

const DEFAULT_PROFILE: CustomerAccountProfile = {
  fullName: '',
  email: '',
  phone: '',
  pincode: '842001',
  cityAddress: '',
  gstin: '',
  businessName: '',
  preferredHub: 'motijheel-842001',
  signedInAt: '',
}

export function validateAccountProfileInput(input: {
  mode: AuthMode
  fullName: string
  email: string
  phone: string
}): string | null {
  if (input.mode === 'register' && input.fullName.trim().length < 2) {
    return 'Enter your full name (at least 2 characters).'
  }
  const emailTrimmed = input.email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    return 'Enter a valid email address.'
  }
  if (input.mode === 'register' || input.phone.trim().length > 0) {
    const phoneCheck = indianPhoneSchema.safeParse(input.phone)
    if (!phoneCheck.success) {
      return phoneCheck.error.issues[0]?.message || 'Enter a valid 10-digit Indian mobile number.'
    }
  }
  return null
}

export function validateSavedBillingDetails(input: {
  pincode: string
  gstin: string
}): string | null {
  if (input.pincode.trim()) {
    const pinCheck = indianPincodeSchema.safeParse(input.pincode)
    if (!pinCheck.success) {
      return pinCheck.error.issues[0]?.message || 'Enter a valid 6-digit Indian PIN code.'
    }
  }
  if (input.gstin.trim()) {
    const gstCheck = indianGstinSchema.safeParse(input.gstin)
    if (!gstCheck.success) {
      return gstCheck.error.issues[0]?.message || 'Enter a valid 15-character GSTIN.'
    }
  }
  return null
}

export function AccountPageClient() {
  const { totalCount, subtotalPaise, openCart } = useCart()
  const [hydrated, setHydrated] = useState(false)
  const [profile, setProfile] = useState<CustomerAccountProfile | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  const [pincode, setPincode] = useState('842001')
  const [cityAddress, setCityAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [preferredHub, setPreferredHub] = useState<PreferredHub>('motijheel-842001')
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CustomerAccountProfile
        if (parsed && parsed.email) {
          setProfile(parsed)
          setPincode(parsed.pincode || '842001')
          setCityAddress(parsed.cityAddress || '')
          setGstin(parsed.gstin || '')
          setBusinessName(parsed.businessName || '')
          setPreferredHub(parsed.preferredHub || 'motijheel-842001')
        }
      }
    } catch {
      // Ignore storage read failures cleanly
    } finally {
      setHydrated(true)
    }
  }, [])

  const persistProfile = (next: CustomerAccountProfile | null) => {
    setProfile(next)
    try {
      if (next) {
        window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(next))
      } else {
        window.localStorage.removeItem(ACCOUNT_STORAGE_KEY)
      }
    } catch {
      // Ignore storage write failures cleanly
    }
  }

  const handleAuthSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validateAccountProfileInput({
      mode: authMode,
      fullName,
      email,
      phone,
    })
    if (error) {
      setAuthError(error)
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    const fallbackName = cleanEmail.split('@')[0] || 'Customer'
    const nextProfile: CustomerAccountProfile = {
      ...DEFAULT_PROFILE,
      fullName: fullName.trim() || fallbackName,
      email: cleanEmail,
      phone: phone.trim(),
      signedInAt: new Date().toISOString(),
    }

    setAuthError(null)
    setPincode(nextProfile.pincode)
    setCityAddress(nextProfile.cityAddress)
    setGstin(nextProfile.gstin)
    setBusinessName(nextProfile.businessName)
    setPreferredHub(nextProfile.preferredHub)
    persistProfile(nextProfile)
  }

  const handleSaveDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return

    const validationError = validateSavedBillingDetails({ pincode, gstin })
    if (validationError) {
      setSaveFeedback({ ok: false, text: validationError })
      return
    }

    const updated: CustomerAccountProfile = {
      ...profile,
      pincode: pincode.trim() || '842001',
      cityAddress: cityAddress.trim(),
      gstin: gstin.trim().toUpperCase(),
      businessName: businessName.trim(),
      preferredHub,
    }
    persistProfile(updated)
    setGstin(updated.gstin)
    setSaveFeedback({
      ok: true,
      text: 'Delivery PIN, hub preference, and B2B GSTIN details saved.',
    })
  }

  const handleSignOut = () => {
    persistProfile(null)
    setSaveFeedback(null)
    setAuthError(null)
  }

  return (
    <StorefrontChrome>
      <section className="bg-obsidian-900 text-ink-inverse border-b border-obsidian-800">
        <div className="page-container py-8 sm:py-11 space-y-3">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-chrome-300 hover:text-gold-500 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian-800 border border-gold-500/40 px-3 py-1 font-mono text-[11px] font-semibold text-gold-500">
              <User className="h-3.5 w-3.5" />
              CUSTOMER ACCOUNT &amp; B2B GST PROFILE
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink-inverse">
            {profile ? `Welcome, ${profile.fullName}` : 'Your Mobile Station Account'}
          </h1>
          <p className="text-sm text-chrome-300 max-w-2xl">
            Manage your delivery PIN code, Muzaffarpur Hub pickup preference, 18% GST Business Input
            Tax Credit details, and order tracking.
          </p>
        </div>
      </section>

      <section className="page-container py-8">
        {!hydrated ? (
          <div className="rounded-md border border-chrome-200 bg-surface-card p-8 text-center text-sm text-ink-muted">
            Loading account preferences...
          </div>
        ) : !profile ? (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-md border border-chrome-200 bg-surface-card p-5 sm:p-6 shadow-card space-y-5">
              <div className="flex items-center gap-2 border-b border-chrome-200 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin')
                    setAuthError(null)
                  }}
                  className={`min-h-[44px] rounded-full px-4 text-xs font-bold transition ${
                    authMode === 'signin'
                      ? 'bg-obsidian-900 text-gold-500'
                      : 'bg-surface-muted text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register')
                    setAuthError(null)
                  }}
                  className={`min-h-[44px] rounded-full px-4 text-xs font-bold transition ${
                    authMode === 'register'
                      ? 'bg-obsidian-900 text-gold-500'
                      : 'bg-surface-muted text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="rounded-sm bg-commerce-errorBg px-3.5 py-2.5 text-xs font-medium text-commerce-errorText">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <label className="block space-y-1.5">
                    <span className="font-semibold text-ink-primary">Full Name *</span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Kumar"
                      className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                    />
                  </label>
                )}

                <label className="block space-y-1.5">
                  <span className="font-semibold text-ink-primary">Email Address *</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="font-semibold text-ink-primary">
                    10-Digit Mobile Number {authMode === 'register' ? '*' : '(Optional for OTP updates)'}
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required={authMode === 'register'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 font-mono text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-sm bg-gold-500 px-5 py-2.5 text-sm font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
                >
                  {authMode === 'signin' ? 'Continue to Account' : 'Create Mobile Station Account'}
                </button>
              </form>
            </div>

            <aside className="lg:col-span-5 space-y-4">
              <div className="rounded-md border border-chrome-200 bg-surface-card p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-base font-bold text-ink-primary flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-gold-700" />
                    <span>Your Active Cart</span>
                  </h2>
                  <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  {totalCount > 0
                    ? `Current subtotal: ${formatINR(subtotalPaise)} (Incl. 18% GST)`
                    : 'Your shopping cart is currently empty.'}
                </p>
                <button
                  type="button"
                  onClick={openCart}
                  className="w-full min-h-[44px] rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition"
                >
                  Open Shopping Cart
                </button>
              </div>

              <div className="rounded-md border border-chrome-200 bg-surface-card p-5 shadow-card space-y-3">
                <h2 className="font-display text-base font-bold text-ink-primary">
                  Account Benefits
                </h2>
                <ul className="space-y-2.5 text-xs text-ink-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-commerce-savings shrink-0 mt-0.5" />
                    <span>Save your 15-digit B2B GSTIN for instant 18% GST Input Tax Credit invoices.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-commerce-warrantyText shrink-0 mt-0.5" />
                    <span>Track Open-Box Delivery OTPs and IMEI/Serial warranty records.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gold-700 shrink-0 mt-0.5" />
                    <span>
                      Fast pickup at {MOBILE_STATION_BRAND.flagshipLocation.city} Hubs (842001 &amp; 842002).
                    </span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <form
                onSubmit={handleSaveDetails}
                className="rounded-md border border-chrome-200 bg-surface-card p-5 sm:p-6 shadow-card space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-chrome-200 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-primary">
                      Delivery &amp; B2B GSTIN Settings
                    </h2>
                    <p className="text-xs text-ink-muted">
                      Signed in as <span className="font-semibold text-ink-primary">{profile.email}</span>
                      {profile.phone ? ` · +91 ${profile.phone}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-gold-500 hover:text-ink-primary transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {saveFeedback && (
                  <div
                    className={`rounded-sm px-3.5 py-2.5 text-xs font-medium ${
                      saveFeedback.ok
                        ? 'bg-commerce-obdBg text-commerce-obdText'
                        : 'bg-commerce-errorBg text-commerce-errorText'
                    }`}
                  >
                    {saveFeedback.text}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <label className="space-y-1.5">
                    <span className="font-semibold text-ink-primary">Default 6-Digit PIN Code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="842001"
                      className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 font-mono text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="font-semibold text-ink-primary">Preferred Muzaffarpur Hub</span>
                    <select
                      value={preferredHub}
                      onChange={(e) => setPreferredHub(e.target.value as PreferredHub)}
                      className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                    >
                      <option value="motijheel-842001">Motijheel Flagship Hub (842001)</option>
                      <option value="club-road-842002">Club Road Express Center (842002)</option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-semibold text-ink-primary">Delivery Street / Landmark</span>
                  <input
                    type="text"
                    value={cityAddress}
                    onChange={(e) => setCityAddress(e.target.value)}
                    placeholder="House/Shop No., Street, City, State"
                    className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                  />
                </label>

                <div className="grid sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-chrome-200">
                  <label className="space-y-1.5">
                    <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-gold-700" />
                      <span>15-Char B2B GSTIN (Optional)</span>
                    </span>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="10AABCU9603R1ZM"
                      className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 font-mono text-sm uppercase text-ink-primary focus:border-gold-500 focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="font-semibold text-ink-primary">Registered Business Name</span>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Optional for ITC Tax Invoice"
                      className="w-full min-h-[44px] rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-sm text-ink-primary focus:border-gold-500 focus:outline-none"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] rounded-sm bg-gold-500 px-5 py-2.5 text-xs font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition"
                >
                  Save Profile &amp; GST Details
                </button>
              </form>

              <div className="rounded-md border border-chrome-200 bg-surface-card p-5 sm:p-6 shadow-card space-y-3">
                <h2 className="font-display text-lg font-bold text-ink-primary flex items-center gap-2">
                  <Package className="h-5 w-5 text-gold-700" />
                  <span>Orders &amp; GST Tax Invoices</span>
                </h2>
                <p className="text-xs text-ink-secondary">
                  No completed orders are linked to this session yet. Once you place an order,
                  IMEI/Serial numbers, Shiprocket tracking, and downloadable 18% GST PDFs appear here.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Link
                    href="/"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition"
                  >
                    Browse Electronics Catalog
                  </Link>
                  <Link
                    href="/offers"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-chrome-300 bg-surface-canvas px-4 py-2 text-xs font-semibold text-ink-primary hover:border-gold-500 transition"
                  >
                    View Promo Codes
                  </Link>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5 space-y-4">
              <div className="rounded-md border border-chrome-200 bg-surface-card p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-base font-bold text-ink-primary flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-gold-700" />
                    <span>Shopping Cart</span>
                  </h2>
                  <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  {totalCount > 0
                    ? `Subtotal ${formatINR(subtotalPaise)} (Incl. 18% GST).`
                    : 'Add devices or accessories to review delivery ETA and GST splits.'}
                </p>
                <button
                  type="button"
                  onClick={openCart}
                  className="w-full min-h-[44px] rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition"
                >
                  Open Shopping Cart
                </button>
              </div>

              <div className="rounded-md border border-chrome-200 bg-surface-card p-5 shadow-card space-y-2.5 text-xs">
                <h3 className="font-display text-sm font-bold text-ink-primary">Quick Links</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/stores/muzaffarpur"
                    className="min-h-[44px] flex items-center rounded-sm border border-chrome-200 bg-surface-canvas px-3 py-2 font-medium text-ink-primary hover:border-gold-500 transition"
                  >
                    Muzaffarpur Hubs
                  </Link>
                  <Link
                    href="/policies/gst-invoicing"
                    className="min-h-[44px] flex items-center rounded-sm border border-chrome-200 bg-surface-canvas px-3 py-2 font-medium text-ink-primary hover:border-gold-500 transition"
                  >
                    18% GST Policy
                  </Link>
                  <Link
                    href="/policies/open-box-delivery"
                    className="min-h-[44px] flex items-center rounded-sm border border-chrome-200 bg-surface-canvas px-3 py-2 font-medium text-ink-primary hover:border-gold-500 transition"
                  >
                    Open-Box Guide
                  </Link>
                  <Link
                    href="/policies/warranty"
                    className="min-h-[44px] flex items-center rounded-sm border border-chrome-200 bg-surface-canvas px-3 py-2 font-medium text-ink-primary hover:border-gold-500 transition"
                  >
                    Warranty Check
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </StorefrontChrome>
  )
}
