# Mobile Station — Monorepo Folder Structure & Architecture

> Designed for clean separation of concerns, zero leftover prototype clutter, and strict service boundaries.

```
mobile-station/
├── GEMINI.md                              # Antigravity workspace rules (boundaries, design & API isolation)
├── AGENTS.md                              # Agent entrypoint & skill index
├── .agents/
│   └── skills/                            # Modular workspace skills (progressive disclosure)
│       ├── mobile-station-api-separation/
│       ├── mobile-station-catalog-data/
│       ├── mobile-station-design-system/
│       └── mobile-station-monorepo-workflow/
├── apps/
│   ├── backend/                           # Medusa v2 Modular Commerce Engine (:9000)
│   │   ├── .env.example                   # Server-only secrets contract
│   │   ├── static/                        # Admin favicons generated from mobile-station-icon.png
│   │   └── src/                           # Modules (Cloudinary, S3/R2, Meilisearch, Razorpay, Shiprocket, GST)
│   └── storefront/                        # Next.js 15 App Router Storefront (:3000)
│       ├── .env.example                   # Browser-safe NEXT_PUBLIC_* env contract
│       ├── tailwind.config.ts             # Mapped directly to tokens.css
│       ├── public/                        # Favicons, apple-touch-icon, PWA icons, manifest.json, og-image.png, brand/
│       └── src/
│           └── styles/
│               ├── tokens.css             # Canonical CSS Custom Properties (Obsidian, Gold, Chrome)
│               └── globals.css            # Base layers & tabular-nums utilities
├── packages/
│   ├── brand/                             # Canonical brand constants, store addresses & trimmed source logos
│   ├── config/                            # Shared TypeScript & ESLint workspace presets
│   └── types/                             # Shared TypeScript electronics models & Zod schemas
├── data/                                  # Prepared canonical catalog & storefront seed datasets
│   ├── taxonomy/
│   │   ├── categories.json                # 7 root categories + 28 subcategories + HSN & GST
│   │   ├── brands.json                    # 18 electronics brands & India warranty descriptors
│   │   └── spec-schemas.json              # Category-driven filters & comparison fields
│   ├── catalog/
│   │   └── products-seed.json             # 13 multi-variant electronics & accessory products
│   └── storefront/
│       ├── announcements.json             # Top trust & offer ticker messages
│       ├── hero-banners.json              # Flagship banner definitions
│       ├── offers.json                    # Promo codes (TECH500, DESK10, FREESHIP)
│       └── trust-badges.json              # Warranty, OBD, GST ITC, Muzaffarpur Hub badges
├── docs/
│   ├── 00-MASTER-PLAN.md                  # Phased build blueprint & GLOROV improvements
│   ├── 01-CATEGORY-AND-CATALOG-RESEARCH.md# Electronics taxonomy, UX, HSN/GST & OBD research
│   ├── 02-SEPARATED-APIS-AND-CREDENTIALS-GUIDE.md # Complete separated API & storage guide
│   ├── 03-ARCHITECTURE-AND-FOLDER-STRUCTURE.md    # This document
│   └── style/
│       ├── DESIGN-SYSTEM.md               # Color, font, radius & accessibility style markdown
│       └── UI-ARCHITECTURE.md             # Navigation, cards, PDP specs, compare & checkout UX
├── scripts/
│   └── generate-brand-assets.py           # Reproducible favicon/PWA/OG generator from root PNGs
├── deploy/                                # Production Dockerfiles, Caddy/Nginx & rollout scripts (Phase 3)
├── docker-compose.yml                     # Isolated local Postgres (5434), Redis (6380), Meilisearch (7700), MinIO S3 (9100)
├── package.json                           # Root pnpm + Turborepo commands
├── pnpm-workspace.yaml
├── turbo.json
├── mobile-station-icon.png                # Original MS source icon
└── mobile-station-name.png                # Original MOBILE STATION source wordmark
```
