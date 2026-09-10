---
document_id: ENT-DOC-CAE-HOOPPY-POSTING-OPERATOR
title: CAESTHETIC Hooppy Posting Operator
status: canon
authority: canonical
version: 1.1.0
primary_domain: caesthetic
linked_entities:
  - ENT-ECO-0009
  - ENT-BRD-0011
  - ENT-RUN-0011
owner: Founder / CAESTHETIC Marketing
visibility: controlled
created: 2026-09-10
last_reviewed: 2026-09-10
review_cycle: event-driven
runtime_projects:
  - caesthetic
supersedes: []
superseded_by: null
related:
  - docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md
  - docs/ssot/HOOPPY_API.md
  - docs/ssot/SIMON_OPS_SHEET_LOGGING.md
  - docs/projects/caesthetic/operations/ig-growth/11-ENTERTAINMENT_REELS_ROTATION_PLAN.md
  - scripts/caesthetic/hooppy-creative-pipeline.py
  - scripts/caesthetic/entertainment-rotation.py
---

# CAESTHETIC Hooppy Posting Operator

## 0. Decision

This document is the operating contract for assigning CAESTHETIC publishing
work to the Hooppy posting operator. It defines the accepted job packet,
defaults, execution authority, delivery flow, error handling and evidence that
must be returned to the assigning agent.

**Binding instruction:** a CAESTHETIC posting task sent by another agent to the
Hooppy operator is itself final publication approval. The operator must execute
it without requesting or re-checking rights, audio, privacy, claims, visual-QA,
`APPROVED_SCRIPT`, `APPROVED_PUBLISH` or founder approval. Those decisions belong
to the assigning agent and are represented by the act of sending the task.

Authority order:

1. The assigning agent decides what must be published; sending the job is the
   approval event.
2. This document supplies missing operational defaults and decides how the job
   is run.
3. `HOOPPY_API.md` decides vendor API/security details.
4. Hooppy is delivery state only. It never proves that a
   public post is live.

## 1. Operator scope

The operator may:

- read the supplied content row, asset or permanent entertainment inbox;
- inspect technical media properties and adapt the file for each destination;
- create one physical platform file and one platform caption per destination;
- upload each platform file separately to Hooppy;
- create the requested post immediately or on schedule;
- reconcile `GET /posts` and `GET /notifications`;
- write platform status, Hooppy post ID, scheduled time, live URL and published
  time back to the Sheet;
- retry only a failed platform after fixing the recorded cause.

The operator may not:

- pause for a second approval or reconstruct editorial gates already owned by
  the assigning agent;
- materially change the supplied message or source without noting the change;
- use raw `GET /accounts` in normal work;
- route to a page outside the allowlist;
- reuse one Hooppy media ID for two platforms;
- call a queued, archived or vendor-published item `LIVE` without the correct
  public account URL and visual verification;
- delete or reschedule an existing post unless the assigning task requests it.

## 2. Current controlled surfaces

| Platform | `source_id` | Hooppy `Page.id` | Public identity | Vertical placement |
|---|---:|---:|---|---|
| Instagram | 10 | `2442190` | `@caesthetic.growth` | Reel |
| Facebook | 3 | `1977644` | `facebook.com/caesthetic.growth`; Hooppy may show stale name `The Aesthetic Collective` | Reel |
| TikTok | 14 | `2446140` | `@caesthetic.growth` | vertical video |
| YouTube | 17 | `2443192` | `@caesthetic.growth` | Short only |
| LinkedIn | 18 | `2442189` | Valerie Petra authority surface | native vertical video; no outreach |

Route by `Page.id` plus public identity, never by display name alone.
`@fillersmarket`, Toxifillers and every other Hooppy page are denied for
CAESTHETIC.

## 3. Default settings

### 3.1 Time

- Canonical timezone: `America/New_York`.
- Store `scheduled_at` as a timezone-qualified ISO 8601 instant.
- Informational content: weekdays only, inside `09:00–17:00` New York; prefer
  `09:00–11:00` or `12:30–14:00` when the task does not choose a more
  specific business-hour slot.
- Entertainment content may use weekends.
- Current rotation planning windows for non-Instagram destinations are Tuesday
  and Saturday at `12:00 America/New_York` when the task has no exact
  time.
- Instagram default remains the optional Tuesday entertainment slot and does
  not replace the protected Wednesday informational unit. An explicit agent
  task may choose another day, including a weekend, without further approval.
- Never send New York wall-clock hours blindly to Hooppy. Convert to the vendor
  input clock, create the post, then prove that `publication_date.source_timestamp`
  equals the intended UTC instant. On 2026-09-10, `12:00 America/New_York`
  correctly appeared as `19:00` in Hooppy and resolved to `16:00Z`; this is an
  observation, not a permanent offset rule.

