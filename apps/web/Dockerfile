# Build from the repo root (docker compose sets context: .), because the web
# app lives in an npm workspace and needs the root package.json + lockfile.
#
#   docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=... .

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
# npm's workspace `ci` skips platform-specific optional deps when the lockfile
# was written on another OS (npm/cli#4828) — reinstall the native bindings
# Tailwind v4 needs so the correct musl binaries are present.
RUN npm install --no-save lightningcss @tailwindcss/oxide
# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
RUN npm run build --workspace web

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
# Standalone output keeps the monorepo layout: server.js under apps/web/.
COPY --from=build --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
USER app
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
