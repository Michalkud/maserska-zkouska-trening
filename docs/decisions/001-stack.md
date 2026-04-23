# ADR 001: Technology Stack

**Status:** Accepted  
**Date:** 2026-04-23  
**Decision Maker:** Michal (via autonomous loop)

## Context

The maserska-zkouska-trening project is a web-based adaptive trainer for the Czech masér (sports and reconditioning massage therapist) qualification exam (NSK 69-037-M). It must:

- Track per-topic mastery across six exam domains
- Deliver spaced-repetition quizzes (SM-2 algorithm) biased toward weak areas
- Scale from ~100 to ~500 questions across all domains
- Run locally with zero cloud dependencies
- Support Czech language content
- Be maintainable by autonomous Claude loops (Haiku-based)

## Decision

Adopt the following full-stack:

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 15 App Router | Type-safe server/client; RSC for quizzes; `app/` directory modern standard |
| **Language** | TypeScript | Catch errors at build time; better IDE support in VS Code; standard for Next.js |
| **ORM** | Prisma | Simple schema, migrations, seeding; better-sqlite3 driver for local-first data |
| **Database** | SQLite (`./data/app.db`) | Zero external dependencies; file-based for simplicity; sufficient for ~500 questions |
| **UI Framework** | shadcn/ui + Tailwind CSS v4 | Component library + utility CSS; professional appearance; well-maintained |
| **CSS** | Tailwind CSS v4 | Utility-first; rapidly build layouts; v4 for latest features |
| **Package Manager** | pnpm | Faster than npm; strict dependency resolution; smaller node_modules footprint |

## Rationale

### Framework & Language
Next.js 15 with App Router is the current industry standard for React applications. TypeScript eliminates entire classes of runtime errors (type mismatches, undefined properties). Server components allow secure quiz submission logic without exposing secrets to the client.

### Data Layer
Prisma abstracts SQLite schema and migrations, making it easy to version-control the data model. SQLite is zero-ops: no external database server, no containers, no cloud bills. The three-table schema (Topic, Question, Attempt + MasteryScore aggregate) easily fits in a local SQLite file. No sharding or clustering needed at this scale.

### UI & Styling
shadcn/ui provides pre-built, accessible components (radio buttons, form inputs, cards) that work well for quiz flows. Tailwind CSS v4 (the latest stable) provides rapid styling without writing custom CSS. Together they produce professional-looking UIs quickly.

### Build Tooling
pnpm is faster and more deterministic than npm. Next.js already uses pnpm internally; it's the recommended package manager for new projects.

## Alternatives Considered

### Backend-only (Flask, Express, Rails)
**Rejected:** Would require separate frontend framework (React, Vue), increasing complexity. Full-stack Next.js is simpler for a solo project.

### PostgreSQL instead of SQLite
**Rejected:** Adds operational overhead (container, external process). SQLite is sufficient for ~500 questions. Can migrate later if needed.

### Vanilla CSS or CSS-in-JS
**Rejected:** Tailwind + shadcn/ui is fastest for this use case. Vanilla CSS would require more custom code; CSS-in-JS libraries (styled-components, Emotion) add runtime overhead.

### npm or Yarn instead of pnpm
**Rejected:** pnpm is faster and stricter; no disadvantage for a greenfield project.

## Consequences

### Positive
- **Fast development:** Next.js, Prisma, shadcn/ui ecosystem is mature and well-documented.
- **Type safety:** TypeScript catches errors early.
- **Local-first:** No cloud dependencies, no DevOps overhead.
- **Maintainable:** The tech stack is mainstream; future developers can onboard easily.

### Negative
- **Node.js runtime required:** Not a concern for a development tool.
- **Learning curve:** If Michal is unfamiliar with any of these, will need initial setup time (offset by their maturity).

## Implementation Notes

1. Start with `pnpm create next-app@latest` (TypeScript, Tailwind, App Router).
2. Install Prisma and shadcn/ui.
3. Initialize Prisma schema with SQLite provider pointing to `./data/app.db`.
4. Define Topic, Question, Attempt, MasteryScore tables.
5. Run `prisma migrate dev --name init` to create the database.

## Links

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [pnpm](https://pnpm.io/)