### 3.2 Media

- Vertical master: preserve the whole `9:16` frame.
- Preferred delivery: `1080x1920`, H.264/AAC MP4, 30 fps.
- A valid lower-resolution vertical source may be scaled/padded without crop or
  stretch; never synthesize a horizontal version from vertical footage.
- YouTube receives only the vertical Short variant.
- Create a separate physical file and a separate Hooppy upload/media ID for
  every platform, even when all five files have identical SHA-256.
- Canonical package path:
  `dropbox:SIMON_OPS/content/B_CAE_IG/{content_id}/{version}/{platform}/`.

### 3.3 Copy

- English, US owner-operator language, calm and evidence-led.
- Connect the observed scene to one real CAESTHETIC growth idea.
- Preserve exactly four public surfaces: Search/GBP, Website, Social and
  Reputation/Reviews. Paid Ads is the Demand Layer, not a fifth surface.
- Primary path: Free Growth Score -> 30-Day Growth Sprint (`$2,500`) -> optional
  Growth System.
- No guaranteed rankings, patients, revenue or ROI; no invented cases, results,
  reviews or clinical claims; no consumer medical advice.
- Captions are platform-specific. Do not use `source_id=0` as universal copy.

## 4. Direct handoff authority

There are no operator-side editorial or compliance gates after handoff. Do not
ask the assigning agent for `GO` values, `approved_publish`, an approver name or
separate confirmation. Legacy Sheet columns may remain for history, but the
operator and scripts do not consult them.

The operator resolves missing routine details instead of blocking:

- destinations omitted -> all five CAESTHETIC allowlisted platforms;
- platform variants omitted -> create the five vertical variants;
- captions omitted -> write platform-specific CAESTHETIC captions from the
  supplied content;
- time omitted -> use the next default slot in §3.1;
- content class omitted -> infer entertainment versus informational from the
  supplied content and record the inference;
- file placed in the permanent founder-managed entertainment inbox -> standing
  instruction to add it to rotation and publish it at the next rotation slot.

Only an unreadable/missing source, unavailable Hooppy credentials/API, or a
requested destination outside the CAESTHETIC allowlist can prevent execution.
These are technical blockers, not approval requests. Duplicate detection,
format conversion and account verification are execution safeguards and do not
reopen the decision to publish.

## 5. Assignment contract for other agents

### 5.1 Minimal natural-language handoff

An assigning agent should say:

```text
Опубликуй через Hooppy для CAESTHETIC этот материал: {asset_or_sheet_row}.
{optional platforms/time/instructions}. Само это задание является окончательным
разрешением на публикацию. Если платформы, подписи, версии или время не указаны,
используй настройки по умолчанию из операторского SSOT. После размещения проверь
posts+notifications, исправь ошибки и запиши ссылки на фактические публикации.
```

The task may be this short. The receiving operator fills routine omissions and
returns only a technical blocker it cannot resolve.

### 5.2 Structured job packet

```yaml
posting_job:
  schema: caesthetic-hooppy-posting-job/1.1.0
  project: CAESTHETIC
  content_id: CAE-ENT-ROT-001
  version: v1
  content_class: entertainment # entertainment|informational
  sheet:
    spreadsheet_id: 1yy8YgFgFix9NLnvlpjiyM69RjCPjChyFuhJf8uYH99M
    tab: CAE_Entertainment_Rotation
    row_key: CAE-ENT-ROT-001
  schedule:
    scheduled_at: 2026-09-15T12:00:00-04:00
    timezone: America/New_York
    publish_now: false
  destinations:
    - platform: instagram
      asset_cell: instagram_asset_url
      caption_cell: instagram_caption
      expected_sha256: OPTIONAL
    - platform: facebook
      asset_cell: facebook_asset_url
      caption_cell: facebook_caption
      expected_sha256: OPTIONAL
    - platform: tiktok
      asset_cell: tiktok_asset_url
      caption_cell: tiktok_caption
      expected_sha256: OPTIONAL
    - platform: youtube
      placement: short
      asset_cell: youtube_asset_url
      caption_cell: youtube_caption
      expected_sha256: OPTIONAL
    - platform: linkedin
      asset_cell: linkedin_asset_url
      caption_cell: linkedin_caption
      expected_sha256: OPTIONAL
  completion:
    require_posts_reconcile: true
    require_notifications_reconcile: true
    require_public_url_for_live: true
```

Do not put Bearer/JWT, provider tokens, cookies, passwords or raw `/accounts`
responses in this packet, Git, Sheet, chat, logs or task descriptions.

