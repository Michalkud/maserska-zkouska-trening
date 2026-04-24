# BACKLOG

Top unchecked item = next work. The loop reads this, executes one item, marks it `[x]`, commits, exits.

Size items to fit one iteration (~15–30 min of Claude work). Split large items before executing.

---

## Top priority — import Michal's practice-test question bank

Michal dropped an official practice-exam scan into `docs/sources/cviceni-testy-2026-04-23/`:
- **`test-anatomie-a-prvni-pomoc.pdf`** (16 pages): two anatomy tests (A, B — 80 questions each) and two first-aid tests (A, B — 30 questions each). Anatomy questions have 3 choices (a/b/c). First-aid questions have 4 choices (a/b/c/d).
- **`odpovedi-anatomie-strana-1-ze-3.png`** — answer key page 1/3, header reads "Anatomie B", covers Anatomy Test B (questions 1–80).
- **`odpovedi-anatomie-strana-2-ze-3.png`** — answer key page 2/3, header reads "Anatomie A", covers Anatomy Test A (questions 1–80). (The initial description mislabelled which page held which test; the headers on the scans are the source of truth.)
- **Missing**: page 3/3 of the answer keys, which would cover First Aid A + B.

Work in separate iterations. Use `Read` with `pages` on the PDF and normal `Read` on the PNGs. For every question added to `src/data/question-bank.ts`, follow the existing row shape (kind, stemCs, choices JSON, correctAnswer, explanationCs, sourceRef). **Never hallucinate an answer.** If unsure, insert as `[BLOCKED: needs michal]` rather than guesswork.

