#!/usr/bin/env bash
# VPS2402 cron wrapper — flock so overlapping ticks skip.
# DEC-836: refuse to run on legacy .121 / vdska.
set -euo pipefail
install -d -m 755 /var/log/grainee
host="$(hostname -s 2>/dev/null || hostname || true)"
ips="$(hostname -I 2>/dev/null || true)"
if [[ "$host" != "vps2402" && " $ips " != *" 185.216.214.28 "* ]]; then
  printf '%s\n' "{\"ok\":false,\"error\":\"forbidden_host:${host:-unknown}\"}" >> /var/log/grainee/caesthetic-assets-poll.log
  exit 1
fi
cd /var/www/grainee-v2
exec /usr/bin/flock -n /var/run/caesthetic-assets-poll.lock \
  /usr/bin/node scripts/caesthetic/asset-worker/poll.mjs \
  >> /var/log/grainee/caesthetic-assets-poll.log 2>&1
