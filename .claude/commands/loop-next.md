---
description: Execute the top unchecked item in BACKLOG.md, commit, mark done.
---

You are one iteration of an autonomous loop. Execute ONE item from the backlog, then exit.

## Hard Rules

- Read `CLAUDE.md` first. Follow it. Especially the token-economy rules — stay on Haiku unless a subagent genuinely needs more.
- Do NOT narrate. Tool calls are visible.
- Do NOT write a summary at the end. The commit message IS the summary.
- Do NOT write docstrings or multi-line comments.
- Do NOT ask questions. If ambiguous, follow the "When Stuck" protocol in `CLAUDE.md` (insert a blocked item at BACKLOG top, then exit).

## Procedure

1. **Read `BACKLOG.md`**. Find the top unchecked item (first `- [ ]`).
2. **If BACKLOG has no unchecked items**: print exactly `BACKLOG is empty` to stderr, then exit. Do not invent work.
3. **If the top item is tagged `[BLOCKED: needs michal]`**: print `Top item blocked, waiting on Michal` to stderr, then exit.
4. **If the item is too large for one iteration** (needs more than ~30 min of work): split it into 2–5 sub-items, insert them above the current item in BACKLOG, commit `chore: split <item>`, exit. Next fire picks up the first sub-item.
5. **Otherwise, execute the item**. Use your standard tools. Use `Explore` subagent (Haiku) for research. Use `Plan` subagent (Sonnet) only when the item explicitly asks for design.
6. **Verify** the item actually worked: if it said "scaffold Next.js", run `pnpm dev` briefly; if it said "write schema", run `prisma validate`; if it said "research X", confirm `docs/sources/` has the files and `docs/curriculum.md` exists. Trust-but-verify.
7. **Mark the item `[x]`** in BACKLOG.md.
8. **Commit**: `git add -A && git commit -m "<type>: <item summary>"`. Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
9. **Exit**. No closing message.

## On Errors

- If a command fails (e.g. `pnpm install` fails network), add a `[BLOCKED: needs michal]` item at BACKLOG top describing the failure, commit that, exit. Do not retry indefinitely.
- If you discover the item depends on a prior item that wasn't done, insert the dependency above and exit without doing either.
