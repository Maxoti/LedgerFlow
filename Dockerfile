# ─── Stage 1: Base ───────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ─── Stage 2: Development ────────────────────────────────────────
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]

# ─── Stage 3: Production ─────────────────────────────────────────
FROM base AS production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]