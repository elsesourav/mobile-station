# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/storefront/package.json ./apps/storefront/package.json
COPY packages/brand/package.json ./packages/brand/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN pnpm install --frozen-lockfile --filter @mobile-station/backend...

COPY packages ./packages
COPY apps/backend ./apps/backend
COPY data ./data

ARG MEDUSA_ADMIN_DISABLED=true
ENV MEDUSA_BUILD_PHASE=true
ENV MEDUSA_ADMIN_DISABLED=${MEDUSA_ADMIN_DISABLED}

RUN pnpm --filter @mobile-station/types build \
  && pnpm --filter @mobile-station/backend build

FROM base AS prod-deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/.medusa/server/package.json ./apps/backend/package.json
COPY apps/storefront/package.json ./apps/storefront/package.json
COPY packages/brand/package.json ./packages/brand/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN pnpm install --prod --frozen-lockfile --filter @mobile-station/backend... --ignore-scripts

FROM node:20-alpine AS runner
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

ENV NODE_ENV=production
ENV MEDUSA_ADMIN_DISABLED=true
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV DB_POOL_MIN=1
ENV DB_POOL_MAX=4
ENV PORT=9000

COPY --from=prod-deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=prod-deps /app/packages ./packages

COPY --from=builder /app/packages/brand ./packages/brand
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/backend/.medusa/server ./apps/backend
COPY --from=builder /app/data ./data

WORKDIR /app/apps/backend
EXPOSE 9000

CMD ["pnpm", "start"]
