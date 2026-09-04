#!/usr/bin/env bash
# Install near-real-time DEC-829 sync on VPS2402 without GitHub Actions.
set -euo pipefail

SOURCE_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
INSTALL_ROOT="${CAESTHETIC_SYNC_INSTALL_ROOT:-/opt/caesthetic-repo-sync}"
LIVE_GRAINEE_ROOT="${CAESTHETIC_SYNC_SOURCE_GRAINEE_ROOT:-/var/www/grainee-v2}"
DATA_ROOT="${CAESTHETIC_SYNC_DATA_ROOT:-/var/lib/caesthetic-repo-sync}"
GRAINEE_ROOT="${GRAINEE_ROOT:-$DATA_ROOT/grainee}"
SATELLITE_ROOT="${CAESTHETIC_AGENTS_DIR:-$DATA_ROOT/satellite}"
SYSTEMD_ROOT="${CAESTHETIC_SYNC_SYSTEMD_ROOT:-/etc/systemd/system}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: run as root" >&2
  exit 1
fi
for command_name in git python3 flock systemctl timeout; do
  command -v "$command_name" >/dev/null || {
    echo "ERROR: missing required command: $command_name" >&2
    exit 1
  }
done
test -d "$LIVE_GRAINEE_ROOT/.git" || {
  echo "ERROR: missing production grainee checkout: $LIVE_GRAINEE_ROOT" >&2
  exit 1
}

# A previous interrupted bootstrap can leave the oneshot and its flock alive.
# Stop it before touching the isolated workers; their dirty/diverged state is
# preserved by prepare_isolated_clone below.
timeout 30s systemctl stop caesthetic-repo-sync.service 2>/dev/null || true
systemctl reset-failed caesthetic-repo-sync.service 2>/dev/null || true

install -d -m 755 "$INSTALL_ROOT" "$SYSTEMD_ROOT"
install -d -m 700 "$DATA_ROOT"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/sync_agents_bidirectional.py" \
  "$INSTALL_ROOT/sync_agents_bidirectional.py"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/expert_dental_mirror.py" \
  "$INSTALL_ROOT/expert_dental_mirror.py"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/continuous-sync-runner.sh" \
  "$INSTALL_ROOT/continuous-sync-runner.sh"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.service" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.service"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.timer" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.timer"

SATELLITE_LIVE_ROOT="${CAESTHETIC_SYNC_SOURCE_SATELLITE_ROOT:-/var/www/caesthetic}"
GRAINEE_ORIGIN="$(git -C "$LIVE_GRAINEE_ROOT" remote get-url origin)"
SATELLITE_ORIGIN="${CAESTHETIC_AGENTS_REPO_URL:-https://github.com/zaomir/caesthetic.git}"
SATELLITE_AUTHORITY_REMOTE="caesthetic-satellite"
test -n "$GRAINEE_ORIGIN"
test -d "$SATELLITE_LIVE_ROOT/.git" || {
  echo "ERROR: missing satellite checkout: $SATELLITE_LIVE_ROOT" >&2
  exit 1
}

verify_push_authority() {
  local source_repo="$1" remote="$2" label="$3" remote_sha
  remote_sha="$(timeout 20s env GIT_TERMINAL_PROMPT=0 GIT_SSH_COMMAND='ssh -o BatchMode=yes -o ConnectTimeout=10 -o ConnectionAttempts=1 -o StrictHostKeyChecking=accept-new' \
    git -C "$source_repo" ls-remote "$remote" refs/heads/main | awk 'NR == 1 {print $1}')"
  [[ "$remote_sha" =~ ^[0-9a-f]{40}$ ]] || {
    echo "ERROR: cannot resolve ${label} main through existing push authority" >&2
    return 1
  }
  timeout 20s git -C "$source_repo" fetch --no-tags "$remote" "$remote_sha" -q
  if ! timeout 20s env GIT_TERMINAL_PROMPT=0 GIT_SSH_COMMAND='ssh -o BatchMode=yes -o ConnectTimeout=10 -o ConnectionAttempts=1 -o StrictHostKeyChecking=accept-new' \
    git -C "$source_repo" push --dry-run "$remote" "${remote_sha}:main" >/dev/null 2>&1; then
    echo "ERROR: existing ${label} checkout has no non-interactive push authority" >&2
    return 1
  fi
}

