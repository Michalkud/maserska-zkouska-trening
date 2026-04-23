#!/usr/bin/env bash
# One-shot installer for the maserska-zkouska-trening loop launchd agent.
# Safe to re-run — reloads the agent with current plist contents.

set -euo pipefail

REPO="$HOME/maserska-zkouska-trening"
LABEL="com.michalkudrnac.maserska-loop"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
RUNNER="$REPO/scripts/loop-runner.sh"

if [ ! -x "$RUNNER" ]; then
  chmod +x "$RUNNER"
fi

mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>

  <key>ProgramArguments</key>
  <array>
    <string>$RUNNER</string>
  </array>

  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Minute</key><integer>7</integer></dict>
    <dict><key>Minute</key><integer>27</integer></dict>
    <dict><key>Minute</key><integer>47</integer></dict>
  </array>

  <key>RunAtLoad</key>
  <false/>

  <key>StandardOutPath</key>
  <string>$REPO/scripts/loop.log</string>

  <key>StandardErrorPath</key>
  <string>$REPO/scripts/loop.log</string>

  <key>WorkingDirectory</key>
  <string>$REPO</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>$HOME</string>
    <key>LANG</key>
    <string>en_US.UTF-8</string>
  </dict>

  <key>ProcessType</key>
  <string>Background</string>
</dict>
</plist>
PLIST_EOF

# Reload idempotently.
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

echo "Installed: $PLIST"
echo "Firing schedule: :07, :27, :47 every hour (every ~20 min)"
echo "Verify with: launchctl list | grep maserska"
echo "Watch with:  tail -f $REPO/scripts/loop.log"
echo "Stop with:   $REPO/scripts/teardown-launchd.sh"
