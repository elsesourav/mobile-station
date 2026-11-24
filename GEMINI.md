# Mobile Station — Workspace Rules

Mobile Station is an Indian direct-to-consumer (D2C) electronics & tech accessories e-commerce monorepo (`pnpm` workspaces + Turborepo + Medusa v2 + Next.js 15 App Router), originated in **Muzaffarpur, Bihar** (`842001` Motijheel Flagship Hub & `842002` Club Road Center) with Pan-India shipping.

## 1. Strict API & Storage Isolation Rules (Non-Negotiable)

1. **Zero Shared Infrastructure with Other Projects**: Never connect Mobile Station to `glorov` databases, Redis instances, Cloudinary clouds, Shiprocket accounts, or Razorpay merchants.
2. **Strict Separation of Data vs. Media vs. Binary Storage**:
   - **PostgreSQL 16 (`DATABASE_URL`)**: Transactional commerce state ONLY (orders, products, inventory, variants, GST tax splits, IMEI/serial numbers, customer addresses). Never use SQLite files in production or dev.
   - **Redis 7 (`REDIS_URL`)**: Event bus, background queues, rate limiting, and short-lived pincode serviceability cache.
   - **Cloudinary (`CLOUDINARY_*`)**: Public product images, category banners, and storefront imagery ONLY (`folder: mobile-station`). Never store PDFs, invoices, or backups here.
   - **S3 / Cloudflare R2 / MinIO (`STORAGE_S3_*`)**: Private non-image files ONLY — generated GST Tax Invoice PDFs, warranty slips, return unboxing proof videos, bulk CSV imports, and encrypted PostgreSQL backups. Always issue short-lived presigned URLs (`<= 15 minutes`); never expose private buckets publicly.
   - **Meilisearch (`MEILISEARCH_*`)**: Instant typo-tolerant search and dynamic technical facet filtering (`ram_gb`, `ssd_gb`, `output_wattage`, `switch_type`). Never expose the admin/master key to the browser (`NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` must be a read-only search key).
3. **Storefront Boundary**: `apps/storefront` must NEVER connect directly to PostgreSQL, Redis, S3/R2, or Medusa Admin routes (`/admin/*`). It calls only Medusa Store API (`/store/*`) with `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` and public read-only search keys.

## 2. Folder Organization Rules

- Keep source code strictly inside `apps/backend`, `apps/storefront`, and `packages/*` (`types`, `config`, `brand`).
- Keep prepared seed/taxonomy datasets in `data/`, documentation in `docs/`, automation scripts in `scripts/`, and deployment configs in `deploy/`.
- Never create scratch folders, unreferenced prototype folders, or duplicate root assets inside `apps/`.

## 3. Design System & Branding Guardrails

- **No Hardcoded Hex Values**: All colors, radii, fonts, shadows, and z-index values must reference CSS custom properties in `apps/storefront/src/styles/tokens.css` or semantic Tailwind utilities in `apps/storefront/tailwind.config.ts`.
- **Logo Visibility**: The metallic silver `STATION` wordmark requires dark contrast (`--color-obsidian-900` `#0B0F17`). Never place `mobile-station-wordmark.png` directly over pure white backgrounds.
- **Currency & GST**: Store all prices as integer **paise** (₹499 = `49900`) to avoid floating-point errors. Electronics default to **18% GST** (verify HSN per category). Display MRP strikethrough, active price, `% OFF`, warranty duration, and "What's in the Box" clearly.
