# UI Review Findings

Each finding is an unresolved item the loop's "fix top unresolved UI finding" iterations will chew through. Resolve from the top. Categories: **[visual]**, **[a11y]**, **[copy]**, **[interaction]**, **[performance]**, **[info-arch]**.

Severity legend:
- **P1** — user-visible defect or blocks a golden-path task
- **P2** — obvious polish / quality loss
- **P3** — nice-to-have

Screenshot references live in `docs/ui-review/2026-04-23/`.

---

## Dashboard (`/`)

- [x] **P1 [copy]** Page `<title>` is literally `Create Next App` — default Next.js scaffolding metadata never got replaced. Bookmarks, tab text, SEO all wrong. Fix in `app/layout.tsx` (or `app/page.tsx` export const metadata). Screenshot: `01-dashboard.png` (browser tab), same on every page.

- [x] **P1 [visual]** Topic-mastery progress bars are barely visible — they render as a hairline track (~2 px tall) and the fill is almost invisible at low percentages. The "3 %" / "4 %" fill on Hygiena / Komunikace is a 2-pixel dot. Bars should be at least 6–8 px tall and have a clear track colour. Screenshot: `06-dashboard-return.png`. → Fixed: bumped to `h-2.5` (10 px), tinted track `bg-primary/10`, filled `bg-primary rounded-full`. Verified in `fix-01-progress-bars.png`.

- [x] **P2 [info-arch]** Topics are listed alphabetically by Czech title. A learner cares first about *weakest* topics or *most due today*. Sort descending by (due count desc, mastery asc) or add sort controls. Screenshot: `01-dashboard.png`. → Fixed in `src/app/page.tsx`: sort `topicRows` by `due desc`, then `masteryPct asc`, then Czech-locale name. Verified in `fix-02-topic-sort.png` — "První pomoc" (19 due) at top, "Masáž hlavy a krku" (4 due) at bottom.

- [x] **P2 [visual]** Three top stats (`K opakování dnes`, `Série`, `Otázek v databázi`) are given equal visual weight, but the primary action hint is "what should I study now?". "K opakování dnes" should be emphasised (larger number, primary colour) and "Otázek v databázi" demoted — it's vanity metric. Screenshot: `01-dashboard.png`. → Fixed: stats section regridded to `sm:grid-cols-4` with "K opakování dnes" as a `col-span-2` tinted card (`border-primary/20 bg-primary/5`, label and number in `text-primary`, number bumped to `text-5xl`); "Série" unchanged; "Otázek v databázi" demoted to `bg-muted/30` with number downgraded to `text-2xl font-medium text-muted-foreground`. Verified in `stat-hierarchy-2026-04-23/dashboard-after.png`.

- [x] **P2 [interaction]** Clicking a topic row in "Zvládnutí podle okruhu" does nothing. Expected: click → quiz scoped to that topic (or at least a topic detail page). Each row looks affordantly tappable (hover cursor?). Screenshot: `01-dashboard.png`. → Fixed: each `<li>` in `src/app/page.tsx` now wraps its content in `<Link href={\`/quiz?topic=${t.id}\`}>` with hover affordance (`hover:border-primary/40 hover:bg-muted/40`, focus-visible ring). Quiz page in `src/app/quiz/page.tsx` reads `searchParams.topic`, filters `prisma.question.findMany` by that topicId, and renders an "okruh" pill next to the topic name in the header. Empty state is scope-aware ("V tomto okruhu nejsou aktuálně otázky k opakování."). Verified via Playwright: clicking "Hygiena a dezinfekce" navigates to `/quiz?topic=cmobpgbya00041k202ywq1h7t` and shows a hygiene question with the scope pill. Screenshots: `docs/ui-review/topic-click-scope-2026-04-23/`.

- [x] **P2 [copy]** "Zvládnutí podle okruhu" header is all-caps small caps, same style as the three stat labels; it's the section H2 and deserves heavier treatment. Visual hierarchy collapses. Screenshot: `01-dashboard.png`. → Fixed: H2 upgraded from `text-sm font-semibold` to `text-lg font-semibold tracking-tight` with `mb-4` (4pt grid). Drops the stat-label twin treatment, establishes a clear heading rung between the 3xl page H1 and body copy. Screenshots: `docs/ui-review/h2-hierarchy-2026-04-23/`.

