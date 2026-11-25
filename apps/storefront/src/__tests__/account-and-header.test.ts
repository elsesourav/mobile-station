import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  validateAccountProfileInput,
  validateSavedBillingDetails,
} from '../components/AccountPageClient'

describe('Account profile and GSTIN validation helpers', () => {
  it('validates registration inputs including Indian mobile numbers', () => {
    expect(
      validateAccountProfileInput({
        mode: 'register',
        fullName: 'A',
        email: 'aarav@example.com',
        phone: '9876543210',
      })
    ).toContain('full name')

    expect(
      validateAccountProfileInput({
        mode: 'register',
        fullName: 'Aarav Kumar',
        email: 'invalid-email',
        phone: '9876543210',
      })
    ).toContain('email')

    expect(
      validateAccountProfileInput({
        mode: 'register',
        fullName: 'Aarav Kumar',
        email: 'aarav@example.com',
        phone: '1234567890',
      })
    ).toContain('mobile')

    expect(
      validateAccountProfileInput({
        mode: 'register',
        fullName: 'Aarav Kumar',
        email: 'aarav@example.com',
        phone: '9876543210',
      })
    ).toBeNull()
  })

  it('validates sign-in inputs with optional phone number', () => {
    expect(
      validateAccountProfileInput({
        mode: 'signin',
        fullName: '',
        email: 'buyer@mobilestation.in',
        phone: '',
      })
    ).toBeNull()
  })

  it('validates Indian 6-digit PIN codes and optional 15-char GSTIN', () => {
    expect(validateSavedBillingDetails({ pincode: '842001', gstin: '' })).toBeNull()
    expect(validateSavedBillingDetails({ pincode: '842001', gstin: '10AABCU9603R1ZM' })).toBeNull()
    expect(validateSavedBillingDetails({ pincode: '042001', gstin: '' })).toContain('PIN')
    expect(validateSavedBillingDetails({ pincode: '842001', gstin: 'BADGST' })).toContain('GSTIN')
  })
})

describe('Header chrome constraints', () => {
  const headerSource = readFileSync(
    path.resolve(__dirname, '../components/layout/Header.tsx'),
    'utf8'
  )
  const searchHeaderSource = readFileSync(
    path.resolve(__dirname, '../components/search/SearchClientView.tsx'),
    'utf8'
  )

  it('removes the top 3px gold/orange bar from Header and SearchClientView', () => {
    expect(headerSource).not.toContain('h-[3px] w-full bg-gold-500')
    expect(searchHeaderSource).not.toContain('h-[3px] w-full bg-gold-500')
  })

  it('shows only Account and Cart actions in the Header top right', () => {
    expect(headerSource).toContain('href="/account"')
    expect(headerSource).toContain('<span>Account</span>')
    expect(headerSource).toContain('<span>Cart</span>')
    expect(headerSource).not.toContain('Video Reviews')
    expect(headerSource).not.toContain('Store Gallery')
    expect(headerSource).not.toContain('Offers &amp; GST')
  })
})
