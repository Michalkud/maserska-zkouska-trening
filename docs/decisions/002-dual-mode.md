# ADR 002: Dual-Mode Build (Server + Static)

**Status:** Accepted
**Date:** 2026-04-24
**Decision Maker:** Michal (via autonomous loop)

## Context

The app was built against a Prisma + SQLite backend (ADR 001) and runs under Next.js's standard dynamic-rendering server. Michal also wants to use the app without a server — open `index.html` from disk or from a static host (GitHub Pages, Netlify static, S3), with all state persisted in the browser's `localStorage`.

Running both modes from one codebase avoids a fork and lets every feature reach both targets.

## Decision

Ship two mutually-exclusive build targets from the same source tree, selected by the `NEXT_PUBLIC_STORAGE` environment variable:

| Mode | `NEXT_PUBLIC_STORAGE` | Persistence | Build | Serve |
|------|----------------------|-------------|-------|-------|
| **Server** (default) | unset or `prisma` | `./data/app.db` via Prisma | `pnpm build` | `pnpm start` or `pnpm dev` |
| **Static** | `localstorage` | browser `localStorage` | `pnpm build:static` | `pnpm dev:static` (or any static host) |

Both modes render the same routes (`/`, `/quiz`, `/review`) and share the same presentation components. The only branches are the storage impl and the server/client rendering of the top-level page file.

## Architecture

### Storage abstraction (`src/lib/storage/`)

```
types.ts         Storage interface (9 methods) + shared row types
prisma.ts        Prisma-backed implementation (server-only deps)
localstorage.ts  localStorage-backed implementation (browser + node-compat)
index.ts         Ternary + require() selector, respecting NEXT_PUBLIC_STORAGE
```

The ternary-with-`require()` pattern is load-bearing: Next.js inlines `process.env.NEXT_PUBLIC_STORAGE` at compile time, so the unused branch gets tree-shaken. A static `import` of both impls would pull Prisma's `better-sqlite3` (a Node-only native module) into the client bundle and break static export.

### Page dispatchers

`src/app/page.tsx`, `src/app/quiz/page.tsx`, `src/app/review/page.tsx` short-circuit to a `"use client"` variant (`dashboard-client.tsx`, `quiz-client.tsx`, `review-client.tsx`) when `NEXT_PUBLIC_STORAGE === "localstorage"`. The client variants import `@/lib/storage/localstorage` directly (not `@/lib/storage`) so dev builds don't transitively pull the Prisma branch into the browser bundle.

In server mode, the dispatcher calls `await headers()` before touching storage to opt into per-request dynamic rendering (replaces the old `export const dynamic = "force-dynamic"`, which couldn't be made conditional because Next.js requires that config to be a static string).

`/quiz` wraps the client variant in `<Suspense fallback={null}>` because `QuizClient` uses `useSearchParams()`, which Next requires under Suspense for static export.

### Static export: `output: 'export'`

`next.config.ts` switches to `{ output: "export", trailingSlash: true, images: { unoptimized: true } }` when `NEXT_PUBLIC_STORAGE === "localstorage"`. Output goes to `out/`.

`trailingSlash: true` makes URLs like `/quiz` resolve to `out/quiz/index.html`, which matters when serving via the plain `python3 -m http.server` or any static host that doesn't rewrite extensionless paths.

### The `/attempt` Route Handler problem

`src/app/attempt/route.ts` is a POST Route Handler. `output: "export"` **cannot** build POST/PUT/DELETE/PATCH Route Handlers — there is no runtime to serve them. We can't gate the export with `export const dynamic` either, because that field must be a static literal.

**Solution:** `scripts/build-static.sh` moves `src/app/attempt/` to a sibling stash directory for the duration of the build and restores it on exit (including on failure, via `trap cleanup EXIT`). In localStorage mode the route is never called — `quiz-form.tsx` branches on a `USE_LOCAL_STORAGE` module-level constant and calls `localStorageStorage.recordAttempt(...)` directly — so removing the route from the static bundle is semantically correct.

## Tradeoffs

### Positive

- **Same codebase, same features.** Selector, SM-2, session stats, streak calc, sparklines — all pure, run identically in both modes. Tests (60 as of this ADR) cover the shared logic; storage contract is covered by storage-specific tests.
- **Zero-hosting deploy.** `out/` can ship to GitHub Pages, Netlify, or an S3 bucket with no runtime cost.
- **Offline-capable.** Static mode works without network after first load.
- **Cheap to toggle.** `NEXT_PUBLIC_STORAGE=localstorage pnpm build:static` — one env var.

### Negative

- **Two data stores, never synced.** An attempt logged on the server build isn't visible in the static build and vice versa. Documented in the ADR; acceptable for a single-user trainer.
- **localStorage capacity is finite (~5–10 MB).** At 10 B/attempt + 50 B/mastery row, 500 questions × 20 attempts each ≈ 200 KB — comfortable. Not a concern in practice.
- **Build script moves a source file.** `scripts/build-static.sh` side-effects the working tree; the `trap` restores it. Running the script under a non-bash shell or with `--no-trap` flags would leave `attempt/` stashed. Mitigated by: the stash is a fixed path (`.build-static-stash/`, gitignored), and any later `bash scripts/build-static.sh` or manual `mv` recovers it.
- **Duplicate rendering entry points.** Dashboard, quiz, review each have a server page + client wrapper + shared view component. Three per route instead of one. Necessary to keep the storage branch cleanly out of the client bundle; the shared `*-view.tsx` keeps the markup in one place.

## Alternatives Considered

### Runtime-switchable storage on a single server build
**Rejected.** The point is to run without a server. A server build that "also supports localStorage" still requires running `pnpm start`.

### Client-only SPA (drop Next entirely, use Vite + React Router)
**Rejected.** Would throw away the server-mode ergonomics (SEO, fast initial paint, Prisma + DB migrations, App Router DX). The dispatcher pattern is cheap relative to a rewrite.

### Keep `/attempt` as a GET handler with query-string body
**Rejected.** POST is semantically correct (records a mutation); GET would pollute browser history and bust CDN caches. The stash-during-build workaround is contained to one shell script and has no runtime cost.

### `pageExtensions` gate (e.g. `route.server.ts` only included in server builds)
**Rejected.** Next.js's `pageExtensions` matches the final file extension only (the part after the last dot), so `route.server.ts` and `route.ts` both resolve to extension `ts`. Couldn't isolate the server-only file cleanly.

### Generate `dynamic = "force-static"` at build time via codegen
**Rejected.** Adds a codegen step and a second source of truth for the dispatcher config. `await headers()` in the Prisma branch is a one-line equivalent.

## How to use

**Server mode (default):**
```bash
pnpm dev               # Turbopack dev, hot reload, Prisma-backed
pnpm build && pnpm start
```

**Static mode:**
```bash
pnpm build:static      # Produces out/
pnpm dev:static        # Serves out/ on http://localhost:3001
```

Deploying `out/`: upload the directory to any static host. No build-time env vars needed at the host — everything is pre-baked.

## Links

- [Next.js static export docs](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Next.js `route.ts` limitations for static export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports#unsupported-features)
- ADR 001: Technology Stack
