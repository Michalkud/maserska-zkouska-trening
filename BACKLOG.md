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

- [ ] **Post-MVP: add mastery history sparkline per topic**
  - Dashboard: next to each topic mastery bar, render a 30-day sparkline of daily average grade (Recharts or plain SVG). Aggregate from the Attempt table in a server action.
  - Commit: `feat: mastery sparklines on dashboard`.

- [ ] **Post-MVP: per-question wrong-answer analysis**
  - Add a "Review mistakes" page listing the 20 most recently missed questions with their correct answer + explanation. Prioritize review-session curation.
  - Commit: `feat: mistake review page`.

- [ ] **Post-MVP: fix top unresolved UI finding**

- [ ] **Post-MVP: fix top unresolved UI finding**

- [ ] **Post-MVP: regenerate improvement batch**
  - Run `/rebuild-backlog` to generate the next batch of 10–15 post-MVP items based on the current state of the app, `docs/ui-review/findings.md`, and open questions logged in SecondBrain.
  - Commit: `chore: regenerate post-MVP batch`.
  - Note: `/rebuild-backlog` should append a new round of improvement items + another copy of this meta-item at the bottom, so the loop never runs dry.
