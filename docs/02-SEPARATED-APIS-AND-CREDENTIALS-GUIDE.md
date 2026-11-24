# Mobile Station — Separated APIs, Storage Layers & Required Credentials Guide

> **Core Requirement:** Every external service, database, image CDN, private file storage bucket, search index, payment merchant, and shipping account for **Mobile Station** is **strictly separated** — both from **GLOROV** and from each other by responsibility.

---

## 1. Architecture of Separated APIs & Storage

```mermaid
flowchart LR
    User["Customer Browser / Mobile"] --> Storefront["Next.js 15 Storefront"]
    Storefront -->|Public Search Key| Meili["Meilisearch API (Specs & Catalog Search)"]
    Storefront -->|Publishable Key + /store/*| Medusa["Medusa v2 Backend API"]
    Storefront -->|Optimized f_auto/q_auto URLs| Cloudinary["Cloudinary Image CDN (Public Media ONLY)"]
    Storefront -->|Checkout Modal & EMI Widget| RazorpayUI["Razorpay Checkout SDK"]

    Medusa --> Postgres["PostgreSQL 16 DB (Orders, Stock, GST, IMEI)"]
    Medusa --> Redis["Redis 7 (Event Bus, Queues, Rate Limits)"]
    Medusa -->|Upload Product Photos| Cloudinary
    Medusa -->|Private Presigned URLs| S3["S3 / Cloudflare R2 / MinIO (GST PDFs, Warranties, CSVs, Backups)"]
    Medusa -->|Server Payment Verify & Webhooks| RazorpayAPI["Razorpay REST API"]
    Medusa -->|Pincode, OBD & AWB| Shiprocket["Shiprocket Logistics API"]
    Medusa -->|Order & Invoice Emails| EmailAPI["Resend / AWS SES SMTP"]
    Medusa -->|COD OTP & OBD Alerts| SMSAPI["MSG91 / Gupshup SMS & WhatsApp API"]
    Medusa -->|Optional B2B Check| GSTAPI["GSTIN Lookup API"]
```

---

## 2. Complete Checklist of APIs You Need to Get (Separate Accounts / Projects)

Below is every API you need to create/provide for **Mobile Station** (never reuse keys from GLOROV):

### A. Core Persistence & Storage (3 Completely Separate Layers)

