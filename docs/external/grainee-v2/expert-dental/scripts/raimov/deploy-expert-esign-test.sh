#!/usr/bin/env bash
# Deploy an isolated, synthetic-data-only Expert E-sign test runtime on VPS2402.
# Public route: /esign/. Runtime, database and evidence storage are isolated from production.
set -euo pipefail

ORIGIN_HOST="vps2402"
if [[ "$(hostname -s)" != "$ORIGIN_HOST" ]]; then
  echo "Refusing to deploy outside ${ORIGIN_HOST}; current host: $(hostname -s)" >&2
  exit 2
fi

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE="${REPO}/apps/expert-esign"
APP_ROOT="/opt/expert-esign-test"
DATA_ROOT="/var/lib/expert-esign-test"
BACKUP_ROOT="/var/backups/expert-esign-test"
CONFIG_DIR="/etc/raimov"
ENV_FILE="${CONFIG_DIR}/expert-esign-test.env"
BOOTSTRAP_FILE="${CONFIG_DIR}/expert-esign-test.bootstrap"
PROJECT="expert-esign-test"
TEST_OVERRIDE="${APP_ROOT}/docker-compose.test.yml"
SOURCE_SHA="$(git -C "$REPO" rev-parse HEAD)"
export ENV_FILE

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
rand_urlsafe() { openssl rand -base64 "$1" | tr -d '\n' | tr '/+' '_-'; }

say "1/9 preflight"
for command in docker openssl rsync nginx curl python3; do command -v "$command" >/dev/null; done
docker compose version >/dev/null
test -f "$SOURCE/docker-compose.runtime.yml"
test -f "$SOURCE/Dockerfile.runtime"
test -f "$SOURCE/generated/legal-templates.json"
install -d -m 0750 "$CONFIG_DIR" "$APP_ROOT" "$DATA_ROOT" "$BACKUP_ROOT"
install -d -m 0700 "$DATA_ROOT/postgres" "$DATA_ROOT/minio"

say "2/9 create or repair isolated test configuration"
if [[ ! -f "$ENV_FILE" ]]; then
  POSTGRES_PASSWORD="$(rand_urlsafe 36)"
  MINIO_ROOT_USER="expert-esign-test-$(openssl rand -hex 5)"
  MINIO_ROOT_PASSWORD="$(rand_urlsafe 42)"
  JWT_SECRET="$(rand_urlsafe 48)"
  WAHA_API_KEY="$(rand_urlsafe 42)"
  WAHA_DASHBOARD_PASSWORD="$(rand_urlsafe 30)"
  CRM_API_KEY="$(rand_urlsafe 42)"
  BOOTSTRAP_ADMIN_PASSWORD="$(rand_urlsafe 24)"
  cat >"$ENV_FILE" <<EOF
NODE_ENV=test
EXPERT_ESIGN_MODE=test
PORT=8787
HOST_PORT=8788
BASE_PATH=/esign
PUBLIC_ORIGIN=https://clinic.raimovdental.com/esign
TRUST_PROXY=1
COOKIE_SECURE=true
JWT_SECRET=${JWT_SECRET}
JWT_TTL_MINUTES=240
BOOTSTRAP_ADMIN_USER=esign-test-admin
BOOTSTRAP_ADMIN_PASSWORD=${BOOTSTRAP_ADMIN_PASSWORD}
BOOTSTRAP_ADMIN_NAME='Expert Dental Test Compliance'
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DB_SSL=false
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
S3_BUCKET=expert-esign-test-evidence
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
DATA_ROOT=${DATA_ROOT}
DEPLOY_SHA=${SOURCE_SHA}
RETENTION_CLINICAL_DAYS=9125
RETENTION_CONTRACT_DAYS=3650
RETENTION_MARKETING_DAYS=1095
RETENTION_SECURITY_LOG_DAYS=1825
AUTOMATIC_DELETION_ENABLED=false
ALLOW_COUNSEL_GATED_TEMPLATES=true
WAHA_ENABLED=false
WAHA_API_KEY=${WAHA_API_KEY}
WAHA_DASHBOARD_PASSWORD=${WAHA_DASHBOARD_PASSWORD}
WAHA_SESSION=test-disabled
WAHA_AUTO_SEND_SIGNED_COPY=false
TSA_ENABLED=false
TSA_REQUIRED=false
TSA_PROVIDER_NAME='DigiCert RFC3161 test adapter'
TSA_URL=http://timestamp.digicert.com
TSA_CA_FILE=
TSA_TIMEOUT_MS=20000
CRM_API_KEY=${CRM_API_KEY}
MOCK_SIGNATURE_WEBHOOK_SECRET=$(rand_urlsafe 42)
ZOHO_SIGN_ENABLED=false
DOCUSIGN_ENABLED=false
CRM_CALLBACK_URL=
CRM_CALLBACK_API_KEY=
SIGNING_SESSION_TTL_MINUTES=15
MAX_SIGNATURE_POINTS=25000
MAX_JSON_BODY_MB=8
EVIDENCE_EXPORT_TTL_MINUTES=10
EOF
  cat >"$BOOTSTRAP_FILE" <<EOF
