---
description: Rebuild BACKLOG.md from project state when it's empty or stale.
---

BACKLOG.md is empty or Michal asked for a refresh. Regenerate it.

## Procedure

1. Read `CLAUDE.md` and `~/SecondBrain/wiki/projects/maserska-zkouska.md`.
2. Inspect repo state: `git log --oneline -30`, list top-level files, check which docs/ and app/ files exist.
3. Compare to what "finished" looks like:
   - curriculum researched → `docs/curriculum.md` exists + `docs/sources/` populated
   - stack decided → `docs/decisions/001-stack.md` exists
   - Next.js scaffolded → `package.json` + `app/` exist
   - Prisma schema → `prisma/schema.prisma` with Topic/Question/Attempt/MasteryScore
   - questions seeded → Prisma seed produces nonzero rows for at least one Topic
   - quiz UI → `app/quiz/page.tsx` + working server action
   - SM-2 → `lib/sm2.ts` with tests
   - dashboard → `app/page.tsx` showing mastery per topic
4. Write the next 6–10 items in `BACKLOG.md`, in execution order, each sized to one iteration.
5. Commit: `chore: rebuild BACKLOG`.
6. Exit.

## Rules

- Do not re-add items that are already done.
- Do not invent features Michal didn't ask for. Stick to the scope in `~/SecondBrain/wiki/projects/maserska-zkouska.md`.
- If you can't tell whether an item is done, check the code, not the git log.