| # | Service Type | Purpose in Mobile Station | Recommended Cloud Provider (Production) | Local Dev Alternative (Included in Docker) | Environment Keys Needed |
|---|---|---|---|---|---|
| **1** | **Database API (Relational SQL)** | Transactional catalog, variants, prices, stock, orders, B2B GSTIN splits, IMEI/serial numbers | **Supabase** (new project `mobile-station`, Session Pooler port `5432`) or **Neon** / Managed PostgreSQL 16 | Docker `postgres:16-alpine` on `localhost:5434` (`mobile_station_medusa`) | `DATABASE_URL` |
| **2** | **Image & Media CDN API** | Public product images, multi-angle galleries, category thumbnails, hero banners (auto AVIF/WebP resize) | **Cloudinary** (New dedicated Cloud Name or completely separate account + folder `mobile-station/`) | Same (uses `CLOUDINARY_*`; mock URL fallback if unset during offline UI dev) | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER=mobile-station`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| **3** | **Private File & Object Storage API** *(Separate from Image CDN & DB!)* | Private non-image files: generated **GST Tax Invoice PDFs**, warranty PDFs, return unboxing videos, bulk CSV imports, encrypted PostgreSQL backups | **Cloudflare R2** (0 egress fees, S3-compatible) OR **AWS S3** (`ap-south-1` Mumbai) OR **Supabase Storage S3** | Docker **MinIO** S3 API on `localhost:9100` (Console `9101`) | `STORAGE_S3_PROVIDER`, `STORAGE_S3_ENDPOINT`, `STORAGE_S3_REGION`, `STORAGE_S3_BUCKET`, `STORAGE_S3_ACCESS_KEY_ID`, `STORAGE_S3_SECRET_ACCESS_KEY` |
| **4** | **Cache & Event Queue API** | Medusa event bus, workflow queue, rate limiting, cached pincode serviceability | **Upstash Redis** (Serverless, Mumbai `ap-south-1`) or **Redis Cloud** | Docker `redis:7-alpine` on `localhost:6380` | `REDIS_URL` |

### B. Search, Commerce, Payments & Logistics

| # | Service Type | Purpose in Mobile Station | Recommended Provider | Free/Test Mode Available? | Environment Keys Needed |
|---|---|---|---|---|---|
| **5** | **Instant Search & Spec Filter API** | Typo-tolerant search (`"iPhone 16"`, `"65W GaN"`) + numeric facet filters (`RAM`, `SSD`, `DPI`) | **Meilisearch Cloud** (or self-hosted Docker container) | Yes — Docker container included on `localhost:7700` | `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` (server), `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` (browser read-only) |
| **6** | **Payment Gateway & EMI API** | UPI, Debit/Credit Cards, NetBanking, **No-Cost EMI & Affordability Widget**, Webhook verification | **Razorpay** (New merchant profile / separate Test & Live keys for Mobile Station) | Yes (`rzp_test_*` + `RAZORPAY_MOCK_MODE=true` offline) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| **7** | **Logistics & Pincode API** | Multi-courier rate lookup, 6-digit pincode ETA, Muzaffarpur (`842001`) pickup, High-value Insurance & Open-Box Delivery | **Shiprocket** (Dedicated pickup warehouse configured for Mobile Station) | Yes (`SHIPROCKET_MOCK_MODE=true` offline) | `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_WEBHOOK_TOKEN`, `SHIPROCKET_PICKUP_LOCATION`, `SHIPROCKET_PICKUP_PINCODE` |

### C. Transactional Notifications, B2B Verification & Monitoring

| # | Service Type | Purpose in Mobile Station | Recommended Provider | Free/Test Mode Available? | Environment Keys Needed |
|---|---|---|---|---|---|
| **8** | **Transactional Email API** | Order confirmations, shipping tracking updates, attached/linked GST Tax Invoice PDFs, password resets | **Resend** (`orders@mobilestation.in`) or **AWS SES** (`ap-south-1` Mumbai) | Yes (Resend Free 3,000 emails/mo + `NOTIFICATION_MOCK_MODE=true`) | `EMAIL_PROVIDER`, `RESEND_API_KEY` (or `SMTP_*`), `NOTIFICATION_FROM_EMAIL`, `NOTIFICATION_REPLY_TO` |
| **9** | **SMS / WhatsApp OTP API** | Login OTP, COD confirmation OTP (prevents fake COD returns), Open-Box Delivery OTP reminder | **MSG91** (Indian DLT compliant) or **Gupshup / Interakt** | Yes (`SMS_MOCK_MODE=true` locally) | `SMS_PROVIDER`, `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_OTP_TEMPLATE_ID`, `WHATSAPP_PROVIDER_TOKEN` |
| **10** | **B2B GSTIN Lookup API** *(Optional)* | Auto-verify buyer's 15-character GSTIN & auto-fill company name/state on checkout | **Sandbox.co.in** / **Cashfree Verification** / **ClearTax** | Yes (`GSTIN_MOCK_MODE=true` validates regex locally) | `GSTIN_VERIFICATION_PROVIDER`, `GSTIN_API_KEY`, `GSTIN_API_SECRET` |
| **11** | **Error Monitoring API** | Separate error & checkout webhook failure alerts (backend + storefront) | **Sentry** (New `mobile-station-backend` & `mobile-station-web` projects) | Yes (Free Developer plan; optional locally) | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` |

---

## 3. Recommended Minimum Setup to Start Developing Immediately vs. Go-Live

1. **Right Now (Local Development — ₹0 cost):**
   - Run `pnpm infra:up` (starts local **PostgreSQL 16**, **Redis 7**, **Meilisearch**, and **MinIO S3 Storage** in Docker).
   - Provide **1 new Cloudinary account** (free tier gives 25GB storage + 25GB monthly bandwidth) for product & hero images.
   - Keep `RAZORPAY_MOCK_MODE=true`, `SHIPROCKET_MOCK_MODE=true`, `NOTIFICATION_MOCK_MODE=true`, `SMS_MOCK_MODE=true` until you obtain live test/prod credentials.
2. **Before Staging / Production Go-Live:**
   - **Supabase / Neon** (PostgreSQL) + **Upstash** (Redis)
   - **Cloudflare R2** (Private S3 bucket for GST PDFs & backups)
   - **Razorpay** Live KYC + **Shiprocket** Live KYC + **Resend** verified domain (`mobilestation.in`) + **MSG91** DLT template.

---

## 4. Step-by-Step Guide: How to Obtain Each API Key

### Group 1 — Instant Developer Accounts (No Business KYC Needed, Free Tier)

1. **Cloudinary (Image CDN API)** — `https://cloudinary.com`
   - Create a separate account (or separate sub-account/product environment from GLOROV).
   - Open **Console → Settings (gear icon) → API Keys**.
   - Copy **Cloud Name**, **API Key**, and click **Reveal** for **API Secret** -> paste into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - Set `CLOUDINARY_FOLDER=mobile-station`.
