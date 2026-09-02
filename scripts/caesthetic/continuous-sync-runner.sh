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

  # Publication is a separate fail-closed path. The ordinary DEC-829 mirror
  # never copies a report into runtime; this processor imports only pinned,
  # approved packages and deploys the resulting canonical grainee commit.
  if [[ -f "$ROOT/scripts/caesthetic/publish-growth-score-control-plane.mjs" ]]; then
    node "$ROOT/scripts/caesthetic/publish-growth-score-control-plane.mjs" poll \
      --grainee "$ROOT" \
      --satellite "$SATELLITE"
  fi

  # Capture post-push heads. A temporary file prevents a partial state write.
  g_remote="$(remote_head "$GRAINEE_AUTHORITY" "$GRAINEE_AUTHORITY_REMOTE" "$(git -C "$ROOT" remote get-url origin)")"
  s_remote="$(remote_head "$SATELLITE_AUTHORITY" "$SATELLITE_AUTHORITY_REMOTE" "$SATELLITE_URL")"
  printf '%s %s\n' "$g_remote" "$s_remote" > "${STATE}.tmp"
  mv "${STATE}.tmp" "$STATE"
  echo "CAESTHETIC_REPO_SYNC_APPLIED grainee=${g_remote:0:12} satellite=${s_remote:0:12}"
}

export -f run_once remote_head
export INSTALL_ROOT ROOT SATELLITE STATE SATELLITE_URL GRAINEE_AUTHORITY SATELLITE_AUTHORITY GRAINEE_AUTHORITY_REMOTE SATELLITE_AUTHORITY_REMOTE
exec flock -n "$LOCK" bash -c run_once
