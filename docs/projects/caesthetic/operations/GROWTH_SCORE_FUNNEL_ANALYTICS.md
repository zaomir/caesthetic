# Growth Score funnel analytics

Server-side Score funnel for operators. Product diagnosis stays in `docs/ssot/CAESTHETIC.md`. Executable event names live in `scripts/caesthetic/growth-score-ops-contract.mjs`. Human contract: `docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md` (DEC-848).

## Event list (no PII)

Canonical sequence:

```text
lead_created → case_created → triaged → approved → delivered → sprint_inquiry
```

Stored fields only: `event_name`, `source_class`, `utm_source`, `utm_medium`, `utm_campaign`, `score_case_id`, `lead_id`, timestamps.

**No-PII rule.** Do not store or print `name`, `email`, `phone`, or `practice_name` in `caesthetic_score_funnel_events`, the weekly report, or this analytics lane. SQL `emit_caesthetic_score_funnel_event` raises `funnel_event_pii_forbidden` when those keys are present. The report CLI groups only by `source_class` / `utm_source`.

## Consent / legal — GA4 approved, Meta stays empty

`site-caesthetic/assets/js/caesthetic-config.js` must keep:

```js
ga4MeasurementId: "G-PNQB0W9YB2",
metaPixelId: "",
```

The GA4 web stream was founder-approved on 2026-08-22. Browser measurement uses Google Advanced Consent Mode:

1. The analytics script records `denied` consent by default.
2. The GA4 tag loads before a choice and sends cookieless measurements while `analytics_storage` is denied.
3. Accepting analytics updates `analytics_storage` to `granted`; rejecting persists the denied choice.
4. Advertising storage, advertising user data and personalisation stay denied in every state.
5. Form answers, payment details, email, phone and practice name remain forbidden event data.

Meta Pixel remains disabled until separately approved.

## How to run the weekly report

Service role (VDS / operator env already loaded):

```bash
cd /var/www/grainee-v2
node scripts/caesthetic/growth-score-funnel-report.mjs
node scripts/caesthetic/growth-score-funnel-report.mjs --from 2026-08-14T00:00:00.000Z --to 2026-08-21T23:59:59.000Z
```

No database credentials — still runnable with contract event names:

```bash
node scripts/caesthetic/growth-score-funnel-report.mjs --fixture
node scripts/caesthetic/growth-score-funnel-report.mjs --fixture path/to/events.json
```

If `SUPABASE_SERVICE_ROLE_KEY` is missing and `--fixture` is omitted, the CLI falls back to the built-in fixture and sets `mode: "fixture"`. Output is JSON: per-event counts, `lead_to_delivered`, `delivered_to_sprint_inquiry`, and the same counts grouped by `source_class` and `utm_source`. Never PII.

## DEC-829 — satellite is not a deploy source

Production authority is **`zaomir/grainee-v2` only**. `zaomir/caesthetic` (`/var/www/caesthetic`) is a public Cursor Agents mirror. Do not deploy from the satellite.

Parity audit (read-only; does not apply sync):

```bash
cd /var/www/grainee-v2
node scripts/caesthetic/dec829-parity-guard.mjs
node scripts/caesthetic/dec829-parity-guard.mjs --json
```

Exit `0` when mirrored trees in `docs/projects/caesthetic/SYNC_MANIFEST.yml` match. Exit `1` with a file list on drift. The guard always checks:

- `docs/ssot/CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS.md`
- `docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md`
- `docs/projects/caesthetic/ROUTER.md`
- `site-caesthetic/assets/js/growth.js` (hash / presence)

**After grainee-v2 ship**, operators restore satellite hash parity with:

```bash
cd /var/www/grainee-v2
bash scripts/caesthetic/sync-agents-bidirectional.sh --apply --commit --push
```

Do not run `--apply` from this analytics lane while hashes already differ and parent ship is not finished. Runtime reconciliation uses the isolated `caesthetic-repo-sync.timer` every 15 seconds; the retired `/etc/cron.d/caesthetic-agents-sync` job must not coexist with it.

