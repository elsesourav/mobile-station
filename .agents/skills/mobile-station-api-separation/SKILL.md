---
name: mobile-station-api-separation
description: >-
  Enforces strict separation across Mobile Station external APIs and storage layers (PostgreSQL DB,
  Redis cache/queue, Cloudinary image CDN, S3/R2 private file storage, Meilisearch search, Razorpay,
  Shiprocket, Email/SMS OTP, GSTIN lookup). Use whenever configuring environment variables, backend
  modules, file uploads, invoice storage, or third-party integrations.
---

# Mobile Station Separated APIs & Storage Skill

Mobile Station strictly separates transactional persistence, media optimization, private document storage, and search indexing so each service scales independently and remains completely isolated from `glorov`.

## Service Responsibility Matrix

| Layer | Technology / Provider | Env Prefix | Allowed Data ONLY | Forbidden Data |
|---|---|---|---|---|
| **Primary DB** | PostgreSQL 16 (Supabase/Neon/Docker) | `DATABASE_URL` | Orders, catalog, variants, stock, GST breakdowns, IMEI/serial ledger | Raw binary files, product images |
| **Cache & Queue** | Redis 7 (Upstash/Docker) | `REDIS_URL` | Event bus, workflow state, rate limits, pincode TTL cache | Source-of-truth records |
| **Image CDN** | Dedicated Cloudinary Account | `CLOUDINARY_*` | Public product photos, banners, brand assets (`f_auto,q_auto`) | Private GST invoices, CSVs, DB backups |
| **Document Storage** | Cloudflare R2 / AWS S3 / MinIO | `STORAGE_S3_*` | Private GST Invoice PDFs, warranty PDFs, return videos, CSV imports, backups | Unoptimized storefront thumbnails |
| **Search & Facets** | Meilisearch | `MEILISEARCH_*` | Indexed public catalog & filterable tech specs | Customer PII, private keys in client |
| **Payments & EMI** | Razorpay + Capped COD | `RAZORPAY_*`, `COD_MAX_AMOUNT_PAISE` | UPI, cards, No-Cost EMI, webhook HMAC verification | Exposing `RAZORPAY_KEY_SECRET` to browser |
| **Logistics & OBD** | Shiprocket | `SHIPROCKET_*` | Pincode serviceability, AWB generation, Open-Box Delivery flags | Sharing GLOROV pickup hub |
| **Notifications** | Resend/SES (Email) + MSG91 (SMS OTP) | `RESEND_*`, `MSG91_*` | Order receipts, GST invoice links, COD OTP verification | Sending unverified marketing blasts |

## Implementation Steps
1. Consult [02-SEPARATED-APIS-AND-CREDENTIALS-GUIDE.md](../../../docs/02-SEPARATED-APIS-AND-CREDENTIALS-GUIDE.md) before adding any new integration.
2. Validate all production env vars at startup (`apps/backend`) — fail fast if `NODE_ENV=production` still uses mock flags, weak secrets, `:6543` transaction pooler ports, or wildcard CORS (`*`).
3. Never use `CLOUDINARY_*` for private PDFs; route invoice/warranty/CSV storage exclusively through the S3/R2 storage provider with presigned download URLs (`STORAGE_PRESIGNED_TTL_SECONDS=900`).
4. Never leak server secrets into `NEXT_PUBLIC_*` variables in `apps/storefront`.
