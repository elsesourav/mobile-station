---
name: mobile-station-monorepo-workflow
description: >-
  Documents Mobile Station folder organization, non-colliding Docker infrastructure ports, shared
  workspace packages, and build/typecheck/test gates. Use when scaffolding apps, running local
  infrastructure, adding workspace packages, or verifying changes.
---

# Mobile Station Monorepo Workflow Skill

## Folder Layout
- `apps/backend` — Medusa v2 modular commerce backend (`PORT=9000`)
- `apps/storefront` — Next.js 15 App Router customer storefront (`PORT=3000`)
- `packages/types` — Shared TypeScript interfaces and Zod validators (`@mobile-station/types`)
- `packages/config` — Shared TSConfig & ESLint presets (`@mobile-station/config`)
- `packages/brand` — Brand constants & trimmed source assets (`@mobile-station/brand`)
- `data/` — Taxonomy, brands, spec schemas, seed products, storefront banners/offers JSON
- `docs/` — Research, separated API guide, ADRs, style markdowns, test plans
- `scripts/` — Brand asset generator, backup/restore, smoke probes
- `deploy/` — Production Dockerfiles, Caddy/Nginx configs, rollout scripts

## Non-Colliding Local Infrastructure Ports
Mobile Station uses dedicated ports in `docker-compose.yml` so it can run alongside `glorov` without conflicts:
- PostgreSQL 16: `localhost:5434` (`mobile_station_medusa`)
- Redis 7: `localhost:6380`
- Meilisearch: `localhost:7700`
- MinIO S3 Storage: `localhost:9100` (API) / `localhost:9101` (Console)

## Verification Workflow
1. Start local infra: `pnpm infra:up`
2. Regenerate icons/OG if brand assets changed: `pnpm assets:brand`
3. Verify types, lint, and tests from root:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
