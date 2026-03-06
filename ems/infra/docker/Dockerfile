# syntax=docker/dockerfile:1.7

# Generic multi-stage Dockerfile for EMS NestJS services.
# Build with:
#   docker build \
#     --build-arg SERVICE_PATH=ems/services/event \
#     --build-arg SERVICE_NAME=event \
#     -f ems/infra/docker/Dockerfile \
#     -t ems-event:latest .

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /workspace

# Install dependencies first to maximize layer caching.
# Supports npm/pnpm/yarn based on lockfile availability.
COPY package.json ./
COPY package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN set -eux; \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
  else npm install; fi

FROM deps AS build
WORKDIR /workspace

# Path to NestJS service in the monorepo (e.g., ems/services/event)
ARG SERVICE_PATH
# Name used by npm script convention (e.g., event => build:event / start:prod:event)
ARG SERVICE_NAME

COPY . .

# Build strategy:
# 1) Prefer service-specific script: build:<service>
# 2) Fallback to generic Nest build at service path
RUN set -eux; \
  if [ -n "${SERVICE_NAME}" ] && npm run | grep -q "build:${SERVICE_NAME}"; then \
    npm run "build:${SERVICE_NAME}"; \
  elif [ -n "${SERVICE_PATH}" ]; then \
    npx nest build "${SERVICE_PATH}"; \
  else \
    echo "SERVICE_PATH or SERVICE_NAME must be provided" >&2; \
    exit 1; \
  fi

FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

ARG SERVICE_PATH
ARG SERVICE_NAME

# Copy production dependencies from deps stage.
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/package.json ./package.json

# Copy built artifacts. This handles common NestJS output layouts.
COPY --from=build /workspace/dist ./dist

EXPOSE 3000

# Runtime strategy:
# 1) Prefer service-specific prod script: start:prod:<service>
# 2) Fallback to dist/<service>/main.js
CMD ["sh", "-c", "if [ -n \"$SERVICE_NAME\" ] && npm run | grep -q \"start:prod:$SERVICE_NAME\"; then npm run start:prod:$SERVICE_NAME; elif [ -n \"$SERVICE_PATH\" ]; then node dist/${SERVICE_PATH}/src/main.js; else node dist/main.js; fi"]