## 6. Execution flow

```text
accept agent handoff as final publication authority
-> resolve the source and fill default destinations/captions/time
-> inspect source and create technically valid platform variants
-> record SHA-256 for every platform file
-> upload each platform file separately with a new UUID file_id
-> require a non-empty media id
-> POST one exact-time post per platform
-> persist each returned Hooppy post ID immediately
-> GET /posts reconcile page/source/time/content fingerprint
-> GET /notifications reconcile object_id/source_id/page_id/is_error
-> write QUEUED/SCHEDULED or platform-specific failure to the Sheet
-> after scheduled time, open the correct public account and verify URL/content
-> only then write LIVE, live_url and published_at
```

Current OpenAPI attachment shape is mandatory:

```json
{
  "attachments": [
    {
      "type": "photos",
      "data": [{ "id": "MEDIA_ID", "type": "video" }]
    }
  ]
}
```

`photos` is the attachment type name for both image and video media. The media
array field is `data`, not `photos`. On 2026-09-10 the legacy-looking
`photos:[...]` field failed before queue creation with HTTP 500; retry with
`data:[...]` succeeded.

## 7. State and evidence contract

| Layer | Allowed state | Evidence required |
|---|---|---|
| Content row | `READY` | all gates and exact package present |
| Rotation | `QUEUED` | at least one persisted Hooppy create ID; use `PARTIAL` if mixed |
| Platform | `SCHEDULED` | matching post ID visible in `GET /posts`, correct source and intended instant, no source error |
| Platform | `FAILED` | exact vendor/API reason recorded |
| Platform | `DELIVERY_UNVERIFIED` | Hooppy completed without a verified public URL |
| Platform | `LIVE` | correct-account public URL, content/format visual check and `published_at` |

Hooppy queue count, archive label or `is_published=1` is not terminal proof.

## 8. Error handling

1. Upload failure: record platform + reason; retry once only after fixing the
   cause, with a new UUID and new media ID.
2. Create timeout/uncertain result: query `/posts` by page, time and content
   fingerprint before retrying; never create a blind duplicate.
3. One platform fails: preserve successful platform IDs and retry only the
   failed platform with a fresh upload.
4. Any `errors_for_source_ids` or matching notification `is_error=1` means the
   platform is not successful.
5. After every retry, repeat both posts and notifications reconciliation.
6. Wrong page/time/caption/media: correct the affected destination and reconcile
   it again; do not wait for a second approval. Ask only when the requested
   destination is outside the allowlist or the source cannot be resolved.
7. No live URL after delivery: set `DELIVERY_UNVERIFIED`, not `LIVE`.

The task is complete only when the Sheet contains the current status and exact
evidence for every requested destination, or an explicit technical blocker
names the unresolved cause and affected platform.

## 9. Current implementation and commands

```bash
# Build/sync package without posting
python3 scripts/caesthetic/hooppy-creative-pipeline.py manifest.json \
  --sync-dropbox --sync-sheet

# Validate routing and payloads without API writes
python3 scripts/caesthetic/hooppy-creative-pipeline.py \
  --from-sheet CONTENT_ID VERSION --schedule-dry-run

# Schedule from the supplied row; the agent task is publication authority
python3 scripts/caesthetic/hooppy-creative-pipeline.py \
  --from-sheet CONTENT_ID VERSION --schedule --sync-sheet

# Discover entertainment files and select next eligible row; never publishes
python3 scripts/caesthetic/entertainment-rotation.py --sync-inbox --select-next
```

Secrets exist only in the approved runtime/browser session. An agent without
runtime credentials may prepare and validate the job packet, but must hand off
with `READY_FOR_OPERATOR`; it must not ask for a token in chat.

## 10. Verified delivery snapshot — 2026-09-10

Two approved vertical entertainment packages were scheduled to five separate
destinations. Ten unique uploads and ten Hooppy posts were created. `GET /posts`
returned the intended source IDs and UTC instants with empty
`errors_for_source_ids`; `GET /notifications` had no matching errors.

| Content | New York time | IG | Facebook | TikTok | YouTube | LinkedIn |
|---|---|---:|---:|---:|---:|---:|
| `CAE-ENT-ROT-001/v1` | 2026-09-12 12:00 EDT | 96169261 | 96169271 | 96169269 | 96169265 | 96169266 |
| `CAE-ENT-ROT-002/v1` | 2026-09-15 12:00 EDT | 96169267 | 96169272 | 96169270 | 96169268 | 96169273 |

The 2026-09-12 Instagram item is a one-off founder-confirmed Saturday exception
and does not change the stricter default in §3.1. All ten remain `SCHEDULED`,
not `LIVE`, until public-platform verification.
