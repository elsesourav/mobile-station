# Mobile Station — Design System & Style Guide

> **Version:** 1.0.0  
> **Brand Origin:** Mobile Station (Muzaffarpur, Bihar — Motijheel Road & Club Road Flagship Hubs)  
> **Domain:** Consumer Electronics, Smartphones, Tablets, Laptops, Audio & Tech Peripherals  
> **Canonical Sources:** [`tokens.css`](../../apps/storefront/src/styles/tokens.css) · [`globals.css`](../../apps/storefront/src/styles/globals.css) · [`tailwind.config.ts`](../../apps/storefront/tailwind.config.ts)

---

## 1. Brand Visual Philosophy

Mobile Station pairs the tactile prestige of our **Brushed Gold (`M`) + Metallic Chrome (`S`)** hardware emblem with a crisp, analytical retail surface inspired by top Indian electronics storefronts (Apple Store, Croma, Keychron, Anker).

### Four Core Principles
1. **Obsidian & Metallic Authority**: Primary navigation, flagship hero showcases, and footer anchors use **Precision Obsidian (`#0B0F17`)**, allowing the metallic gold-and-silver brand wordmark and product renders to stand out cleanly.
2. **High-Trust Retail Canvas**: Catalog grids, spec tables, comparison matrices, and checkout forms sit on **Studio Slate (`#F8FAFC`)** and **Pure Card White (`#FFFFFF`)** so shoppers can compare dense specs without visual fatigue.
3. **Zero Hardcoded Styles**: Every color, radius, shadow, z-index, and font variable originates in `apps/storefront/src/styles/tokens.css` and maps directly into `apps/storefront/tailwind.config.ts`.
4. **Electronics Commerce Clarity**: Tabular numbers (`tabular-nums`), prominent MRP vs Offer savings, No-Cost EMI badges, Official Brand Warranty pills, and 44×44px mobile touch targets.

---

## 2. Three-Layer Token Pipeline

```
apps/storefront/src/styles/tokens.css   (Layer 1: CSS Custom Properties)
        │
        ▼
apps/storefront/tailwind.config.ts      (Layer 2: Semantic Tailwind Utilities)
        │
        ▼
apps/storefront/src/components/ui/*     (Layer 3: Reusable UI Primitives)
```

---

## 3. Color Palette Specification

### 3.1 Brand & Surface Tokens

| Token | CSS Variable | Hex | Role | Contrast / Rule |
|---|---|---|---|---|
| **Obsidian 950** | `--color-obsidian-950` | `#06090F` | Footer base, splash screen | AAA with `#F8FAFC` text |
| **Obsidian 900** | `--color-obsidian-900` | `#0B0F17` | Header, hero backdrop, dark badges | Primary dark brand surface |
| **Obsidian 800** | `--color-obsidian-800` | `#131A26` | Mega-menu panel, dark spec cards | Elevated dark container |
| **Obsidian 700** | `--color-obsidian-700` | `#1E293B` | Secondary dark CTA / active chip | High-contrast slate |
| **Brushed Gold 500** | `--color-gold-500` | `#E5A01D` | Primary accent on Obsidian surfaces | Use with `#0B0F17` dark text only |
| **Brushed Gold 600** | `--color-gold-600` | `#C9830B` | Gold button hover / active state | Use with `#0B0F17` dark text |
| **Safe Gold 700** | `--color-gold-700` | `#A16207` | Gold link/label on `#FFFFFF` | WCAG AA on white |
| **Chrome 200 / 300** | `--color-chrome-200` / `300` | `#E2E8F0` / `#CBD5E1` | Hardware hairline borders & inputs | Matches brushed silver `S` |
| **Studio Canvas** | `--color-surface-canvas` | `#F8FAFC` | Main storefront page background | Crisp daylight retail canvas |
| **Card White** | `--color-surface-card` | `#FFFFFF` | Product cards, buy box, spec sheet | Clean hardware framing |
| **Spec Muted** | `--color-surface-muted` | `#F1F5F9` | Zebra spec table rows & pill surfaces | Subtle separation |

### 3.2 Commerce, Trust & Compliance Semantic Tokens

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| **Savings / EMI Green** | `--color-price-savings` | `#047857` | `% OFF`, Bank Discount, No-Cost EMI label |
| **Flash Deal Red** | `--color-badge-deal-bg` | `#DC2626` | Limited-time price drops, exchange bonuses |
| **Brand Warranty Bg** | `--color-warranty-bg` | `#EFF6FF` | "1 Year Brand Authorized Warranty" pill |
| **Brand Warranty Ink** | `--color-warranty-text` | `#1D4ED8` | Warranty text & check icon |
| **Open-Box Delivery Bg** | `--color-obd-bg` | `#ECFDF5` | "Open-Box Inspection Available" badge |
| **Open-Box Delivery Ink** | `--color-obd-text` | `#065F46` | OBD shield icon & label |

---

## 4. Typography & Numeric Discipline

- **Display / Headings (`font-display`)**: `Space Grotesk` (`700`, tight `-0.025em` tracking) — geometric precision suited to consumer hardware.
- **Body / UI (`font-sans`)**: `Inter` (`400` / `500` / `600`) — maximum legibility in dense specification tables, pincode fields, and GST checkout forms.
- **Specs / SKUs / Prices (`font-mono` / `.tabular-nums`)**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` so columns of storage capacities (`128GB`, `256GB`, `512GB`), clock speeds, HSN codes (`8517`, `8471`), and `₹` prices align vertically without jitter.

---

## 5. Geometry, Elevation & Touch Rules

- **Hardware Radii**:
  - Inputs & compact spec chips: `8px` (`rounded-sm`)
  - Product cards & comparison drawers: `12px` (`rounded-md`)
  - Hero cards & promo banners: `16px`–`20px` (`rounded-lg` / `rounded-xl`)
  - Filter pills & variant chips: `9999px` (`rounded-full`)
- **Touch Ergonomics**: All buttons, variant chips, quantity steppers, and filter toggles MUST maintain a minimum `44px` height/touch target on mobile viewports (`< 768px`).
- **Accessibility**: Keyboard focus rings always render a crisp `2px solid var(--color-gold-500)` ring (`:focus-visible`).

---

## 6. Logo & Favicon Asset Usage Rules

1. **Dark Header / Footer / Splash**: Use `/brand/mobile-station-wordmark.png` (2084×571 trimmed) alongside `/brand/mobile-station-icon.png` (MS emblem) on `bg-obsidian-900` (`#0B0F17`).
2. **Never place the brushed silver `STATION` text directly on bright white without contrast backing**, as metallic silver highlights blend into `#FFFFFF`. Always anchor the primary navbar & brand strip in Obsidian (`#0B0F17`) or inside an Obsidian pill container.
3. **Favicons & PWA**: Configured automatically via `apps/storefront/public/favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icons/icon-192.png`, `icons/icon-512.png`, and `manifest.json`.
