#!/usr/bin/env bash
# VPS2402 cron wrapper — flock so overlapping ticks skip.
set -euo pipefail
install -d -m 755 /var/log/grainee /var/lib/caesthetic-social
host="$(hostname -s 2>/dev/null || hostname || true)"
ips="$(hostname -I 2>/dev/null || true)"
if [[ "$host" != "vps2402" && " $ips " != *" 185.216.214.28 "* ]]; then
  printf '%s\n' "{\"ok\":false,\"error\":\"forbidden_host:${host:-unknown}\"}" >> /var/log/grainee/caesthetic-social-poll.log
  exit 1
fi
cd /var/www/grainee-v2
set -a
[ -f /etc/evo/secrets.env ] && . /etc/evo/secrets.env
[ -f /etc/social-fleet/hooppy.env ] && . /etc/social-fleet/hooppy.env
[ -f /root/.cursor/secrets.env ] && . /root/.cursor/secrets.env
set +a
exec /usr/bin/flock -n /var/run/caesthetic-social-poll.lock \
  /usr/bin/node scripts/caesthetic/social-channel/poll.mjs \
  >> /var/log/grainee/caesthetic-social-poll.log 2>&1
