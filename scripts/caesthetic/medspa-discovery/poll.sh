#!/usr/bin/env bash
# VPS2402 flock poller for type=caesthetic_medspa Agent API requests.
set -euo pipefail
install -d -m 755 /var/log/grainee /var/lib/caesthetic-medspa
host="$(hostname -s 2>/dev/null || hostname || true)"
ips="$(hostname -I 2>/dev/null || true)"
if [[ "$host" != "vps2402" && " $ips " != *" 185.216.214.28 "* ]]; then
  printf '%s\n' "{\"ok\":false,\"error\":\"forbidden_host:${host:-unknown}\"}" >> /var/log/grainee/caesthetic-medspa-poll.log
  exit 1
fi
cd /var/www/grainee-v2
exec /usr/bin/flock -n /var/run/caesthetic-medspa-poll.lock \
  /usr/bin/python3 scripts/caesthetic/medspa-discovery/poll.py \
  >> /var/log/grainee/caesthetic-medspa-poll.log 2>&1
