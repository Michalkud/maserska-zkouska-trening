# CLAUDE.md — maserska-zkouska-trening

## What This Repo Is

Adaptive web trainer for Michal's **Czech masér professional qualification exam** (NSK 69-037-M; masér sportovní a rekondiční). Tracks per-topic mastery, uses SM-2 spaced repetition to steer future quizzes toward weak areas.

This repo is **built and maintained by a Claude loop** — not hand-written. You (Claude) are one iteration of that loop. Read `BACKLOG.md` first.

## Second Brain

Michal's Obsidian vault lives at `~/SecondBrain`. Project is documented there:
- `~/SecondBrain/wiki/projects/maserska-zkouska.md` — overview
- `~/SecondBrain/wiki/projects/maserska-zkouska-architecture.md` — system design
- `~/SecondBrain/wiki/projects/maserska-zkouska-autonomy.md` — how the loop runs

Vault schema: `~/SecondBrain/CLAUDE.md`. Follow it when writing to the vault. Never modify `~/SecondBrain/sources/`.

## How the Loop Works

1. `scripts/loop-runner.sh` is invoked by macOS launchd every 20 min.
2. It runs `claude -p --model claude-haiku-4-5-20251001 "/loop-next"`.
3. `/loop-next` reads the top unchecked item in `BACKLOG.md`, does it, commits, marks it `[x]`.
4. On rate-limit, the runner exits 0 silently; launchd retries. When the token window resets, work resumes automatically.

See `.claude/commands/loop-next.md` for the exact iteration logic.

## Token Economy — Hard Rules

This project is aggressively cost-optimized. Every Claude invocation runs on Haiku by default.

- **Default model is Haiku.** Only escalate when the task genuinely requires it (nontrivial design, ambiguous architecture). Escalate via a subagent, not by switching the main session.
- **Subagent model choice**: `Explore` → Haiku. `Plan` → Sonnet. Never Opus unless Michal explicitly asks.
- **No narration.** Tool calls are visible; do not announce them.
- **No docstrings or multi-line comments.** Comments only when the *why* is non-obvious.
- **No defensive coding.** Validate at system boundaries only. Trust internal code.
- **No backwards-compat shims.** This is a greenfield repo with zero deployed users. Delete freely.
- **Edit over rewrite.** Never `Write` a file the loop already wrote unless the change is a full replacement.
- **No premature abstraction.** Three similar lines beats a premature helper.
- **No summary recaps** at end of a loop iteration. The BACKLOG checkbox and the commit message are the summary.

## Conventions

- Commit after every completed BACKLOG item. Conventional commits style: `feat:`, `fix:`, `chore:`, `docs:`.
- File names: `kebab-case`.
- Czech content fields in UI use suffix `Cs` (e.g. `stemCs`, `nameCs`). Default locale is Czech; no i18n until Michal asks.
- All DB data lives in `./data/app.db` (SQLite). Never commit it — `.gitignore` covers it.
- Source research documents go in `docs/sources/` with original filename preserved where possible.

## When BACKLOG Is Empty

Write `BACKLOG is empty` to stderr and exit. Do NOT invent new work. Michal will add items. The one exception: if a BACKLOG item says "split next item" or similar meta-task, that's fine.

## When Stuck

If a BACKLOG item is ambiguous or you need a decision from Michal, **do not guess**. Add a new item to BACKLOG at the top:

```
- [ ] [BLOCKED: needs michal] <original item>
  - Question: <specific decision needed>
  - Options considered: A / B / C
```

Then exit. Michal resolves it; next fire picks it up.
