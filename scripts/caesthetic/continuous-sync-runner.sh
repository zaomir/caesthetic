#!/usr/bin/env bash
set -euo pipefail
INSTALL_ROOT="${CAESTHETIC_SYNC_INSTALL_ROOT:-/opt/caesthetic-repo-sync}"
ROOT="${GRAINEE_ROOT:-/var/lib/caesthetic-repo-sync/grainee}"
SATELLITE="${CAESTHETIC_AGENTS_DIR:-/var/lib/caesthetic-repo-sync/satellite}"
LOCK="${CAESTHETIC_SYNC_LOCK:-/run/lock/caesthetic-repo-sync.lock}"
STATE="${CAESTHETIC_SYNC_REMOTE_STATE:-/var/lib/caesthetic-repo-sync/remote-heads}"
SATELLITE_URL="${CAESTHETIC_AGENTS_REPO_URL:-https://github.com/zaomir/caesthetic.git}"
GRAINEE_AUTHORITY="${CAESTHETIC_SYNC_GRAINEE_AUTHORITY_ROOT:-$ROOT}"
SATELLITE_AUTHORITY="${CAESTHETIC_SYNC_SATELLITE_AUTHORITY_ROOT:-$SATELLITE}"
GRAINEE_AUTHORITY_REMOTE="${CAESTHETIC_SYNC_GRAINEE_AUTHORITY_REMOTE:-origin}"
SATELLITE_AUTHORITY_REMOTE="${CAESTHETIC_SYNC_SATELLITE_AUTHORITY_REMOTE:-origin}"

remote_head() {
  local authority="$1" remote="$2" fallback_url="$3"
  if [[ -d "$authority/.git" ]]; then
    git -C "$authority" ls-remote "$remote" refs/heads/main | awk 'NR == 1 {print $1}'
  else
    git ls-remote "$fallback_url" refs/heads/main | awk 'NR == 1 {print $1}'
  fi
}

prepare_growth_score_pin_runtime() {
  local runtime
  runtime="$(node "$ROOT/scripts/caesthetic/score-pin-runtime.mjs" pending-runtime "$SATELLITE")"
  CAESTHETIC_SCORE_ACCESS_CONFIG="$(printf '%s' "$runtime" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.stringify({access_groups:JSON.parse(s).access_groups})))')"
  CAESTHETIC_SCORE_PUBLISH_PASSWORDS="$(printf '%s' "$runtime" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.stringify(JSON.parse(s).passwords)))')"
  export CAESTHETIC_SCORE_ACCESS_CONFIG CAESTHETIC_SCORE_PUBLISH_PASSWORDS
}

run_once() {
  set -euo pipefail
  local g_remote s_remote current previous
  g_remote="$(remote_head "$GRAINEE_AUTHORITY" "$GRAINEE_AUTHORITY_REMOTE" "$(git -C "$ROOT" remote get-url origin)")"
  s_remote="$(remote_head "$SATELLITE_AUTHORITY" "$SATELLITE_AUTHORITY_REMOTE" "$SATELLITE_URL")"
  test -n "$g_remote" && test -n "$s_remote"
  current="${g_remote} ${s_remote}"
  previous="$(cat "$STATE" 2>/dev/null || true)"
  if [[ "$current" == "$previous" ]]; then
    echo "CAESTHETIC_REPO_SYNC_IDLE grainee=${g_remote:0:12} satellite=${s_remote:0:12}"
    return 0
  fi

  python3 "$INSTALL_ROOT/sync_agents_bidirectional.py" \
    --grainee "$ROOT" \
    --satellite "$SATELLITE" \
    --apply --commit --push || return $?

  # Publication remains fail-closed for approval/schema/evidence, but client
  # access is now PIN-only. Runtime access config and smoke PINs are derived
  # automatically from the protected-route manifest and pending package hashes.
  if [[ -f "$ROOT/scripts/caesthetic/publish-growth-score-control-plane.mjs" ]]; then
    prepare_growth_score_pin_runtime
    node "$ROOT/scripts/caesthetic/publish-growth-score-control-plane.mjs" poll \
      --grainee "$ROOT" \
      --satellite "$SATELLITE"
  fi

  g_remote="$(remote_head "$GRAINEE_AUTHORITY" "$GRAINEE_AUTHORITY_REMOTE" "$(git -C "$ROOT" remote get-url origin)")"
  s_remote="$(remote_head "$SATELLITE_AUTHORITY" "$SATELLITE_AUTHORITY_REMOTE" "$SATELLITE_URL")"
  printf '%s %s\n' "$g_remote" "$s_remote" > "${STATE}.tmp"
  mv "${STATE}.tmp" "$STATE"
  echo "CAESTHETIC_REPO_SYNC_APPLIED grainee=${g_remote:0:12} satellite=${s_remote:0:12}"
}

export -f run_once remote_head prepare_growth_score_pin_runtime
export INSTALL_ROOT ROOT SATELLITE STATE SATELLITE_URL GRAINEE_AUTHORITY SATELLITE_AUTHORITY GRAINEE_AUTHORITY_REMOTE SATELLITE_AUTHORITY_REMOTE
exec flock -n "$LOCK" bash -c run_once
