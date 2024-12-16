FROM node:23-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/build ./
COPY --from=deps /app/node_modules ./node_modules
ENV PORT=3000
EXPOSE 3000
CMD ["node", "index.js"]