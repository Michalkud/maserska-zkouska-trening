---
description: Rebuild BACKLOG.md when empty or stale. In continuous-improvement mode, generate the next batch.
---

BACKLOG.md needs items. Two modes.

## Mode A — MVP incomplete

Some pre-"Post-MVP" item is still `[ ]`. That should never require rebuild — tell the user their BACKLOG already has pending work and exit.

## Mode B — continuous improvement

Every item above the `## Post-MVP — UI Testing & Continuous Improvement` heading is `[x]` AND every item below it is `[x]`. The loop is in continuous mode.

Procedure:

1. Read `CLAUDE.md` and `~/SecondBrain/wiki/projects/maserska-zkouska.md`.
2. Inspect:
   - `docs/ui-review/findings.md` — any unresolved `- [ ]` findings? (Those drive "fix top finding" items.)
   - `git log --oneline -30` — what was done recently? Avoid churning on the same concerns.
   - `src/app/`, `src/lib/`, `src/components/ui/` — what surfaces exist to polish?
   - `prisma/schema.prisma` + seed state — are more curriculum domains unseeded?
3. Generate a new batch of 10–15 post-MVP items under the same `## Post-MVP` heading. Mix of:
   - 3–5 × "fix top unresolved UI finding" (if findings.md has open items; otherwise omit)
   - 2–3 × design polish (concrete focus each: typography, color, layout, empty states, loading states, error states, mobile)
   - 2–3 × logic refinement (SM-2 edge cases, selector tie-breaking, session pacing, streak logic, explanation quality)
   - 1–2 × new small features from the original project goals (e.g. daily goal, pomodoro-like pacing, audio pronunciation of Czech terms, etc.) — only within the scope in `~/SecondBrain/wiki/projects/maserska-zkouska.md`
   - 1 × UI sweep refresh (if the last sweep is more than 3 days old)
   - Always end with: `- [ ] **Post-MVP: regenerate improvement batch**` so the loop never runs dry
4. Don't re-add items that are already done and clearly stable — check git log.
5. Don't invent features Michal didn't ask for.
6. Commit: `chore: rebuild BACKLOG (continuous improvement round N)` where N is incremented from the previous round commit.
7. Exit.

## Rules

- Each item sized to ≤1 iteration (~10–30 min of Opus work).
- Every item specifies the commit message.
- Never delete completed `[x]` items — they're the record.
- If repo state looks broken (tests failing, dev server not starting), add a `[BLOCKED: needs michal]` item at top explaining what's wrong, instead of piling more work on.
