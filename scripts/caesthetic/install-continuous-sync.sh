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
for command_name in git python3 flock systemctl; do
  command -v "$command_name" >/dev/null || {
    echo "ERROR: missing required command: $command_name" >&2
    exit 1
  }
done
test -d "$LIVE_GRAINEE_ROOT/.git" || {
  echo "ERROR: missing production grainee checkout: $LIVE_GRAINEE_ROOT" >&2
  exit 1
}

install -d -m 755 "$INSTALL_ROOT" "$SYSTEMD_ROOT"
install -d -m 700 "$DATA_ROOT"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/sync_agents_bidirectional.py" \
  "$INSTALL_ROOT/sync_agents_bidirectional.py"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/continuous-sync-runner.sh" \
  "$INSTALL_ROOT/continuous-sync-runner.sh"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.service" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.service"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.timer" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.timer"

SATELLITE_LIVE_ROOT="${CAESTHETIC_SYNC_SOURCE_SATELLITE_ROOT:-/var/www/caesthetic}"
GRAINEE_ORIGIN="$(git -C "$LIVE_GRAINEE_ROOT" remote get-url origin)"
SATELLITE_ORIGIN="${CAESTHETIC_AGENTS_REPO_URL:-https://github.com/zaomir/caesthetic.git}"
test -n "$GRAINEE_ORIGIN"
test -d "$SATELLITE_LIVE_ROOT/.git" || {
  echo "ERROR: missing satellite checkout: $SATELLITE_LIVE_ROOT" >&2
  exit 1
}

copy_git_auth_config() {
  local source_repo="$1" target_repo="$2" key value line
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    key="${line%% *}"
    value="${line#* }"
    git -C "$target_repo" config --local "$key" "$value"
  done < <(
    git -C "$source_repo" config --local --get-regexp \
      '^(credential\.|http\..*\.extraheader$|core\.sshcommand$|url\..*\.insteadof$)' \
      2>/dev/null || true
  )
  chmod 600 "$target_repo/.git/config"
}

prepare_isolated_clone() {
  local source_repo="$1" target_repo="$2" remote_url="$3"
  if [[ ! -d "$target_repo/.git" ]]; then
    if [[ -d "$target_repo" ]]; then
      [[ -z "$(find "$target_repo" -mindepth 1 -maxdepth 1 -print -quit)" ]] || {
        echo "ERROR: non-empty incomplete sync checkout: $target_repo" >&2
        exit 1
      }
      rmdir "$target_repo"
    fi
    git clone --shared --no-checkout "$source_repo" "$target_repo"
    git -C "$target_repo" sparse-checkout init --cone
    git -C "$target_repo" sparse-checkout set \
      site-caesthetic docs/projects/caesthetic docs/caesthetic \
      docs/audits/caesthetic scripts/caesthetic tests/caesthetic docs/ssot \
      agents/manifests deploy/systemd
    git -C "$target_repo" checkout main
  fi
  git -C "$target_repo" remote set-url origin "$remote_url"
  copy_git_auth_config "$source_repo" "$target_repo"
}

prepare_isolated_clone "$LIVE_GRAINEE_ROOT" "$GRAINEE_ROOT" "$GRAINEE_ORIGIN"
prepare_isolated_clone "$SATELLITE_LIVE_ROOT" "$SATELLITE_ROOT" "$SATELLITE_ORIGIN"

install -d -m 755 /etc/caesthetic-repo-sync
{
  printf 'GRAINEE_ROOT=%q\n' "$GRAINEE_ROOT"
  printf 'CAESTHETIC_AGENTS_DIR=%q\n' "$SATELLITE_ROOT"
  printf 'CAESTHETIC_SYNC_LOCK=%q\n' "/run/lock/caesthetic-repo-sync.lock"
  printf 'CAESTHETIC_SYNC_REMOTE_STATE=%q\n' "$DATA_ROOT/remote-heads"
} > /etc/caesthetic-repo-sync/environment
chmod 600 /etc/caesthetic-repo-sync/environment

# Force one reconciliation with the newly installed code. The state contains
# only remote SHAs and is safe to recreate.
rm -f "$DATA_ROOT/remote-heads" "$DATA_ROOT/remote-heads.tmp"

# The old 10-minute cron and the timer must never run together.
rm -f /etc/cron.d/caesthetic-agents-sync
systemctl daemon-reload
systemctl enable --now caesthetic-repo-sync.timer
if ! systemctl start caesthetic-repo-sync.service; then
  systemctl --no-pager --full status caesthetic-repo-sync.service || true
  journalctl -u caesthetic-repo-sync.service -n 80 --no-pager || true
  exit 1
fi

systemctl is-enabled --quiet caesthetic-repo-sync.timer
systemctl is-active --quiet caesthetic-repo-sync.timer
systemctl --no-pager --full status caesthetic-repo-sync.timer | sed -n '1,12p'
systemctl --no-pager --full status caesthetic-repo-sync.service | sed -n '1,18p' || true
echo "CAESTHETIC_REPO_SYNC_INSTALL_PASS interval=15s remote_head_gate=enabled github_actions=disabled"
