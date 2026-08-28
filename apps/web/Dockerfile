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
# npm's workspace `ci` can skip platform-specific optional deps when the lockfile
# was written on another OS (npm/cli#4828). Reinstall native Alpine bindings used
# by Tailwind v4 and Next image optimization so production can resize/transcode.
RUN npm install --no-save lightningcss @tailwindcss/oxide sharp
ARG INTERNAL_API_URL=http://api:8000
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_SITE_URL=https://vocora.uz
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ARG NEXT_PUBLIC_APPLE_CLIENT_ID=
ARG NEXT_PUBLIC_APPLE_REDIRECT_URI=
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID=
ARG NEXT_PUBLIC_TELEGRAM_BOT_ID=
ARG NEXT_PUBLIC_SENTRY_DSN=
ENV INTERNAL_API_URL=$INTERNAL_API_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_APPLE_CLIENT_ID=$NEXT_PUBLIC_APPLE_CLIENT_ID \
    NEXT_PUBLIC_APPLE_REDIRECT_URI=$NEXT_PUBLIC_APPLE_REDIRECT_URI \
    NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID \
    NEXT_PUBLIC_TELEGRAM_BOT_ID=$NEXT_PUBLIC_TELEGRAM_BOT_ID \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
RUN npm run build --workspace web

FROM node:22-alpine AS run
WORKDIR /app
ARG INTERNAL_API_URL=http://api:8000
ARG NEXT_PUBLIC_SITE_URL=https://vocora.uz
ARG NEXT_PUBLIC_SENTRY_DSN=
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    INTERNAL_API_URL=$INTERNAL_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
RUN addgroup -S app && adduser -S app -G app
# Standalone output keeps the monorepo layout: server.js under apps/web/.
COPY --from=build --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=app:app /app/apps/web/public ./apps/web/public
USER app
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
