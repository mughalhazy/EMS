# syntax=docker/dockerfile:1.7

# Multi-stage Dockerfile for a Next.js frontend.
# Build with repository root as context, optionally overriding APP_DIR:
#   docker build -f ems/infra/docker/Dockerfile --build-arg APP_DIR=path/to/frontend .

ARG NODE_VERSION=20-alpine
ARG APP_DIR=ems/frontend

FROM node:${NODE_VERSION} AS base
WORKDIR /app

FROM base AS deps
ARG APP_DIR

# Copy only package manifests first for better layer caching.
COPY ${APP_DIR}/package.json ./package.json
COPY ${APP_DIR}/package-lock.json* ./
COPY ${APP_DIR}/yarn.lock* ./
COPY ${APP_DIR}/pnpm-lock.yaml* ./

RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

FROM base AS builder
ARG APP_DIR
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY ${APP_DIR}/ ./

RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm run build; \
    elif [ -f yarn.lock ]; then \
      yarn build; \
    else \
      npm run build; \
    fi

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Use unprivileged user.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Expected output of "next build" with output: 'standalone'.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
