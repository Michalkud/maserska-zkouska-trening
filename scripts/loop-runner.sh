#!/usr/bin/env bash
# One iteration of the maserska-zkouska-trening autonomous loop.
# Invoked by launchd. Always exits 0 so launchd never backs off.

set -u

REPO="$HOME/maserska-zkouska-trening"
LOG="$REPO/scripts/loop.log"
MAX_LOG_BYTES=$((5 * 1024 * 1024))  # rotate at 5 MB

cd "$REPO" || { echo "$(date -Iseconds) runner: cannot cd to $REPO" >> "$LOG"; exit 0; }

# Prevent concurrent runs. `mkdir` is atomic on macOS; first wins.
LOCK="$REPO/scripts/.loop-runner.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  # Check for stale lock (owner PID dead).
  OLD_PID="$(cat "$LOCK/pid" 2>/dev/null || echo 0)"
  if [ "$OLD_PID" -gt 0 ] && ! kill -0 "$OLD_PID" 2>/dev/null; then
    echo "$(date -Iseconds) runner: stale lock from PID $OLD_PID, removing" >> "$LOG"
    rm -rf "$LOCK"
    mkdir "$LOCK" || { echo "$(date -Iseconds) runner: lock retake failed" >> "$LOG"; exit 0; }
  else
    echo "$(date -Iseconds) runner: another iteration is running (PID $OLD_PID), skipping" >> "$LOG"
    exit 0
  fi
fi
echo $$ > "$LOCK/pid"
trap 'rm -rf "$LOCK" 2>/dev/null || true' EXIT

# Rotate log if large.
if [ -f "$LOG" ] && [ "$(stat -f%z "$LOG" 2>/dev/null || echo 0)" -gt "$MAX_LOG_BYTES" ]; then
  mv "$LOG" "$LOG.1"
fi

# Ensure claude is on PATH (launchd strips PATH).
export PATH="$HOME/.local/bin:$HOME/.volta/bin:$HOME/.nvm/versions/node/$(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | tail -n1)/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

if ! command -v claude >/dev/null 2>&1; then
  echo "$(date -Iseconds) runner: claude CLI not found on PATH" >> "$LOG"
  exit 0
fi

STAMP="$(date -Iseconds)"
echo "" >> "$LOG"
echo "=== $STAMP loop-next start ===" >> "$LOG"

# Run one iteration. Haiku by default; /loop-next may escalate via subagents.
# --dangerously-skip-permissions is required for non-interactive headless runs.
OUTPUT="$(claude -p \
  --model claude-haiku-4-5-20251001 \
  --dangerously-skip-permissions \
  "/loop-next" 2>&1)"
EXIT_CODE=$?

echo "$OUTPUT" >> "$LOG"
echo "--- exit=$EXIT_CODE ---" >> "$LOG"

# Detect rate-limit patterns in output and log them plainly so `grep rate-limited loop.log` works.
if echo "$OUTPUT" | grep -qiE "rate.?limit|quota|429|overloaded"; then
  echo "$(date -Iseconds) runner: rate-limited, will retry on next launchd fire" >> "$LOG"
fi

# Always exit 0 — launchd retries unconditionally on its cron schedule.
exit 0
