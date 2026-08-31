#!/usr/bin/env bash
# Install near-real-time DEC-829 sync on VPS2402 without GitHub Actions.
set -euo pipefail

SOURCE_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
INSTALL_ROOT="${CAESTHETIC_SYNC_INSTALL_ROOT:-/opt/caesthetic-repo-sync}"
GRAINEE_ROOT="${GRAINEE_ROOT:-/var/www/grainee-v2}"
SATELLITE_ROOT="${CAESTHETIC_AGENTS_DIR:-/var/www/caesthetic}"
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
test -d "$GRAINEE_ROOT/.git" || {
  echo "ERROR: missing grainee checkout: $GRAINEE_ROOT" >&2
  exit 1
}

install -d -m 755 "$INSTALL_ROOT" "$SYSTEMD_ROOT" "$SATELLITE_ROOT"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/sync_agents_bidirectional.py" \
  "$INSTALL_ROOT/sync_agents_bidirectional.py"
install -m 755 "$SOURCE_ROOT/scripts/caesthetic/continuous-sync-runner.sh" \
  "$INSTALL_ROOT/continuous-sync-runner.sh"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.service" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.service"
install -m 644 "$SOURCE_ROOT/deploy/systemd/caesthetic-repo-sync.timer" \
  "$SYSTEMD_ROOT/caesthetic-repo-sync.timer"

install -d -m 755 /etc/caesthetic-repo-sync
{
  printf 'GRAINEE_ROOT=%q\n' "$GRAINEE_ROOT"
  printf 'CAESTHETIC_AGENTS_DIR=%q\n' "$SATELLITE_ROOT"
  printf 'CAESTHETIC_SYNC_LOCK=%q\n' "/run/lock/caesthetic-repo-sync.lock"
} > /etc/caesthetic-repo-sync/environment
chmod 600 /etc/caesthetic-repo-sync/environment

# The old 10-minute cron and the timer must never run together.
rm -f /etc/cron.d/caesthetic-agents-sync
systemctl daemon-reload
systemctl enable --now caesthetic-repo-sync.timer
systemctl start caesthetic-repo-sync.service

systemctl is-enabled --quiet caesthetic-repo-sync.timer
systemctl is-active --quiet caesthetic-repo-sync.timer
systemctl --no-pager --full status caesthetic-repo-sync.timer | sed -n '1,12p'
systemctl --no-pager --full status caesthetic-repo-sync.service | sed -n '1,18p' || true
echo "CAESTHETIC_REPO_SYNC_INSTALL_PASS interval=15s github_actions=disabled"
