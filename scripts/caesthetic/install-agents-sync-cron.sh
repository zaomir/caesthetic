#!/usr/bin/env bash
# Retired DEC-829 cron entrypoint. Keep old operator commands safe by routing
# them to the isolated 15-second systemd timer installer.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
INSTALLER="$REPO_ROOT/scripts/caesthetic/install-continuous-sync.sh"

echo "NOTICE: install-agents-sync-cron.sh is retired; installing caesthetic-repo-sync.timer instead." >&2
test -x "$INSTALLER" || {
  echo "ERROR: missing executable $INSTALLER" >&2
  exit 1
}

exec bash "$INSTALLER" "$@"
