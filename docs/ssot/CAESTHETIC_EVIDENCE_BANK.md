---
owner: CAESTHETIC
status: canonical
version: 1.0
created: 2026-08-19
authority: DEC-842
parent: docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md §5 (Evidence Bank lifecycle)
---

# CAESTHETIC Evidence Bank — manifest, storage and tooling

V3.2 §5 defines the Evidence Bank's lifecycle (`CAPTURED → PUBLISHABLE →
USED`) and required manifest fields, but names no storage location and no
tooling. This file is that missing layer. It does not change §5's rules; it
implements them.

## 1. Storage layout

```text
Production/evidence-bank/<unit_id>/
  manifest.json
  raw/       (unredacted originals — never read by any render pipeline)
  clean/     (redacted, publishable artifacts)
```

`unit_id` matches `^[A-Za-z0-9._-]{6,80}$`. Locally this resolves under the
repo root; in production it is a Dropbox-mirrored path via `rclone`, the same
pattern already used for `Production/daily-growth-note/<episode>/`.

## 2. Manifest schema

JSON, not YAML — the repo has no YAML dependency in `package.json` and adding
one is Lane B/integrator territory (`AGENTS.md` §4), not a docs-scope change.
Schema and validation live in code, not prose, so they cannot drift:
`scripts/caesthetic/evidence/schema.mjs`.

| Field | Required | Notes |
|---|---|---|
| `unit_id` | always | |
| `source` | always | |
| `capture_date` | always | ISO 8601 date |
| `epistemic_label` | always | one of `Observed, Measured, Calculated, Benchmark, Estimated, Illustrative` |
| `verified_observation` | always | |
| `allowed_public_wording` | always | |
| `method_scope` | when label is `Calculated`/`Benchmark`/`Estimated` | |
| `rights_status` | always | one of `public_source, anonymized_only, client_consented` |
| `consent_ref` | when `rights_status = client_consented` | pointer to the signed consent (e.g. Sprint agreement clause) |
| `redaction_status` | required for review before promotion | `pending \| clean \| not_applicable` — `not_applicable` only valid for `Illustrative` |
| `reviewer` | required for any non-`Illustrative` unit | named human, per the same convention as `growth-score-engine.mjs`'s `namedHuman()` |
| `lifecycle_state` | always | `CAPTURED \| PUBLISHABLE \| USED` |
| `reuse` | array, optional | which Reels/Stories/Scores reused this unit |

`Illustrative` units (model examples, no real client data) skip `reviewer`
and `redaction_status` review by construction — there is nothing to redact.
Every other label requires both before promotion.

## 3. Lifecycle enforcement

`CAPTURED → PUBLISHABLE` requires (`schema.mjs canPromoteToPublishable`):
every required field present per §2, **and** `redaction_status` at a
terminal reviewed value (`clean` or `not_applicable`) — `pending` blocks
promotion even if every other field is filled in.

`PUBLISHABLE → USED` is not a separate gate; a unit is `USED` once something
real (a Reel, a Score) actually cites it. Nothing currently writes `USED`
automatically — `reuse` is appended by whichever tool consumes the unit.

## 4. Tooling

```bash
node scripts/caesthetic/evidence/new-unit.mjs new <unit_id> [--label <EpistemicLabel>] [--source <text>]
node scripts/caesthetic/evidence/new-unit.mjs status <unit_id>
node scripts/caesthetic/evidence/new-unit.mjs promote <unit_id>
node scripts/caesthetic/evidence/new-unit.mjs list
```

`new` scaffolds the folder + a manifest with every required field present
but empty (except the ones a human must supply). `status` runs full
validation and says exactly what's missing. `promote` re-validates and only
then flips `lifecycle_state`; it never trusts a manually-edited file blindly.

Root defaults to `Production/evidence-bank` under the repo root; override
with `CAE_EVIDENCE_BANK_ROOT` (used by every test and safe for local/CI use
without touching the real Dropbox-backed store).

### 4.1 Score → Evidence Bank extraction

```bash
node scripts/caesthetic/evidence/from-score.mjs <report.json> --client <label>
```

Reads the same `report.json` shape scored by
`site-caesthetic/assets/js/growth-score-engine.mjs`. Drafts one `CAPTURED`
unit per metric that is `reviewer_status: approved`, `evidence_class: A`
(independently observed, not an estimate) and carries a non-empty `finding`.
Every draft is conservative by construction — `rights_status:
anonymized_only`, `redaction_status: pending` — regardless of how the source
metric was scored, because a client's own Score data needs an explicit human
consent decision before it can become `client_consented`. This script never
makes that call; it only proposes candidates for a human to review with
`new-unit.mjs status` / `promote`.

This is deliberately the **only** point where Evidence Bank volume can scale
past manual capture: Growth Score production is already the highest-volume,
highest-quality observation source in the whole system (30–50 audits/month
per `caesthetic_days_1_30.md`), and it was previously discarded after
delivery. Add "flag 1–3 observations for the bank" to the Score delivery
checklist so a human always decides which candidates are worth drafting.

## 5. Publish ownership — routing + request layer

```bash
node scripts/caesthetic/asset-worker/publish-request.mjs prepare \
  --request-id <id> --reels-dir <Huck/reels/dir> --caption <text> \
  (--contour <registry_contour> | --profile-id <id> --account <identity>) \
  [--evidence <unit_id,unit_id,...>]
