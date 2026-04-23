# maserska-zkouska-trening

Adaptive web trainer for the Czech masér professional qualification exam (NSK 69-037-M).

Built by an autonomous Claude loop. See `~/SecondBrain/wiki/projects/maserska-zkouska-autonomy.md` for the full design.

## Start the Loop

```bash
./scripts/setup-launchd.sh
```

Installs a macOS launchd agent that fires every 20 min, runs one BACKLOG item per fire, commits, and exits. Rate-limit errors are handled automatically — the loop pauses and resumes when your Anthropic token window refreshes.

## Watch It Work

```bash
tail -f scripts/loop.log
```

## Steer It

Edit `BACKLOG.md`. Top unchecked item is the next thing the loop will do. Reorder, insert, or delete items freely.

## Pause It

Comment out every item in `BACKLOG.md` (or delete them). Fires become near-free no-ops.

## Stop It

```bash
./scripts/teardown-launchd.sh
```

## Run a Single Iteration Now

```bash
./scripts/loop-runner.sh
```

## Project Docs

- `CLAUDE.md` — what the loop must follow on every iteration
- `BACKLOG.md` — ordered task queue
- `~/SecondBrain/wiki/projects/maserska-zkouska.md` — project overview in the vault
