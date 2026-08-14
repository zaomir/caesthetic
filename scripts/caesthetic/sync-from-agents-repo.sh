#!/usr/bin/env bash
# Compat wrapper → bidirectional sync (DEC-829).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
echo "note: sync-from-agents-repo.sh runs bidirectional sync (DEC-829)" >&2
exec bash "$ROOT/scripts/caesthetic/sync-agents-bidirectional.sh" "$@"