- [x] **P3 [visual]** Next.js dev-tools floating "N" badge overlaps the topic list at mid-viewport. Dev-only — suppressible by setting `devIndicators: false` in `next.config.js` for the launchd dev server or ignoring since not prod. Screenshot: `01-dashboard.png`, `07-mobile-dashboard.png`. → Fixed: `next.config.ts` sets `devIndicators: false` in both the static and default branches. Schema confirmed in Next 16.2.4 (`node_modules/next/dist/esm/server/config-schema.js` — `z.union([z.object({...}), z.literal(false)])`). After launchd restart the `#devtools-indicator` element inside `<nextjs-portal>` shadow DOM still exists but renders as 0×0 — no visible overlap on the topic list. Full-page screenshot: `docs/ui-review/dev-indicator-2026-04-24/dashboard-no-badge.png`.

- [x] **P3 [info-arch]** No `favicon.ico` customised — still the generic one. Low stakes. Screenshot: browser tab in any page. → Fixed: replaced default `src/app/favicon.ico` with `src/app/icon.svg` (SVG monogram "MZ" on neutral-900 rounded square, white text). Verified via Playwright on `/`, `/quiz`, `/review` — each page emits `<link rel="icon" type="image/svg+xml" href="/icon.svg?…">`; the asset serves `200 image/svg+xml`. Asset copy: `docs/ui-review/favicon-2026-04-24/icon.svg`.

- [ ] **P3 [a11y]** The three stat cards use headings? They look like `<div>`s — confirm a11y tree has proper heading / role. Should be a list or labelled group. Inspect via snapshot: `- generic [ref=e8]` — no semantic role, just generics. Accessibility tree would benefit from `<dl>` or `role="group" aria-label`.

## Quiz (`/quiz`)

- [x] **P1 [interaction]** No progress indicator on the quiz page — user has no idea if they have 5 questions left or 500. Add "Otázka X z Y" or "X k dnešnímu opakování" in the header area (next to the topic name). Screenshot: `02-quiz-question.png`. → Fixed: `src/app/quiz/page.tsx` computes `dueToday` from the already-fetched `questions` array using the same rule as the dashboard (mastery null OR dueAt ≤ end-of-day local). Scope-aware: when `?topic=…` is set, `questions` is already filtered so the count reflects the scoped topic. Renders as a bordered pill "N k opakování" next to the topic name (mirrors the dashboard topic-row phrasing). Hidden when 0. Screenshot: `docs/ui-review/quiz-progress-2026-04-23/quiz-with-progress.png`.

- [x] **P1 [interaction]** Submit-and-next flow requires two clicks (Odeslat → Další otázka). On desktop/tablet with keyboard, neither action has a keyboard shortcut. Enter should submit; a clear key (Space / Enter / N) should advance. The post-MVP backlog already has a keyboard-shortcuts item — mark this as the motivating evidence. Screenshot: `03-answer-correct.png`. → Fixed in `feat: quiz keyboard shortcuts` (d5bb309): `src/app/quiz/quiz-form.tsx` registers a window-level `keydown` listener — `1`–`4` select an MC choice, `Enter` submits pre-grade MC (skipped when focus is in a textarea/non-radio input), `N` / `Enter` advance post-grade, `Esc` returns to dashboard; modifier keys (meta/ctrl/alt) are ignored. Subtle `<kbd>` hint row renders at the bottom of the quiz card, contextual to state (choices + Enter pre-grade → N/Enter post-grade; Esc always). Re-verified 2026-04-24 via Playwright on :3000: press `2` selected the second choice, `Enter` submitted → ✓ Správně, `N` advanced to a new question, `Esc` navigated to `/`.

- [ ] **P2 [visual]** The disabled "Odeslat" button is gray-on-white with very low contrast; at a glance it reads as disabled *and* absent. Either darken disabled state or use a clearly muted but legible treatment. Screenshot: `02-quiz-question.png` (before selecting an option).

