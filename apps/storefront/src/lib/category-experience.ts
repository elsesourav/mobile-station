import type { ElectronicsRootCategory } from '@mobile-station/types'
import specSchemasData from '../../../../data/taxonomy/spec-schemas.json'
import type { CategoryExperienceProfile } from '@/types/category'

const SCHEMA_FILTERS = specSchemasData.facet_schemas_by_category as Record<
  string,
  { filters?: string[]; quick_card_specs?: string[]; compare_fields?: string[] }
>

export const CATEGORY_EXPERIENCE_PROFILES: Record<
  ElectronicsRootCategory,
  CategoryExperienceProfile
> = {
  smartphones: {
    handle: 'smartphones',
    eyebrow: 'IMEI-VERIFIED 5G SMARTPHONES',
    headline: 'Flagship & Value 5G Smartphones',
    searchPlaceholder: 'Search iPhone, Galaxy, Snapdragon, 256GB...',
    buyerAssurances: [
      {
        title: 'IMEI Serialized GST Invoice',
        detail: 'Every handset carries sealed IMEI billing eligible for 18% GST credit.',
      },
      {
        title: 'Open-Box Courier Verification',
        detail: 'Inspect seal, IMEI match & screen before OTP confirmation on phones ₹25k+.',
      },
      {
        title: 'Same-Day Muzaffarpur Hub',
        detail: '2-hour pickup or insured dispatch from Motijheel (842001) & Club Road.',
      },
    ],
    priceBands: [
      { id: 'under_25k', label: 'Under ₹25,000', minPaise: 0, maxPaise: 2500000 },
      { id: '25k_50k', label: '₹25,000 – ₹50,000', minPaise: 2500000, maxPaise: 5000000 },
      { id: '50k_90k', label: '₹50,000 – ₹90,000', minPaise: 5000000, maxPaise: 9000000 },
      { id: 'above_90k', label: 'Above ₹90,000', minPaise: 9000000, maxPaise: null },
    ],
    specFilterKeys: [
      'ram_gb',
      'storage_gb',
      'refresh_rate_hz',
      'charging_watt',
      'network',
      ...(SCHEMA_FILTERS.smartphones?.filters ?? []),
    ],
    quickPresets: [
      {
        id: 'flagship_pro',
        label: 'Flagship (₹50k+)',
        priceBandIds: ['50k_90k', 'above_90k'],
      },
      {
        id: 'mid_range',
        label: 'Mid-Range',
        priceBandIds: ['25k_50k'],
      },
      {
        id: '12gb_multitask',
        label: '12GB+ RAM',
        specs: { ram_gb: ['12'] },
      },
      {
        id: '120hz_amoled',
        label: '120Hz Display',
        specs: { refresh_rate_hz: ['120'] },
      },
    ],
    pairingCategoryHandles: ['audio', 'power-charging', 'accessories-storage'],
    pairingTitle: 'Complete Your Smartphone Setup',
    pairingSubtitle: 'Pair with MagSafe armor, GaN PD chargers & Hi-Res TWS earbuds',
  },
  tablets: {
    handle: 'tablets',
    eyebrow: 'IPADS, ANDROID TABS & CREATOR SLATES',
    headline: 'Tablets, E-Readers & Stylus Displays',
    searchPlaceholder: 'Search iPad, Galaxy Tab, M2, Stylus...',
    buyerAssurances: [
      {
        title: 'Serial Tracked Dispatch',
        detail: 'Official Apple & Android brand serial verification prior to shipping.',
      },
      {
        title: 'Creator & Study Ready',
        detail: 'Apple Pencil, Xiaomi Smart Pen & S-Pen compatible displays verified.',
      },
      {
        title: '7-Day Sealed Replacement',
        detail: 'Fast hub support for manufacturing defects & insured Open-Box checks.',
      },
    ],
    priceBands: [
      { id: 'under_28k', label: 'Under ₹28,000', minPaise: 0, maxPaise: 2800000 },
      { id: '28k_48k', label: '₹28,000 – ₹48,000', minPaise: 2800000, maxPaise: 4800000 },
      { id: 'above_48k', label: 'Above ₹48,000', minPaise: 4800000, maxPaise: null },
    ],
    specFilterKeys: [
      'ram_gb',
      'storage_gb',
      'refresh_rate_hz',
      'display_size_inches',
      'stylus_support',
      'os',
    ],
    quickPresets: [
      {
        id: 'apple_ipad',
        label: 'Apple iPads',
        subcategories: ['apple-ipads'],
      },
      {
        id: 'high_refresh_tab',
        label: '90Hz / 144Hz Display',
        specs: { refresh_rate_hz: ['90', '144'] },
      },
      {
        id: 'stylus_ready',
        label: 'Stylus Supported',
        specs: { stylus_support: ['true'] },
      },
    ],
    pairingCategoryHandles: ['keyboards-mice', 'power-charging', 'audio'],
    pairingTitle: 'Productivity Gear for Your Tablet',
    pairingSubtitle: 'Turn your tablet into a portable workstation with keyboards & GaN power',
  },
  laptops: {
    handle: 'laptops',
    eyebrow: 'MACBOOKS, RTX GAMING RIGS & OLED MONITORS',
    headline: 'Performance Laptops & Workstations',
    searchPlaceholder: 'Search MacBook M3, RTX 4050, OLED, 512GB SSD...',
    buyerAssurances: [
      {
        title: '18% GST Business Input Credit',
        detail: 'Full B2B GSTIN invoicing on laptops & monitors for studios and firms.',
      },
      {
        title: 'Insured Open-Box Check',
        detail: 'Verify laptop chassis seal, charger brick & serial before handoff.',
      },
      {
        title: 'Apple M3, Intel HX & Ryzen',
        detail: 'Verified RAM & NVMe SSD tiers configured for coding, gaming & design.',
      },
    ],
    priceBands: [
      { id: 'under_50k', label: 'Under ₹50,000', minPaise: 0, maxPaise: 5000000 },
      { id: '50k_85k', label: '₹50,000 – ₹85,000', minPaise: 5000000, maxPaise: 8500000 },
      { id: 'above_85k', label: 'Above ₹85,000', minPaise: 8500000, maxPaise: null },
    ],
    specFilterKeys: [
      'processor_brand',
      'use_case',
      'ram_gb',
      'ssd_gb',
      'refresh_rate_hz',
      'os',
    ],
    quickPresets: [
      {
        id: 'apple_m3',
        label: 'Apple MacBooks',
        specs: { processor_brand: ['Apple'] },
      },
      {
        id: 'gaming_rtx',
        label: 'RTX Gaming Rigs',
        specs: { use_case: ['gaming'] },
      },
      {
        id: 'ultrabooks',
        label: 'Thin Ultrabooks',
        specs: { use_case: ['ultrabook'] },
      },
      {
        id: 'monitors_180',
        label: 'Monitors',
        subcategories: ['monitors'],
      },
    ],
    pairingCategoryHandles: ['keyboards-mice', 'power-charging', 'accessories-storage'],
    pairingTitle: 'Essential Workstation Add-Ons',
    pairingSubtitle: 'Complete your desk with mechanical keyboards, USB-C hubs & NVMe SSDs',
  },
  audio: {
    handle: 'audio',
    eyebrow: 'ACTIVE NOISE CANCELLING, TWS & PORTABLE AUDIO',
    headline: 'Earphones, ANC Headphones & Speakers',
    searchPlaceholder: 'Search WH-1000XM5, AirPods, LDAC, Buds...',
    buyerAssurances: [
      {
        title: 'Codec & ANC Verified Specs',
        detail: 'Filter by LDAC, aptX Adaptive, AAC, Active Noise Cancellation & IP rating.',
      },
      {
        title: 'Zero Fake Clones Guarantee',
        detail: '100% authorized Sony, Apple, Sennheiser, OnePlus, JBL & boAt retail boxes.',
      },
      {
        title: 'Demo Lounge Available',
        detail: 'Compare comfort & sound signatures live at Motijheel Hub, Muzaffarpur.',
      },
    ],
    priceBands: [
      { id: 'under_2k', label: 'Under ₹2,000', minPaise: 0, maxPaise: 200000 },
      { id: '2k_8k', label: '₹2,000 – ₹8,000', minPaise: 200000, maxPaise: 800000 },
      { id: '8k_20k', label: '₹8,000 – ₹20,000', minPaise: 800000, maxPaise: 2000000 },
      { id: 'above_20k', label: 'Above ₹20,000', minPaise: 2000000, maxPaise: null },
    ],
    specFilterKeys: ['form_factor', 'anc', 'connector', 'water_resistance'],
    quickPresets: [
      {
        id: 'anc_active',
        label: 'ANC Audio',
        specs: { anc: ['true'] },
      },
      {
        id: 'tws_buds',
        label: 'TWS Earbuds',
        specs: { form_factor: ['tws_earbuds'] },
      },
      {
        id: 'over_ear',
        label: 'Over-Ear',
        specs: { form_factor: ['over_ear'] },
      },
      {
        id: 'budget_audio',
        label: 'Under ₹2,000',
        priceBandIds: ['under_2k'],
      },
    ],
    pairingCategoryHandles: ['smartphones', 'power-charging', 'laptops'],
    pairingTitle: 'Devices Built for High-Res Audio',
    pairingSubtitle: 'Explore flagship phones, laptops & PD fast chargers',
  },
  'keyboards-mice': {
    handle: 'keyboards-mice',
    eyebrow: 'MECHANICAL QMK/VIA KEYBOARDS & PRECISION MICE',
    headline: 'Desk Peripherals, Switches & Gaming Gear',
    searchPlaceholder: 'Search Keychron, Logitech MX, 8000Hz, Mechanical...',
    buyerAssurances: [
      {
        title: 'Verified Switch & Polling Specs',
        detail: 'Filter easily by Tactile/Optical switches, QMK/VIA layout & polling rates.',
      },
      {
        title: 'macOS & Windows Ready',
        detail: 'Dual-OS keycaps and multi-host Bluetooth + 2.4GHz receivers detailed cleanly.',
      },
      {
        title: 'Genuine Logitech, Razer & Keychron',
        detail: 'Brand-authorized Indian units with GST tax invoicing.',
      },
    ],
    priceBands: [
      { id: 'under_2k', label: 'Under ₹2,000', minPaise: 0, maxPaise: 200000 },
      { id: '2k_7k', label: '₹2,000 – ₹7,000', minPaise: 200000, maxPaise: 700000 },
      { id: 'above_7k', label: 'Above ₹7,000', minPaise: 700000, maxPaise: null },
    ],
    specFilterKeys: [
      'peripheral_type',
      'switch_type',
      'connectivity',
      'layout',
      'hot_swappable',
      'backlight',
    ],
    quickPresets: [
      {
        id: 'mech_keyboards',
        label: 'Mechanical Keyboards',
        specs: { peripheral_type: ['keyboard'] },
      },
      {
        id: 'wireless_mice',
        label: 'Precision Mice',
        specs: { peripheral_type: ['mouse'] },
      },
      {
        id: 'hot_swap',
        label: 'Hot-Swappable',
        specs: { hot_swappable: ['true'] },
      },
      {
        id: 'rgb_gear',
        label: 'RGB Backlit',
        specs: { backlight: ['RGB'] },
      },
    ],
    pairingCategoryHandles: ['laptops', 'accessories-storage', 'power-charging'],
    pairingTitle: 'Complete Your Desk Setup',
    pairingSubtitle: 'Pair with laptops, high-speed USB-C docks & portable NVMe SSDs',
  },
  'power-charging': {
    handle: 'power-charging',
    eyebrow: 'BIS-CERTIFIED GaN PD CHARGERS & 20000MAH POWER',
    headline: 'Fast Chargers, Power Banks & USB-C Docks',
    searchPlaceholder: 'Search 65W GaN, 20000mAh, 100W Cable, Anker...',
    buyerAssurances: [
      {
        title: '100% BIS Safety Certified',
        detail: 'Genuine surge protection with USB-PD 3.0, PPS & SuperVOOC protocols.',
      },
      {
        title: 'Exact Wattage Verification',
        detail: 'Filter 20W mobile bricks up to 100W laptop PD cables and multi-port hubs.',
      },
      {
        title: '10-Day Fast Replacement',
        detail: 'Protected against adapter & cable defects with serialized retail packaging.',
      },
    ],
    priceBands: [
      { id: 'under_1500', label: 'Under ₹1,500', minPaise: 0, maxPaise: 150000 },
      { id: '1500_3500', label: '₹1,500 – ₹3,500', minPaise: 150000, maxPaise: 350000 },
      { id: 'above_3500', label: 'Above ₹3,500', minPaise: 350000, maxPaise: null },
    ],
    specFilterKeys: ['device_type', 'output_wattage', 'bis_certified'],
    quickPresets: [
      {
        id: 'gan_adapters',
        label: 'GaN Fast Chargers',
        specs: { device_type: ['gan_charger'] },
      },
      {
        id: 'power_banks',
        label: 'Power Banks',
        specs: { device_type: ['power_bank'] },
      },
      {
        id: 'high_watt_pd',
        label: '45W – 100W High Output',
        specs: { output_wattage: ['45', '65', '100'] },
      },
      {
        id: 'cables_docks',
        label: 'Cables & USB-C Hubs',
        specs: { device_type: ['cable', 'hub_dock'] },
      },
    ],
    pairingCategoryHandles: ['smartphones', 'laptops', 'accessories-storage'],
    pairingTitle: 'Flagship Devices Powered Right',
    pairingSubtitle: 'Explore smartphones, MacBooks & MagSafe protective accessories',
  },
  'accessories-storage': {
    handle: 'accessories-storage',
    eyebrow: 'MAGSAFE CASES, NVME SSDS & SMARTWATCHES',
    headline: 'Protection, High-Speed Storage & Wearables',
    searchPlaceholder: 'Search Spigen, 1TB SSD, Watch, EZ-Fit Glass...',
    buyerAssurances: [
      {
        title: 'Genuine Spigen, SanDisk & OEM',
        detail: 'Authentic serial-verified NVMe SSDs, 9H glass & AMOLED smartwatches.',
      },
      {
        title: 'Device Fit Guarantee',
        detail: 'Exact MagSafe & iPhone 16 / Pro model compatibility labeled upfront.',
      },
      {
        title: '10-Day Hub Replacement',
        detail: 'Ready replacement & in-store installation help at Muzaffarpur hubs.',
      },
    ],
    priceBands: [
      { id: 'under_2k', label: 'Under ₹2,000', minPaise: 0, maxPaise: 200000 },
      { id: '2k_10k', label: '₹2,000 – ₹10,000', minPaise: 200000, maxPaise: 1000000 },
      { id: 'above_10k', label: 'Above ₹10,000', minPaise: 1000000, maxPaise: null },
    ],
    specFilterKeys: [
      'accessory_type',
      'capacity_gb',
      'magsafe_compatible',
      'interface',
      'water_resistance',
    ],
    quickPresets: [
      {
        id: 'magsafe_gear',
        label: 'MagSafe Cases',
        specs: { magsafe_compatible: ['true'] },
      },
      {
        id: 'nvme_storage',
        label: 'Portable SSD & Drives',
        specs: { accessory_type: ['ssd_hdd', 'pen_drive_sd'] },
      },
      {
        id: 'smartwatches',
        label: 'AMOLED Smartwatches',
        specs: { accessory_type: ['smartwatch'] },
      },
    ],
    pairingCategoryHandles: ['smartphones', 'laptops', 'power-charging'],
    pairingTitle: 'Top Devices & Chargers to Pair With',
    pairingSubtitle: 'Shop sealed smartphones, laptops & GaN power adapters',
  },
}

export function getCategoryExperienceProfile(
  categoryHandle: string
): CategoryExperienceProfile {
  if (categoryHandle in CATEGORY_EXPERIENCE_PROFILES) {
    return CATEGORY_EXPERIENCE_PROFILES[categoryHandle as ElectronicsRootCategory]
  }
  return CATEGORY_EXPERIENCE_PROFILES.smartphones
}
