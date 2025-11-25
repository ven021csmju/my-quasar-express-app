# Stage 1: Build Quasar SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files และ install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build Quasar (SPA)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# ลบ default config ของ nginx (ป้องกัน routing SPA พัง)
RUN rm /etc/nginx/conf.d/default.conf

# ใส่ nginx config ใหม่สำหรับ SPA (รองรับ history route)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder
COPY --from=builder /app/dist/spa /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