## Read-only satellite drift audit (2026-08-21)

Compared grainee-v2 working tree vs `/var/www/caesthetic` (local `10d8b9b`, `origin/main` `76a53b3`, local **ahead 4 / behind 19**). Deploy authority confirmed: `target_repo: zaomir/grainee-v2`. Sync was **not** applied.

| Metric | Value |
|---|---|
| Files compared (SYNC_MANIFEST trees + SSOT globs + required) | 569 |
| Drifted | 146 |
| only_in_grainee | 117 |
| hash_mismatch | 29 |
| only_in_satellite | 0 |

Required files — all drifted:

| File | Status |
|---|---|
| `docs/ssot/CAESTHETIC_FUNNEL_TOOLING_AND_LAUNCH_READINESS.md` | only in grainee-v2 |
| `docs/ssot/CAESTHETIC_GROWTH_SCORE_OPS_CONTRACT.md` | only in grainee-v2 |
| `docs/projects/caesthetic/ROUTER.md` | hash mismatch |
| `site-caesthetic/assets/js/growth.js` | hash mismatch |

Hash mismatches (29): `docs/caesthetic/caesthetic_days_1_30.md`, `docs/caesthetic/growth_score_spec.md`, `docs/caesthetic/tz_website_caesthetic.md`, `docs/projects/caesthetic/AGENTS.md`, `docs/projects/caesthetic/PROJECT_STATUS.md`, `docs/projects/caesthetic/ROUTER.md`, `docs/projects/caesthetic/operations/ig-growth/08-PUBLISH_COMPLIANCE_AND_MEASUREMENT_GATE.md`, `docs/projects/caesthetic/operations/ig-growth/README.md`, `docs/ssot/CAESTHETIC.md`, `docs/ssot/CAESTHETIC_AUDIENCE_LISTS.md`, `docs/ssot/CAESTHETIC_EMAIL_TO_IG.md`, `docs/ssot/CAESTHETIC_HEYGEN_PRODUCTION_SYSTEM.md`, `docs/ssot/CAESTHETIC_IG_CONTENT_PLACEMENT.md`, `docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md`, `docs/ssot/CAESTHETIC_IG_REACH_PLAYBOOK.md`, `docs/ssot/CAESTHETIC_OWNER_MARKETING_QUESTIONS.md`, `docs/ssot/CAESTHETIC_VISUAL_ASSET_LIBRARY.md`, `scripts/caesthetic/README.md`, `scripts/caesthetic/render-growth-score.mjs`, `site-caesthetic/assets/css/growth-report.css`, `site-caesthetic/assets/css/growth.css`, `site-caesthetic/assets/js/analytics.js`, `site-caesthetic/assets/js/growth.js`, `site-caesthetic/score/demo-aesthetics-clinic-reputation-gap/index.html`, `site-caesthetic/score/demo-injector-practice-booking-friction/index.html`, `site-caesthetic/score/demo-medical-aesthetics-search-gap/index.html`, `site-caesthetic/sprint/index.html`, `tests/caesthetic/growth-score-renderer.test.mjs`, `tests/caesthetic/growth-score-submit-contract.test.mjs`.

only_in_grainee by tree: `docs/projects/caesthetic` 49 · `scripts/caesthetic` 31 · `docs/ssot` 17 · `tests/caesthetic` 15 · `site-caesthetic` 3 · `docs/audits/caesthetic` 2. Includes this analytics lane (`growth-score-funnel-report.mjs`, `dec829-parity-guard.mjs`, this doc, the analytics test) plus DEC-848 ops contract files that have not been mirrored yet.

Expected until parent ship + the sync command above. Satellite local also lags `origin/main` by 19 commits and has 4 unpublished local commits — operators should fetch/reconcile the satellite checkout before treating a later guard run as clean.
