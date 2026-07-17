# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
# Copy workspace package files
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install dependencies (workspaces)
RUN npm ci

# Copy source code
COPY apps/web/ ./apps/web/

# Build workspace
WORKDIR /app/apps/web

# Define build arguments for frontend environment variables
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL


RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
