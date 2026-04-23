#!/usr/bin/env bash
# Remove the maserska-zkouska-trening dev server launchd agent.

set -u

LABEL="com.michalkudrnac.maserska-dev-server"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ -f "$PLIST" ]; then
  launchctl unload "$PLIST" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Removed: $PLIST"
else
  echo "No plist at $PLIST — nothing to remove."
fi

if launchctl list | grep -q "$LABEL"; then
  echo "WARNING: launchctl still lists $LABEL. Try: launchctl remove $LABEL"
else
  echo "launchd agent $LABEL is gone."
fi
