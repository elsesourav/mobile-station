import type { Metadata } from 'next'
import { AccountPageClient } from '@/components/AccountPageClient'

export const metadata: Metadata = {
  title: 'Account & Orders',
  description:
    'Sign in to manage your Mobile Station profile, saved Indian delivery PIN codes, 18% GST B2B GSTIN details, and orders.',
}

export default function AccountPage() {
  return <AccountPageClient />
}
