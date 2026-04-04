# Stage 1: builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install system deps (IMPORTANT for prisma)
RUN apk add --no-cache openssl

# Copy only package files (cache layer)
COPY package.json package-lock.json ./

# Install deps (fast + cached)
RUN npm ci

# Copy prisma schema only
COPY prisma ./prisma

# Generate Prisma client (no DB needed)
RUN npx prisma generate

# Copy rest of app
COPY . .

# Build TypeScript
RUN npm run build

# ----------------------------

# Stage 2: runner
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy built app
COPY --from=builder /app ./

EXPOSE 5000

CMD ["node", "dist/index.js"]