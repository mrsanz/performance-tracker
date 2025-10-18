# Containerization and Production Entrypoints

This project ships a Docker image that supports development and production workloads. Production images never use hot reload.

## Entrypoints

- Production (default):
  - Command: `bun dist/server.js`
  - Use: Standard runtime in containers (no hot reload)
  - Ports: Exposes 3000 (configurable via `PORT`)
  - Env: `DATABASE_PATH` (default `/app/data/performance-tracker.db`), `HOST`, `PORT`, `NODE_ENV=production`

- Development (local only, not in image):
  - Command: `bun --hot src/backend/index.ts`
  - Provided via npm script `dev:server`
  - Not used in the Docker image.

## Volumes and Persistence

- SQLite database stored by default at `/app/data/performance-tracker.db` inside the container
- Mount a host volume for persistence:
  - `-v ${PWD}/data:/app/data`

## Examples

- Build image:
  - `docker build -t performance-tracker -f infrastructure/Dockerfile .`

- Run (ephemeral DB in container):
  - `docker run --rm -p 3000:3000 performance-tracker`

- Run (persistent DB on host):
  - `docker run --rm -p 3000:3000 -v ${PWD}/data:/app/data performance-tracker`

## Notes

- The image installs only production dependencies to keep size minimal and avoid native build toolchains.
- The server is built during the image build and started from `dist/server.js`.