Created: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Mode: TEST / SYNTHETIC DATA ONLY
URL: https://clinic.raimovdental.com/esign/
Login: esign-test-admin
One-time bootstrap password: ${BOOTSTRAP_ADMIN_PASSWORD}

Only patients whose names begin with ТЕСТ, ДЕМО, TEST or DEMO are accepted.
WhatsApp delivery and CRM callbacks are disabled. Do not place real patient data here.
Rotate the bootstrap credential after named test users are created.
EOF
fi

# Repair the first test-deploy environment if it was created before shell-safe values were added.
python3 - "$ENV_FILE" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
lines = p.read_text().splitlines()
values = {
    'NODE_ENV': 'test',
    'EXPERT_ESIGN_MODE': 'test',
    'HOST_PORT': '8788',
    'BOOTSTRAP_ADMIN_NAME': "'Expert Dental Test Compliance'",
    'ALLOW_COUNSEL_GATED_TEMPLATES': 'true',
    'WAHA_ENABLED': 'false',
    'WAHA_AUTO_SEND_SIGNED_COPY': 'false',
    'TSA_ENABLED': 'false',
    'TSA_PROVIDER_NAME': "'DigiCert RFC3161 test adapter'",
    'AUTOMATIC_DELETION_ENABLED': 'false',
}
seen = set()
out = []
for line in lines:
    key = line.split('=', 1)[0] if '=' in line else None
    if key in values:
        out.append(f'{key}={values[key]}')
        seen.add(key)
    else:
        out.append(line)
for key, value in values.items():
    if key not in seen:
        out.append(f'{key}={value}')
p.write_text('\n'.join(out) + '\n')
PY
if ! grep -q '^WAHA_DASHBOARD_PASSWORD=' "$ENV_FILE"; then
  printf 'WAHA_DASHBOARD_PASSWORD=%s\n' "$(rand_urlsafe 30)" >>"$ENV_FILE"
fi
if grep -q '^DEPLOY_SHA=' "$ENV_FILE"; then
  sed -i "s/^DEPLOY_SHA=.*/DEPLOY_SHA=${SOURCE_SHA}/" "$ENV_FILE"
else
  printf 'DEPLOY_SHA=%s\n' "$SOURCE_SHA" >>"$ENV_FILE"
fi
chmod 0600 "$ENV_FILE"
chown root:root "$ENV_FILE"
if [[ -f "$BOOTSTRAP_FILE" ]]; then chmod 0600 "$BOOTSTRAP_FILE"; chown root:root "$BOOTSTRAP_FILE"; fi

say "3/9 publish application source"
rsync -a --delete \
  --exclude '.env' --exclude 'node_modules' --exclude 'server.prod.mjs' --exclude 'server.runtime.mjs' \
  "$SOURCE/" "$APP_ROOT/"
chown -R root:root "$APP_ROOT"
find "$APP_ROOT" -type d -exec chmod 0755 {} +
find "$APP_ROOT" -type f -exec chmod 0644 {} +

