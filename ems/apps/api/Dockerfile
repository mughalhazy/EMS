# syntax=docker/dockerfile:1.7

# ── deps: install full dependency tree (build needs devDependencies) ───────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build: compile every service/infra/app via the root tsconfig ───────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json nest-cli.json ./
COPY apps ./apps
COPY services ./services
COPY infra ./infra
RUN npm run build:all

# ── prod-deps: production-only dependency tree ──────────────────────────────
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── runtime: minimal image with compiled output + prod deps ────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY tsconfig.json ./
COPY scripts ./scripts
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.APP_PORT||3000)+'/v1/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "-r", "./scripts/register-paths.js", "dist/apps/api/src/main.js"]
