#!/usr/bin/env bash
# Install CAESTHETIC Asset Worker poller on VPS2402 only (DEC-836).
# Does not copy rclone credentials; they must already exist on this host.
set -euo pipefail
ROOT="${REPO_ROOT:-/var/www/grainee-v2}"
HOST="$(hostname -s 2>/dev/null || hostname || true)"
IPS="$(hostname -I 2>/dev/null || true)"
if [[ "$HOST" != "vps2402" && " $IPS " != *" 185.216.214.28 "* ]]; then
  echo "[cae-assets] FATAL: install only on VPS2402 (got host=${HOST})" >&2
  exit 1
fi
install -d -m 755 /opt/caesthetic-assets/{input,processing,output,generated,configs,status} /var/log/grainee
cp "$ROOT/vds/cron/caesthetic-assets-crontab.txt" /etc/cron.d/grainee-caesthetic-assets
chmod 644 /etc/cron.d/grainee-caesthetic-assets
chmod 755 "$ROOT/scripts/caesthetic/asset-worker/poll.sh"
echo "[cae-assets] installed cron /etc/cron.d/grainee-caesthetic-assets on ${HOST}"

# The CAESTHETIC deploy is the allowlisted server bootstrap path. Keep the
# repository mirror timer installed here too; it uses no GitHub Actions.
bash "$ROOT/scripts/caesthetic/install-continuous-sync.sh"