prepare_isolated_clone() {
  local target_repo="$1" remote_url="$2" authority_repo="$3" authority_remote="$4"
  local quarantine quarantine_reason="" authority_ref="refs/remotes/${authority_remote}/main"
  if [[ -d "$target_repo/.git" ]]; then
    if [[ -n "$(git -C "$target_repo" status --porcelain)" ]]; then
      quarantine_reason="dirty"
    else
      timeout 20s git -C "$authority_repo" fetch "$authority_remote" main -q
      git -C "$target_repo" fetch --no-tags "$authority_repo" \
        "+${authority_ref}:refs/remotes/origin/main" -q
      if ! git -C "$target_repo" merge-base --is-ancestor HEAD origin/main && \
         ! git -C "$target_repo" merge-base --is-ancestor origin/main HEAD; then
        quarantine_reason="diverged"
      fi
    fi
  fi
  if [[ -n "$quarantine_reason" ]]; then
    quarantine="${target_repo}.quarantine-$(date -u +%Y%m%dT%H%M%SZ)-$$"
    mv "$target_repo" "$quarantine"
    echo "CAESTHETIC_REPO_SYNC_QUARANTINED reason=$quarantine_reason path=$quarantine" >&2
  fi
  if [[ ! -d "$target_repo/.git" ]]; then
    if [[ -d "$target_repo" ]]; then
      [[ -z "$(find "$target_repo" -mindepth 1 -maxdepth 1 -print -quit)" ]] || {
        echo "ERROR: non-empty incomplete sync checkout: $target_repo" >&2
        exit 1
      }
      rmdir "$target_repo"
    fi
    git clone --shared --no-checkout "$authority_repo" "$target_repo"
    git -C "$target_repo" sparse-checkout init --cone
    git -C "$target_repo" sparse-checkout set \
      site-caesthetic docs/projects/caesthetic docs/caesthetic \
      docs/audits/caesthetic scripts/caesthetic tests/caesthetic docs/ssot \
      agents/manifests deploy/systemd deploy/nginx vds/cron \
      infra/cloudflare scripts/agent-api
    git -C "$authority_repo" fetch "$authority_remote" main -q
    git -C "$target_repo" fetch --no-tags "$authority_repo" \
      "+${authority_ref}:refs/remotes/origin/main" -q
    git -C "$target_repo" checkout -B main refs/remotes/origin/main
  fi
  git -C "$target_repo" remote set-url origin "$remote_url"
}

case "$GRAINEE_ORIGIN" in
  */grainee-v2.git) SATELLITE_AUTHORITY_URL="${GRAINEE_ORIGIN%/grainee-v2.git}/caesthetic.git" ;;
  */grainee-v2) SATELLITE_AUTHORITY_URL="${GRAINEE_ORIGIN%/grainee-v2}/caesthetic.git" ;;
  *)
    echo "ERROR: cannot derive allowlisted satellite authority URL from canonical origin" >&2
    exit 1
    ;;
esac
if git -C "$LIVE_GRAINEE_ROOT" remote get-url "$SATELLITE_AUTHORITY_REMOTE" >/dev/null 2>&1; then
  git -C "$LIVE_GRAINEE_ROOT" remote set-url "$SATELLITE_AUTHORITY_REMOTE" "$SATELLITE_AUTHORITY_URL"
else
  git -C "$LIVE_GRAINEE_ROOT" remote add "$SATELLITE_AUTHORITY_REMOTE" "$SATELLITE_AUTHORITY_URL"
fi

verify_push_authority "$LIVE_GRAINEE_ROOT" "origin" "grainee"
verify_push_authority "$LIVE_GRAINEE_ROOT" "$SATELLITE_AUTHORITY_REMOTE" "satellite"
prepare_isolated_clone "$GRAINEE_ROOT" "$GRAINEE_ORIGIN" "$LIVE_GRAINEE_ROOT" "origin"
prepare_isolated_clone "$SATELLITE_ROOT" "$SATELLITE_ORIGIN" \
  "$LIVE_GRAINEE_ROOT" "$SATELLITE_AUTHORITY_REMOTE"

install -d -m 755 /etc/caesthetic-repo-sync
{
  printf 'GRAINEE_ROOT=%q\n' "$GRAINEE_ROOT"
  printf 'CAESTHETIC_AGENTS_DIR=%q\n' "$SATELLITE_ROOT"
  printf 'CAESTHETIC_SYNC_GRAINEE_AUTHORITY_ROOT=%q\n' "$LIVE_GRAINEE_ROOT"
  printf 'CAESTHETIC_SYNC_GRAINEE_AUTHORITY_REMOTE=%q\n' "origin"
  printf 'CAESTHETIC_SYNC_SATELLITE_AUTHORITY_ROOT=%q\n' "$LIVE_GRAINEE_ROOT"
  printf 'CAESTHETIC_SYNC_SATELLITE_AUTHORITY_REMOTE=%q\n' "$SATELLITE_AUTHORITY_REMOTE"
  printf 'CAESTHETIC_SYNC_LOCK=%q\n' "/run/lock/caesthetic-repo-sync.lock"
  printf 'CAESTHETIC_SYNC_REMOTE_STATE=%q\n' "$DATA_ROOT/remote-heads"
  printf 'CAESTHETIC_PUBLISH_SECRETS_FILE=%q\n' "${CAESTHETIC_PUBLISH_SECRETS_FILE:-/etc/evo/secrets.env}"
} > /etc/caesthetic-repo-sync/environment
chmod 600 /etc/caesthetic-repo-sync/environment

# Force one reconciliation with the newly installed code. The state contains
# only remote SHAs and is safe to recreate.
rm -f "$DATA_ROOT/remote-heads" "$DATA_ROOT/remote-heads.tmp"

# The old 10-minute cron and the timer must never run together.
rm -f /etc/cron.d/caesthetic-agents-sync
systemctl daemon-reload
systemctl enable --now caesthetic-repo-sync.timer
# Do not make the bootstrap worker share the oneshot lifecycle. The timer owns
# reconciliation, while each publication request/result is the durable proof.
systemctl start --no-block caesthetic-repo-sync.service

systemctl is-enabled --quiet caesthetic-repo-sync.timer
systemctl is-active --quiet caesthetic-repo-sync.timer
systemctl --no-pager --full status caesthetic-repo-sync.timer | sed -n '1,12p'
systemctl --no-pager --full status caesthetic-repo-sync.service | sed -n '1,18p' || true
echo "CAESTHETIC_REPO_SYNC_INSTALL_PASS interval=15s remote_head_gate=enabled github_actions=disabled"
