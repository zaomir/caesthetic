#!/usr/bin/env bash
# Guarded CAESTHETIC IG coverage day — for systemd timers.
# InMail/LinkedIn owns priority on shared Dolphin profile 833304152:
# - if the canonical profile lease is busy, IG skips immediately;
# - IG never places a global HOLD while waiting for an active LinkedIn action;
# - once an idle slot is acquired, the exclusive IG block is short and bounded;
# - fact-gated comments remain enabled and the runner stops on challenge/restriction.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

LOCK_DIR="${CAE_IG_LOCK_DIR:-/var/lock}"
LOCK_FILE="${CAE_IG_LOCK_FILE:-$LOCK_DIR/cae-ig-coverage.lock}"
STATE_DIR="${CAE_IG_STATE_DIR:-$ROOT/tmp/cae-ig-queue}"
FLEET_STATE_DIR="${SBO_FLEET_STATE_DIR:-/var/lib/social-fleet}"
FLEET_HOLD="$FLEET_STATE_DIR/HOLD"
PROFILE_LEASE="$FLEET_STATE_DIR/leases/profile_833304152.json"
BLOCK="${CAE_IG_BLOCK:-full}"
BLOCK_COOLDOWN_HOURS="${CAE_IG_BLOCK_COOLDOWN_HOURS:-6}"
RACE_GUARD_SECONDS="${CAE_IG_RACE_GUARD_SECONDS:-8}"
mkdir -p "$LOCK_DIR" "$STATE_DIR" /var/log/cae-ig

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[cae-ig-day] SKIP locked by another coverage run" | tee -a /var/log/cae-ig/coverage.log
  exit 0
fi

# A founder/deploy HOLD stops every social writer, including this timer.
if [[ -f "$FLEET_HOLD" ]]; then
  echo "[cae-ig-day] SKIP global social-fleet HOLD active" | tee -a /var/log/cae-ig/coverage.log
  exit 0
fi

# LinkedIn/InMail has priority. Do not freeze future fleet jobs while waiting for
# an active action to finish; simply give up this optional Instagram slot.
if [[ -f "$PROFILE_LEASE" ]]; then
  echo "[cae-ig-day] SKIP profile 833304152 busy; LinkedIn/InMail keeps priority" \
    | tee -a /var/log/cae-ig/coverage.log
  exit 0
fi

# Keep a short account-safety cooldown after a verified challenge/action block.
set +e
CAE_IG_BLOCK_COOLDOWN_HOURS="$BLOCK_COOLDOWN_HOURS" python3 - <<'PY'
import json, os, sys, time
from pathlib import Path
root = Path("/var/www/grainee-v2/tmp/cae-ig-queue")
hours = max(1.0, float(os.environ.get("CAE_IG_BLOCK_COOLDOWN_HOURS", "6")))
cutoff = time.time() - hours * 3600
blocked = False
for p in sorted(root.glob("coverage-*/summary.json"), reverse=True)[:12]:
    try:
        j = json.loads(p.read_text())
    except Exception:
        continue
    if j.get("blocked") and p.stat().st_mtime >= cutoff:
        blocked = True
        print(f"[cae-ig-day] SKIP recent_platform_block cooldown_h={hours:g} file={p}", flush=True)
        break
sys.exit(75 if blocked else 0)
PY
skip_rc=$?
set -e
if [[ "$skip_rc" -eq 75 ]]; then
  exit 0
elif [[ "$skip_rc" -ne 0 ]]; then
  echo "[cae-ig-day] WARN block-check rc=$skip_rc; continuing" >&2
fi

FLEET_WAS_ACTIVE=0
TEMP_HOLD_CREATED=0
HOLD_TOKEN="cae-ig-${$}-$(date +%s)"
restore_fleet() {
  local rc=$?
  trap - EXIT INT TERM
  # The coverage runner normally stops the profile itself; this is emergency cleanup.
  node "${DOLPHIN_OPERATOR_PACKAGE:-/opt/dolphin-profile-control/current}/scripts/operator-stop.mjs" 833304152 >/dev/null 2>&1 || true
  if [[ "$TEMP_HOLD_CREATED" -eq 1 && -f "$FLEET_HOLD" ]]; then
    if [[ "$(cat "$FLEET_HOLD" 2>/dev/null || true)" == "$HOLD_TOKEN" ]]; then
      rm -f "$FLEET_HOLD"
    else
      echo "[cae-ig-day] preserving externally replaced global HOLD" \
        | tee -a /var/log/cae-ig/coverage.log
    fi
  fi
  if [[ "$FLEET_WAS_ACTIVE" -eq 1 && ! -f "$FLEET_HOLD" ]]; then
    systemctl start social-fleet.service || true
  fi
  exit "$rc"
}
trap restore_fleet EXIT INT TERM

if systemctl is-active --quiet social-fleet.service; then
  FLEET_WAS_ACTIVE=1
fi

