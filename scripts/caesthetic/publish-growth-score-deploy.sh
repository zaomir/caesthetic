#!/usr/bin/env bash
# Fixed, no-argument CAESTHETIC deploy used only by the Growth Score bridge.
set -euo pipefail

CANONICAL_ROOT="${REPO_ROOT:-/var/lib/caesthetic-repo-sync/grainee}"
EXPECTED_SHA="${1:-}"
SECRETS_FILE="${CAESTHETIC_PUBLISH_SECRETS_FILE:-/etc/evo/secrets.env}"

[[ "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "invalid expected SHA" >&2; exit 2; }
git -C "$CANONICAL_ROOT" cat-file -e "${EXPECTED_SHA}^{commit}" || { echo "canonical imported SHA is missing" >&2; exit 3; }
test -r "$SECRETS_FILE" || { echo "missing root-owned deploy environment" >&2; exit 4; }
[[ "$(git -C "$CANONICAL_ROOT" rev-parse HEAD)" == "$EXPECTED_SHA" ]] || {
  echo "canonical checkout is not pinned to imported SHA" >&2
  exit 7
}
[[ -z "$(git -C "$CANONICAL_ROOT" status --porcelain)" ]] || {
  echo "canonical checkout is dirty before deploy" >&2
  exit 8
}
ROOT="$CANONICAL_ROOT"

set -a
# shellcheck disable=SC1090
source "$SECRETS_FILE"
set +a

test -n "${CLOUDFLARE_ACCOUNT_ID:-}" || { echo "CLOUDFLARE_ACCOUNT_ID missing" >&2; exit 5; }
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -z "${CLOUDFLARE_API_TOKEN2:-}" && -z "${CLOUDFLARE_API_TOKEN_BOTOTOX:-}" && -z "${CF_API_TOKEN:-}" ]]; then
  echo "Cloudflare Workers token missing" >&2
  exit 6
fi

CAESTHETIC_SKIP_GIT_SYNC=1 CAESTHETIC_SKIP_WORKER_INSTALL=1 CAESTHETIC_SKIP_NGINX_SYNC=1 \
  REPO_ROOT="$ROOT" bash "$ROOT/scripts/deploy-caesthetic.sh"
CAESTHETIC_KEEP_SCORE_ACCESS_CONFIG=1 bash "$ROOT/scripts/cf-caesthetic-cutover.sh" --skip-routes
bash "$ROOT/scripts/cf-caesthetic-cutover-smoke.sh"
bash "$ROOT/scripts/caesthetic-growth-score-production-smoke.sh"

echo "CAESTHETIC_GROWTH_SCORE_PUBLISH_DEPLOY_PASS sha=${EXPECTED_SHA}"
