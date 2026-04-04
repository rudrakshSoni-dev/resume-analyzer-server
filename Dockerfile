# Stage 1: builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install deps first (cache layer)
COPY package*.json ./
RUN npm ci

# Copy prisma separately (important for caching)
COPY prisma ./prisma

# Generate Prisma client (NO DB connection needed)
RUN npx prisma generate

# Copy rest of code
COPY . .

# Build TS
RUN npm run build

# Stage 2: runner
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 5000

CMD ["node", "dist/index.js"]