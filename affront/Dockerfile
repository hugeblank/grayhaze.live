FROM node:23-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG PUBLIC_SPRINKLER_URL
ENV PUBLIC_SPRINKLER_URL=$PUBLIC_SPRINKLER_URL
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/run.sh ./run.sh
COPY --from=builder /app/out ./out
ARG PUBLIC_SPRINKLER_URL
ENV PUBLIC_SPRINKLER_URL=$PUBLIC_SPRINKLER_URL
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "run.sh"]