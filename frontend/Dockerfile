# Multi-stage Dockerfile for building Quasar SPA and serving with nginx (production-ready)

# Builder: Node (alpine) to install deps and build the SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Install basic build tools sometimes needed by packages
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Final: small nginx image to serve static files
FROM nginx:stable-alpine

# Replace default config with our nginx config (if provided)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built SPA from builder
COPY --from=builder /app/dist/spa/ /usr/share/nginx/html/

# Also copy standalone HTML pages (so they can be accessed directly)
# Copy index_name.html if present in source pages
COPY ./src/pages/index_name.html /usr/share/nginx/html/index_name.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
