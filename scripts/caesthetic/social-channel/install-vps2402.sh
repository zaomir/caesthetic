#!/usr/bin/env bash
# Install CAESTHETIC social channel poller on VPS2402 only.
set -euo pipefail
ROOT="${REPO_ROOT:-/var/www/grainee-v2}"
HOST="$(hostname -s 2>/dev/null || hostname || true)"
IPS="$(hostname -I 2>/dev/null || true)"
if [[ "$HOST" != "vps2402" && " $IPS " != *" 185.216.214.28 "* ]]; then
  echo "[cae-social] FATAL: install only on VPS2402 (got host=${HOST})" >&2
  exit 1
fi
install -d -m 700 /var/lib/caesthetic-social/intents /var/lib/caesthetic-social/inbox /var/lib/caesthetic-social/idempotency
install -d -m 755 /var/log/grainee
cp "$ROOT/vds/cron/caesthetic-social-crontab.txt" /etc/cron.d/grainee-caesthetic-social
chmod 644 /etc/cron.d/grainee-caesthetic-social
chmod 755 "$ROOT/scripts/caesthetic/social-channel/poll.sh"
echo "[cae-social] installed cron /etc/cron.d/grainee-caesthetic-social on ${HOST}"
