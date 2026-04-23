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

# Stream stdout+stderr live via tee so `tail -f loop.log` shows progress during the run.
# --verbose --output-format stream-json emits JSON events for each assistant turn, tool use, and tool result.
# jq extracts a human-readable summary line per event; raw JSON is tee'd to a sibling .jsonl for debugging.
JSONL="$REPO/scripts/loop.jsonl"
claude -p \
  --model claude-opus-4-7 \
  --dangerously-skip-permissions \
  --verbose \
  --output-format stream-json \
  "/loop-next" 2>&1 \
  | tee -a "$JSONL" \
  | jq -r --unbuffered '
      if .type == "assistant" and (.message.content // [] | length) > 0 then
        (.message.content[] | (if .type=="text" then (.text | gsub("\n"; " ") | .[0:300])
                               elif .type=="tool_use" then "TOOL \(.name) \((.input // {}) | tostring | .[0:200])"
                               else empty end)) // empty
      elif .type == "user" and (.message.content // [] | length) > 0 then
        (.message.content[] | select(.type=="tool_result")
          | "  RESULT \((.content // "" | tostring | .[0:200]))") // empty
      elif .type == "result" then
        "=== done: \(.subtype // "ok") cost=$\(.total_cost_usd // 0) dur=\(.duration_ms // 0)ms turns=\(.num_turns // 0) ==="
      else empty end
    ' 2>/dev/null \
  | tee -a "$LOG" > /dev/null
EXIT_CODE="${PIPESTATUS[0]}"

echo "--- exit=$EXIT_CODE ---" >> "$LOG"

# Detect rate-limit patterns in the tail of the log so `grep rate-limited loop.log` works.
if tail -n 400 "$LOG" | grep -qiE "rate.?limit|quota|429|overloaded"; then
  echo "$(date -Iseconds) runner: rate-limited, will retry on next launchd fire" >> "$LOG"
fi

# Always exit 0 — launchd retries unconditionally on its cron schedule.
exit 0
