#!/usr/bin/env bash
# VPS2402 recurring Outscraper discovery. Mon/Wed/Fri 12:00 UTC.
# One collector. Missed slots are not caught up with extra purchases.
set -euo pipefail
install -d -m 755 /var/log/grainee /var/lib/caesthetic-medspa
host="$(hostname -s 2>/dev/null || hostname || true)"
ips="$(hostname -I 2>/dev/null || true)"
if [[ "$host" != "vps2402" && " $ips " != *" 185.216.214.28 "* ]]; then
  printf '%s\n' "{\"ok\":false,\"error\":\"forbidden_host:${host:-unknown}\"}" >> /var/log/grainee/caesthetic-medspa-recurring.log
  exit 1
fi
cd /var/www/grainee-v2
exec /usr/bin/flock -n /var/run/caesthetic-medspa-recurring.lock \
  /usr/bin/python3 scripts/caesthetic/medspa-discovery/run.py run_discovery \
  >> /var/log/grainee/caesthetic-medspa-recurring.log 2>&1
