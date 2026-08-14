#!/usr/bin/env bash
# Install DEC-829 CAESTHETIC Agents↔grainee sync cron on this VDS.
# Run as root: bash scripts/caesthetic/install-agents-sync-cron.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$REPO_ROOT/deploy/cron.d/caesthetic-agents-sync"
DST="/etc/cron.d/caesthetic-agents-sync"
LOG="/var/log/caesthetic-agents-sync.log"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: run as root" >&2
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: missing $SRC" >&2
  exit 1
fi

install -m 644 "$SRC" "$DST"
touch "$LOG"
chmod 644 "$LOG"

if command -v systemctl >/dev/null 2>&1; then
  systemctl reload cron 2>/dev/null || systemctl reload crond 2>/dev/null || true
fi

echo "Installed $DST"
echo "Log: $LOG"
echo "Next tick: every 10 minutes (flock /tmp/caesthetic-agents-sync.lock)"
ls -la "$DST"
