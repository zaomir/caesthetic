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

install -d -m 755 "$INSTALL_ROOT" "$SYSTEMD_ROOT" "$DATA_ROOT"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/sync_agents_bidirectional.py" \
  "$INSTALL_ROOT/sync_agents_bidirectional.py"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/continuous-sync-runner.sh" \
  "$INSTALL_ROOT/continuous-sync-runner.sh"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.service" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.service"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.timer" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.timer"

GRAINEE_ORIGIN="$(git -C "$LIVE_GRAINEE_ROOT" remote get-url origin)"
test -n "$GRAINEE_ORIGIN"
if [[ ! -d "$GRAINEE_ROOT/.git" ]]; then
  git clone --branch main --single-branch "$GRAINEE_ORIGIN" "$GRAINEE_ROOT"
else
  git -C "$GRAINEE_ROOT" remote set-url origin "$GRAINEE_ORIGIN"
fi
if [[ ! -d "$SATELLITE_ROOT/.git" ]]; then
  git clone --branch main --single-branch \
    "${CAESTHETIC_AGENTS_REPO_URL:-https://github.com/zaomir/caesthetic.git}" \
    "$SATELLITE_ROOT"
fi

install -d -m 755 /etc/caesthetic-repo-sync "$DATA_ROOT"
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