python3 - "$APP_ROOT/public/index.html" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
text = p.read_text()
banner = '<div role="status" style="position:sticky;top:0;z-index:9999;padding:10px 16px;background:#7a2418;color:white;text-align:center;font:700 14px/1.3 system-ui">ТЕСТОВЫЙ РЕЖИМ · ТОЛЬКО СИНТЕТИЧЕСКИЕ ДАННЫЕ · НЕ ДЛЯ ЛЕЧЕНИЯ</div>'
if banner not in text:
    text = text.replace('<body>', '<body>' + banner, 1)
text = text.replace('<title>Expert Dental · Электронные документы</title>', '<title>TEST · Expert Dental · Электронные документы</title>')
p.write_text(text)
PY

cat >"$TEST_OVERRIDE" <<'YAML'
services:
  waha:
    profiles: ["waha-disabled-in-test"]
YAML

COMPOSE=(docker compose -p "$PROJECT" --env-file "$ENV_FILE" -f "$APP_ROOT/docker-compose.runtime.yml" -f "$TEST_OVERRIDE")

say "4/9 build and start isolated test stack"
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
export DEPLOY_SHA="$SOURCE_SHA"
"${COMPOSE[@]}" config >/tmp/expert-esign-test-compose.yml
"${COMPOSE[@]}" up -d --build --remove-orphans

say "5/9 wait for local health"
healthy=false
for _ in $(seq 1 75); do
  if curl -fsS --max-time 5 http://127.0.0.1:8788/healthz >/tmp/expert-esign-test-health.json; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  "${COMPOSE[@]}" ps >&2
  "${COMPOSE[@]}" logs --tail=250 api >&2 || true
  exit 1
fi
python3 - <<'PY'
import json
h=json.load(open('/tmp/expert-esign-test-health.json'))
assert h.get('ok') is True, h
assert h.get('immutableStorage') is True, h
assert h.get('mode') == 'test', h
assert h.get('applicationMode') == 'test', h
assert h.get('testMode') is True, h
assert h.get('templatesMayBeCounselGated') is True, h
assert h.get('outboundDeliveryEnabled') is False, h
assert h.get('deployedSha'), h
providers={p['name']:p for p in h.get('signatureProviders', [])}
assert providers.get('mock', {}).get('enabled') is True, providers
assert providers.get('zoho-sign', {}).get('enabled') is False, providers
assert providers.get('docusign', {}).get('enabled') is False, providers
assert h.get('tundukIntegration') == 'DEFERRED_INTEGRATION_GATE', h
print(json.dumps(h, ensure_ascii=False))
PY

say "6/9 authenticated application smoke"
LOGIN_JSON="$(python3 - <<'PY'
import json, os
print(json.dumps({'username': os.environ['BOOTSTRAP_ADMIN_USER'], 'password': os.environ['BOOTSTRAP_ADMIN_PASSWORD']}))
PY
)"
curl -fsS --max-time 15 -c /tmp/expert-esign-test.cookies \
  -H 'content-type: application/json' \
  --data "$LOGIN_JSON" \
  http://127.0.0.1:8788/esign/api/auth/login >/tmp/expert-esign-test-login.json
curl -fsS --max-time 15 -b /tmp/expert-esign-test.cookies \
  http://127.0.0.1:8788/esign/api/templates >/tmp/expert-esign-test-templates.json
python3 - <<'PY'
import json
p=json.load(open('/tmp/expert-esign-test-templates.json'))
assert p.get('allowCounselGated') is True, p
items=p.get('templates') or []
assert len(items) == 19, len(items)
assert all(x.get('status') == 'NOT_EFFECTIVE' for x in items), items
print({'templates': len(items), 'status': 'NOT_EFFECTIVE'})
PY
rm -f /tmp/expert-esign-test.cookies /tmp/expert-esign-test-login.json

say "7/9 install nginx test route"
SNIPPET="/etc/nginx/snippets/expert-esign-location.conf"
cat >"$SNIPPET" <<'EOF'
# Expert Dental electronic signing TEST runtime — managed by deploy-expert-esign-test.sh
location = /esign { return 308 /esign/; }
location = /esign/healthz {
    proxy_pass http://127.0.0.1:8788/healthz;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    add_header Cache-Control "no-store" always;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
    add_header X-Expert-Esign-Mode "test" always;
}
location ^~ /esign/ {
    proxy_pass http://127.0.0.1:8788/esign/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
    client_max_body_size 10m;
    add_header Cache-Control "no-store" always;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
    add_header X-Expert-Esign-Mode "test" always;
}
EOF
chmod 0644 "$SNIPPET"

