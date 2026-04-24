#!/usr/bin/env bash
# Serve the static export at http://localhost:3001 for smoke-testing.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

if [ ! -d out ]; then
  echo "out/ not found — run \`pnpm build:static\` first." >&2
  exit 1
fi

exec python3 -m http.server --directory out 3001
