#!/usr/bin/env sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Run migrations if compiled migrate script is present
if [ -f /app/dist/migrate.js ]; then
  echo "Running database migrations..."
  # If migrations fail, log and continue to allow first-boot without failing the container
  if ! bun /app/dist/migrate.js; then
    echo "Warning: migrations failed; continuing startup" >&2
  fi
else
  echo "No migrate script found; skipping migrations"
fi

# Start the server
exec bun /app/dist/server.js
