FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy workspace files
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy app and libs
COPY apps/back/api ./apps/back/api
COPY libs ./libs

# Build the application
RUN npx nx build api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist/apps/back/api ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

# Production mode: Run built application
CMD ["nx", "serve", "api"]

