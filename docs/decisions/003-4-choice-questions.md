# ADR 003: 4-Choice Questions + Unanswered-Question Support

**Status:** Accepted
**Date:** 2026-04-24
**Decision Maker:** Michal (via autonomous loop)

## Context

The practice-exam scan in `docs/sources/cviceni-testy-2026-04-23/` contains two first-aid tests (A, B — 30 questions each, 60 total). First-aid questions use **4 choices** (a/b/c/d), unlike the anatomy section which uses 3.

In addition, the answer key for the first-aid tests (page 3/3) is missing from the scan. Guessing answers is explicitly forbidden; we need a way to represent a question whose `correctAnswer` is not yet known so that:

1. The row can be transcribed into the bank the moment the key arrives (no second pass re-typing stems).
2. Unanswered rows never appear in the quiz (cannot be graded).
3. The dashboard total reflects that these rows exist but are not yet trainable.

## Decision

### 1. Choices are already N-length — no schema change needed

`SeedQuestion.choices` is typed as `string[]`, and the Prisma column `Question.choices String?` stores a JSON-serialized array. The selector, storage layer, and `QuizForm` all iterate `choices.map(...)` without a hard-coded length. First-aid rows will ship with 4 entries; the UI will render them top-to-bottom, and the existing keyboard shortcut (`1..9` → `choices[idx-1]`) already covers `4`.

**No code change required for the 4-choice case.** The item header is kept for the ADR commit message because it's the user-visible framing, but the mechanical lift is zero.

### 2. `correctAnswer` becomes nullable

Add `| null` to the type in three places:

| Location | Change |
|---|---|
| `src/data/question-bank.ts` — `SeedQuestion.correctAnswer` | `string` → `string \| null` |
| `prisma/schema.prisma` — `Question.correctAnswer` | `String` → `String?` |
| `src/lib/storage/types.ts` — `QuestionWithContext.correctAnswer` | `string` → `string \| null` |

Migration: `prisma migrate dev --name first-aid-nullable-answer`.

Legacy rows (all existing anatomy/domain seed data) have non-null `correctAnswer` values; the migration is additive and a no-op for them.

### 3. Unanswered rows are excluded from quiz selection

Semantics of `correctAnswer === null`: *"We have the question and choices but no authoritative answer yet."*

`pickNextQuestion` (selector) and the two storage impls must filter these rows out of the candidate set:

- **prisma.ts**: add `correctAnswer: { not: null }` to the `getNextDueQuestion` and mastery-computation queries where they feed the selector. `listQuestions` keeps them (admin surfaces may want them).
- **localstorage.ts**: filter `questions.filter(q => q.correctAnswer !== null)` before passing to `pickNextQuestion`.
- **Selector itself**: not modified. Keeps `SelectorQuestion` agnostic; the storage layer is responsible for what enters the candidate pool.

Consequence: unanswered rows never reach `QuizForm`, so `QuizForm.correctAnswer` stays `string` (non-null). No UI change for the answer-display path.

### 4. Aggregate counts and dashboard surfacing

`getAggregateCounts` splits into two numbers:

- `totalQuestions` — unchanged, counts everything in the bank (including pending).
- `totalDue` — subtract pending rows (they are never "due").

New field: `pendingAnswerKey: number` on `AggregateCounts`. The dashboard renders a muted footer line below `N k opakování v databázi`:

> *X otázek čeká na doplnění klíče*

Hidden when `pendingAnswerKey === 0` (the default for the current bank).

`getMasteryByTopic`: `TopicSummary.total` stays "rows in the topic" (pending included, so the denominator is stable when the key arrives). `TopicSummary.due` excludes pending. This matches how the user sees it: a 30-row topic is still a 30-row topic; it's just that 30 of them aren't trainable yet.

### 5. Attempt recording is unaffected

`/attempt` never receives a pending-row POST because the selector never surfaces one and `QuizForm` types `correctAnswer: string`. No null guard needed in `route.ts` or `recordAttempt`.

### 6. Filling answers is a plain data edit

When Michal provides the answer key (page 3/3), filling in the 60 rows is a `sed`-equivalent edit of `src/data/question-bank.ts` followed by `pnpm db:seed`. No schema migration, no code change.

## Tradeoffs

### Positive

- **No guessed answers, ever.** The bank can hold the full first-aid corpus from day one; trainer behavior is unchanged for the 158 existing questions.
- **Single-source-of-truth transcription.** No scratch file or sidecar JSON; the question text lives where all other questions live.
- **Minimal schema churn.** One nullable column and one filter clause per storage impl.
- **Reversible.** If the pending rows ever get stale (e.g. Michal decides to drop them), `DELETE FROM Question WHERE correctAnswer IS NULL` is a one-liner.

### Negative

- **Two-phase import workflow.** Text lands in one commit, answers in another. Mitigated: the answer-fill commit is mechanical.
- **Dashboard now has a conditional footer.** Another UI state to keep in mind. Mitigated: hidden at zero, explicit copy when nonzero.
- **Storage impls both gain a filter.** If a third storage backend is ever added (unlikely given ADR 002), it must remember to filter. Mitigated: the Storage contract's docstring notes the invariant.

## Alternatives Considered

### Keep `correctAnswer: string`, use a sentinel like `""` or `"TODO"`

**Rejected.** Sentinels lie about the type. `"TODO"` shown to the user if a filter is forgotten is worse than a type error caught at compile time.

### Hold all imports until the answer key arrives

**Rejected.** Imports are ~30 min each; doing them all in one go inflates the iteration to ~2 h, above the one-item-per-iteration budget. Transcription and answering are independent subtasks and should be separately committed.

### Add a boolean `pending` column next to `correctAnswer`

**Rejected.** Redundant with `correctAnswer IS NULL`. Two fields that must stay in sync are a bug farm.

### Build a separate `PendingQuestion` table

**Rejected.** Would duplicate the schema and force a migration when promoting a row. Nullable column on the existing table is strictly simpler.

### Render pending rows as open-answer with forced self-grade

**Rejected.** The user does not know the answer either — the whole point is that the key is missing. Self-grade is meaningless without a reference.

## Rollout

The ADR itself is the deliverable of iteration 1. The rest of the work is broken into discrete BACKLOG items:

1. **Schema + types + storage filter + dashboard footer** — `feat: nullable correctAnswer + pending-key dashboard surface`.
2. **First Aid Test A q1–q15 import** — rows with `correctAnswer: null`; answer fill is a separate commit once the key arrives.
3. **First Aid Test A q16–q30 import**
4. **First Aid Test B q1–q15 import** (aggressive dedup vs Test A — same pattern as Anatomy B).
5. **First Aid Test B q16–q30 import**
6. **Fill first-aid answers** — mechanical edit of `correctAnswer` for all null rows once Michal provides page 3/3.

A `[BLOCKED: needs michal]` entry is inserted at the top of BACKLOG asking for the missing answer-key page. The loop halts on that item; Michal clears it when the scan is uploaded.

## Links

- ADR 001: Technology Stack
- ADR 002: Dual-Mode Build (Server + Static)
- `docs/sources/cviceni-testy-2026-04-23/test-anatomie-a-prvni-pomoc.pdf` — PDF pages 11–16 hold first-aid A + B.
