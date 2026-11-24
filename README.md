# Mobile Station — Online Electronics & Tech Accessories Store

> **Direct-to-Consumer Electronics Platform** specializing in **Smartphones, Tablets, Laptops, Earphones & Audio, Keyboards & Mice, Fast Chargers, and Tech Accessories** — originated in **Muzaffarpur, Bihar** (`842001` / `842002`) with Pan-India insured shipping, **18% GST Tax Invoices**, **Official Brand Warranty**, and **Open-Box Delivery**.

Built as a clean, upgraded evolution of the **GLOROV** monorepo (`pnpm` workspaces + Turborepo + Medusa v2 + Next.js 15 App Router), with **100% separated APIs and storage layers**.

---

## Documentation & Blueprints

| Guide | Purpose |
|---|---|
| [**00-MASTER-PLAN.md**](docs/00-MASTER-PLAN.md) | Phased engineering roadmap & architectural upgrades over GLOROV |
| [**01-CATEGORY-AND-CATALOG-RESEARCH.md**](docs/01-CATEGORY-AND-CATALOG-RESEARCH.md) | Research-backed 7-pillar electronics taxonomy, spec filters, HSN/GST & Open-Box Delivery rules |
| [**02-SEPARATED-APIS-AND-CREDENTIALS-GUIDE.md**](docs/02-SEPARATED-APIS-AND-CREDENTIALS-GUIDE.md) | Complete list of every separate API (DB, Cloudinary, S3/R2, Redis, Meilisearch, Razorpay, Shiprocket, Email/SMS) and required keys |
| [**03-ARCHITECTURE-AND-FOLDER-STRUCTURE.md**](docs/03-ARCHITECTURE-AND-FOLDER-STRUCTURE.md) | Clean workspace directory layout |
| [**DESIGN-SYSTEM.md**](docs/style/DESIGN-SYSTEM.md) | Brushed Gold + Metallic Chrome + Precision Obsidian style guide |
| [**UI-ARCHITECTURE.md**](docs/style/UI-ARCHITECTURE.md) | Storefront layout, product cards, PDP spec accordions, compare matrix & GST checkout UX |

---

## Separated Infrastructure Ports (Local Docker)

Mobile Station uses isolated ports so it never collides with GLOROV or local services:

| Service | Role | Local Endpoint |
|---|---|---|
| **PostgreSQL 16** | Transactional DB (Catalog, Orders, GST, IMEI) | `localhost:5434` (`mobile_station_medusa`) |
| **Redis 7** | Event Bus, Queues, Pincode Cache & Rate Limit | `localhost:6380` |
| **Meilisearch** | Typo-tolerant Search & Faceted Technical Specs | `localhost:7700` |
| **MinIO (S3 API)** | Private Object Storage (GST PDFs, Warranties, CSVs, Backups) | `localhost:9100` (Console `:9101`) |
| **Cloudinary** | Public Image CDN (`mobile-station/` folder) | External API (`CLOUDINARY_*`) |

```bash
# Start local PostgreSQL, Redis, Meilisearch, and MinIO S3 storage
pnpm infra:up

# Regenerate favicons, PWA icons, and og-image.png from root brand PNGs
pnpm assets:brand
```