2. **Supabase (PostgreSQL Database API)** — `https://supabase.com` *(or `https://neon.tech`)*
   - Create a brand-new project named `mobile-station` in **Mumbai (`ap-south-1`)**.
   - Click **Connect** at the top -> choose **Session Pooler** or **Direct Connection** (port **`5432`** — never `:6543` transaction pooler for Medusa migrations).
   - Copy the `postgresql://...` URI -> paste into `DATABASE_URL`.
3. **Cloudflare R2 (Private Object Storage API — Invoices, Warranties, CSVs, Backups)** — `https://dash.cloudflare.com`
   - Go to **R2 Object Storage** -> **Create Bucket** named `mobile-station-private` (leave public access **disabled**).
   - Click **Manage R2 API Tokens → Create API Token** with **Object Read & Write** scoped to `mobile-station-private`.
   - Copy **Access Key ID**, **Secret Access Key**, and **S3 Endpoint** (`https://<account-id>.r2.cloudflarestorage.com`) -> paste into `STORAGE_S3_*`.
4. **Upstash (Redis Cache & Event Bus API)** — `https://console.upstash.com`
   - Create a new Redis database in **Mumbai (`ap-south-1`)**.
   - Under **Connect → Node.js / ioredis**, copy the **`rediss://default:...@...:6379`** TCP URL (Medusa requires TCP/ioredis, not the REST URL) -> paste into `REDIS_URL`.
5. **Meilisearch (Instant Search & Tech Spec Filters)** — Local Docker or `https://cloud.meilisearch.com`
   - Locally: `pnpm infra:up` starts Meilisearch on `http://localhost:7700` using `MEILISEARCH_API_KEY` from `.env`.
   - Query `GET http://localhost:7700/keys` with the master key to retrieve the auto-generated read-only **Default Search API Key** for `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY`.
   - Production: Create a Meilisearch Cloud project in Mumbai/Singapore and copy the Host URL, Admin Key (backend only), and Search Key (storefront).
6. **Resend (Transactional Email API)** — `https://resend.com`
   - Create account -> **API Keys → Create API Key** (`Sending Access`) -> copy the `re_...` token into `RESEND_API_KEY`.
   - Add & verify your domain (`mobilestation.in`) under **Domains** (DNS TXT/DKIM records) before live emails.
7. **Sentry (Error Monitoring)** — `https://sentry.io`
   - Create two new projects (`mobile-station-backend` Node.js, `mobile-station-storefront` Next.js) and copy their DSNs into `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`.

### Group 2 — Indian Business & KYC APIs (Test/Mock Works Immediately; Live Needs GST/PAN)

8. **Razorpay (UPI, Cards, NetBanking & No-Cost EMI)** — `https://dashboard.razorpay.com`
   - Sign up with your Mobile Station business details/PAN/GSTIN & bank account.
   - **Immediate Test Keys:** Switch top toggle to **Test Mode** -> **Account & Settings → API Keys → Generate Test Key** -> copy `rzp_test_...` Key ID & Secret.
   - **Webhook Secret:** Go to **Account & Settings → Webhooks → Add New Webhook** pointing to `https://api.<yourdomain>/hooks/razorpay` and copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
   - Switch toggle to **Live Mode** after KYC approval to generate `rzp_live_...`.
9. **Shiprocket (Courier Aggregation & Muzaffarpur Pickup)** — `https://app.shiprocket.in`
   - Sign up and add your pickup warehouse (**Motijheel Road, Muzaffarpur, Bihar - `842001`**).
   - Go to **Settings → API → Configure → Create an API User** using a separate dedicated email (cannot be your login email) & strong password -> paste into `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD`.
   - Add webhook URL `https://api.<yourdomain>/hooks/shiprocket` and set `SHIPROCKET_WEBHOOK_TOKEN`.
10. **MSG91 + Telecom DLT (SMS & COD OTP Verification — India)** — `https://msg91.com`
    - Indian law (TRAI) requires registering your business once on a telecom **DLT portal** (e.g., Jio TrueConnect, Airtel DLT, or SmartPing) with PAN & GST to get an **Entity ID**, a 6-letter **Sender ID** (e.g., `MOBSTN`), and approved OTP SMS templates (**Template ID**).
    - Connect those IDs inside **MSG91 → SMS → Templates** and copy your **Auth Key** (`MSG91_AUTH_KEY`), `MSG91_SENDER_ID`, and `MSG91_OTP_TEMPLATE_ID`.
11. **B2B GSTIN Lookup API *(Optional)*** — `https://sandbox.co.in` or Cashfree Verification
    - Sign up for developer API credentials to auto-fill buyer business names from a 15-digit GSTIN; leave `GSTIN_MOCK_MODE=true` initially to validate GSTIN format locally for free.

