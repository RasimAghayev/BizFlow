# syntax=docker/dockerfile:1.7

# BizFlow — Next.js 15 app. Multi-stage build per CLAUDE.md's Docker standard:
# base -> deps -> build -> test -> runtime. `docker build --target test` is
# the authoritative "did the test suite pass" check; `runtime` never ships
# dev tooling or the full node_modules tree (next.config.ts output:
# 'standalone' trims it to only what's actually imported at runtime).

FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ---- deps: install once, reuse the layer for build and test -----------
# --legacy-peer-deps: @genkit-ai/next's peerDependencies still pin zod ^3.x
# (true through its latest 1.44.0 release) while the root project is on
# zod ^4 (a merged security bump, commit 6048f62, predates this baseline).
# A strict `npm ci` fails on this conflict. See docs/DEPENDENCY_DECISIONS.md
# for the full rationale — this is a documented, re-evaluated-every-cycle
# workaround, not a silent fix.
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# ---- test: runs the Phase-5 characterization suite --------------------
# Fails the build if any test fails — this stage IS the quality gate.
FROM deps AS test
COPY . .
RUN node --test src/

# ---- build: production Next.js build -----------------------------------
FROM deps AS build
COPY . .
RUN npm run build

# ---- runtime: slim, non-root, healthcheck, graceful shutdown ----------
FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 -G nodejs

COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>{process.exit(r.statusCode<500?0:1)}).on('error',()=>process.exit(1))"

# next's standalone server.js handles SIGTERM for graceful shutdown.
ENTRYPOINT ["node", "server.js"]