```

Validates a finished Reel's `video-qa.json` passed and that every cited
Evidence Bank unit is `PUBLISHABLE`/`USED`. Routing — which account a piece
of content targets — is resolved from the real, existing account registry
(`docs/ssot/data/social-account-registry.yaml`, canon:
`SOCIAL_ACCOUNT_CONTROL_PLANE.md`) via `scripts/caesthetic/evidence/resolve-account.py`,
not hardcoded or invented: `--contour caesthetic` resolves to whichever live
Instagram surface the registry lists for that contour (today:
`valeria-lana-caesthetic-instagram`, `@caesthetic.growth`, Dolphin profile
`833304152`). An explicit `--profile-id`/`--account` always overrides
resolution for a caller who already knows the target. The assembled request
matches the envelope shape `services/social-browser-operator` already uses
(`profile_id`, `platform`, `expected_account_identity`, `idempotency_key`).

**It stops there by design.** `services/social-browser-operator` has no
`instagram` platform entry and no video/Reels adapter today — its own
`social_attach_image` schema is explicitly "LinkedIn only" — and that
service is shared, multi-client infrastructure (also serves other clients'
LinkedIn/Facebook accounts on Dolphin profile `833304152`). DEC-843 cleared
the old repo-wide activation block: any authorised ecosystem agent may
trigger the canonical VPS2402 factory. Trigger authority does not add a
missing platform adapter or bypass account autonomy, approval, limits,
identity separation or project SSOT. CAESTHETIC IG therefore remains
`DRAFT_ONLY_READY`: its session and surface are verified, while
`adapter_capabilities.instagram.execute: false` correctly prevents automatic
publishing. DEC-792 still assigns the recurring heartbeat to VPS2402 systemd;
Cloud/chat agents may send event-driven requests, not become the ticker.
Building an Instagram Reels composer adapter means writing and
verifying Playwright selectors against Instagram's live upload UI; doing
that blind, without a live browser session to test against, risks silently
breaking or misposting on a real account. `submitPublishRequest()`
therefore always returns `status: "blocked_missing_adapter"` with the
registry's own real blocking reasons attached
(`registry_blocking_reasons`) — the same fail-closed pattern this codebase
already uses for `social_edit_post`/`social_delete_post` on Facebook
("returns UNSUPPORTED until an adapter exists").

The Instagram execute-adapter work is scoped as
**`docs/tasks/TASK-837_caesthetic_ig_reels_adapter.md`**, filed per the
handoff protocol in `CHATGPT_DELFIN_TASK_HANDOFF.md`, addressed to whoever
has live VPS2402/Dolphin access. Activation is already clear under DEC-843;
the task must not weaken any other account's policy or identity boundary.

Until TASK-837 lands, publishing stays manual: a named person publishes
through Instagram's own app/Meta Business Suite, using
`publish-request.mjs prepare`'s output only as a checklist (QA passed,
evidence cleared, caption/idempotency key recorded, correct account
resolved) — not as a trigger for anything automatic.

## 6. Non-goals (explicitly out of scope for this SSOT)

- Automated screenshot capture (Local Falcon API pull, GBP scraping). No
  volume yet to justify it; `raw/` still expects a human to drop files in.
- Automatic PII redaction (image blur/crop). `redaction_status` review stays
  a human step.
- The Instagram Reels composer adapter itself (§5). Scoped as a follow-up
  engineering task for someone with live Dolphin/Playwright access, not
  buildable here.
