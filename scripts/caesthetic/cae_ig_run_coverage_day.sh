#!/usr/bin/env bash
# CAESTHETIC IG day session — DEC-824 coverage on Dolphin 833304152
# Usage:
#   bash scripts/caesthetic/cae_ig_run_coverage_day.sh
#   CAE_IG_DRY_RUN=1 bash scripts/caesthetic/cae_ig_run_coverage_day.sh
#   CAE_IG_STORY_LIMIT=40 CAE_IG_LIKE_LIMIT=10 CAE_IG_FOLLOW_LIMIT=5 bash ...
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PROFILE_ID="${CAE_IG_PROFILE_ID:-833304152}"
DOLPHIN_PKG="${DOLPHIN_OPERATOR_PACKAGE:-/opt/dolphin-profile-control/current}"
SBO_SCRIPT="$ROOT/services/social-browser-operator/scripts/run-cae-ig-coverage-day-833304152.mjs"

echo "[cae-ig-day] rebuild queue"
node "$ROOT/scripts/caesthetic/cae_ig_build_dolphin_queue.mjs" >/tmp/cae_ig_queue_build.json
python3 - <<'PY'
import json
print(json.dumps(json.load(open("/tmp/cae_ig_queue_build.json")), indent=2))
PY

echo "[cae-ig-day] proxy preflight $PROFILE_ID"
if [[ -f "$DOLPHIN_PKG/scripts/proxy-preflight.mjs" ]]; then
  node "$DOLPHIN_PKG/scripts/proxy-preflight.mjs" "$PROFILE_ID"
elif [[ -f "$ROOT/mcp-server/dolphin-profile-control/scripts/proxy-preflight.mjs" ]]; then
  node "$ROOT/mcp-server/dolphin-profile-control/scripts/proxy-preflight.mjs" "$PROFILE_ID"
else
  echo "[cae-ig-day] WARN: proxy-preflight script not found; continuing only if you already preflighted" >&2
fi

echo "[cae-ig-day] operator-start $PROFILE_ID"
node "$DOLPHIN_PKG/scripts/operator-start.mjs" "$PROFILE_ID"

echo "[cae-ig-day] coverage runner (stops profile in finally)"
export CAE_IG_QUEUE="${CAE_IG_QUEUE:-$ROOT/tmp/cae-ig-queue/queue.txt}"
export CAE_IG_STATE="${CAE_IG_STATE:-$ROOT/tmp/cae-ig-queue/state.json}"
node "$SBO_SCRIPT"

echo "[cae-ig-day] done — see tmp/cae-ig-queue/coverage-*/summary.json"
