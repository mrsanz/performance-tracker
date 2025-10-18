# syntax=docker/dockerfile:1

# --- Build Stage ---
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock ./
# Install only production dependencies to avoid building dev deps (e.g., better-sqlite3)
ENV NODE_ENV=production
RUN bun install --production
COPY . .
# Build server bundle for production
RUN bun run build:server

# --- Production Stage ---
FROM oven/bun:slim AS runtime
WORKDIR /app
COPY --from=builder /app /app

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
