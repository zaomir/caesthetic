---
document_id: ENT-DOC-CAE-IG-LOOKUP
title: CAESTHETIC Instagram username lookup (ManyChat)
status: canonical
authority: implementation
owner: platform / CAESTHETIC ops
created: 2026-08-14
last_reviewed: 2026-08-14
related:
  - docs/founder-notes/DEC-827.md
  - docs/tasks/TASK-820_lookup_caesthetic_instagram.md
  - docs/ssot/CAESTHETIC.md
  - docs/ssot/CAESTHETIC_AUDIENCE_LISTS.md
  - docs/ssot/EF_PLACEMENT.md
---

# CAESTHETIC Instagram lookup — ManyChat data contract

## Live API

| Field | Value |
|-------|-------|
| URL | `https://evo.do/api/v1/lookup-caesthetic-instagram` |
| Placement | VDS (DEC-291 / DEC-827) |
| Methods | `POST`, `OPTIONS` |
| Auth header | `X-Lookup-Token: <CAESTHETIC_IG_LOOKUP_TOKEN>` |
| Token store | `/etc/evo/secrets.env` + `/etc/grainee/edge.env` — never git |

ManyChat External Request sends:

```json
{
  "instagram_username": "{{Instagram Username}}"
}
```

`username` is accepted as a compatibility alias. The token belongs in the header; it must never be written to logs or documentation.

## Exact-match rule

The handler accepts only an explicit Instagram handle in one of these equivalent representations:

- `Practice.Name`
- `@Practice.Name`
- `https://instagram.com/Practice.Name/`

Normalization trims whitespace, removes the one explicit `@` or Instagram URL wrapper, and lowercases the handle. The remaining value must match `[a-z0-9._]{1,30}`. Invalid characters, multi-segment URLs, post/reel/story URLs, names, domains, cities and biographies are rejected; they are never cleaned into a guessed username.

Lookup is one exact equality on `username_normalized`. There is no fuzzy matching, similarity search, candidate fallback or AI inference.

## Stable HTTP 200 response

Exact match:

```json
{
  "status": "matched",
  "practice_name": "Willow Aesthetics",
  "city_state": "Scottsdale, AZ",
  "website": "https://willowaesthetics.com"
}
```

No exact match, invalid/missing input, unavailable source, failed auth or rate limit:

```json
{
  "status": "not_found",
  "practice_name": "",
  "city_state": "",
  "website": ""
}
```

Every `POST` outcome is HTTP 200 and contains exactly these four keys so ManyChat Response Mapping remains stable. Missing fields on a matched canonical row stay empty strings; the endpoint does not fill them by inference.

## ManyChat Response Mapping

| JSON path | Text Custom Field |
|-----------|-------------------|
| `$.status` | `cae_lookup_status` |
| `$.practice_name` | `cae_candidate_name` |
| `$.city_state` | `cae_candidate_city` |
| `$.website` | `cae_candidate_website` |

Branch only on `cae_lookup_status = matched`. `not_found` continues to the existing manual collection branch.

## Private source and projection

The authority chain is:

1. `docs/ssot/data/outreach-username-registries.yaml` identifies the CAESTHETIC private registry.
2. Dropbox `/CAESTHETIC/audience/us-spa-ig-master/CURRENT.json` resolves one immutable `releases/<release_id>/canonical_master.csv` and its deny overlay.
3. Exact normalized-username equality against VDS `data/master/master_companies.csv` may enrich the response with a canonical website or missing practice name.
4. `scripts/caesthetic/sync_instagram_lookup_projection.py` atomically replaces the private RLS table `caesthetic_instagram_lookup_projection`.

The table is a low-latency read projection, not another prospect master or write authority. It is readable only with the service role. Raw usernames and private rows are never committed to git; the adapter emits aggregate counts only.

Conflicting exact source values fail closed to an empty response field. A row absent from the CURRENT release is always `not_found`, even if it appears in a candidate export or another tagged audience.

## Deploy and smoke

Agent API deploy target is `functions`. The hook refreshes the VDS edge runtime, rebuilds the projection from the current private pointers, then verifies one private exact `matched` row and one guaranteed `not_found` row against the live URL. The smoke uses `CAESTHETIC_IG_LOOKUP_TOKEN` without printing the token or username.
