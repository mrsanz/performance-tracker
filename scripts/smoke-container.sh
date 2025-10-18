#!/usr/bin/env bash
set -euo pipefail

IMAGE=${1:-performance-tracker}
PORT=${PORT:-3000}

CID=$(docker run -d -p ${PORT}:3000 -v "${PWD}/data:/app/data" ${IMAGE})
cleanup() { docker rm -f "$CID" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# simple wait loop up to 10s
for i in {1..20}; do
  if curl -sf http://localhost:${PORT}/healthz >/dev/null; then
    echo "OK: /healthz responded"
    exit 0
  fi
  sleep 0.5
done

echo "FAIL: /healthz did not respond in time" >&2
exit 1
