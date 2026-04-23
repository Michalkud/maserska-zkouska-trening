# BACKLOG

Top unchecked item = next work. The loop reads this, executes one item, marks it `[x]`, commits, exits.

Size items to fit one iteration (~15–30 min of Claude work). Split large items before executing.

---

- [x] **Research Czech masér qualification exam structure**
  - Fetch primary sources: hodnotící standard NSK 69-037-M (Národní soustava kvalifikací), zákon č. 455/1991 Sb. (živnostenský zákon, příloha 2, vázané živnosti — masérské, rekondiční a regenerační služby), relevant prováděcí vyhlášky for hygiene/first-aid requirements.
  - Save raw PDFs / HTML dumps to `docs/sources/` with filenames reflecting the source.
  - Write `docs/curriculum.md` — list the exam topic domains, their sub-topics, and a rough weight (% of exam). Cite each domain to a source in `docs/sources/`.
  - Commit: `docs: initial curriculum research from primary sources`.

- [x] **Decide stack and document the decision**
  - Write `docs/decisions/001-stack.md`. Default candidate: Next.js 15 App Router + TypeScript + Prisma + SQLite + shadcn/ui + Tailwind + pnpm. Confirm or deviate, with reasons.
  - Commit: `docs: ADR 001 — tech stack`.

- [ ] **Scaffold Next.js app**
  - `pnpm create next-app@latest` with TS + Tailwind + App Router.
  - Install: `prisma`, `@prisma/client`, shadcn/ui init, `better-sqlite3` (via Prisma).
  - Configure Prisma with SQLite provider at `./data/app.db`.
  - `pnpm dev` must boot cleanly.
  - Commit: `feat: scaffold Next.js + Prisma + Tailwind`.

- [ ] **Prisma schema: Topic, Question, Attempt, MasteryScore**
  - Match the data model in `~/SecondBrain/wiki/projects/maserska-zkouska-architecture.md`.
  - `prisma migrate dev --name init` applies it.
  - Commit: `feat: initial Prisma schema`.

- [ ] **Seed first curriculum domain into DB**
  - Pick the first domain from `docs/curriculum.md` (likely anatomy or contraindications).
  - Write ~20 multiple-choice questions + 5 open questions in Czech, each with `explanationCs` and `sourceRef`.
  - Prisma seed script populates Topic + Question rows.
  - Commit: `feat: seed first curriculum domain`.

- [ ] **Quiz UI — next-question selection + answer flow**
  - `app/quiz/page.tsx` picks one due question (see `lib/selector.ts`).
  - Multiple-choice renders as radio list; open-answer renders as textarea.
  - Submit → server action in `app/attempt/route.ts` → grade, insert Attempt, update MasteryScore via `lib/sm2.ts`.
  - Show correct answer + explanation after submit.
  - Commit: `feat: quiz page + attempt logging`.

- [ ] **SM-2 mastery + adaptive selection**
  - `lib/sm2.ts` — pure SM-2 implementation (ease, interval, repetitions, dueAt).
  - `lib/selector.ts` — weight by `(1 / mastery) × overdueDays × topic.weight`; fall back to unseen questions first.
  - Unit tests for sm2.ts.
  - Commit: `feat: SM-2 scoring + adaptive selection`.

- [ ] **Progress dashboard**
  - `app/page.tsx` — per-topic mastery bar, total due today, streak count.
  - Link to `/quiz`.
  - Commit: `feat: dashboard`.

- [ ] **Seed remaining curriculum domains**
  - Meta-task: if `docs/curriculum.md` has N domains and only 1 is seeded, split into N−1 items and add them before this one.
  - Commit per domain.
