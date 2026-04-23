#!/usr/bin/env bash
# One-shot installer for the maserska-zkouska-trening dev server launchd agent.
# Keeps `pnpm dev` alive on :3000 so UI sweeps can hit a live instance.
# Safe to re-run — reloads the agent with current plist contents.

set -euo pipefail

REPO="$HOME/maserska-zkouska-trening"
LABEL="com.michalkudrnac.maserska-dev-server"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
PNPM="$(command -v pnpm)"
NODE_BIN_DIR="$(dirname "$(command -v node)")"

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
    <string>$PNPM</string>
    <string>dev</string>
  </array>

  <!-- Keep the dev server running. If it crashes or exits, relaunch it. -->
  <key>KeepAlive</key>
  <true/>

  <key>RunAtLoad</key>
  <true/>

  <key>ThrottleInterval</key>
  <integer>10</integer>

  <key>StandardOutPath</key>
  <string>$REPO/scripts/dev-server.log</string>

  <key>StandardErrorPath</key>
  <string>$REPO/scripts/dev-server.log</string>

  <key>WorkingDirectory</key>
  <string>$REPO</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>$HOME</string>
    <key>LANG</key>
    <string>en_US.UTF-8</string>
    <key>PATH</key>
    <string>$NODE_BIN_DIR:/usr/local/bin:/usr/bin:/bin</string>
  </dict>

  <key>ProcessType</key>
  <string>Background</string>
</dict>
</plist>
PLIST_EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

echo "Installed: $PLIST"
echo "Dev server running at: http://localhost:3000"
echo "Verify with: curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000"
echo "Watch with:  tail -f $REPO/scripts/dev-server.log"
echo "Stop with:   $REPO/scripts/teardown-dev-server.sh"
