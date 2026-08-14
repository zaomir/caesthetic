#!/usr/bin/env bash
# Guarded CAESTHETIC IG coverage day (DEC-824) — for systemd timers.
# - flock so AM/PM never overlap
# - skip if last run blocked within 36h
# - optional CAE_IG_BLOCK=am|pm for cap presets
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

LOCK_DIR="${CAE_IG_LOCK_DIR:-/var/lock}"
LOCK_FILE="${CAE_IG_LOCK_FILE:-$LOCK_DIR/cae-ig-coverage.lock}"
STATE_DIR="${CAE_IG_STATE_DIR:-$ROOT/tmp/cae-ig-queue}"
BLOCK="${CAE_IG_BLOCK:-full}"
mkdir -p "$LOCK_DIR" "$STATE_DIR" /var/log/cae-ig

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[cae-ig-day] SKIP locked by another coverage run" | tee -a /var/log/cae-ig/coverage.log
  exit 0
fi

# Skip if recent block
set +e
python3 - <<'PY'
import json, sys, time
from pathlib import Path
root = Path("/var/www/grainee-v2/tmp/cae-ig-queue")
cutoff = time.time() - 36 * 3600
blocked = False
for p in sorted(root.glob("coverage-*/summary.json"), reverse=True)[:8]:
    try:
        j = json.loads(p.read_text())
    except Exception:
        continue
    if j.get("blocked"):
        if p.stat().st_mtime >= cutoff:
            blocked = True
            print(f"[cae-ig-day] SKIP recent_block file={p}", flush=True)
            break
if blocked:
    sys.exit(75)  # special skip
sys.exit(0)
PY
skip_rc=$?
set -e
if [[ "$skip_rc" -eq 75 ]]; then
  exit 0
elif [[ "$skip_rc" -ne 0 ]]; then
  echo "[cae-ig-day] WARN block-check rc=$skip_rc; continuing" >&2
fi

case "$BLOCK" in
  am)
    export CAE_IG_STORY_LIMIT="${CAE_IG_STORY_LIMIT:-70}"
    export CAE_IG_LIKE_LIMIT="${CAE_IG_LIKE_LIMIT:-15}"
    export CAE_IG_FOLLOW_LIMIT="${CAE_IG_FOLLOW_LIMIT:-0}"
    export CAE_IG_COMMENT_DRAFT_LIMIT="${CAE_IG_COMMENT_DRAFT_LIMIT:-3}"
    export CAE_IG_COMMENT_SEND="${CAE_IG_COMMENT_SEND:-0}"
    export CAE_IG_MAX_RUNTIME_MS="${CAE_IG_MAX_RUNTIME_MS:-7200000}"
    ;;
  pm)
    export CAE_IG_STORY_LIMIT="${CAE_IG_STORY_LIMIT:-50}"
    export CAE_IG_LIKE_LIMIT="${CAE_IG_LIKE_LIMIT:-15}"
    export CAE_IG_FOLLOW_LIMIT="${CAE_IG_FOLLOW_LIMIT:-5}"
    export CAE_IG_COMMENT_DRAFT_LIMIT="${CAE_IG_COMMENT_DRAFT_LIMIT:-3}"
    export CAE_IG_COMMENT_SEND="${CAE_IG_COMMENT_SEND:-0}"
    export CAE_IG_MAX_RUNTIME_MS="${CAE_IG_MAX_RUNTIME_MS:-7200000}"
    ;;
  *)
    export CAE_IG_STORY_LIMIT="${CAE_IG_STORY_LIMIT:-120}"
    export CAE_IG_LIKE_LIMIT="${CAE_IG_LIKE_LIMIT:-30}"
    export CAE_IG_FOLLOW_LIMIT="${CAE_IG_FOLLOW_LIMIT:-5}"
    export CAE_IG_COMMENT_DRAFT_LIMIT="${CAE_IG_COMMENT_DRAFT_LIMIT:-3}"
    export CAE_IG_COMMENT_SEND="${CAE_IG_COMMENT_SEND:-0}"
    ;;
esac

export CAE_IG_QUEUE="${CAE_IG_QUEUE:-$STATE_DIR/queue.txt}"
export CAE_IG_STATE="${CAE_IG_STATE:-$STATE_DIR/state.json}"
export CAE_IG_COMMENT_DRAFTS="${CAE_IG_COMMENT_DRAFTS:-$STATE_DIR/comment_drafts.json}"

echo "[cae-ig-day] start block=$BLOCK story=$CAE_IG_STORY_LIMIT like=$CAE_IG_LIKE_LIMIT follow=$CAE_IG_FOLLOW_LIMIT comment_draft=$CAE_IG_COMMENT_DRAFT_LIMIT send=$CAE_IG_COMMENT_SEND" \
  | tee -a /var/log/cae-ig/coverage.log

bash "$ROOT/scripts/caesthetic/cae_ig_run_coverage_day.sh" 2>&1 | tee -a /var/log/cae-ig/coverage.log
