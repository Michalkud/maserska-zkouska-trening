#!/usr/bin/env bash
# Build the app for static export (localStorage mode, zero-server).
# Output goes to out/. POST Route Handlers (/attempt, /api/flag) are
# incompatible with Next.js's `output: 'export'`; we temporarily move
# them out of src/app/ for the duration of the build and restore them
# on exit (even if the build fails).
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

STASH_DIR="$REPO/.build-static-stash"
STASH_PATHS=(
  "src/app/attempt"
  "src/app/api"
)

cleanup() {
  for src in "${STASH_PATHS[@]}"; do
    stashed="$STASH_DIR/$(basename "$src")"
    if [ -e "$stashed" ] && [ ! -e "$src" ]; then
      mkdir -p "$(dirname "$src")"
      mv "$stashed" "$src"
    fi
  done
  rmdir "$STASH_DIR" 2>/dev/null || true
}
trap cleanup EXIT

mkdir -p "$STASH_DIR"
for src in "${STASH_PATHS[@]}"; do
  if [ -e "$src" ]; then
    mv "$src" "$STASH_DIR/$(basename "$src")"
  fi
done

rm -rf out

NEXT_PUBLIC_STORAGE=localstorage pnpm exec next build
