# syntax=docker/dockerfile:1

# --- Build Stage ---
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock ./
# Install all dependencies (needed for build)
RUN bun install --frozen-lockfile
COPY . .
# Build frontend and server bundle for production
RUN bun run build

# --- Production Stage ---
FROM oven/bun:slim AS runtime
WORKDIR /app

# Copy package.json and lock file first
COPY --from=builder /app/package.json /app/bun.lock ./

# Install only production dependencies (includes native modules like better-sqlite3)
RUN bun install --production --frozen-lockfile

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/frontend/dist ./src/frontend/dist

# Expose port (default 3000, can be overridden)
EXPOSE 3000

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=production \
    DATABASE_PATH=/app/data/performance-tracker.db \
    PORT=3000 \
    HOST=0.0.0.0

# Create data directory for SQLite file
RUN mkdir -p /app/data

# Volume for persistent SQLite storage (container mode)
VOLUME ["/app/data"]

# Entrypoint for standalone or container mode
# Run compiled server (no hot reload in production)
CMD ["bun", "dist/server.js"]

# Usage:
# Standalone: docker run --rm -p 3000:3000 performance-tracker
# Container: docker run --rm -p 3000:3000 -v $(pwd)/data:/app/data performance-tracker
# Override env: docker run -e DATABASE_PATH=/app/data/other.db ...