- [x] **P2 [interaction]** No way to skip a question or flag it as ambiguous / broken. Seed quality will matter long-term; users should have a "nahlásit otázku" link on every item for feedback. Screenshot: any quiz screenshot. → Partly fixed (flag half; skip still open — file a dedicated finding if it's wanted): `src/app/quiz/quiz-form.tsx` shows a subtle "Nahlásit otázku" link under the feedback card once a question is graded; opening it reveals an optional textarea ("Co je špatně?") + Odeslat hlášení / Zrušit buttons. Submit branches on `NEXT_PUBLIC_STORAGE`: Prisma mode POSTs `{questionId, reason?}` to new `/api/flag/route.ts` which inserts into the new `QuestionFlag` Prisma model (`id`, `questionId`, `reason?`, `createdAt`); localStorage mode appends to `mz.flags`. No admin view — `sqlite3 data/app.db "SELECT * FROM QuestionFlag"` is enough for now.

- [x] **P2 [visual]** On a correct answer, the explanation card uses a soft green border / background (`03-answer-correct.png`); on an incorrect answer, the red border is similarly soft (`05-answer-incorrect.png`). Both are tasteful but the "✓ Správně" / "✗ Špatně" pill could be more prominent (larger type, filled badge) — it's the single most important feedback element. Screenshots: `03-answer-correct.png`, `05-answer-incorrect.png`. → Fixed: pill moved out of the explanation card and above it; `inline-flex rounded-full px-4 py-1.5 text-lg font-semibold shadow-sm` filled with `bg-green-700 text-white` (correct) or `bg-destructive text-white` (incorrect); subtle `animate-in fade-in slide-in-from-top-1 duration-200` entrance. White text on both tokens clears AA (5.0:1 on green-700, 5.1:1 on tuned destructive). Screenshots: `docs/ui-review/feedback-pill-2026-04-23/`.

- [x] **P2 [copy]** After a wrong answer, the user's (wrong) selected radio stays red-outlined and the correct option is green-outlined. The correct-answer text *also* appears spelled out in the explanation block ("SPRÁVNÁ ODPOVĚĎ: ..."). This duplicates information. Remove the textual repetition — the green outline is enough. Screenshot: `05-answer-incorrect.png`. → Fixed: in `src/app/quiz/quiz-form.tsx`, dropped the `kind === "mc" && !graded.correct` "Správná odpověď" block from the post-grade feedback panel. Green-outlined correct radio + red-outlined wrong selection do the visual work; the explanation card immediately follows. Open-answer path (line ~184) still renders "Správná odpověď" since self-grading has no radio to highlight. Verified via Playwright on a GDPR newsletter question: picked wrong option 1, green pill highlights option 2, ✗ Špatně pill → Vysvětlení card, no textual duplication. Screenshot: `no-dup-answer-2026-04-23/wrong-answer-no-duplication.png`.

- [ ] **P2 [interaction]** After submission, radios become `disabled` but still *look* like radios. Consider converting them to a review view that makes it clearer the interaction is done — e.g. replace the circle with ✓ / ✗ icons. Screenshot: `03-answer-correct.png`, `05-answer-incorrect.png`.

- [ ] **P2 [a11y]** Radio labels wrap onto multiple lines for long options. The click target is the full card (good) but the radio circle itself is small (~16 px). Meets WCAG but feels small for touch. Screenshot: `02-quiz-question.png`.

- [ ] **P3 [copy]** Quiz page header shows the topic name ("Komunikace s klientem") as small muted text; the question stem is the H1. Either invert (topic as chip near H1) or add breadcrumb: Přehled > Komunikace s klientem. Screenshot: `02-quiz-question.png`.

- [ ] **P3 [visual]** Serif for the H1 question stem, sans for answers — intentional editorial choice, looks good, but the Czech punctuation mixing (hyphen, em-dash, curly quotes) inside explanations is inconsistent. Check `prisma/seed*.ts` for uniformity. Screenshot: `05-answer-incorrect.png` ("„špinavé" na „čistou"" — mixed quote directions look correct here, but audit broadly).

- [ ] **P3 [interaction]** No "back" within quiz — once you submit, you can't see the previous question/explanation. If learner wants to revisit the just-seen explanation they must go to dashboard → no mistake review surface exists (post-MVP item already covers a review page).

## Cross-cutting

- [x] **P2 [a11y]** No `html[lang="cs"]` check performed — verify `app/layout.tsx` sets `lang="cs"` on `<html>`. Screen readers need it for Czech pronunciation. → Fixed: `src/app/layout.tsx:31` flipped `lang="en"` → `lang="cs"`. Verified via `curl http://localhost:3000/` — response contains `<html lang="cs" …>`.

- [x] **P2 [performance]** No skeleton or loading state during the POST `/api/attempt` round-trip; button just … disables. Add optimistic feedback. Screenshot: not captured (fast enough on localhost). → Fixed: `quiz-form.tsx` swapped `submitting: boolean` for `pending: "mc" | 1 | 3 | 4 | 5 | null` so only the clicked button shows the spinner. Each submit-path button wraps its label in a `<PendingLabel>` that keeps the text in flow but `invisible` when active and overlays an absolutely-positioned `animate-spin` ring — preserves the button's visual footprint, no layout shift. `aria-busy` toggled on the active button. Round-trip is <100 ms on localhost so unseen in normal use; verified graceful degradation by throttling `/attempt` fetch to 15 s via Playwright and screenshotting the spinner on the "Odeslat" button. Screenshot: `docs/ui-review/pending-state-2026-04-24/quiz-pending-spinner.png`.

- [ ] **P3 [visual]** No dark-mode support despite Tailwind being configured. Michal studies evenings — dark mode would be pleasant. Low priority.

- [ ] **P3 [info-arch]** No global nav — every navigation jump is via inline "Přehled" link in the top-right of the quiz page. If the app grows beyond dashboard + quiz, this will break. Defer.

## Mobile (390 × 844)

- [x] **P2 [visual]** Stat cards stack vertically on mobile — reasonable — but they take 60 % of the above-the-fold space, pushing the primary "Spustit trénink" CTA and the topic list below. Consider collapsing into a single compact header row on mobile. Screenshot: `07-mobile-dashboard.png`. → Fixed: mobile `<sm` now renders a single compact primary-tinted card with "K opakování dnes 149" on the left and a divider-separated "Série 1 den" on the right; "Otázek v databázi" vanity metric dropped from mobile. Desktop layout unchanged (`hidden sm:grid sm:grid-cols-4`). Stat block height on mobile drops from ~260 px to ~80 px, which moves 4–5 topic rows above the fold at 390×844. Screenshots: `mobile-2026-04-23/before-dashboard.png`, `after-dashboard.png`, regression `after-dashboard-desktop-regression.png`.

- [x] **P3 [visual]** Quiz page padding on mobile looks slightly tight — text touches viewport edges at ~16 px margin. Bump to 20–24 px. Screenshot: `08-mobile-quiz.png`. → Verified already resolved: `main` on `/quiz` uses `px-6` (24 px, within 20–24 px target). Computed `paddingLeft/Right = 24px` at viewport 390; H1 stem and MC choice cards both have comfortable breathing room (originally sweep-time screenshot likely predated the `px-6` change). Screenshot: `mobile-2026-04-23/before-quiz.png`, `after-quiz.png`.

## Static / localStorage build (`pnpm build:static` → :3001)

- [x] **[static] verification sweep 2026-04-24** — cleared localStorage, navigated dashboard → scoped quiz (`?topic=hygiena-a-dezinfekce`) → answered one MC correct (grade 3) and one MC wrong (grade 1) → reloaded → visited `/review` → hard-reloaded `/review`. All three routes served as static HTML with client hydration. localStorage persisted across reloads (`mz.attempts` and `mz.mastery` survived). Dashboard after sweep: `K opakování dnes 156`, `Série 1 den`, Hygiena row `2/15 · 9% · 13 k opakování` — matches expected SM-2 state. Review page lists the wrong-answered question with correct answer + explanation. No console errors (only benign woff2 preload warnings from Next, same in Prisma mode). Screenshots: `docs/ui-review/static-2026-04-24/01-dashboard-fresh.png`, `02-quiz-unscoped-open.png`, `03-quiz-correct-feedback.png`, `04-quiz-wrong-feedback.png`, `05-dashboard-after-2-attempts.png`, `06-review-with-mistake.png`, `07-review-after-reload.png`.

---

**Total findings: 26** (4 × P1, 13 × P2, 9 × P3)
