#!/usr/bin/env bash
set -euo pipefail
INSTALL_ROOT="${CAESTHETIC_SYNC_INSTALL_ROOT:-/opt/caesthetic-repo-sync}"
ROOT="${GRAINEE_ROOT:-/var/www/grainee-v2}"
SATELLITE="${CAESTHETIC_AGENTS_DIR:-/var/www/caesthetic}"
LOCK="${CAESTHETIC_SYNC_LOCK:-/run/lock/caesthetic-repo-sync.lock}"
exec flock -n "$LOCK" python3 "$INSTALL_ROOT/sync_agents_bidirectional.py" \
  --grainee "$ROOT" \
  --satellite "$SATELLITE" \
  --apply --commit --push
