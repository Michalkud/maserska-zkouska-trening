#!/usr/bin/env bash
# Build the app for static export (localStorage mode, zero-server).
# Output goes to out/. The /attempt route handler is a POST Route Handler,
# which is incompatible with Next.js's `output: 'export'`; we temporarily
# move it out of src/app/ for the duration of the build and restore it
# on exit (even if the build fails).
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

ATTEMPT_DIR="src/app/attempt"
STASH_DIR="$REPO/.build-static-stash"

cleanup() {
  if [ -d "$STASH_DIR/attempt" ] && [ ! -d "$ATTEMPT_DIR" ]; then
    mv "$STASH_DIR/attempt" "$ATTEMPT_DIR"
  fi
  rmdir "$STASH_DIR" 2>/dev/null || true
}
trap cleanup EXIT

mkdir -p "$STASH_DIR"
if [ -d "$ATTEMPT_DIR" ]; then
  mv "$ATTEMPT_DIR" "$STASH_DIR/attempt"
fi

rm -rf out

NEXT_PUBLIC_STORAGE=localstorage pnpm exec next build
