#!/usr/bin/env bash
# Exit 0 when Instagram for profile 833304152 sits under a platform stop (circuit), so both CAESTHETIC IG timers can
# skip without opening a browser and without turning into a red "failed service" every weekday.
#
# Source of truth: the readable circuit mirror written by scripts/ops/simon-outreach/circuit.mjs
# (`circuit.mjs set 833304152 <ISO> --platform instagram`). Since 2026-10-29 that stop is open until 2027-01-01:
# Instagram suspended @valerie.petra.uk and the account cannot be read or written until its owner restores it
# (docs/ops/simon-outreach/INCIDENT_2026-10-29_valerie_instagram_suspended.md). A bare `<profile>` stop closes
# LinkedIn only, so it does not silence Instagram.
#
# Usage: bash scripts/caesthetic/cae_ig_platform_closed.sh && echo closed
set -uo pipefail

python3 - "${SIMON_CIRCUIT_MIRROR:-/var/lib/simon-outreach-public/profile-circuits.json}" "${1:-833304152}" <<'PY'
import json
import sys
from datetime import datetime, timezone

path, profile = sys.argv[1], sys.argv[2]
try:
    rows = json.load(open(path, encoding="utf-8"))
except (OSError, ValueError):
    sys.exit(1)  # cannot tell: do not skip, the runner itself fails closed on the account
until = rows.get(f"{profile}:instagram")
try:
    when = datetime.fromisoformat(str(until).replace("Z", "+00:00"))
except (TypeError, ValueError):
    sys.exit(1)
sys.exit(0 if when > datetime.now(timezone.utc) else 1)
PY
