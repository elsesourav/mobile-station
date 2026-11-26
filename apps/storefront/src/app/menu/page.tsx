import type { Metadata } from 'next'
import { MenuHubClient } from '@/components/menu/MenuHubClient'

export const metadata: Metadata = {
  title: 'Menu, Account & Electronics Services',
  description:
    'Browse Mobile Station electronics departments, orders, B2B GSTIN profile settings, Muzaffarpur pickup hubs, warranty support, and verified offers.',
}

export default function MenuPage() {
  return <MenuHubClient />
}
