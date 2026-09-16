---
owner: CAESTHETIC / Social Automation
status: active
created: 2026-09-15
version: 1.0.3
authority: canonical
related:
  - docs/ssot/AGENT_API_ACCESS.md
  - docs/ssot/CHATGPT_SERVER_OPS.md
  - docs/ssot/SOCIAL_ACCOUNT_CONTROL_PLANE.md
  - docs/ssot/HOOPPY_API.md
  - docs/projects/social-automation/README.md
---

# CAESTHETIC_SOCIAL_CHANNEL — ChatGPT → GitHub → VPS2402

Permanent typed Agent API for CAESTHETIC social checks, publication and allowed interactions. ChatGPT does **not** hand tasks to Cursor for routine work.

**Type:** `caesthetic_social`  
**Processor:** VPS2402 poller `/etc/cron.d/grainee-caesthetic-social` every 2 minutes  
**Executor:** existing Social Browser Operator / social-fleet on **VPS2402**, profile `833304152`, Local API `127.0.0.1:3001` (Cloud pin `legacy-vds-121` = agent id only — `DOLPHIN_PROFILE_CONTROL.md` §4.2)  
**Not:** `deploy`, `caesthetic_medspa`, Dolphin MCP writes, arbitrary shell.

## Mandatory complete-run contract — owner instruction 2026-09-15

> «Я запрещаю делать неполный прогон. Каждый прогон должен быть по всем аккаунтам и выполнить все разрешённые задания, без исключений».

This is the mandatory acceptance contract for every CAESTHETIC / ROVLEX social run, including conversational “прогон”, “полный прогон” and `full_run`. A standalone diagnostic explicitly requested as such remains a diagnostic and must not be presented as a run.

1. **All accounts, every run.** Resolve the complete current project scope from `docs/ssot/data/social-account-registry.yaml` and the canonical project directory; include every personal account and business surface. The surfaces table below is an adapter mapping, not a second account registry or permission to omit newly enrolled accounts. Missing binding, unknown Company Page or unsupported adapter must remain visible as a blocker, never disappear from the scope.
2. **All permitted work.** For each account, check live identity/access and page roles, inbox/replies, existing outreach queues, due publications, planned reposts/warmup and available analytics. Perform every due authorised task within the actual remaining shared limits; do not stop after one test, one successful action, one account or queue inspection. Create required preparation tasks from the existing editorial SSOT when a due item lacks a package; an empty execution queue alone does not prove there is no work.
3. **Continue independently.** An error, closed window or blocked account does not stop permitted work on other accounts or action types. Diagnose and repair recoverable faults within existing authority, then continue. Do not ask for repeated permission already given. If capabilities or genuinely missing owner information prevent repair, record the exact blocker and concrete next action.
4. **Existing boundaries apply.** “All permitted” does not bypass platform restrictions, identity checks, suppression, deduplication, shared limits, work windows, active leases or another executor. YouTube remains Hooppy-only; denied page `1226338` remains excluded. Do not auto-clear a renewed HOLD. Do not manufacture posts, recipients, claims or interactions merely to produce activity.
5. **Verify actions.** A queued job is not a sent message; a scheduled post is not LIVE. Reconcile uncertain outcomes before any retry. Keep private content on the host and put sanitised receipts and counts in GitHub.
6. **Strict completion.** Report every account and task category as verified completed, checked with no due eligible task (with evidence), deferred (reason and next eligibility), blocked (code and next action), or unsupported. Any uninspected account, unperformed permitted task or unresolved required step makes the overall run **INCOMPLETE**. Account coverage with blockers may be reported as coverage achieved, never as a fully completed run. A worker terminal `status=success` alone is not business acceptance.
7. **No silent leftovers.** Finish only after all currently permitted tasks have verified outcomes and every remaining task has an explicit constraint and continuation record. Record counters before/after, receipts, remaining work and next step in GitHub. A future retry is not described as scheduled unless an actual existing or newly authorised automation has been verified.

This contract supersedes weaker descriptions of `full_run` as queue inspection only. It is an execution and reporting requirement; this documentation change does not by itself prove that the deployed worker implements every stage.

## ChatGPT loop

1. Write `docs/agent-api/requests/{request_id}.json` on `zaomir/grainee-v2` **`main`**.
2. Wait for GHA ack `status=queued_on_vds` then VPS result.
3. Read `docs/agent-api/results/{request_id}.json` on **`main`**.
4. Continue from that JSON only. Re-read until `status` is terminal (`success`, `blocked`, `error`, `unsupported`, `already_completed`, `NO_ACTION_PROVEN`).
5. Same `request_id` is not re-executed. Use a new id to retry a blocked job after the cause is gone. After a send/`intended`/`uncertain` result, call `reconcile` — do not send again.

Poller cadence is 2 minutes. Do not open a Cursor chat for health, readiness, status, Hooppy pages, stop, or recover.

## Operations

| operation | When | Write? |
|-----------|------|--------|
| `health` | Host, token present (boolean), Dolphin Local API, fleet, HOLD | no |
| `readiness` | Live identity/restriction probe via existing operator; unknown ≠ verified | no |
| `status` | Queue counts, InMail remaining, journal aggregates, leases | no |
| `inbox` | Actual operator read; `unread_count` is null unless the inbox was read | no (bodies stay on host) |
| `execute` | Hands the private `content_ref` to the existing SBO drain; waits for `ACTION_VERIFIED`. Queueing is not a send. Closed window → `WINDOW_CLOSED`, item stays ready | yes, if allowed |
| `publish` | Existing Hooppy operator on a ready package; returns post id and live URL check | yes, if package exists |
| `full_run` | All accounts and all due permitted tasks; mandatory complete-run contract above. Queue inspection alone is insufficient | mixed |
| `reconcile` | Checks journal/queue/Hooppy for an uncertain result; never resends | no |
| `stop` | Cancel a job created by this channel | n/a |
| `recover_hold` | Diagnostic after cause is gone | **does not delete** fleet HOLD file; see § HOLD clearance |

