# RAIMOV_OPS_ACCESS — Secure production ops for ChatGPT (SSOT)

**Status:** active  
**Created:** 2026-08-10  
**Owner:** Raimov Dental / platform ops  
**Runner:** `scripts/raimov-ops/ops-runner.mjs`  
**Production:** `clinic.raimovdental.com` and protected `balamdental.com` on VPS2402 (`185.216.214.28`)

## Purpose

ChatGPT (via GitHub connector) can **diagnose, smoke-test, screenshot, deploy and restart** Raimov Dental production **without** receiving SSH keys, `.env`, or root passwords in chat.

| Layer | Role |
|-------|------|
| **ChatGPT** | Writes typed request JSON to `main` or triggers `workflow_dispatch` |
| **GitHub Actions** | SSH to VPS2402 with `VPS2402_SSH_KEY` (secret), runs allowlisted runner |
| **VPS2402 runner** | Executes fixed operations only; redacts secrets; writes audit log |
| **Result** | JSON in `docs/agent-api/results/` + screenshots in `docs/agent-api/artifacts/raimov-ops/` |

The bridge executes every request from a disposable detached worktree at current `origin/main`.
This keeps deploy SHA exact and does not rewrite or discard local commits in the canonical VPS checkout.

## Architecture

```
ChatGPT (GitHub connector)
    │
    ├─► docs/agent-api/requests/{id}.json  (type=raimov_ops)
    │         │
    │         ▼
    │   .github/workflows/raimov-ops-bridge.yml
    │         │ SSH (VPS2402_SSH_KEY)
    │         ▼
    │   VPS2402: node scripts/raimov-ops/ops-runner.mjs bridge
    │         │
    │         ▼ SCP + commit
    └─► docs/agent-api/results/{id}.json
        docs/agent-api/artifacts/raimov-ops/{id}/screenshots/
```

**Fallback workflows** (enum inputs only — no arbitrary shell):

| Workflow | Purpose |
|----------|---------|
| `ops-production-status.yml` | `production_status`, `deployment_status` |
| `ops-smoke.yml` | Fixed smoke (`feedback-hub`, `recruitment-hub`, `patient-site`, `balam-stage0`) |
| `ops-deploy.yml` | Allowlisted deploy + post-deploy smoke |

**Cursor / VDS on VPS2402** may run the runner directly:

```bash
cd /var/www/grainee-v2
node scripts/raimov-ops/ops-runner.mjs production_status --json
node scripts/raimov-ops/ops-runner.mjs bridge --input docs/agent-api/requests/{id}.json
```

## Typed operations (MCP/API tools)

| Operation | Params (enum only) | Description |
|-----------|-------------------|-------------|
| `production_status` | — | hostname, uptime, load, disk, memory, git SHAs |
| `service_status` | `service`: `expert-feedback-hub` \| `expert-recruitment-hub` | systemd status + health |
| `service_logs` | `service`, `lines` (≤500), `since` (`10m`, `1h`, `24h`) | journalctl, redacted |
| `http_check` | `path` (on clinic origin only) | SSRF-safe probe |
| `run_smoke` | `scenario`, `viewport` (`mobile` \| `desktop`) | Playwright/puppeteer smoke |
| `take_screenshot` | `route`, `viewport` | Allowlisted routes only |
| `deployment_status` | `component` | GitHub vs production vs deploy marker |
| `deploy` | `component`, `dry_run` | Runs repo deploy script only |
| `restart_service` | `service` | Allowlisted systemd unit + health |

## Allowlists (deny-by-default)

| Category | Allowed |
|----------|---------|
| **Services** | `expert-feedback-hub`, `expert-recruitment-hub` |
| **Deploy components** | `feedback-hub`, `recruitment-hub`, `patient-site`, `balam-stage0` |
| **Smoke scenarios** | same four |
| **HTTP origins** | `https://clinic.raimovdental.com`; fixed BALAM smoke only: `https://balamdental.com` |
| **Screenshot routes** | `/`, `/feedback/demo`, `/career/administrator`, `/about/`, `/services/`, `/contact/` |

## Request schema

```json
{
  "request_id": "raimov-ops-feedback-smoke-20260810",
  "type": "raimov_ops",
  "created_at": "2026-08-10T12:00:00Z",
  "requested_by": "chatgpt",
  "operation": "run_smoke",
  "params": {
    "scenario": "feedback-hub",
    "viewport": "mobile"
  }
}
```

Templates: `docs/agent-api/templates/TEMPLATE.raimov_ops_*.json`

## Result schema

```json
{
  "request_id": "raimov-ops-feedback-smoke-20260810",
  "type": "raimov_ops",
  "operation": "run_smoke",
  "status": "success",
  "ok": true,
  "generated_at": "2026-08-10T12:01:00.000Z",
  "data": { "pass": true, "assertions": [], "screenshots": [] },
  "warnings": ["channel: raimov-ops-bridge"],
  "errors": []
}
```

## Security

| Rule | Status |
|------|--------|
| No arbitrary shell / SSH / curl / file paths from client | enforced |
| Secret redaction on all logs/output | `scripts/raimov-ops/lib/redaction.mjs` |
| Audit log (no secrets) | `/var/log/grainee/raimov-ops-audit.jsonl` |
| Deploy only via repo scripts | `scripts/raimov/deploy-*.sh` |
| TLS to production | via nginx / Cloudflare |

## One-time human setup (ChatGPT path)

1. Add GitHub Actions secrets on `zaomir/grainee-v2`:
   - Preferred: `VPS2402_SSH_KEY` — private key (deploy key or root key limited to ops)
   - Existing approved fallback: `DEPLOY_KEY` or `EVO_SSH_KEY` already provisioned for VPS2402 deploy workflows
   - Optional: `VPS2402_HOST` (`185.216.214.28`), `VPS2402_SSH_USER` (`root`); `EVO_SSH_USER` is the user fallback
2. Ensure VPS2402 has Chrome (`google-chrome-stable`) for smoke/screenshots
3. ChatGPT: connect GitHub repo; read results from `docs/agent-api/results/` on `main`

## Related

| Path | Role |
|------|------|
| `scripts/raimov-ops/` | Ops runner + libs |
| `docs/ssot/AGENT_API_ACCESS.md` | Parent bridge pattern (maps/deploy) |
| `scripts/raimov/deploy-feedback-hub.sh` | Feedback hub deploy |
| `tests/smoke/raimov-ops-allowlist-smoke.mjs` | Allowlist unit smoke |

## ChatGPT integration recommendation

| Option | Verdict |
|--------|---------|
| **GitHub Actions + request JSON** | **Preferred** — already connected; no new MCP |
| **OpenAPI connector** | Possible later if HTTP ops daemon added on VPS |
| **MCP server** | Optional; same typed tools as runner |
| **Direct SSH to ChatGPT** | **Forbidden** |

Use **typed GitHub bridge** first; MCP can wrap the same operations later.
