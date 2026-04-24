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

- [ ] **Post-MVP: new feature — flag a question**
  - Covers findings.md P2 [interaction] "nahlásit otázku". Add a subtle "Nahlásit otázku" icon/link on each graded quiz card. Click → optional short textarea ("Co je špatně?") → POST to a new `/api/flag/route.ts` that writes to a new `QuestionFlag` Prisma model (`id`, `questionId`, `reason?`, `createdAt`). Migration, server action, minimal form UI. No admin view yet — raw table access is fine.
  - Commit: `feat: question flagging`.

- [ ] **Post-MVP: new feature — daily goal indicator**
  - Add a small daily goal target (default: 20 attempts/day, stored as a local constant for now; no settings UI) and render on the dashboard as `dnes: 7 / 20` next to the stats. When hit, badge turns primary with a subtle check. Read from `Attempt` rows with `answeredAt` in local-day range. No new tables yet.
  - Commit: `feat: daily goal indicator`.

- [ ] **Post-MVP: regenerate improvement batch**
  - Run `/rebuild-backlog` to generate the next batch of 10–15 post-MVP items based on the current state of the app, `docs/ui-review/findings.md`, and open questions logged in SecondBrain.
  - Commit: `chore: regenerate post-MVP batch`.
  - Note: `/rebuild-backlog` should append a new round of improvement items + another copy of this meta-item at the bottom, so the loop never runs dry.