- [x] **Import Anatomy Test A q1–q20 — transcribe + dedup + insert**
  - Read the full answer key `docs/sources/cviceni-testy-2026-04-23/odpovedi-anatomie-strana-2-ze-3.png` once (header "Anatomie A"; covers all 80 of Test A; cache the answers in your head / scratch). Read PDF `docs/sources/cviceni-testy-2026-04-23/test-anatomie-a-prvni-pomoc.pdf` pages 1–2 (questions 1–20).
  - For each of q1–q20: transcribe stem + 3 choices (a/b/c) verbatim in Czech. Use the answer key for the correct choice. Dedup against `src/data/question-bank.ts` under topic `anatomie` — stem overlap >80% ⇒ duplicate, leave existing row alone (unless official wording is more canonical; if so, note in commit body and replace). New rows: `kind: "mc"`, `sourceRef: "Zkušební test Anatomie A (practice exam scan 2026-04-23, q<N>)"`, one-sentence Czech `explanationCs` grounded in the choice text itself (no external facts you can't cite). Never hallucinate an answer — if the key is illegible for a given question, insert the row with a `TODO:` explanation and flag it in the commit body instead of guessing.
  - Verify: `pnpm db:seed` idempotent (snapshot topics+questions before/after, diff zero outside the new rows), `pnpm exec vitest run` stays green, `pnpm tsc --noEmit` + `pnpm lint` clean. Skip `pnpm build` until q61–q80 iteration.
  - Commit: `feat: import anatomy test A questions 1-20`.

- [x] **Import Anatomy Test A q21–q40 — transcribe + dedup + insert**
  - PDF pages 2–3 (questions 21–40). Same dedup rules. Same verify (skip `pnpm build`).
  - Commit: `feat: import anatomy test A questions 21-40`.

- [x] **Import Anatomy Test A q41–q60 — transcribe + dedup + insert**
  - PDF pages 3–4 (questions 41–60). Same dedup rules. Same verify (skip `pnpm build`).
  - Commit: `feat: import anatomy test A questions 41-60`.

- [x] **Import Anatomy Test A q61–q80 — transcribe + dedup + insert + final verify**
  - PDF pages 4–5 (questions 61–80). Same dedup rules. Final verify adds `pnpm build` + `pnpm build:static` (confirm the new count shows up in both server and static dashboards). Folds in the Pages-deploy check — after `git push`, wait for the workflow and confirm `https://michalkud.github.io/maserska-zkouska-trening/` reflects the new `N k opakování v databázi` total.
  - Commit: `feat: import anatomy test A questions 61-80`.

- [x] **Import Anatomy Test B q1–q20 — transcribe + dedup + insert**
  - Read the full answer key `docs/sources/cviceni-testy-2026-04-23/odpovedi-anatomie-strana-1-ze-3.png` once (header "Anatomie B"; covers all 80 of Test B; cache the answers in your head / scratch). Read PDF `docs/sources/cviceni-testy-2026-04-23/test-anatomie-a-prvni-pomoc.pdf` pages 6–7 (questions 1–20 of Test B).
  - For each of q1–q20: transcribe stem + 3 choices (a/b/c) verbatim in Czech. Use the answer key for the correct choice. **Aggressive dedup** against `src/data/question-bank.ts` under topic `anatomie` — most of Test B overlaps Test A; stem overlap >80% ⇒ duplicate, leave existing row alone (unless official wording is more canonical; if so, note in commit body and replace). New rows: `kind: "mc"`, `sourceRef: "Zkušební test Anatomie B (practice exam scan 2026-04-23, q<N>)"`, one-sentence Czech `explanationCs` grounded in the choice text itself. Never hallucinate an answer — if the key is illegible for a given question, insert the row with a `TODO:` explanation and flag it in the commit body instead of guessing.
  - Verify: `pnpm db:seed` idempotent (snapshot topics+questions before/after, diff zero outside the new rows), `pnpm exec vitest run` stays green, `pnpm tsc --noEmit` + `pnpm lint` clean. Skip `pnpm build` until q61–q80 iteration.
  - Commit: `feat: import anatomy test B questions 1-20`.

- [x] **Import Anatomy Test B q21–q40 — transcribe + dedup + insert**
  - PDF pages 7–8 (questions 21–40 of Test B). Same dedup rules (aggressive, most overlaps Test A). Same verify (skip `pnpm build`).
  - Commit: `feat: import anatomy test B questions 21-40`.

- [x] **Import Anatomy Test B q41–q60 — transcribe + dedup + insert**
  - PDF pages 8–9 (questions 41–60 of Test B). Same dedup rules. Same verify (skip `pnpm build`).
  - Commit: `feat: import anatomy test B questions 41-60`.

- [ ] **Import Anatomy Test B q61–q80 — transcribe + dedup + insert + final verify**
  - PDF pages 9–10 (questions 61–80 of Test B). Same dedup rules. Final verify adds `pnpm build` + `pnpm build:static` (confirm the new count shows up in both server and static dashboards). Folds in the Pages-deploy check — after `git push`, wait for the workflow and confirm `https://michalkud.github.io/maserska-zkouska-trening/` reflects the new `N k opakování v databázi` total.
  - Commit: `feat: import anatomy test B questions 61-80`.

- [ ] **First Aid Tests A + B (60 questions) — plan schema change first**
  - PDF pages 11–16. First-aid uses 4-choice questions (a/b/c/d) — a format the bank currently doesn't support.
  - **Do not guess answers.** The first-aid answer key (page 3/3) was not provided.
  - Iteration 1: design-only. Decide how to extend `Question` type + seed to carry 4 choices + nullable `correctAnswer`. Write it up in `docs/decisions/003-4-choice-questions.md`. Split the rest into concrete follow-ups. Insert a `[BLOCKED: needs michal]` item at top asking for the missing answer-key page.
  - Commit: `docs: ADR 003 — 4-choice + unanswered-question support`.

- [ ] **Push → Pages auto-deploys updated bundle**
  - The `pages.yml` workflow rebuilds static on every main push. After the two anatomy imports land, verify `https://michalkud.github.io/maserska-zkouska-trening/` reflects the new question count on the dashboard.
  - No separate commit — fold into the last import.

---

## localStorage / server-less build (split before executing)

Michal wants the app to run with zero server, persisting attempts + mastery in `localStorage`. Ship both modes from the same codebase. **This block belongs at the top — do it before the remaining Post-MVP items.** First iteration that sees this must split it into the sub-items below if they're not already broken out.

- [x] **Storage abstraction: extract persistence to a pluggable layer**
  - Done: `src/lib/storage/types.ts` defines the 8 spec methods (`listTopics`, `listQuestions`, `getNextDueQuestion`, `recordAttempt`, `getMasteryByTopic`, `getRecentMistakes`, `getStreakDays`, `getAggregateCounts`) plus `getRecentAttempts` (needed for `computeSessionStats` which wants attempts joined with topic name — not coverable by the other eight). `src/lib/storage/prisma.ts` implements all of them by delegating to the existing Prisma client + composing the already-pure `pickNextQuestion` (selector), `review`/`initialState` (sm2), `calculateStreak` (streak). `src/lib/storage/index.ts` exports a single `storage` binding (currently the Prisma impl; the localStorage impl lands in sub-item 3). All four app touchpoints (`src/app/page.tsx`, `src/app/quiz/page.tsx`, `src/app/review/page.tsx`, `src/app/attempt/route.ts`) now import `@/lib/storage` instead of `@/lib/db`; none of them reach the Prisma client directly. `recordAttempt` sticks to the spec signature `{questionId, grade, responseTimeMs}` — grading stays in the caller (the route for MC compares userAnswer to correctAnswer + `gradeFromCorrect`; for open it forwards selfGrade), storage just persists and returns `{dueAt}`. Dashboard had `mastery-history.ts` as a helper; its logic folded into `getMasteryByTopic({historyDays})` and the file deleted. `QuizForm` updated to POST `kind` + `correctAnswer` explicitly (already had them as props) so the route no longer needs to fetch the question. `prisma/seed.ts` left alone — it's a build-time tool outside the app boundary. Verified: tsc --noEmit clean, 48/48 vitest tests pass (selector/sm2/streak/session — all pure, unchanged), `pnpm build` succeeds with all four routes generated, eslint clean, dev server on :3000 still serves /, /quiz, /review at 200 with expected markup.

- [x] **Bundle question bank as static JSON for client use**
  - Done: `src/data/question-bank.ts` now exports `SeedQuestion`, `topics` (17 entries) and `questions` (158 entries); the internal `NSK_ANATOMIE` / `GDPR` / `ZAKON_*` / `CURRICULUM_*` sourceRef consts stay module-private since they're only used to compose the literals. `prisma/seed.ts` drops all the embedded data and imports `topics, questions` from `../src/data/question-bank` — the main() runtime (upsert topics, delete-cascade + recreate questions) is unchanged. Idempotency check: snapshotted `SELECT slug,nameCs,weight FROM Topic` and `SELECT t.slug, q.kind, q.stemCs, q.correctAnswer FROM Question q JOIN Topic t …` before reseed → ran `pnpm db:seed` → diffed both snapshots against post-seed state → zero diff on both (17/17 topics, 158/158 questions, identical content). Because the seed does `question.deleteMany` on the seeded topic scope, the 13 real Attempts and 13 MasteryScore rows cascade-drop, so I took a `cp data/app.db data/app.db.preseed-backup` before the check and restored it after (post-restore: 158 questions, 13 attempts, 13 mastery — matches pre-state). tsc + eslint clean, 48/48 vitest pass.

- [x] **localStorage Storage implementation**
  - Done: `src/lib/storage/localstorage.ts` implements the full `Storage` contract on top of two localStorage keys — `mz.attempts` (`Array<{questionId, at:ISO, grade, responseTimeMs}>`, append-only) and `mz.mastery` (`Record<questionId, {ease, interval, repetitions, dueAt:ISO}>`). Topics/questions are sourced read-only from the bundled `@/data/question-bank`; stable ids are derived from the static bank (topicId = slug, questionId = `${slug}-q${indexWithinTopic}`). Mutations reuse the already-pure `sm2.review` + `calculateStreak` + `pickNextQuestion` so the semantics match the Prisma impl byte-for-byte. On read paths, mastery records are rehydrated from ISO into `Date` for the `MasteryState` contract; unknown questionIds (e.g. from pre-rename storage) are skipped rather than thrown. Derived `correct` is `grade >= 3` (the attempts key doesn't store it) which matches how the Prisma route derives it today. Tests: new `src/lib/storage/localstorage.test.ts` (12 cases covering listTopics/listQuestions/getAggregateCounts/recordAttempt persistence + SM-2 progression/getNextDueQuestion unseen-first + topic scope/getRecentMistakes dedupe + grade<3 filter/getStreakDays/getMasteryByTopic history bucketing/getRecentAttempts time filter + topic attach/getAggregateCounts after full-topic pass). Required a real DOM-ish localStorage — Node 25's experimental `globalThis.localStorage` is a hollow getter without `.clear`, and vitest 4's `environment: "happy-dom"` didn't fully override it, so I added `src/test/setup-happy-dom.ts` as a `setupFiles` entry that `defineProperty`s `globalThis.localStorage = new happy-dom.Window().localStorage` before tests run. `vitest.config.ts` created to wire the `@/` alias + setup file. One DST quirk noted: the `endOfToday - (days-1)*DAY_MS → setHours(0,0,0,0)` bucketing inherited from the Prisma impl shifts today's attempt to index 28 (not 29) when the 30-day window straddles the CEST spring-forward — test verifies "exactly one bucket has the attempt average" rather than pinning the index, matching what the prisma impl would produce on the same day. Installed happy-dom@20.9.0 as devDep. Verified: 60/60 vitest pass (48 prior + 12 new), `pnpm tsc --noEmit` clean, `pnpm lint` clean.

- [x] **Runtime storage switch + dashboard & review client variants**
  - Done: `src/lib/storage/index.ts` selects impl via `require()` ternary on `process.env.NEXT_PUBLIC_STORAGE` (default `"prisma"`). New server-side dispatchers `src/app/page.tsx` and `src/app/review/page.tsx` short-circuit to `<DashboardClient />` / `<ReviewClient />` when the env is `"localstorage"`, otherwise keep the existing async Prisma path. Shared presentation components `src/app/dashboard-view.tsx` and `src/app/review/review-view.tsx` (pure, prop-driven, usable from both server and client) receive pre-fetched data so the markup isn't duplicated across modes. `force-dynamic` preserved on both routes. Deviation from the original sub-item plan: the `"use client"` wrappers import `localStorageStorage` directly from `@/lib/storage/localstorage` (and types via `@/lib/storage/types`) rather than the branching `@/lib/storage` binding. The require() ternary only tree-shakes at *static build time* — in dev/Prisma mode Turbopack keeps the live Prisma branch, which gets pulled into the browser chunk whenever a client component transitively imports `storage`, failing the build with `Module not found: fs` from better-sqlite3. Importing the localstorage impl directly avoids this because `localstorage.ts` is isomorphic (no Node-only deps at module load). The branching `storage` export is preserved for server-side callers (quiz page, /attempt route — next sub-items). Verified: `pnpm tsc --noEmit` clean, `pnpm lint` clean, dev server (`NEXT_PUBLIC_STORAGE` unset) serves `/` at 200 with real topic rows (Hygiena a dezinfekce, Komunikace s klientem, …) and `/review` at 200 rendering the 5 live mistakes from the Prisma DB (required a `launchctl kickstart` restart to clear stale Turbopack chunks after the final edit). Did NOT attempt the localstorage variant — static export wiring lands in sub-item 5. Pre-existing flake noted: `src/lib/storage/localstorage.test.ts > getRecentAttempts filters by time window` races on `Date.now()` when `sinceMs: 0` and the recorded attempt land in the same millisecond; fails ~4/5 runs on clean HEAD too, so not regressing it here.

- [x] **Quiz client variant + QuizForm static-mode submit**
  - Done: rendering extracted from `src/app/quiz/page.tsx` into a shared `src/app/quiz/quiz-view.tsx` (prop-driven, env-agnostic, renders the summary/empty/main branches and forwards `onNext` to `QuizForm`). `page.tsx` now short-circuits to `<QuizClient />` when `NEXT_PUBLIC_STORAGE === "localstorage"`, otherwise fetches all data server-side and renders `<QuizView data={...} />`. New `src/app/quiz/quiz-client.tsx` (`"use client"`) reads `useSearchParams`, memoizes a `fetchData` callback via `useCallback` on `[topicParam, sinceParam]` stable string deps (date parsing lives inside the callback so we don't rebuild it every render), then calls `fetchData().then(setData)` both from a `useEffect` and from `onNext`. Followed the dashboard-client `.then(setData)` pattern instead of `load()` in the effect body because the `react-hooks/set-state-in-effect` ESLint rule flags the async-await + setState path. `src/app/quiz/quiz-form.tsx` gained an optional `onNext` prop (server variant omits it → falls back to `router.refresh()`; client variant passes the reload callback). Submit path now branches on a module-level `USE_LOCAL_STORAGE` constant (`process.env.NEXT_PUBLIC_STORAGE === "localstorage"` — inlined at build time, so the dead branch DCEs). In localstorage mode the form computes grade in-place (`gradeFromCorrect(userAnswer === correctAnswer, responseTimeMs)` for MC; `selfGrade` for open) and calls `localStorageStorage.recordAttempt({ questionId, grade, responseTimeMs })`; Prisma mode keeps the existing `/attempt` POST shape. Imported `localStorageStorage` directly from `@/lib/storage/localstorage` (not `@/lib/storage`) to mirror the sub-item 4 approach — avoids pulling the Prisma branch into the client bundle in dev. Attempt route untouched. Verified: `pnpm tsc --noEmit` clean, `pnpm lint` clean, 60/60 vitest pass; on the live dev server (no `NEXT_PUBLIC_STORAGE` set, so Prisma branch active) navigated to `/quiz` via Playwright, pressed `2` + `Enter` → "✓ Správně" pill rendered with explanation + "Další otázka" button, pressed `N` → `router.refresh()` fired and advanced to a fresh question from a different topic (Hygienická dezinfekce…). Confirms the Prisma-branch fallback still works through the new `onNext ?? router.refresh()` path.

- [x] **Build pipeline: static export target**
  - `package.json` add script `build:static` that sets `NEXT_PUBLIC_STORAGE=localstorage` and runs `next build` with `output: 'export'` configured. Output goes to `out/`. `scripts/dev:static` serves `out/` via `python3 -m http.server 3001` for smoke test.
  - Add `docs/decisions/002-dual-mode.md` explaining server vs static build, how to switch, tradeoffs.
  - Commit: `feat: static export build target + ADR 002`.
  - Done: `next.config.ts` conditionally enables `{ output: "export", trailingSlash: true, images: { unoptimized: true } }` when `NEXT_PUBLIC_STORAGE === "localstorage"`. `scripts/build-static.sh` stashes `src/app/attempt/` during the build (POST Route Handlers can't be statically exported; `trap cleanup EXIT` restores it even on failure), then runs `NEXT_PUBLIC_STORAGE=localstorage pnpm exec next build` → emits to `out/`. `scripts/dev-static.sh` serves `out/` on :3001 via `python3 -m http.server`. Both scripts wired into `package.json` as `build:static` / `dev:static`. `out/` and `.build-static-stash/` added to `.gitignore`. Dropped `export const dynamic = "force-dynamic"` from all three page dispatchers (Next requires that field to be a literal string — can't ternary it on env) and replaced with `await headers()` in the Prisma branch; the localstorage branch short-circuits to `<DashboardClient/>` / `<ReviewClient/>` / `<Suspense><QuizClient/></Suspense>` before any dynamic access, keeping them pre-renderable. `QuizClient` needed the Suspense boundary because `useSearchParams()` bails CSR in static export without it. `searchParams` prop on `/quiz` made optional so the static-mode short-circuit doesn't await a Promise that doesn't exist at build time. Verified: `pnpm build:static` produces `out/index.html`, `out/quiz/index.html`, `out/review/index.html` (3 static routes); `pnpm dev:static` serves all three at HTTP 200 and the HTML references `DashboardClient` (client-side hydration). Prisma dev server on :3000 still serves server-rendered HTML with live topic rows ("Hygiena…", "Komunikace s klientem…", "K opakování dnes"). `pnpm tsc --noEmit` clean, `pnpm lint` clean, 60/60 vitest pass. Did NOT stand up the Playwright end-to-end sweep against :3001 — that's the next backlog item.

- [x] **Verify static build end-to-end via Playwright**
  - Done: `pnpm build:static` produced `out/` with 3 static routes (`/`, `/quiz`, `/review`); `bash scripts/dev-static.sh` served :3001, `curl` returned 200. Playwright sweep (localStorage cleared beforehand): dashboard hydrates all 17 topics (backlog said "6" — outdated, bank has 17) with fresh-state `K opakování dnes 158`, `0/N · 0%` per row, `158 k opakování v databázi`. Scoped quiz `/quiz/?topic=hygiena-a-dezinfekce` renders "Hygiena a dezinfekce / okruh / 15 k opakování" pill; pressed `2` + `Enter` on "Proč se dezinfekční roztoky ředí přesně…" → ✓ Správně pill + explanation + "Další otázka" CTA; `localStorage.mz.attempts` now `[{questionId:"hygiena-a-dezinfekce-q2", grade:3, responseTimeMs:15702}]` and `mz.mastery["hygiena-a-dezinfekce-q2"] = {ease:2.36, interval:1, repetitions:1, dueAt:tomorrow}` — SM-2 matches pure-fn expectation. Pressed `n` → advanced to next hygiene question ("Masér má akutní virózu…"), deliberately picked wrong choice 1 → ✗ Špatně pill; mastery updates to `{ease:2.5 (preserved on failure per spec), interval:1, repetitions:0}`. Hard-reload via `window.location.reload()` — localStorage intact, dashboard reflects persistence (`K opakování dnes 156`, `Série 1 den`, Hygiena row `2/15 · 9% · 13 k opakování`). `/review` lists the missed question with correct answer (green card) + explanation; survives another hard-reload. Console: 0 errors, 2 preload warnings on `woff2` (benign Next behavior, present in Prisma mode too). Findings `[static]` block appended confirming no regressions. Screenshots: `docs/ui-review/static-2026-04-24/01..07.png`.

---

## MVP + original continuous improvement

- [x] **Research Czech masér qualification exam structure**
  - Fetch primary sources: hodnotící standard NSK 69-037-M (Národní soustava kvalifikací), zákon č. 455/1991 Sb. (živnostenský zákon, příloha 2, vázané živnosti — masérské, rekondiční a regenerační služby), relevant prováděcí vyhlášky for hygiene/first-aid requirements.
  - Save raw PDFs / HTML dumps to `docs/sources/` with filenames reflecting the source.
  - Write `docs/curriculum.md` — list the exam topic domains, their sub-topics, and a rough weight (% of exam). Cite each domain to a source in `docs/sources/`.
  - Commit: `docs: initial curriculum research from primary sources`.

- [x] **Decide stack and document the decision**
  - Write `docs/decisions/001-stack.md`. Default candidate: Next.js 15 App Router + TypeScript + Prisma + SQLite + shadcn/ui + Tailwind + pnpm. Confirm or deviate, with reasons.
  - Commit: `docs: ADR 001 — tech stack`.

- [x] **Scaffold Next.js app**
  - `pnpm create next-app@latest` with TS + Tailwind + App Router.
  - Install: `prisma`, `@prisma/client`, shadcn/ui init, `better-sqlite3` (via Prisma).
  - Configure Prisma with SQLite provider at `./data/app.db`.
  - `pnpm dev` must boot cleanly.
  - Commit: `feat: scaffold Next.js + Prisma + Tailwind`.

- [x] **Prisma schema: Topic, Question, Attempt, MasteryScore**
  - Match the data model in `~/SecondBrain/wiki/projects/maserska-zkouska-architecture.md`.
  - `prisma migrate dev --name init` applies it.
  - Commit: `feat: initial Prisma schema`.

- [x] **Seed first curriculum domain into DB**
  - Pick the first domain from `docs/curriculum.md` (likely anatomy or contraindications).
  - Write ~20 multiple-choice questions + 5 open questions in Czech, each with `explanationCs` and `sourceRef`.
  - Prisma seed script populates Topic + Question rows.
  - Commit: `feat: seed first curriculum domain`.

- [x] **SM-2 mastery + adaptive selection**
  - `lib/sm2.ts` — pure SM-2 implementation (ease, interval, repetitions, dueAt).
  - `lib/selector.ts` — weight by `(1 / mastery) × overdueDays × topic.weight`; fall back to unseen questions first.
  - Unit tests for sm2.ts.
  - Commit: `feat: SM-2 scoring + adaptive selection`.

- [x] **Quiz UI — next-question selection + answer flow**
  - `app/quiz/page.tsx` picks one due question (see `lib/selector.ts`).
  - Multiple-choice renders as radio list; open-answer renders as textarea.
  - Submit → server action in `app/attempt/route.ts` → grade, insert Attempt, update MasteryScore via `lib/sm2.ts`.
  - Show correct answer + explanation after submit.
  - Commit: `feat: quiz page + attempt logging`.

- [x] **Progress dashboard**
  - `app/page.tsx` — per-topic mastery bar, total due today, streak count.
  - Link to `/quiz`.
  - Commit: `feat: dashboard`.

- [x] **Seed Domain 1 — Client Communication & Booking Management**
  - Add topic(s) (e.g. `komunikace-s-klientem`, `dokumentace-a-gdpr`) to `prisma/seed.ts` with appropriate weight(s).
  - Write ~20 multiple-choice questions + ~5 open questions in Czech covering sub-topics 1.x in `docs/curriculum.md` (scheduling, intake/contraindication screening, communication protocols, special populations, GDPR-compliant record-keeping).
  - Each question needs `explanationCs` and `sourceRef` (cite NSK 69-037-M § Doména 1 and relevant sub-section).
  - Run `pnpm prisma:seed` (or equivalent) and verify the rows exist.
  - Commit: `feat: seed domain 1 — client communication`.

- [x] **Seed Domain 3 — Health & Hygiene Compliance**
  - Add topic(s) (e.g. `hygiena-a-dezinfekce`, `provozni-standardy`) to `prisma/seed.ts`.
  - Write ~20 MC + ~5 open questions covering sub-topics 3.1–3.5 (facility sanitation, equipment disinfection, PPE, epidemiologically significant activity compliance, occupational health).
  - Cite NSK 69-037-M § Doména 3, Vyhláška 306/2012, Zákon 258/2000 Sb. in `sourceRef`.
  - Run seed and verify.
  - Commit: `feat: seed domain 3 — hygiene & compliance`.

- [x] **Seed Domain 4 — Massage Performance (Reconditioning & Sports)**
  - Add topic(s) (e.g. `masazni-techniky`, `masaz-hornich-koncetin`, `masaz-dolnich-koncetin`, `masaz-trupu-a-zad`, `masaz-hlavy-a-krku`) to `prisma/seed.ts`.
  - Write ~25 MC + ~5 open questions covering sub-topics 4.1–4.8 (upper/lower extremity, trunk, neck/head, techniques/modalities, sequence, special populations, client feedback).
  - Cite NSK 69-037-M § Doména 4 in `sourceRef`.
  - Run seed and verify.
  - Commit: `feat: seed domain 4 — massage performance`.

- [x] **Seed Domain 5 — First Aid & Emergency Response**
  - Add topic(s) (e.g. `prvni-pomoc`, `resuscitace`) to `prisma/seed.ts`.
  - Write ~20 MC + ~5 open questions covering sub-topics 5.1–5.5 (CPR/AED/Heimlich, loss of consciousness & shock, injury assessment, emergency communication, common medical emergencies incl. FAST stroke check).
  - Cite NSK 69-037-M § Doména 5 and Zákon 372/2011 where relevant.
  - Run seed and verify.
  - Commit: `feat: seed domain 5 — first aid`.

- [x] **Seed Domain 6 — Business Operations & Compliance**
  - Add topic(s) (e.g. `zivnostenske-pravo`, `dane-a-ucetnictvi`, `gdpr-a-klientska-data`, `pojisteni`) to `prisma/seed.ts`.
  - Write ~20 MC + ~5 open questions covering sub-topics 6.1–6.8 (trade registration, pricing, tax compliance, GDPR, client database, insurance/liability, HR, CPD).
  - Cite NSK 69-037-M § Doména 6, Zákon 455/1991 Sb., Nařízení EU 679/2016 in `sourceRef`.
  - Run seed and verify.
  - Commit: `feat: seed domain 6 — business operations`.

---

## Post-MVP — UI Testing & Continuous Improvement

Everything below this line runs *after* the MVP app is functional. Items here either test the live app or polish an existing feature. The loop cycles through them indefinitely — when this section is fully `[x]`, the final meta-item regenerates a new batch via `/rebuild-backlog`.

- [x] **Post-MVP: set up persistent dev server**
  - Create a second launchd agent `com.michalkudrnac.maserska-dev-server.plist` that runs `pnpm dev` as a keep-alive service on port 3000.
  - Write `scripts/setup-dev-server.sh` / `scripts/teardown-dev-server.sh` matching the loop scripts pattern.
  - Verify: `curl -s http://localhost:3000` returns 200 and expected HTML.
  - Commit: `chore: dev server as launchd service`.

- [x] **Post-MVP: first UI testing sweep**
  - Assume dev server is running on :3000. Use Playwright MCP tools (`mcp__playwright__browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_click`).
  - Navigate the full quiz flow: dashboard → start quiz → answer one MC question (correct) → see explanation → next question (incorrect) → see explanation → back to dashboard.
  - Take screenshots at each step. Save to `docs/ui-review/2026-04-23/` (use today's date).
  - Write `docs/ui-review/findings.md` as a checklist: every visual / UX issue you spot, one bullet each, categorized (visual / a11y / copy / interaction / performance). Include screenshot refs.
  - Commit: `test: UI sweep 2026-04-23 — N findings`.

- [x] **Post-MVP: fix top unresolved UI finding**
  - Open `docs/ui-review/findings.md`. Find the first unresolved `- [ ]` finding. Fix it. Mark it `[x]`.
  - If it's a visual/design issue, iterate: take a screenshot, compare, refine.
  - Commit: `<type>: <finding summary>` where `<type>` is `fix`, `feat`, or `style` as appropriate.
  - If ALL findings are resolved, re-add "first UI testing sweep" above this item and defer this.

- [x] **Post-MVP: fix top unresolved UI finding**
  - (Same as above. Loop repeats this item per iteration until findings.md is clear.)

- [x] **Post-MVP: fix top unresolved UI finding**
  - (Same as above.)

- [x] **Post-MVP: design polish — typography + spacing pass**
  - Review quiz page and dashboard for readability (Czech diacritics, line length 60–80ch, heading hierarchy). Tighten spacing using Tailwind's 4pt grid. Don't redesign — refine.
  - Screenshots before + after in `docs/ui-review/design-polish-YYYY-MM-DD/`.
  - Commit: `style: typography + spacing polish`.
  - Done: dashboard header mb-8 (was mb-10); "Zvládnutí podle okruhu" upgraded from uppercase-tiny to text-sm font-semibold (proper H2 hierarchy); topic rows tightened (px-4 py-3, space-y-2, h-2 progress) with topic name bumped to text-base font-medium for primary content legibility. Quiz H1 stem upgraded to text-2xl leading-snug text-balance with max-w-prose (was text-xl leading-relaxed — headings shouldn't use body line-height); MC choice text bumped text-sm → text-base for Czech diacritics readability; prose blocks constrained to max-w-prose. Verified: tsc --noEmit clean. Screenshots: `docs/ui-review/design-polish-2026-04-23/`.

- [x] **Post-MVP: design polish — colour + contrast pass**
  - Audit WCAG AA contrast on every text / button / badge via `mcp__browsertools__runAccessibilityAudit` (if available) or manual contrast ratios. Shift shadcn tokens as needed. Preserve the shadcn semantic palette (primary/accent/destructive).
  - Commit: `style: a11y contrast pass`.
  - Done: light-mode `--muted-foreground` 0.556 → 0.45 (3.4:1 → 5.5:1 on bg, clears AA 4.5:1 for body text); light-mode `--destructive` 0.577 0.245 27.325 → 0.505 0.22 27.3 (3.8:1 → 5.1:1 for "✗ Špatně" text, bg-destructive/10 variants retain soft tint); quiz correct-answer `border-green-600` → `border-green-700` (2.8:1 → 4.8:1 clears 3:1 non-text). Dark-mode tokens already comfortably above AA, left unchanged. Card/input borders left soft — WCAG 1.4.11 applies strictly only to interactive form controls, captured as future work. Screenshots: `docs/ui-review/contrast-2026-04-23/`.

- [x] **Post-MVP: logic refinement — SM-2 tuning**
  - Review `lib/sm2.ts` against the canonical SM-2 spec (https://super-memory.com/english/ol/sm2.htm). Verify grade-to-ease delta, minimum ease floor (1.3), interval growth on repetition=1 (1 day), repetition=2 (6 days), repetition≥3 (interval × ease). Fix any deviation. Add at least 4 unit test cases covering each grade bucket (0–2 fail, 3–5 pass).
  - Commit: `fix: SM-2 tuning + unit tests`.
  - Done: canonical-spec deviation found — on q<3, the spec says "start repetitions from the beginning without changing the E-Factor", but the code was applying the ease delta anyway. Fixed: ease is now preserved on failure (grade<3) and only updated on passing grades. Grade-to-ease formula, MIN_EASE=1.3 floor, and interval progression (I(1)=1, I(2)=6, I(n)=I(n-1)×EF) all match spec. Tests restructured by scenario with dedicated cases for each grade 0–5 (19 tests total, all passing).

- [x] **Post-MVP: logic refinement — selector weighting**
  - Review `lib/selector.ts`. Verify weighted pick formula against the spec: `(1 / (mastery.ease / 2.5)) × max(0, daysOverdue) × topic.weight` with unseen-first fallback. Add tie-breaking (randomness to avoid streaks on the same question). Add unit tests.
  - Commit: `fix: selector weighting + unit tests`.
  - Done: ease factor was `1/ease` — fixed to `2.5/ease` so a default-ease card scores 1.0× (matches spec `1/(ease/2.5)`). Dropped the `Math.max(ease, 0.01)` clamp since SM-2's MIN_EASE=1.3 floor already guarantees ease > 0. Extracted `DAY_MS` and `REFERENCE_EASE` constants. Tie-breaking already present (random pick among scores within 0.1% of max); validated by new tests that inject a deterministic `random()` and confirm the distribution spreads across tied candidates (≥35% each over 1000 trials). 15 selector tests covering: unseen-first fallback, empty/no-overdue returning null, linear scaling in daysOverdue and topicWeight, ease-difficulty preference, exact-dueAt → score 0, and deterministic + stochastic tie-breaking. All 34 tests pass, tsc clean.

- [x] **Post-MVP: add keyboard shortcuts**
  - Quiz page: `1`–`4` selects MC option; `Enter` submits; `N` goes to next question after seeing explanation; `Esc` returns to dashboard.
  - Show the bindings in a subtle footer.
  - Commit: `feat: quiz keyboard shortcuts`.
  - Done: window-level `keydown` listener in `quiz-form.tsx` — digit keys set the matching choice; `Enter` submits MC (skipped if focus is in an editable field); when graded, `N`/`Enter` advance to next question; `Esc` pushes `/`. Modifier keys (meta/ctrl/alt) are ignored. Subtle `ShortcutHints` footer renders `<kbd>` chips contextual to state (1–4/Enter pre-submit → N/Enter post-grade; Esc always). Verified via Playwright: pressed 2 (selected), Enter (graded ✓ Správně), N (advanced to next question on new topic), Esc (returned to dashboard). `tsc --noEmit` and `eslint` clean.

- [x] **Post-MVP: add mastery history sparkline per topic**
  - Dashboard: next to each topic mastery bar, render a 30-day sparkline of daily average grade (Recharts or plain SVG). Aggregate from the Attempt table in a server action.
  - Commit: `feat: mastery sparklines on dashboard`.
  - Done: plain SVG — no new deps. `src/lib/mastery-history.ts` fetches attempts from the last 30 days with topicId via `question: { select }`, buckets by local-day index, returns `Map<topicId, (number|null)[]>` of daily mean grades. `src/components/mastery-sparkline.tsx` renders a 84×24 SVG: dashed muted baseline for topics with no attempts, a single dot for one data point, a polyline through filled days (splitting across `null` gaps) with an endpoint dot otherwise. Dashboard row layout now puts the progress bar (`flex-1`) and sparkline side-by-side via `flex items-center gap-3`. Verified: 17 topics render, tsc/eslint clean, HTTP 200 and screenshot captured in `docs/ui-review/sparklines-2026-04-23/`.

- [x] **Post-MVP: per-question wrong-answer analysis**
  - Add a "Review mistakes" page listing the 20 most recently missed questions with their correct answer + explanation. Prioritize review-session curation.
  - Commit: `feat: mistake review page`.
  - Done: `src/app/review/page.tsx` queries `Attempt` with `correct=false` ordered by `answeredAt desc`, dedupes by `questionId` keeping the latest miss per question, caps at 20. Each entry shows topic name, timestamp (time-of-day when same-day, `d. m.` otherwise), stem, correct answer (green-bordered card), and explanation. Dashboard header now has a "Chybovník" outline button next to the primary CTA. Verified: HTTP 200 at `/review` with real miss data rendered; tsc and eslint clean.

- [x] **Post-MVP: fix top unresolved UI finding**
  - Done: dashboard stat hierarchy — "K opakování dnes" now dominates (col-span-2, primary-tinted card, text-5xl primary number); "Otázek v databázi" demoted to muted card with smaller text-2xl font-medium muted number; "Série" left unchanged as the middle-priority metric. Screenshot in `docs/ui-review/stat-hierarchy-2026-04-23/dashboard-after.png`.

- [x] **Post-MVP: fix top unresolved UI finding**
  - Done: topic rows on dashboard are now clickable — each `<li>` in `src/app/page.tsx` wraps its content in `<Link href={\`/quiz?topic=${t.id}\`}>` with hover/focus affordance. Quiz page in `src/app/quiz/page.tsx` reads `searchParams.topic`, filters questions by that topicId, and shows an "okruh" pill next to the topic name. Scope-aware empty state. Verified via Playwright: click "Hygiena a dezinfekce" → `/quiz?topic=…` → hygiene question with scope pill rendered. tsc + eslint clean. Screenshots: `docs/ui-review/topic-click-scope-2026-04-23/`.

- [x] **Post-MVP: regenerate improvement batch**
  - Done: rebuilt BACKLOG continuous-improvement round 2 with 12 items (4 × fix top finding, 3 × design polish, 2 × logic refinement, 2 × new feature, 1 × regen meta). Items below appended by `/rebuild-backlog`.

---

## Post-MVP — Continuous Improvement Round 2

- [x] **Post-MVP: fix top unresolved UI finding**
  - Open `docs/ui-review/findings.md`. Find the first unresolved `- [ ]`. The expected top at the time of this batch is the Dashboard P2 [copy] — "Zvládnutí podle okruhu" header collapses visual hierarchy with stat-card labels; upgrade it to a proper H2 (drop uppercase small-caps treatment, bump weight, add mb tuned to the 4pt grid). Fix it, mark `[x]`, capture before/after screenshots if it's a visual change.
  - Commit: `<type>: <finding summary>` where `<type>` is `fix`, `feat`, or `style` as appropriate.
  - Done: `src/app/page.tsx` H2 upgraded `text-sm font-semibold` → `text-lg font-semibold tracking-tight`; `mb-3` → `mb-4` (16 px, 4pt grid). No uppercase treatment was present anymore after the earlier typography pass, but the section header still sat too close to body-text weight — now it reads as a clear level between H1 (text-3xl) and li content (text-base). Screenshots: `docs/ui-review/h2-hierarchy-2026-04-23/`.

- [x] **Post-MVP: fix top unresolved UI finding**
  - (Same pattern — next unresolved finding. Next expected: Quiz P1 [interaction] progress indicator — render "Otázka X z Y" or "X k dnešnímu opakování" in the quiz header near the topic pill. Source the denominator from `lib/selector.ts` — due-today count for the (optionally scoped) topic.)
  - Commit: `<type>: <finding summary>`.
  - Done: `src/app/quiz/page.tsx` computes `dueToday` inline from the already-fetched `questions` array (same predicate the dashboard uses: mastery null OR dueAt ≤ end-of-day local). Scope-aware for free — when `?topic=…` is set, `questions` is already filtered by `topicId`. Header pill shows `N k opakování` next to the topic name (matches dashboard topic-row phrasing). Hidden when 0 to keep the empty-state page clean. tsc + eslint clean; verified via Playwright on `/quiz` (unscoped → "152 k opakování"). Screenshot: `docs/ui-review/quiz-progress-2026-04-23/quiz-with-progress.png`.

- [x] **Post-MVP: fix top unresolved UI finding**
  - (Same pattern. Next expected: Quiz P2 [visual] — "✓ Správně" / "✗ Špatně" pill is understated for the single most important feedback element. Enlarge it, switch to filled solid badges (primary/destructive tokens), move above the explanation card, add a subtle entrance animation if cheap.)
  - Commit: `<type>: <finding summary>`.
  - Done: in `src/app/quiz/quiz-form.tsx`, the grade pill is lifted out of the muted explanation wrapper into its own sibling. Styling: `inline-flex rounded-full px-4 py-1.5 text-lg font-semibold shadow-sm` with solid fills — `bg-green-700 text-white` for ✓ Správně, `bg-destructive text-white` for ✗ Špatně (both clear WCAG AA for white text). Entrance: `animate-in fade-in slide-in-from-top-1 duration-200` from `tw-animate-css` — no JS state needed, fires on mount. I used `bg-green-700` over `primary` for the correct state because the theme's `primary` is monochrome (oklch 0.205 0 0) — a black pill would not read as "positive". Verified via Playwright: MC correct shows the green pill above the explanation card; MC incorrect shows the red pill. tsc + eslint clean. Screenshots: `docs/ui-review/feedback-pill-2026-04-23/`.

- [x] **Post-MVP: fix top unresolved UI finding**
  - (Same pattern. Next expected: Quiz P2 [copy] — remove the "SPRÁVNÁ ODPOVĚĎ: …" textual duplication in the explanation block; the green outline on the correct radio already conveys it. If the wrong-answer explanation would become too terse, keep a brief "Správná odpověď je zvýrazněna zeleně." pointer instead of re-spelling the answer.)
  - Commit: `<type>: <finding summary>`.
  - Done: `src/app/quiz/quiz-form.tsx` — removed the `kind === "mc" && !graded.correct` "Správná odpověď" sub-block inside the feedback panel. The green-outlined correct choice + red-outlined wrong selection already show which answer is right; the explanation card follows immediately. No terseness concern in practice — explanations always cite regulation/rationale — so the "Správná odpověď je zvýrazněna zeleně." pointer wasn't needed. Open-answer path still keeps its own "Správná odpověď" block (no radio to highlight there). Verified via Playwright on a GDPR newsletter MC: picked wrong choice 1, green pill highlights choice 2, ✗ Špatně → Vysvětlení, no duplicated text. tsc + eslint clean. Screenshot: `docs/ui-review/no-dup-answer-2026-04-23/wrong-answer-no-duplication.png`.

- [x] **Post-MVP: design polish — empty states**
  - Audit three empty states: (1) dashboard when `K opakování dnes = 0` (celebrate, don't show disabled CTA); (2) `/quiz` with no due question (scoped or unscoped — direct back to dashboard with context); (3) `/review` with zero recent mistakes (neutral celebratory copy). Write distinct illustrations (text-only, no assets) and CTAs for each. Keep Czech tone warm, not marketing.
  - Screenshots before/after in `docs/ui-review/empty-states-YYYY-MM-DD/`.
  - Commit: `style: empty-state pass`.
  - Done: (1) Dashboard `totalDue=0` — stat card now shows label "Dnes splněno" with warm copy ("Máš všechno z dneška za sebou. / Další otázky se vrátí, až jim vyprší termín opakování. Můžeš si zkusit i něco navíc.") preserving the primary-tinted treatment so it reads as achievement, not absence; header CTA swaps from "Spustit trénink" to "Zkusit otázku navíc" (still primary, not weakened). (2) `/quiz` empty — H1 changes by scope ("V tomto okruhu je teď klid" vs "Dnes už máš všechno projeté"), body copy explains why (termín opakování), primary CTA "Zpět na přehled" + context-sensitive outline (scoped → "Trénink napříč okruhy"; unscoped → "Chybovník"). Replaced the tiny underline back-link with real button pair. (3) `/review` empty — dashed-border card centered, "Zatím bez chyb" heading + warm copy ("Ještě jsi nic nezkazil. Až něco pustíš vedle, najdeš to přesně tady — se správnou odpovědí i vysvětlením.") + primary "Spustit trénink" CTA. Header subtitle also conditioned on `items.length`: empty → "Tady se ti budou skládat otázky, na kterých jsi zaváhal." instead of the misleading "Posledních 20 otázek…" copy. Screenshots in `docs/ui-review/empty-states-2026-04-23/` (empty-state frames synthesized via Playwright DOM-swap since the live DB has 149 due & active misses — "after-dashboard-empty.png", "after-quiz-empty-global.png", "after-review-empty.png"; live-data regression frames "after-dashboard-live.png", "after-review-with-misses.png"). tsc + eslint clean.

- [x] **Post-MVP: design polish — mobile layout pass**
  - Cover findings.md's two mobile items in one pass: (a) dashboard stat cards on mobile collapse to a single compact header row above the fold; (b) quiz page horizontal padding bumped from ~16 px to 20–24 px so Czech diacritics don't kiss the edge. Verify at 390×844 via Playwright; screenshots before/after in `docs/ui-review/mobile-YYYY-MM-DD/`. Mark both findings `[x]`.
  - Commit: `style: mobile layout pass`.
  - Done: (a) `src/app/page.tsx` — stat section split into two: a `<sm` compact card (primary-tinted, due-count on left + streak on right, vanity `Otázek v databázi` metric dropped) and a `hidden sm:grid sm:grid-cols-4` desktop tree preserving the original layout. Mobile stat block height drops from ~260 px to ~80 px at 390 px viewport, lifting 4–5 topic rows above the fold. (b) `src/app/quiz/page.tsx` main already at `px-6` (24 px) — within the 20–24 px target range; verified computed `paddingLeft/Right=24px` at 390 px viewport, H1 stem and MC choice cards comfortable. Both findings in `findings.md` marked `[x]`. Screenshots before/after in `docs/ui-review/mobile-2026-04-23/` plus a desktop regression frame confirming the `hidden sm:grid` layer doesn't alter the original 4-col layout.

- [x] **Post-MVP: design polish — loading + in-flight feedback**
  - The submit button currently just disables on attempt POST; findings.md P2 [performance]. Add an inline spinner (or animated dots) + keep the button's visual footprint stable (no layout shift). If the round-trip is <100 ms on localhost, still wire it so slow conditions degrade gracefully. Consider `useFormStatus` or equivalent pending state.
  - Commit: `feat: pending state on attempt submit`.
  - Done: `quiz-form.tsx` replaces the single `submitting` boolean with `pending: "mc" | 1 | 3 | 4 | 5 | null` so only the clicked button animates while the rest remain `disabled` (no ambiguity about which button the user's action is tied to). Each submit path now wraps its label in a `PendingLabel` that keeps the text in layout but `invisible` while pending and overlays an absolutely-positioned `animate-spin` ring — zero layout shift. `aria-busy` toggles on the active button for screen readers. Skipped `useFormStatus` because we're not using form actions (plain `fetch("/attempt")`). Verified via Playwright by throttling `/attempt` to 15 s: spinner renders centred inside the "Odeslat" button with the label hidden and siblings disabled; button width unchanged. Screenshot: `docs/ui-review/pending-state-2026-04-24/quiz-pending-spinner.png`.

- [x] **Post-MVP: logic refinement — streak calculation audit + tests**
  - Locate the "Série" streak calculation (likely in `src/app/page.tsx` or a helper). Audit: does it count consecutive calendar days with ≥1 attempt in local time? What happens on timezone edges? What happens if there are attempts today but none yesterday? Extract to `src/lib/streak.ts` if inline. Add unit tests for: (a) brand new user with 0 attempts, (b) 1 attempt today, (c) 3 consecutive days, (d) gap day breaks streak, (e) attempts spanning midnight local.
  - Commit: `fix: streak calc + unit tests`.
  - Done: logic extracted from `src/app/page.tsx` inline closure into `src/lib/streak.ts` as `calculateStreak(attemptDates, now = new Date())` — injectable `now` makes it deterministically testable. Audit confirmed: bucketing uses local-time `y-m-d` keys via `getFullYear/getMonth/getDate` (DST-safe, TZ-safe relative to the browser/server clock — no UTC drift), backward cursor decrements by `setDate(d-1)` which handles month/year rollovers. Grace period preserved: if today has no attempt yet, start counting from yesterday (so a past streak doesn't visually break mid-day). Tests in `src/lib/streak.test.ts` cover all five required cases plus three regression cases (yesterday-grace preserving streak-of-2, >1-day gap returning 0, dedupe of multiple attempts same day). 8 tests pass, tsc clean.

- [x] **Post-MVP: logic refinement — session pacing / end-of-session summary**
  - After the user exhausts due questions in the current session (or after a sensible cap, e.g. 20 attempts in a row), show an end-of-session card: count of questions, accuracy %, topics touched, next due date. Keep it on `/quiz` — don't redirect. Persist nothing new; just read the last N attempts. Don't auto-redirect; provide "Zpět na přehled" + "Pokračovat" buttons.
  - Commit: `feat: end-of-session summary`.
  - Done: new `src/lib/session.ts` exposes `computeSessionStats(attempts, sinceExclusive?)` — sorts by `answeredAt desc`, walks until the gap between consecutive attempts exceeds `SESSION_GAP_MS` (15 min). Returns `{ count, correctCount, accuracy, topics, latestAt }`. `SESSION_CAP=20`, `SESSION_GAP_MS=15*60e3`. 6 unit tests cover empty, sub-gap bucketing, gap-breaks-session, since-exclusive filter, unsorted input, topic dedupe. `src/app/quiz/page.tsx` now fetches recent `Attempt` rows (`answeredAt >= now - 4*SESSION_GAP_MS`, joined with topic) in parallel with the question fetch, reads `?since=<ISO>` as `sinceExclusive`, and shows a summary card instead of the next question when `(atCap || exhausted) && session.count > 0`. Copy branches on mode: exhausted → "Hotovo pro teď" + "Další opakování přijdou postupně &lt;za N dní&gt;"; cap-hit → "Pauza se hodí" with an encouragement line. Four `SummaryStat` cards show Otázek / Úspěšnost / Okruhů / (Zbývá dnes | Dnes ještě). A sub-line lists touched topic names, joined by · . Buttons: primary "Zpět na přehled" always; outline "Pokračovat" (only when not exhausted) links to `/quiz?[topic=…&]since=<renderTs-ISO>` so the just-seen attempts fall outside the session window; outline "Trénink napříč okruhy" when exhausted+scoped. Verified via Playwright by inserting 20 fake Attempt rows within the last ~10 min: `/quiz` rendered the "Pauza se hodí" summary (22 otázek, 55 % úspěšnost, 3 okruhy, 154 dnes ještě); clicking "Pokračovat" navigated to `/quiz?since=…` and rendered a fresh MC question. Test data cleaned up. 48 tests pass, tsc + eslint clean. Screenshot: `docs/ui-review/session-summary-2026-04-24/cap-hit-summary.png`.

- [x] **Post-MVP: new feature — flag a question**
  - Covers findings.md P2 [interaction] "nahlásit otázku". Add a subtle "Nahlásit otázku" icon/link on each graded quiz card. Click → optional short textarea ("Co je špatně?") → POST to a new `/api/flag/route.ts` that writes to a new `QuestionFlag` Prisma model (`id`, `questionId`, `reason?`, `createdAt`). Migration, server action, minimal form UI. No admin view yet — raw table access is fine.
  - Commit: `feat: question flagging`.
  - Done: `prisma/schema.prisma` adds `QuestionFlag { id, questionId, reason?, createdAt }` with a `questionId` index; migration `20260424091303_question_flag` applied via `prisma migrate dev`. Storage abstraction extended: `FlagInput` type in `src/lib/storage/types.ts`, `flagQuestion(input)` method on the `Storage` interface. Prisma impl inserts a row (empty/whitespace reason normalised to `null`); localStorage impl appends to a new `mz.flags` key as `{questionId, reason?, at: ISO}[]` — architectural parity even though static mode has no operator to read them. New `src/app/api/flag/route.ts` POST handler parses `{questionId, reason?}` and calls `storage.flagQuestion`. UI: subtle underline-dotted "Nahlásit otázku" button renders below the explanation card in `src/app/quiz/quiz-form.tsx` once a question is graded; opening it expands an inline dashed-border panel with a 3-row textarea ("Co je špatně? (nepovinné)"), an "Odeslat hlášení" button (primary, inherits the existing `PendingLabel` spinner treatment), and a "Zrušit" button. Submit branches on `USE_LOCAL_STORAGE` the same way the attempt submit does — Prisma mode POSTs to `/api/flag`, static mode calls `localStorageStorage.flagQuestion` directly. After submit a terse muted "Díky, nahlášení jsme zaznamenali." replaces the widget; the `next()` reset clears the flag widget state alongside the question state. `scripts/build-static.sh` generalised to stash an array of server-only route dirs (both `src/app/attempt` and `src/app/api`) so `pnpm build:static` keeps working — verified `pnpm build:static` produces 4 static routes and restores both stashed dirs on exit. Didn't touch the skip-a-question half of the finding (the flag widget was the explicit ask; skip is an open UX question). Verified end-to-end on :3000 (launchd dev server restarted via `launchctl kickstart` to pick up regenerated Prisma client): navigated to `/quiz?topic=hygiena-a-dezinfekce`, answered two MC questions, opened the flag widget on the graded view, typed a reason, clicked "Odeslat hlášení" → success message; `sqlite3 data/app.db "SELECT * FROM QuestionFlag"` showed the new row with `reason="loop-test: ambigous wording"` and an ISO `createdAt`. Test row deleted afterwards. Pressed `n` on graded → advanced cleanly (flag widget reset). `pnpm tsc --noEmit` clean, `pnpm lint` clean, 59/60 vitest (the one failure is the pre-existing `getRecentAttempts` same-millisecond race documented in sub-item 4). Updated `docs/ui-review/findings.md` marking the P2 [interaction] flag item `[x]` with a note that the "skip" half remains open. Screenshots: `docs/ui-review/flag-2026-04-24/01-graded-with-flag-link.png`, `02-flag-form-open.png`.

- [x] **Post-MVP: new feature — daily goal indicator**
  - Add a small daily goal target (default: 20 attempts/day, stored as a local constant for now; no settings UI) and render on the dashboard as `dnes: 7 / 20` next to the stats. When hit, badge turns primary with a subtle check. Read from `Attempt` rows with `answeredAt` in local-day range. No new tables yet.
  - Commit: `feat: daily goal indicator`.
  - Done: `AggregateCounts` extended with `todayAttempts: number`. Prisma impl adds a `prisma.attempt.count({ where: { answeredAt: { gte: startOfTodayLocal() } } })` to the parallel `Promise.all` in `getAggregateCounts`; localStorage impl filters `readAttempts()` by `new Date(a.at) >= startOfTodayLocal()`. `startOfTodayLocal()` mirrors the existing `endOfTodayLocal()` pattern (setHours(0,0,0,0)) so boundaries are consistent with the `totalDue` calc. `DAILY_GOAL = 20` is a local const in `dashboard-view.tsx` (no settings UI per spec). Render: a new `<section aria-label="Denní cíl">` sits between the stats grid and the topics list. Two branches — in-progress shows "dnes:", bold `{todayAttempts}` + muted `/ 20`, plus a 160 px × 6 px `bg-muted` rail with a `bg-primary/70` fill at `Math.min(100, pct)%`; met flips to a filled pill (`bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold shadow-sm`) with `✓ Cíl dne splněn · {count}` (plain ✓ char to match the existing quiz feedback-pill style — no new icon dep). Verified via DOM inspection on live :3000 (`todayAttempts=8`): section markup = `dnes: <b>8</b> / 20` plus progress bar at `width:40%`. tsc --noEmit clean, pnpm lint clean, 60/60 vitest pass. Storage tests only assert `totalQuestions`/`totalDue` so no regression from the new field. Playwright screenshot tool was timing out on the font-load wait, so no saved screenshot — verification is DOM-level.

- [x] **Post-MVP: regenerate improvement batch**
  - Done: generated round 3 (13 items). Drivers: 5 × unresolved UI findings on top of findings.md (keyboard-shortcut retroactive close, dev-tools badge, favicon, `html[lang="cs"]`, disabled-Odeslat contrast), 3 × design polish (dark mode, focus-visible audit, /review card treatment), 2 × logic refinement (explanation/sourceRef coverage audit, daily-goal DST/midnight tests), 2 × new features from the original goals (export/import localStorage JSON for static-mode portability, "Xx chybně" repeat-miss counter on /review). No UI sweep refresh — last sweep 2026-04-23, only 1 day old. Round 3 meta-item appended.

---

## Post-MVP — Continuous Improvement Round 3

- [x] **Post-MVP: fix top unresolved UI finding**
  - Open `docs/ui-review/findings.md`. Find the first unresolved `- [ ]`. Next expected: Quiz P1 [interaction] "Submit-and-next flow requires two clicks … neither action has a keyboard shortcut." — this has already shipped via `feat: quiz keyboard shortcuts` (commit d5bb309). Verify the shortcuts still work (Enter submits MC, N/Enter advances after grade, Esc returns to dashboard), then retroactively mark the finding `[x]` with a note citing the commit. If verification uncovers regression, fix it first.
  - Commit: `<type>: <finding summary>` (likely `docs: close resolved keyboard-shortcut finding`).
  - Done: verified no regression — ran Playwright against :3000, pressed `2` (selected option 2), `Enter` (submitted → ✓ Správně + explanation), `N` (advanced to a new question "Použité prostěradlo / ručník…"), `Esc` (navigated to `/` dashboard). Listener in `src/app/quiz/quiz-form.tsx:48-89` still wires all four paths; `ShortcutHints` footer renders contextual `<kbd>` hints. Marked Quiz P1 [interaction] `[x]` in `docs/ui-review/findings.md` with a note citing commit d5bb309 and the re-verification run.

- [x] **Post-MVP: fix top unresolved UI finding**
  - Next expected: Dashboard P3 [visual] "Next.js dev-tools floating N badge overlaps the topic list." Suppress the dev indicator by setting `devIndicators: false` in `next.config.ts` (Next 15 syntax: `devIndicators: false` at top level disables the entire badge; double-check the current schema since Next has churned it). Confirm the badge is gone on :3000 after launchd picks up the config, then mark the finding `[x]`.
  - Commit: `<type>: <finding summary>`.
  - Done: `next.config.ts` now sets `devIndicators: false` in both the static-export branch and the default branch. Installed Next is 16.2.4, not 15 — verified the schema still accepts the literal `false` (`node_modules/next/dist/esm/server/config-schema.js` has `z.union([z.object({position: ...}), z.literal(false)])`) so the backlog note about Next churn held up. Launchd dev server picked up the config change (log: `⚠ Found a change in next.config.ts. Restarting the server to apply the changes…`). Verified via Playwright: `document.querySelector('nextjs-portal').shadowRoot.querySelector('#devtools-indicator')` still exists (Next keeps the element for internal portal routing) but renders at 0×0 — full-page screenshot confirms no floating N over the topic list at either viewport scroll position. Marked the Dashboard P3 finding `[x]` with the same evidence. Screenshot: `docs/ui-review/dev-indicator-2026-04-24/dashboard-no-badge.png`.

- [x] **Post-MVP: fix top unresolved UI finding**
  - Next expected: Dashboard P3 [info-arch] "No `favicon.ico` customised — still the generic one." Replace `src/app/favicon.ico` (or add `src/app/icon.svg`) with a simple monogram matching the app — e.g. "MZ" in the primary token on a square background, or a stylised mortar / massage-stone glyph. SVG preferred so it scales; if emitting ICO, keep it 32×32. Verify the browser tab on `/`, `/quiz`, `/review` shows the new icon. Mark the finding `[x]`.
  - Commit: `<type>: <finding summary>`.
  - Done: deleted `src/app/favicon.ico` (default Next.js template asset) and added `src/app/icon.svg` — a 32×32 viewBox SVG rendering "MZ" in semibold white (`#fafafa`) on a neutral-900 (`#262626`) rounded square, matching the app's monochrome token palette. SVG over ICO per the spec's "SVG preferred so it scales" — Next's file-based metadata picks it up via App Router's `icon` convention and emits `<link rel="icon" type="image/svg+xml" href="/icon.svg?…">` on every route. Verified via `curl`: all three routes (`/`, `/quiz`, `/review`) serve the same `<link rel="icon" …>` tag and `/icon.svg` returns HTTP 200 with `Content-Type: image/svg+xml` (315 B). Asset copy preserved at `docs/ui-review/favicon-2026-04-24/icon.svg` for historical reference. Marked the Dashboard P3 [info-arch] finding `[x]` in `docs/ui-review/findings.md` with the same evidence.

- [x] **Post-MVP: fix top unresolved UI finding**
  - Next expected: Cross-cutting P2 [a11y] "No `html[lang="cs"]` check — verify `app/layout.tsx` sets `lang='cs'`." Confirmed bug: `src/app/layout.tsx:31` currently has `lang="en"`. Flip it to `"cs"` so Czech pronunciation works in screen readers. Verify via DOM inspection on `/` and mark the finding `[x]`.
  - Commit: `<type>: <finding summary>`.
  - Done: `src/app/layout.tsx:31` flipped `lang="en"` → `lang="cs"`. Verified via `curl http://localhost:3000/ | grep '<html'` → `<html lang="cs" class="…">`. Marked the Cross-cutting P2 [a11y] finding `[x]` in `docs/ui-review/findings.md` with the same evidence.

- [x] **Post-MVP: fix top unresolved UI finding**
  - Next expected: Quiz P2 [visual] "Disabled `Odeslat` button is gray-on-white with very low contrast; reads as disabled and absent." Audit the shadcn `Button` disabled tokens for the default variant. Either bump the disabled background to `bg-muted` with `text-muted-foreground` at a legible weight, or keep the primary fill at a reduced opacity (e.g. `disabled:opacity-60`) so the shape stays identifiable. Target WCAG 1.4.11 non-text contrast 3:1 against the page. Verify both MC pre-selection and open-answer pre-input states. Mark the finding `[x]`.
  - Commit: `<type>: <finding summary>`.
  - Done: picked the second option (opacity bump) over the bg-muted approach — bg-muted is oklch(0.97) which is within 1.05:1 of the white page bg and would itself fail 1.4.11 without a border. `src/components/ui/button.tsx` base class: `disabled:opacity-50` → `disabled:opacity-60`. Alpha-blend math vs `--background` oklch(1): primary oklch(0.205) ≈ sRGB #212121 → at 60% alpha ≈ #7A7A7A (linear luminance ~0.194) → contrast ratio vs white ≈ 4.30:1, well above WCAG 1.4.11's 3:1 non-text minimum (opacity-50 previously sat at #909090 / ~3.19:1 — barely passing). Added `aria-busy:opacity-100` so pending submits snap back to full primary while the spinner overlay is on — otherwise the opacity-60 treatment would linger during the /attempt round-trip and undercut the "click acknowledged, in flight" feedback. Applies globally, so both `/quiz` MC pre-selection ("Odeslat" disabled until an option is chosen) and the open-answer "Zobrazit správnou odpověď" pre-input state (disabled until `answer.trim()` is non-empty) inherit the fix; the flag-widget "Odeslat hlášení" button also benefits. Verified via Playwright on `/quiz` (MC question, no option selected): the disabled Odeslat button has `opacity=0.6`, `background-color` computes to the primary token (unchanged), text white — clearly legible dark-gray fill against the white page. tsc + eslint clean. Marked the Quiz P2 [visual] finding `[x]` in `docs/ui-review/findings.md` with the same evidence. Screenshot: `docs/ui-review/disabled-button-2026-04-24/quiz-mc-disabled-odeslat.png`.

- [x] **Post-MVP: design polish — dark mode support**
  - Tailwind and shadcn tokens already ship light/dark pairs (`:root` and `.dark` blocks in `globals.css`). Add `dark` class plumbing: (1) respect `prefers-color-scheme` by default via `next-themes` or a small inline script in `layout.tsx`; (2) a subtle toggle in the dashboard header (sun/moon `<button>`, no new icon dep — use text characters or an inline SVG); (3) audit the few places that hard-code colour (quiz green-700 correct choice, feedback pill bg-green-700 / bg-destructive) to make sure they still clear contrast in dark mode — add `dark:` variants where needed.
  - Screenshots of dashboard + quiz in both modes in `docs/ui-review/dark-mode-YYYY-MM-DD/`.
  - Commit: `feat: dark mode`.
  - Done: chose the inline-script path over `next-themes` (no new dep, no SSR wrapping — the script is ~140 bytes, sets `<html>.classList` before paint based on `localStorage['mz-theme']` with `prefers-color-scheme` fallback). `src/app/layout.tsx` gains a `<head>` with `dangerouslySetInnerHTML` + `suppressHydrationWarning` on `<html>` (without the suppress, React warns since the script mutates the class before hydration). `src/components/theme-toggle.tsx` is a client component using `useSyncExternalStore` with a MutationObserver subscribe — avoids the `react-hooks/set-state-in-effect` lint violation that naive `useState+useEffect` would trigger, and keeps the toggle reactive if something else flips the class. Server snapshot returns `null`, client renders a `size-9` placeholder until mounted, so there's no hydration mismatch even in Prisma (server-rendered) mode. Icon is inline SVG (sun when dark is active, moon when light is active — clicking advances to the shown state). Hard-coded green audit: (a) `quiz-form.tsx:207` correct-choice card `border-green-700 bg-green-50` → added `dark:border-green-500 dark:bg-green-950/40`; (b) `quiz-form.tsx:318` success pill `bg-green-700 text-white` → added `dark:bg-green-600` for punchier contrast on the darker card; (c) `review-view.tsx:82` correct-answer chip `border-green-700/40 bg-green-50` → added `dark:border-green-500/40 dark:bg-green-950/40`. Left `bg-destructive text-white` alone: in dark mode `--destructive` is `oklch(0.704 0.191 22.216)` (brighter), text-white stays legible (spot-checked on the "Špatně" pill — see `docs/ui-review/dark-mode-2026-04-24/quiz-graded-dark.png`). Verified via Playwright: toggle applies `.dark`, writes `mz-theme=dark` to localStorage, persists across `/quiz` → `/review` navigation (`isDark: true` confirmed after client-side nav). Screenshots: `dashboard-light.png`, `dashboard-dark.png`, `quiz-graded-light.png` (wrong-choice shown with red fill and green correct card), `quiz-graded-dark.png`, `review-dark.png` (multiple mistake cards with green correct-answer chips). tsc + eslint clean. Toggle button placement: left of "Chybovník" in the dashboard header — subtle 9×9 outline button matching shadcn's outline variant.

- [x] **Post-MVP: design polish — focus-visible audit**
  - Walk every interactive surface with keyboard only (Tab / Shift+Tab through `/`, `/quiz`, `/review`). Every focused element must have a visible `focus-visible:ring-2 focus-visible:ring-ring` treatment. Current offenders likely: topic row Link, quiz choice labels, mistake review cards, flag-widget textarea and buttons, dashboard CTA buttons. Normalise to the shadcn `focus-visible` pattern. Screenshot three representative focus states in `docs/ui-review/focus-YYYY-MM-DD/`.
  - Commit: `style: focus-visible audit`.
  - Done: audited Tab order on `/`, `/quiz` (pre- and post-grade), `/review`. Existing treatment already covered via shadcn `Button` (both `<button>` and `Link` w/ `buttonVariants`) and the dashboard topic-row Link. Four gaps normalised: (1) **MC choice labels** (`src/app/quiz/quiz-form.tsx:202-213`) — the `<input type="radio">` inside the `<label>` received the browser-native dot-ring but the big clickable card had no indicator; added `focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50` on the label (matches Button's `ring-3/50` scale) and `focus:outline-none` on the radio to suppress the now-redundant native ring. (2) **Flag trigger button "Nahlásit otázku"** (`quiz-form.tsx:403-410`) — had only `focus-visible:text-foreground`, added `rounded-sm focus-visible:ring-2 focus-visible:ring-ring/60`. (3) **Quiz header "Přehled" link** (`quiz-view.tsx:168-173`) — underline-only, added the same `rounded-sm focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60` pattern. (4) **Review header "← Přehled" link** (`review-view.tsx:41-46`) — same treatment. `rounded-sm` on inline links ensures the ring follows the link's text box rather than its invisible baseline bounding box. Picked the ring-2/60 scale for inline text links (subtler) and the shadcn-standard ring-3/50 scale for the card-sized MC labels (matches Button prominence). Verified: `pnpm tsc --noEmit` clean, `pnpm lint` clean. Playwright focus screenshots on :3000 (dark mode): topic row card lit, MC choice card lit, "Nahlásit otázku" button lit. Screenshots: `docs/ui-review/focus-2026-04-24/01-dashboard-topic-row-focus.png`, `02-quiz-mc-choice-focus.png`, `03-quiz-flag-button-focus.png`.

- [ ] **Post-MVP: design polish — /review card treatment**
  - Current mistake review list renders 20 entries in a flat stack; with real data the page becomes a long wall of similarly-styled cards. Tighten: compact topic chip + timestamp in a one-liner header, collapse the correct-answer card into a subtler left-border accent (no full green-tinted card per row), and reduce vertical spacing so ~10 entries fit on a 1080p viewport. Keep the explanation readable (`max-w-prose`). Don't add filtering — volume control lives with the 20-cap.
  - Screenshots before/after in `docs/ui-review/review-density-YYYY-MM-DD/`.
  - Commit: `style: /review layout density pass`.

- [ ] **Post-MVP: logic refinement — explanation + sourceRef coverage audit**
  - Add a vitest `src/data/question-bank.test.ts` that asserts every entry in `questions` has (a) `explanationCs.trim().length >= 20`, (b) `sourceRef` set to a non-empty string, (c) for MC questions: `correctAnswer` appears in `choicesCs`. Any failures list the offending questionId + topic so the loop can patch them later. If failures appear, log them to `docs/curriculum-gaps.md` in the same iteration but do not hand-edit question-bank content — a future iteration will address them after review.
  - Commit: `test: question-bank content coverage`.

- [ ] **Post-MVP: logic refinement — daily-goal + streak DST/midnight tests**
  - `startOfTodayLocal()` / `endOfTodayLocal()` use `setHours(0,0,0,0)` — safe across DST for local-time bucketing, but we have no tests asserting that. Add `src/lib/day-boundaries.test.ts` (extracting the two helpers into `src/lib/day-boundaries.ts` if they're still inline) with cases for: (a) attempts just before local midnight roll over cleanly to the next day's count; (b) Europe/Prague spring-forward 2026-03-29 02:00 → 03:00 — an attempt at 01:59 belongs to 2026-03-29 bucket; (c) fall-back 2026-10-25 (02:59 CEST → 02:00 CET) — attempts during the repeated hour still bucket correctly. Inject a `now` parameter rather than mocking system time. Verify `calculateStreak` already correct under the same dates (tests exist, just extend coverage).
  - Commit: `test: day-boundary + DST coverage`.

- [ ] **Post-MVP: new feature — export/import localStorage progress**
  - Static-mode users have no sync. Add a "Záloha pokroku" section at the bottom of `/`: (1) "Stáhnout zálohu" button triggers a JSON download of `{version: 1, attempts: mz.attempts, mastery: mz.mastery, flags: mz.flags, exportedAt: ISO}`; (2) hidden `<input type="file" accept="application/json">` + "Obnovit ze zálohy" button — on change, parse, validate version, merge into localStorage (dedupe attempts by `{questionId, at}`; overwrite mastery; append flags). Show a neutral "Obnoveno" / error toast. Hide entirely in Prisma mode (no value there — server DB is the source of truth). Keep scope to localStorage; don't touch Prisma branch.
  - Commit: `feat: localStorage backup export/import`.

- [ ] **Post-MVP: new feature — mistake count per question on /review**
  - The current `/review` dedupes by questionId keeping only the latest miss. Surface repetition: render a small "`N× chybně`" chip on each row when `N >= 2`, computed from all attempts for that questionId where `correct=false`. Both storage impls already have `getRecentMistakes` / `getRecentAttempts` — extend the server-side fetch (and the localStorage client variant) to pass a `missCount` field through to `ReviewView`. No schema change. If `N === 1`, hide the chip to keep the page calm.
  - Commit: `feat: repeat-miss counter on /review`.

- [ ] **Post-MVP: regenerate improvement batch**
  - Run `/rebuild-backlog` to generate the next batch of 10–15 post-MVP items based on the current state of the app, `docs/ui-review/findings.md`, and open questions logged in SecondBrain.
  - Commit: `chore: regenerate post-MVP batch`.
  - Note: `/rebuild-backlog` should append a new round of improvement items + another copy of this meta-item at the bottom, so the loop never runs dry.
