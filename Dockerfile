# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TS → JS
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

# Only install production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files + prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 5000

# Run migrations + start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]