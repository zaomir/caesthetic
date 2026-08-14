#!/usr/bin/env bash
# Bidirectional sync: zaomir/caesthetic ↔ grainee-v2 (DEC-829)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec python3 "$ROOT/scripts/caesthetic/sync_agents_bidirectional.py" "$@"
