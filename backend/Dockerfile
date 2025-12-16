# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build TypeScript (Prisma client already generated and committed)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/src/generated /app/dist/generated
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json ./

# Create logs dir
RUN mkdir -p logs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:4000/api/demo || exit 1

EXPOSE 4000

CMD ["node", "dist/server.js"]