Templates: `docs/agent-api/templates/TEMPLATE.caesthetic_social_*.json`.

Unsupported `operation` → `status=unsupported`, `errors[0].code=unsupported_operation`.

## Request rules

Forbidden keys anywhere: `command`, `shell`, `script`, `exec`, `curl`, `ssh`, `bash`, `cdp`, `headers`, `token`, `password`, `cookies`.  
Forbidden in Git JSON: recipients, emails, message/subject/body/caption, cookies, provider tokens.  
Writes use `content_ref` / `queue_item_id` / `package_id` under `/var/lib/social-fleet/` or `/var/lib/caesthetic-social/` only.

## Surfaces

Availability ≠ permission.

| `surface_account_id` | Notes |
|---|---|
| `valeria-lana-linkedin` | Valerie `/in/valeriia-petrova-uk/`. InMail ceiling **20/day, 140/week, 600/month** across all executors. Coordinate with Aside; do not disable their routines. |
| `valeria-lana-facebook` | Lana. Exact identity URL still unverified. |
| `caesthetic-instagram` | `@caesthetic.growth`. Cold DM = 0. Registry execute may be false. |
| `caesthetic-facebook-page` | Page `987019634498026` / Hooppy `1977644`. Login ≠ page role. |
| `caesthetic-tiktok` | Profile `833304152` only. Hooppy `2446140`. Handle vs Hooppy name may be unresolved. |
| `caesthetic-youtube` | **No Dolphin.** Hooppy `2443192` only. |
| `robertas-lobanovskis-linkedin` | Hard block `NO_DOLPHIN_BINDING` until real profile + powers exist. |
| `viktorija-jonane-linkedin` | Same. |

## Hooppy

Allowlist only: `2442190` (IG), `1977644` (FB), `2446140` (TikTok), `2443192` (YouTube), `2442189` (Valerie LI organic).  
Hard deny: TikTok `1226338`.  
Never call raw `GET /accounts`. Pages/posts are sanitised; `access_token` / `refresh_token` / `bot_token` never appear in Git results.

Queue/SCHEDULED is not LIVE. `LIVE_VERIFIED` needs a public URL.

## HOLD and Aside

Fleet stop-flag (per profile): `/var/lib/social-fleet/profiles/valeriia-lana/HOLD` (JSON with `blocker_code`, often `CHALLENGE_OR_RESTRICTION` / `automatic_safety_hold`).

`recover_hold` **does not remove** that file. It only reports whether HOLD is still present after the underlying cause is gone.

### HOLD clearance (canonical — VPS2402)

After login is verified, **stop the profile and remove only the server stop-flag**. Do **not** repeat checkpoint steps once LinkedIn/messages are healthy.

1. In Dolphin profile **`833304152`**, confirm **LinkedIn and messaging** open **without** checkpoint/restriction screens.
2. End the operator session and **stop the profile** via Dolphin / Local API (no mass tab close — `DOLPHIN_PROFILE_CONTROL.md` §6.2).
3. When **no active fleet job** owns the profile, on VPS2402:

   ```bash
   sudo rm -f -- /var/lib/social-fleet/profiles/valeriia-lana/HOLD
   ```

4. Via this channel, run **`health`** and **`readiness`**. Require **`hold.active: false`** in both results.
5. Run **one allowed write** (`execute` or `publish` as appropriate) and verify the result receipt. If HOLD reappears, read the **new** `blocker_code` / file contents — **do not** auto-delete HOLD again without fixing that cause.

Host: **VPS2402** only (ChatGPT ROVLEX Dolphin Control or Local API on that machine — not physical `.121`).

Valerie: one active executor. Shared limits and contacts. Foreign jobs (`source` ≠ `caesthetic-social`/`chatgpt`) are not cancelled by `stop`.

## Results

Git holds aggregates, surface ids, codes, Hooppy page ids, public URLs, private object refs.  
Host holds recipients, copy, cookies, tokens, full inbox.

Re-read path: `docs/agent-api/results/{request_id}.json` ref `main`. If missing after ~6 minutes, diagnose `bash scripts/agent-api/diagnose.sh` (`social_cron=present`) — still no Cursor task for a valid request.

## Remaining limits

- Valerie writes stay inside Mon–Fri 09:00–17:00 America/New_York. Outside that window `execute` / `full_run` return `WINDOW_CLOSED` and leave the existing queue untouched. Next open: next weekday 09:00 New York.
- If fleet HOLD reappears after the 2026-09-15 clearance, read the new `blocker_code` — do not delete HOLD again automatically.
- Robertas/Viktorija: no Dolphin binding.
- CAESTHETIC LinkedIn Company Page: unknown surface.
- Aside routines remain on their side; VPS cannot see or stop them. Check `asideConflict` before Valerie sends.
- YouTube is Hooppy only. TikTok `1226338` is hard-denied.
- Do not invent test posts or messages. `publish` requires a ready private package; empty package dirs → `NO_ACTION_PROVEN(no_due_package)` after the check.
