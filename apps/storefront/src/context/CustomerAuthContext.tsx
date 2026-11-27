'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  AuthAddressItem,
  AuthCustomerUser,
  CustomerProfileUpdateInput,
  CustomerRegisterInput,
} from '@mobile-station/types'
import { persistStoredAccountProfile, type CustomerAccountProfile } from '@/lib/account'

interface AuthActionResult {
  success: boolean
  error?: string
}

interface CustomerAuthContextValue {
  customer: AuthCustomerUser | null
  addresses: AuthAddressItem[]
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  authError: string | null
  login: (email: string, password: string) => Promise<AuthActionResult>
  register: (input: CustomerRegisterInput) => Promise<AuthActionResult>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<AuthActionResult>
  resetPassword: (
    email: string,
    newPassword: string,
    resetToken?: string
  ) => Promise<AuthActionResult>
  updateProfile: (input: CustomerProfileUpdateInput) => Promise<AuthActionResult>
  refreshSession: () => Promise<void>
  clearError: () => void
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

function syncCustomerToLocalProfile(user: AuthCustomerUser): void {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
  const mapped: CustomerAccountProfile = {
    fullName,
    email: user.email,
    phone: user.phone || '',
    pincode: user.pincode || '842001',
    cityAddress: user.cityAddress || '',
    gstin: user.gstin || '',
    businessName: user.businessName || '',
    preferredHub: user.preferredHub || 'motijheel-842001',
    signedInAt: new Date().toISOString(),
  }
  persistStoredAccountProfile(mapped)
}

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [customer, setCustomer] = useState<AuthCustomerUser | null>(null)
  const [addresses, setAddresses] = useState<AuthAddressItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const data = (await res.json().catch(() => ({}))) as {
        authenticated?: boolean
        customer?: AuthCustomerUser | null
        addresses?: AuthAddressItem[]
      }

      if (res.ok && data.authenticated && data.customer) {
        setCustomer(data.customer)
        setAddresses(Array.isArray(data.addresses) ? data.addresses : [])
        syncCustomerToLocalProfile(data.customer)
      } else {
        setCustomer(null)
        setAddresses([])
      }
    } catch {
      setCustomer(null)
      setAddresses([])
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      setIsLoading(true)
      setAuthError(null)

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        })

        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
          customer?: AuthCustomerUser
          addresses?: AuthAddressItem[]
        }

        if (res.ok && data.success && data.customer) {
          setCustomer(data.customer)
          setAddresses(Array.isArray(data.addresses) ? data.addresses : [])
          syncCustomerToLocalProfile(data.customer)
          setIsLoading(false)
          return { success: true }
        }

        const error = data.error || 'Invalid email or password.'
        setAuthError(error)
        setIsLoading(false)
        return { success: false, error }
      } catch (err: unknown) {
        const error =
          err instanceof Error
            ? err.message
            : 'Unable to reach Mobile Station authentication service.'
        setAuthError(error)
        setIsLoading(false)
        return { success: false, error }
      }
    },
    []
  )

  const register = useCallback(async (input: CustomerRegisterInput): Promise<AuthActionResult> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
      }

      if (res.ok && data.success) {
        setIsLoading(false)
        return { success: true }
      }

      const error = data.error || 'Registration failed. Please check your details.'
      setAuthError(error)
      setIsLoading(false)
      return { success: false, error }
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : 'Unable to reach registration server. Try again.'
      setAuthError(error)
      setIsLoading(false)
      return { success: false, error }
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setCustomer(null)
    setAddresses([])
    setAuthError(null)
    persistStoredAccountProfile(null)

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore network errors while clearing client session state
    }
  }, [])

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthActionResult> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
      }

      setIsLoading(false)
      if (res.ok && data.success) {
        return { success: true }
      }

      const error = data.error || 'Failed to dispatch password recovery instructions.'
      setAuthError(error)
      return { success: false, error }
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : 'Failed to dispatch password recovery link.'
      setAuthError(error)
      setIsLoading(false)
      return { success: false, error }
    }
  }, [])

  const resetPassword = useCallback(
    async (
      email: string,
      newPassword: string,
      resetToken?: string
    ): Promise<AuthActionResult> => {
      setIsLoading(true)
      setAuthError(null)

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: email.trim().toLowerCase() || undefined,
            newPassword,
            token: resetToken || undefined,
          }),
        })

        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
        }

        setIsLoading(false)
        if (res.ok && data.success) {
          return { success: true }
        }

        const error = data.error || 'Failed to update password.'
        setAuthError(error)
        return { success: false, error }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Failed to update password.'
        setAuthError(error)
        setIsLoading(false)
        return { success: false, error }
      }
    },
    []
  )

  const updateProfile = useCallback(
    async (input: CustomerProfileUpdateInput): Promise<AuthActionResult> => {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(input),
        })

        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean
          customer?: AuthCustomerUser
          error?: string
        }

        if (res.ok && data.success && data.customer) {
          setCustomer(data.customer)
          syncCustomerToLocalProfile(data.customer)
          return { success: true }
        }

        return { success: false, error: data.error || 'Failed to update profile.' }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Failed to save profile details.'
        return { success: false, error }
      }
    },
    []
  )

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      addresses,
      isAuthenticated: Boolean(customer),
      isHydrated,
      isLoading,
      authError,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      refreshSession,
      clearError,
    }),
    [
      customer,
      addresses,
      isHydrated,
      isLoading,
      authError,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      refreshSession,
      clearError,
    ]
  )

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) {
    throw new Error('useCustomerAuth must be used inside a CustomerAuthProvider')
  }
  return ctx
}

export function useOptionalCustomerAuth(): CustomerAuthContextValue | null {
  return useContext(CustomerAuthContext)
}
