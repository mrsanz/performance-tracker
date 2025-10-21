# syntax=docker/dockerfile:1

# --- Build Stage ---
FROM oven/bun:latest AS builder
WORKDIR /app

# Install Python and build tools for native modules (better-sqlite3 used by drizzle-kit)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
# Install all dependencies (needed for build)
RUN bun install --frozen-lockfile
COPY . .
# Build frontend and server bundle for production
RUN bun run build

# --- Production Stage ---
FROM oven/bun:slim AS runtime
WORKDIR /app

# Copy package.json (metadata only - bun:sqlite is built-in, no node_modules needed)
COPY --from=builder /app/package.json ./

# Copy built files (server bundle uses bun:sqlite, not better-sqlite3)
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