NGINX_CONF="/etc/nginx/sites-available/clinic.raimovdental.com.origin.conf"
if [[ ! -f "$NGINX_CONF" ]]; then
  NGINX_CONF="$(grep -RIl --include='*.conf' 'server_name[[:space:]].*clinic\.raimovdental\.com' /etc/nginx/sites-available /etc/nginx/conf.d 2>/dev/null | head -n 1 || true)"
fi
if [[ -z "$NGINX_CONF" || ! -f "$NGINX_CONF" ]]; then
  echo "Could not locate clinic.raimovdental.com nginx server config" >&2
  exit 1
fi
python3 - "$NGINX_CONF" "$SNIPPET" <<'PY'
from pathlib import Path
import re, sys
conf = Path(sys.argv[1]); snippet = sys.argv[2]
text = conf.read_text(); include = f'    include {snippet};'
blocks = []
for match in re.finditer(r'\bserver\s*\{', text):
    brace = text.find('{', match.start())
    depth = 0; quote = None; escaped = False; end = None
    for i, ch in enumerate(text[brace:], brace):
        if escaped: escaped = False; continue
        if ch == '\\': escaped = True; continue
        if quote:
            if ch == quote: quote = None
            continue
        if ch in "'\"": quote = ch; continue
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: end = i; break
    if end is not None: blocks.append((match.start(), end, text[match.start():end+1]))
target = None
for start, end, block in blocks:
    if re.search(r'\bserver_name\b[^;]*\bclinic\.raimovdental\.com\b', block) and re.search(r'\blisten\b[^;]*\b443\b', block):
        target = (start, end, block); break
if target is None: raise SystemExit('HTTPS server block for clinic.raimovdental.com not found')
start, end, block = target
if include not in block:
    text = text[:end] + include + '\n' + text[end:]
    conf.write_text(text)
PY
nginx -t
systemctl reload nginx
nginx -T 2>/dev/null | grep -Fq 'proxy_pass http://127.0.0.1:8788/esign/'

say "8/9 external smoke"
code=000
health_code=000
for _ in $(seq 1 24); do
  code="$(curl -LsS -o /tmp/expert-esign-test-public.html -w '%{http_code}' --max-time 20 https://clinic.raimovdental.com/esign/ || true)"
  health_code="$(curl -LsS -o /tmp/expert-esign-test-public-health.json -w '%{http_code}' --max-time 20 https://clinic.raimovdental.com/esign/healthz || true)"
  if [[ "$code" == 200 && "$health_code" == 200 ]]; then break; fi
  sleep 5
done
test "$code" = 200
test "$health_code" = 200
grep -Fq 'ТЕСТОВЫЙ РЕЖИМ' /tmp/expert-esign-test-public.html
python3 - <<'PY'
import json
h=json.load(open('/tmp/expert-esign-test-public-health.json'))
assert h.get('ok') is True, h
assert h.get('applicationMode') == 'test', h
assert h.get('testMode') is True, h
assert h.get('outboundDeliveryEnabled') is False, h
PY

say "9/9 record deployment marker"
install -d -m 0750 "$DATA_ROOT/deploy"
cat >"$DATA_ROOT/deploy/current.json" <<EOF
{"source_sha":"${SOURCE_SHA}","deployed_at":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","url":"https://clinic.raimovdental.com/esign/","mode":"test","synthetic_prefix_required":true,"whatsapp":"disabled","immutable_storage":"passed","health":"passed"}
EOF
chmod 0640 "$DATA_ROOT/deploy/current.json"

echo
echo "Expert E-sign TEST is live: https://clinic.raimovdental.com/esign/"
echo "Source SHA: ${SOURCE_SHA}"
echo "Credentials remain root-only at: ${BOOTSTRAP_FILE}"
echo "Only ТЕСТ/ДЕМО/TEST/DEMO patient names are accepted."
