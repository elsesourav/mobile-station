'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  LogIn,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  User,
  UserPlus,
} from 'lucide-react'
import {
  indianGstinSchema,
  indianPhoneSchema,
  indianPincodeSchema,
} from '@mobile-station/types'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'
import { useCart } from '@/components/CartContext'
import { useOptionalCustomerAuth } from '@/context/CustomerAuthContext'
import { formatINR } from '@/lib/format'
import {
  DEFAULT_ACCOUNT_PROFILE,
  persistStoredAccountProfile,
  readStoredAccountProfile,
  type CustomerAccountProfile,
  type PreferredHub,
} from '@/lib/account'
import { StorefrontChrome } from '@/components/StorefrontChrome'

export type { CustomerAccountProfile }

type AuthMode = 'signin' | 'register'

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
  const { totalCount, subtotalPaise } = useCart()
  const auth = useOptionalCustomerAuth()

  const [localHydrated, setLocalHydrated] = useState(false)
  const [localProfile, setLocalProfile] = useState<CustomerAccountProfile | null>(null)

  const [pincode, setPincode] = useState('842001')
  const [cityAddress, setCityAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [preferredHub, setPreferredHub] = useState<PreferredHub>('motijheel-842001')
  const [saving, setSaving] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const parsed = readStoredAccountProfile()
    if (parsed) {
      setLocalProfile(parsed)
    }
    setLocalHydrated(true)
  }, [])

  const authCustomer = auth?.customer ?? null
  const hydrated = auth ? auth.isHydrated : localHydrated

  const activeProfile = useMemo<CustomerAccountProfile | null>(() => {
    if (!auth) return localProfile
    if (!authCustomer) return null
    return {
      ...DEFAULT_ACCOUNT_PROFILE,
      fullName:
        [authCustomer.firstName, authCustomer.lastName].filter(Boolean).join(' ').trim() ||
        authCustomer.email,
      email: authCustomer.email,
      phone: authCustomer.phone || '',
      pincode: authCustomer.pincode || '842001',
      cityAddress: authCustomer.cityAddress || '',
      gstin: authCustomer.gstin || '',
      businessName: authCustomer.businessName || '',
      preferredHub: authCustomer.preferredHub || 'motijheel-842001',
      signedInAt: localProfile?.signedInAt || new Date().toISOString(),
    }
  }, [auth, authCustomer, localProfile])

  useEffect(() => {
    if (!activeProfile) return
    setPincode(activeProfile.pincode || '842001')
    setCityAddress(activeProfile.cityAddress || '')
    setGstin(activeProfile.gstin || '')
    setBusinessName(activeProfile.businessName || '')
    setPreferredHub(activeProfile.preferredHub || 'motijheel-842001')
  }, [activeProfile])

  const handleSaveDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeProfile) return

    const validationError = validateSavedBillingDetails({ pincode, gstin })
    if (validationError) {
      setSaveFeedback({ ok: false, text: validationError })
      return
    }

    const cleanedPin = pincode.trim() || '842001'
    const cleanedGstin = gstin.trim().toUpperCase()
    const cleanedCityAddress = cityAddress.trim()
    const cleanedBusinessName = businessName.trim()

    setSaving(true)
    setSaveFeedback(null)

    if (auth?.isAuthenticated) {
      const res = await auth.updateProfile({
        pincode: cleanedPin,
        cityAddress: cleanedCityAddress,
        gstin: cleanedGstin,
        businessName: cleanedBusinessName,
        preferredHub,
      })

      setSaving(false)
      if (!res.success) {
        setSaveFeedback({
          ok: false,
          text: res.error || 'Could not sync preferences to server. Please try again.',
        })
        return
      }
    } else {
      const updated: CustomerAccountProfile = {
        ...activeProfile,
        pincode: cleanedPin,
        cityAddress: cleanedCityAddress,
        gstin: cleanedGstin,
        businessName: cleanedBusinessName,
        preferredHub,
      }
      persistStoredAccountProfile(updated)
      setLocalProfile(updated)
      setSaving(false)
    }

    setGstin(cleanedGstin)
    setSaveFeedback({
      ok: true,
      text: 'Delivery PIN, hub preference, and B2B GSTIN details saved.',
    })
  }

  const handleSignOut = async () => {
    setSaveFeedback(null)
    if (auth) {
      await auth.logout()
    }
    persistStoredAccountProfile(null)
    setLocalProfile(null)
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
            {activeProfile ? `Welcome, ${activeProfile.fullName}` : 'Your Mobile Station Account'}
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
            Checking account session...
          </div>
        ) : !activeProfile ? (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-md border border-chrome-200 bg-surface-card p-6 sm:p-7 shadow-card space-y-5">
              <div className="space-y-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-ink-primary">
                  Sign in or create your customer account
                </h2>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  Sign in with your verified email and password to sync your 15-digit B2B GSTIN,
                  track IMEI-serialized invoices, and speed up Muzaffarpur Express Hub pickup.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <Link
                  href="/auth/login?redirect=/account"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-sm bg-obsidian-900 hover:bg-obsidian-800 px-5 py-2.5 text-sm font-bold text-gold-500 shadow-card transition"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>Sign In to Account</span>
                </Link>
                <Link
                  href="/auth/signup?redirect=/account"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-sm bg-gold-500 hover:bg-gold-600 px-5 py-2.5 text-sm font-bold text-obsidian-950 shadow-gold transition"
                >
                  <UserPlus className="h-4 w-4 shrink-0" />
                  <span>Create Account</span>
                </Link>
              </div>

              <div className="pt-3 border-t border-chrome-200 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-secondary">
                <span>Forgot your login password?</span>
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center gap-1 font-bold text-gold-700 hover:underline"
                >
                  <span>Recover Account Access</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
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
                <Link
                  href="/cart"
                  className="w-full inline-flex min-h-[44px] items-center justify-center rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition"
                >
                  Open Shopping Cart
                </Link>
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
                      Fast pickup at {MOBILE_STATION_BRAND.flagshipLocation.city} Hubs (842001 &amp;
                      842002).
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
                id="settings"
                onSubmit={handleSaveDetails}
                className="rounded-md border border-chrome-200 bg-surface-card p-5 sm:p-6 shadow-card space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-chrome-200 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-primary">
                      Delivery &amp; B2B GSTIN Settings
                    </h2>
                    <p className="text-xs text-ink-muted">
                      Signed in as{' '}
                      <span className="font-semibold text-ink-primary">{activeProfile.email}</span>
                      {activeProfile.phone ? ` · +91 ${activeProfile.phone}` : ''}
                      {authCustomer?.memberSince ? ` · Since ${authCustomer.memberSince}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/auth/reset-password?email=${encodeURIComponent(activeProfile.email)}`}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-gold-500 hover:text-ink-primary transition"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Password</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-gold-500 hover:text-ink-primary transition cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {saveFeedback ? (
                  <div
                    className={`rounded-sm px-3.5 py-2.5 text-xs font-medium ${
                      saveFeedback.ok
                        ? 'bg-commerce-obdBg text-commerce-obdText'
                        : 'bg-commerce-errorBg text-commerce-errorText'
                    }`}
                  >
                    {saveFeedback.text}
                  </div>
                ) : null}

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
                  disabled={saving}
                  className="min-h-[44px] rounded-sm bg-gold-500 px-5 py-2.5 text-xs font-bold text-obsidian-950 shadow-gold hover:bg-gold-600 transition disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Saving Preferences...' : 'Save Profile & GST Details'}
                </button>
              </form>

              <div
                id="orders"
                className="rounded-md border border-chrome-200 bg-surface-card p-5 sm:p-6 shadow-card space-y-3"
              >
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
                <Link
                  href="/cart"
                  className="w-full inline-flex min-h-[44px] items-center justify-center rounded-sm bg-obsidian-900 px-4 py-2 text-xs font-bold text-gold-500 hover:bg-obsidian-800 transition"
                >
                  Open Shopping Cart
                </Link>
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
