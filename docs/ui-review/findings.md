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

- [ ] **P2 [info-arch]** Topics are listed alphabetically by Czech title. A learner cares first about *weakest* topics or *most due today*. Sort descending by (due count desc, mastery asc) or add sort controls. Screenshot: `01-dashboard.png`.

- [ ] **P2 [visual]** Three top stats (`K opakování dnes`, `Série`, `Otázek v databázi`) are given equal visual weight, but the primary action hint is "what should I study now?". "K opakování dnes" should be emphasised (larger number, primary colour) and "Otázek v databázi" demoted — it's vanity metric. Screenshot: `01-dashboard.png`.

- [ ] **P2 [interaction]** Clicking a topic row in "Zvládnutí podle okruhu" does nothing. Expected: click → quiz scoped to that topic (or at least a topic detail page). Each row looks affordantly tappable (hover cursor?). Screenshot: `01-dashboard.png`.

- [ ] **P2 [copy]** "Zvládnutí podle okruhu" header is all-caps small caps, same style as the three stat labels; it's the section H2 and deserves heavier treatment. Visual hierarchy collapses. Screenshot: `01-dashboard.png`.

- [ ] **P3 [visual]** Next.js dev-tools floating "N" badge overlaps the topic list at mid-viewport. Dev-only — suppressible by setting `devIndicators: false` in `next.config.js` for the launchd dev server or ignoring since not prod. Screenshot: `01-dashboard.png`, `07-mobile-dashboard.png`.

- [ ] **P3 [info-arch]** No `favicon.ico` customised — still the generic one. Low stakes. Screenshot: browser tab in any page.

- [ ] **P3 [a11y]** The three stat cards use headings? They look like `<div>`s — confirm a11y tree has proper heading / role. Should be a list or labelled group. Inspect via snapshot: `- generic [ref=e8]` — no semantic role, just generics. Accessibility tree would benefit from `<dl>` or `role="group" aria-label`.

## Quiz (`/quiz`)

- [ ] **P1 [interaction]** No progress indicator on the quiz page — user has no idea if they have 5 questions left or 500. Add "Otázka X z Y" or "X k dnešnímu opakování" in the header area (next to the topic name). Screenshot: `02-quiz-question.png`.

- [ ] **P1 [interaction]** Submit-and-next flow requires two clicks (Odeslat → Další otázka). On desktop/tablet with keyboard, neither action has a keyboard shortcut. Enter should submit; a clear key (Space / Enter / N) should advance. The post-MVP backlog already has a keyboard-shortcuts item — mark this as the motivating evidence. Screenshot: `03-answer-correct.png`.

- [ ] **P2 [visual]** The disabled "Odeslat" button is gray-on-white with very low contrast; at a glance it reads as disabled *and* absent. Either darken disabled state or use a clearly muted but legible treatment. Screenshot: `02-quiz-question.png` (before selecting an option).

- [ ] **P2 [interaction]** No way to skip a question or flag it as ambiguous / broken. Seed quality will matter long-term; users should have a "nahlásit otázku" link on every item for feedback. Screenshot: any quiz screenshot.

- [ ] **P2 [visual]** On a correct answer, the explanation card uses a soft green border / background (`03-answer-correct.png`); on an incorrect answer, the red border is similarly soft (`05-answer-incorrect.png`). Both are tasteful but the "✓ Správně" / "✗ Špatně" pill could be more prominent (larger type, filled badge) — it's the single most important feedback element. Screenshots: `03-answer-correct.png`, `05-answer-incorrect.png`.

- [ ] **P2 [copy]** After a wrong answer, the user's (wrong) selected radio stays red-outlined and the correct option is green-outlined. The correct-answer text *also* appears spelled out in the explanation block ("SPRÁVNÁ ODPOVĚĎ: ..."). This duplicates information. Remove the textual repetition — the green outline is enough. Screenshot: `05-answer-incorrect.png`.

- [ ] **P2 [interaction]** After submission, radios become `disabled` but still *look* like radios. Consider converting them to a review view that makes it clearer the interaction is done — e.g. replace the circle with ✓ / ✗ icons. Screenshot: `03-answer-correct.png`, `05-answer-incorrect.png`.

- [ ] **P2 [a11y]** Radio labels wrap onto multiple lines for long options. The click target is the full card (good) but the radio circle itself is small (~16 px). Meets WCAG but feels small for touch. Screenshot: `02-quiz-question.png`.

- [ ] **P3 [copy]** Quiz page header shows the topic name ("Komunikace s klientem") as small muted text; the question stem is the H1. Either invert (topic as chip near H1) or add breadcrumb: Přehled > Komunikace s klientem. Screenshot: `02-quiz-question.png`.

- [ ] **P3 [visual]** Serif for the H1 question stem, sans for answers — intentional editorial choice, looks good, but the Czech punctuation mixing (hyphen, em-dash, curly quotes) inside explanations is inconsistent. Check `prisma/seed*.ts` for uniformity. Screenshot: `05-answer-incorrect.png` ("„špinavé" na „čistou"" — mixed quote directions look correct here, but audit broadly).

- [ ] **P3 [interaction]** No "back" within quiz — once you submit, you can't see the previous question/explanation. If learner wants to revisit the just-seen explanation they must go to dashboard → no mistake review surface exists (post-MVP item already covers a review page).

## Cross-cutting

- [ ] **P2 [a11y]** No `html[lang="cs"]` check performed — verify `app/layout.tsx` sets `lang="cs"` on `<html>`. Screen readers need it for Czech pronunciation.

- [ ] **P2 [performance]** No skeleton or loading state during the POST `/api/attempt` round-trip; button just … disables. Add optimistic feedback. Screenshot: not captured (fast enough on localhost).

- [ ] **P3 [visual]** No dark-mode support despite Tailwind being configured. Michal studies evenings — dark mode would be pleasant. Low priority.

- [ ] **P3 [info-arch]** No global nav — every navigation jump is via inline "Přehled" link in the top-right of the quiz page. If the app grows beyond dashboard + quiz, this will break. Defer.

## Mobile (390 × 844)

- [ ] **P2 [visual]** Stat cards stack vertically on mobile — reasonable — but they take 60 % of the above-the-fold space, pushing the primary "Spustit trénink" CTA and the topic list below. Consider collapsing into a single compact header row on mobile. Screenshot: `07-mobile-dashboard.png`.

- [ ] **P3 [visual]** Quiz page padding on mobile looks slightly tight — text touches viewport edges at ~16 px margin. Bump to 20–24 px. Screenshot: `08-mobile-quiz.png`.

---

**Total findings: 26** (4 × P1, 13 × P2, 9 × P3)
