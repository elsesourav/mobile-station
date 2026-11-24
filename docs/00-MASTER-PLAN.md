# Mobile Station — Master Research & Build Plan

> **Brand:** Mobile Station (Muzaffarpur, Bihar — Motijheel Road `842001` & Club Road `842002`, Shipping Pan-India)  
> **Reference Architecture:** Inspired by `/Users/sourav/Developer/WEB/top-projects/glorov` (Medusa v2 + Next.js 15 + pnpm/Turborepo), redesigned and cleaned up specifically for **Online Electronics & Accessories Retail** with **100% separated APIs and storage layers**.

---

## 1. Strategic Differences & Improvements Over GLOROV

| Dimension | GLOROV (Reference) | Mobile Station (Upgraded Blueprint) |
|---|---|---|
| **Domain** | Seeds & Live Plants (Perishables) | Smartphones, Tablets, Laptops, Audio, Peripherals, Power & Accessories |
| **Root Cleanup** | Legacy `02-website/`, `flutter/`, `scratch/`, local `medusa.db` | Clean `apps/` + `packages/` + `data/` + `docs/` + `scripts/` + `deploy/` only; PostgreSQL-only persistence |
| **Image vs Binary Storage** | Single Cloudinary module for images | **Strictly split**: **Cloudinary** for public optimized images/banners ONLY + **S3/R2/MinIO** private bucket for GST Invoice PDFs, warranty cards, CSV imports, unboxing proof videos & DB backups |
| **Catalog Search** | SQL LIKE / JS filter | Dedicated **Meilisearch** service (`localhost:7700`) for typo-tolerant instant search + dynamic numeric spec facets (`RAM`, `SSD`, `Wattage`, `Switch`) |
| **India Compliance** | 0%–18% agri/garden GST | **18% Electronics GST** + HSN classification + optional **15-digit B2B GSTIN** capture + **IMEI/Serial** tracking + **Open-Box Delivery (OBD)** for orders ≥ ₹25,000 |
| **Payment & COD** | ₹5,000 COD cap | **Razorpay** (UPI, Cards, **No-Cost EMI / Affordability Widget**) + ₹10,000 COD cap with SMS OTP safeguard |
| **Local Infra Ports** | Postgres `5432`, Redis `6379` | Isolated ports (`5434` Postgres, `6380` Redis, `7700` Meilisearch, `9100` MinIO S3) so GLOROV & Mobile Station never collide |

---

## 2. Phased Implementation Roadmap

### Phase 0 — Research, Folder Organization, Branding, Skills & Data (**Completed Now**)
- [x] Research electronics e-commerce taxonomy, Indian GST/HSN codes, Baymard spec UX, Razorpay EMI, and Open-Box Delivery rules.
- [x] Research **Mobile Station (Muzaffarpur, Bihar)** context and anchor pickup/store support (`842001` / `842002`).
- [x] Generate crisp favicons (`favicon.ico`, `16x16`, `32x32`, `512x512`), `apple-touch-icon.png`, PWA icons (`192`, `512`, maskable), `manifest.json`, and `og-image.png` from `/Users/sourav/Developer/WEB/top-projects/mobile-station/mobile-station-icon.png` and `mobile-station-name.png`.
- [x] Define Design System & Style Markdown ([DESIGN-SYSTEM.md](./style/DESIGN-SYSTEM.md), [UI-ARCHITECTURE.md](./style/UI-ARCHITECTURE.md)), CSS tokens, and Tailwind config.
- [x] Create Antigravity Workspace Rules (`GEMINI.md`, `AGENTS.md`) and 4 focused Workspace Skills under `.agents/skills/`.
- [x] Prepare structured electronics taxonomy, brand registry, facet spec schemas, storefront banners/trust badges, and 13 starter multi-variant products in `data/`.
- [x] Document every separated API & credential needed in [02-SEPARATED-APIS-AND-CREDENTIALS-GUIDE.md](./02-SEPARATED-APIS-AND-CREDENTIALS-GUIDE.md).

### Phase 1 — Infrastructure & Medusa v2 Backend (`apps/backend`)
- Boot isolated local stack (`pnpm infra:up`: PostgreSQL 16, Redis 7, Meilisearch, MinIO S3).
- Initialize Medusa v2 project in `apps/backend/` with strict startup environment validation.
- Implement separated modules:
  1. `file-cloudinary` (Public optimized images ONLY)
  2. `storage-s3` (Private S3/R2 service for GST PDFs, warranty docs, CSVs, backups via presigned URLs)
  3. `search-meilisearch` (Auto-indexing subscriber syncing product specs & facets)
  4. `payment-razorpay` (Orders, UPI, Cards, EMI, HMAC webhook verification) + `payment-cod` (₹10,000 cap + OTP flag)
  5. `fulfillment-shiprocket` (Muzaffarpur `842001` hub pickup, pincode ETA, high-value insurance & OBD tags)
  6. `gst-invoice` (Automated CGST+SGST / IGST PDF generator uploaded to private S3/R2)
  7. `notification-email` & `notification-sms` (Resend + MSG91)
- Run catalog seed importer reading directly from `data/taxonomy/*` and `data/catalog/products-seed.json`.

### Phase 2 — Next.js 15 Storefront (`apps/storefront`)
- Build Obsidian + Brushed Gold + Chrome Studio storefront consuming `tokens.css` & `@mobile-station/types`.
- Implement Multi-Tier Obsidian Header, Mega-Menu, and instant Meilisearch command/search bar.
- Implement Category PLP with dynamic category-specific spec filters (RAM/SSD for laptops, Wattage for GaN chargers, Switch Type for keyboards).
- Implement Product Cards with interactive color/storage variant swatches, warranty pill, and Compare `+` button.
- Implement PDP with sticky buy box, Razorpay Affordability/EMI preview, inline Pincode + OBD + Muzaffarpur pickup checker, "What's in the Box", and accordion full spec table.
- Implement side-by-side Product Comparison matrix (`/compare`).
- Implement Cart Drawer + Checkout with **B2B GSTIN toggle**, Razorpay/EMI, and order confirmation with presigned GST PDF download.

### Phase 3 — Verification, Testing & Production Deployment
- 3-Tier Testing: Vitest (storefront), Jest unit & HTTP integration against Postgres/Redis/Meilisearch/MinIO, Playwright E2E + multi-viewport visual audit (`360×800`, `390×844`, `768×1024`, `1440×900`).
- Production deployment topology: Vercel (`apps/storefront`), Docker/Caddy VPS or Railway (`apps/backend`), Managed Postgres (Supabase/Neon), Upstash Redis, Meilisearch Cloud, Dedicated Cloudinary, Cloudflare R2.
