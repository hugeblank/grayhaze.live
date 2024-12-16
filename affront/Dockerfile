FROM node:23-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV PRIVATE_VALKEY_URL=redis://valkey:6379
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=deps /app/node_modules ./node_modules
ENV PORT=6080
ENV NODE_ENV=production
ENV PRIVATE_VALKEY_URL=redis://valkey:6379
EXPOSE 6080
CMD ["node", "build/index.js"]