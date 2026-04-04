# ----------------------------
# Stage 1: builder
# ----------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# 🔥 Fix slow Alpine mirror + install deps
RUN sed -i 's/dl-cdn.alpinelinux.org/mirror.clarkson.edu/g' /etc/apk/repositories \
 && apk add --no-cache openssl

# Copy only package files (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema separately (cache optimization)
COPY prisma ./prisma

# Generate Prisma client (no DB connection needed)
RUN npx prisma generate

# Copy rest of the code
COPY . .

# Build TypeScript
RUN npm run build

# ----------------------------
# Stage 2: runner
# ----------------------------
FROM node:18-alpine

WORKDIR /app

# 🔥 Same mirror fix here
RUN sed -i 's/dl-cdn.alpinelinux.org/mirror.clarkson.edu/g' /etc/apk/repositories \
 && apk add --no-cache openssl

# Copy only required files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]