# Claim a short idle window. The HOLD is installed only after the initial busy
# check. A small race guard catches a fleet job that acquired the lease at the
# same instant; in that case IG yields and the trap removes our HOLD.
printf '%s\n' "$HOLD_TOKEN" > "$FLEET_HOLD"
TEMP_HOLD_CREATED=1
for ((i=0; i<RACE_GUARD_SECONDS; i++)); do
  if [[ -f "$PROFILE_LEASE" ]]; then
    echo "[cae-ig-day] SKIP lease appeared during race guard; yielding to LinkedIn/InMail" \
      | tee -a /var/log/cae-ig/coverage.log
    exit 0
  fi
  sleep 1
done

if [[ "$FLEET_WAS_ACTIVE" -eq 1 ]]; then
  echo "[cae-ig-day] borrowing idle profile 833304152 for a short IG maintenance block" \
    | tee -a /var/log/cae-ig/coverage.log
  systemctl stop social-fleet.service
fi

# Instagram is maintained, but it no longer owns multi-hour exclusive windows.
# Each scheduled block gets at most 20 minutes, so LinkedIn/InMail loses at most
# 40 minutes per weekday even if both IG windows obtain an idle lease.
case "$BLOCK" in
  am)
    export CAE_IG_STORY_LIMIT="${CAE_IG_STORY_LIMIT:-12}"
    export CAE_IG_LIKE_LIMIT="${CAE_IG_LIKE_LIMIT:-4}"
    export CAE_IG_FOLLOW_LIMIT="${CAE_IG_FOLLOW_LIMIT:-1}"
    export CAE_IG_FOLLOW_BACK_LIMIT="${CAE_IG_FOLLOW_BACK_LIMIT:-1}"
    export CAE_IG_COMMENT_DRAFT_LIMIT="${CAE_IG_COMMENT_DRAFT_LIMIT:-1}"
    export CAE_IG_COMMENT_SEND="${CAE_IG_COMMENT_SEND:-1}"
    export CAE_IG_MAX_RUNTIME_MS="${CAE_IG_MAX_RUNTIME_MS:-1200000}"
    ;;
  pm)
    export CAE_IG_STORY_LIMIT="${CAE_IG_STORY_LIMIT:-8}"
    export CAE_IG_LIKE_LIMIT="${CAE_IG_LIKE_LIMIT:-3}"
    export CAE_IG_FOLLOW_LIMIT="${CAE_IG_FOLLOW_LIMIT:-1}"
    export CAE_IG_FOLLOW_BACK_LIMIT="${CAE_IG_FOLLOW_BACK_LIMIT:-1}"
    export CAE_IG_COMMENT_DRAFT_LIMIT="${CAE_IG_COMMENT_DRAFT_LIMIT:-1}"
    export CAE_IG_COMMENT_SEND="${CAE_IG_COMMENT_SEND:-1}"
    export CAE_IG_MAX_RUNTIME_MS="${CAE_IG_MAX_RUNTIME_MS:-1200000}"
    ;;
  *)
    export CAE_IG_STORY_LIMIT="${CAE_IG_STORY_LIMIT:-20}"
    export CAE_IG_LIKE_LIMIT="${CAE_IG_LIKE_LIMIT:-6}"
    export CAE_IG_FOLLOW_LIMIT="${CAE_IG_FOLLOW_LIMIT:-2}"
    export CAE_IG_FOLLOW_BACK_LIMIT="${CAE_IG_FOLLOW_BACK_LIMIT:-2}"
    export CAE_IG_COMMENT_DRAFT_LIMIT="${CAE_IG_COMMENT_DRAFT_LIMIT:-2}"
    export CAE_IG_COMMENT_SEND="${CAE_IG_COMMENT_SEND:-1}"
    export CAE_IG_MAX_RUNTIME_MS="${CAE_IG_MAX_RUNTIME_MS:-1200000}"
    ;;
esac

export CAE_IG_QUEUE="${CAE_IG_QUEUE:-$STATE_DIR/queue.txt}"
export CAE_IG_STATE="${CAE_IG_STATE:-$STATE_DIR/state.json}"
export CAE_IG_COMMENT_DRAFTS="${CAE_IG_COMMENT_DRAFTS:-$STATE_DIR/comment_drafts.json}"

echo "[cae-ig-day] start block=$BLOCK story=$CAE_IG_STORY_LIMIT like=$CAE_IG_LIKE_LIMIT follow=$CAE_IG_FOLLOW_LIMIT follow_back=$CAE_IG_FOLLOW_BACK_LIMIT comment=$CAE_IG_COMMENT_DRAFT_LIMIT send=$CAE_IG_COMMENT_SEND runtime_ms=$CAE_IG_MAX_RUNTIME_MS" \
  | tee -a /var/log/cae-ig/coverage.log

bash "$ROOT/scripts/caesthetic/cae_ig_run_coverage_day.sh" 2>&1 | tee -a /var/log/cae-ig/coverage.log
