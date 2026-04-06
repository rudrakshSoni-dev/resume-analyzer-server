# ----------------------------
# Stage 1: builder
# ----------------------------
FROM node:18 AS builder

WORKDIR /app

# Install deps (cached)
COPY package.json package-lock.json ./
RUN npm ci

# Copy prisma + generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy full source
COPY . .

# Build TypeScript
RUN npm run build

# ----------------------------
# Stage 2: runner
# ----------------------------
FROM node:18

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# sanity check
RUN test -f dist/server.js

EXPOSE 5000

CMD ["node", "dist/server.js"]