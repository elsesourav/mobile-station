import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  customerLoginSchema,
  customerPasswordResetRequestSchema,
  customerPasswordUpdateSchema,
  customerRegisterSchema,
} from '@mobile-station/types'
import {
  evaluatePasswordStrength,
  formatCustomerInitials,
  isValidIndianMobile,
  sanitizeRedirectPath,
  validateSignupStep1,
} from '../lib/auth-constants'

describe('Auth schemas and step validation helpers', () => {
  it('validates Indian mobile numbers and step-1 signup rules cleanly', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true)
    expect(isValidIndianMobile('5876543210')).toBe(false)
    expect(isValidIndianMobile('98765')).toBe(false)

    expect(
      validateSignupStep1({
        firstName: 'A',
        lastName: 'Kumar',
        email: 'aarav@example.com',
        phone: '9876543210',
      })
    ).toContain('first name')

    expect(
      validateSignupStep1({
        firstName: 'Aarav',
        lastName: 'Kumar',
        email: 'aarav@example.com',
        phone: '9876543210',
      })
    ).toBeNull()
  })

  it('scores password strength across weak, fair, good, and strong levels', () => {
    expect(evaluatePasswordStrength('')).toEqual({ score: 0, label: '' })
    expect(evaluatePasswordStrength('short')).toEqual({ score: 1, label: 'Weak' })
    expect(evaluatePasswordStrength('longlower')).toEqual({ score: 1, label: 'Weak' })
    expect(evaluatePasswordStrength('Longpass')).toEqual({ score: 2, label: 'Fair' })
    expect(evaluatePasswordStrength('Longpass1')).toEqual({ score: 3, label: 'Good' })
    expect(evaluatePasswordStrength('StrongPass@1')).toEqual({ score: 4, label: 'Strong' })
  })

  it('sanitizes redirect targets against open redirects and auth loops', () => {
    expect(sanitizeRedirectPath(null)).toBe('/account')
    expect(sanitizeRedirectPath('https://evil.example/phish')).toBe('/account')
    expect(sanitizeRedirectPath('//evil.example')).toBe('/account')
    expect(sanitizeRedirectPath('/auth/login')).toBe('/account')
    expect(sanitizeRedirectPath('/checkout?step=address')).toBe('/checkout?step=address')
    expect(sanitizeRedirectPath('/account')).toBe('/account')
  })

  it('formats customer initials and validates Zod auth contracts', () => {
    expect(formatCustomerInitials({ firstName: 'Aarav', lastName: 'Kumar' })).toBe('AK')
    expect(formatCustomerInitials({ email: 'buyer@mobilestation.in' })).toBe('BU')

    expect(
      customerRegisterSchema.safeParse({
        firstName: 'Aarav',
        lastName: 'Kumar',
        email: 'AARAV@Example.COM',
        phone: '9876543210',
        password: 'Password@123',
      }).success
    ).toBe(true)

    expect(
      customerLoginSchema.safeParse({ email: 'aarav@example.com', password: 'Password@123' })
        .success
    ).toBe(true)
    expect(customerPasswordResetRequestSchema.safeParse({ email: 'bad' }).success).toBe(false)
    expect(customerPasswordUpdateSchema.safeParse({ newPassword: '123' }).success).toBe(false)
  })
})

describe('Storefront Auth UI structural and token guardrails', () => {
  const authFiles = [
    '../app/auth/layout.tsx',
    '../app/auth/login/page.tsx',
    '../app/auth/signup/page.tsx',
    '../app/auth/forgot-password/page.tsx',
    '../app/auth/reset-password/page.tsx',
    '../components/auth/AuthCardHeader.tsx',
  ]

  it('contains all auth pages cleanly styled with semantic tokens and zero hardcoded hex colors', () => {
    for (const relPath of authFiles) {
      const absPath = path.resolve(__dirname, relPath)
      expect(existsSync(absPath)).toBe(true)
      const content = readFileSync(absPath, 'utf8')
      expect(content).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(content.toLowerCase()).not.toContain('glorov')
    }
  })

  it('enforces Mobile Station dark-header contrast for silver wordmark and policy links', () => {
    const headerCard = readFileSync(
      path.resolve(__dirname, '../components/auth/AuthCardHeader.tsx'),
      'utf8'
    )
    const signupSource = readFileSync(
      path.resolve(__dirname, '../app/auth/signup/page.tsx'),
      'utf8'
    )

    expect(headerCard).toContain('bg-obsidian-900')
    expect(headerCard).toContain('/brand/mobile-station-wordmark.png')
    expect(signupSource).toContain('/policies/terms-and-conditions')
    expect(signupSource).toContain('/policies/privacy-policy')
    expect(signupSource).toContain('/auth/login?')
  })
})
