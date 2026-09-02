---
owner: CAESTHETIC / Platform
status: active
version: 1.0
updated: 2026-09-02
scope: allowlisted publication of approved Growth Score packages from zaomir/caesthetic
parent: docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
decision: DEC-829
---

# CAESTHETIC Growth Score Publish Control Plane

## Outcome

An agent with GitHub write access only to public satellite `zaomir/caesthetic` can request publication of an approved `single_location` or `multi_location` Growth Score. The request does not grant repository, deploy, server or Cloudflare credentials. `zaomir/grainee-v2/main` remains the only production source.

```text
satellite approved artifact @ exact SHA
→ VPS2402 DEC-829 poller
→ fail-closed canonical validation + canonical render
→ allowlisted grainee-v2 paths only
→ grainee-v2/main commit
→ VPS2402 origin + Cloudflare Worker deploy
→ exact live smoke
→ durable result committed to satellite
```

No paid GitHub Actions are used by the steady-state publication path. The existing VPS2402 systemd timer owns polling, locking and deploy serialization.

## Agent contract

Working directory: the root of `zaomir/caesthetic` on `main`.

1. Complete the production SOP through named-human approval. The final artifact must be an `approved_report` record whose embedded `report_json` is schema v5, template `growth-score-report-template/5.2.0`, contains exactly one Primary plus two Supporting Gaps and has an approved Journey Graph review.
2. Create one request directory:
   `docs/projects/caesthetic/publish-growth-score/artifacts/<request_id>/`.
3. Put `package.json` and one approved-report JSON there for a single-location audit, or exactly two approved-report JSON files (`network_parent` and `focus_location`) for Multi-Location.
4. Seal the digests:

   `node scripts/caesthetic/publish-growth-score-control-plane.mjs seal --satellite . --package docs/projects/caesthetic/publish-growth-score/artifacts/<request_id>/package.json`

5. Commit and push the sealed artifact to `zaomir/caesthetic/main`.
6. Create the pinned request from that exact remote SHA:

   `node scripts/caesthetic/publish-growth-score-control-plane.mjs request --satellite . --package docs/projects/caesthetic/publish-growth-score/artifacts/<request_id>/package.json`

7. Commit and push the generated file under `.../requests/<request_id>.json` to satellite `main`.
8. Read `.../results/<request_id>.json`. Success is only `status=success` with `canonical_imported_sha`, `deployed_sha`, exact `live_urls` and `smoke.ok=true`.

The stable `request_id` format is `publish-growth-score-<slug>` and is the idempotency key. Never edit or reuse it for a different payload. A correction uses a new ID and `operation=republish`.

## Package contract

Common fields:

```json
{
  "contract_version": "caesthetic-growth-score-publish/1.0",
  "request_id": "publish-growth-score-example-20260902",
  "operation": "create",
  "audit_format": "single_location",
  "visibility": "synthetic",
  "project_id": "synthetic-example-20260902",
  "access_group_id": null,
  "reports": [
    {
      "role": "single_location",
      "slug": "demo-example-publication",
      "approval_path": "docs/projects/caesthetic/publish-growth-score/artifacts/publish-growth-score-example-20260902/approved-report.json",
      "approval_sha256": "filled-by-seal"
    }
  ]
}
```

Multi-Location uses `audit_format=multi_location` and exactly two entries. Their roles are `network_parent` and `focus_location`; routes must exactly match both reports' `audit.parent_route` / `audit.child_route`. The parent and child must share `project_id`, `access_group_id`, ordered Top 3, binding constraint and Do Not Fund Yet. The package is imported atomically.

Synthetic publication requires `visibility=synthetic`, `reportKind=demo`, a `demo-` parent slug and an explicit fictional/no-client disclosure. Its package-level `access_group_id` is null; a Multi-Location report may retain its non-secret internal package grouping ID. Private publication requires `visibility=private`, `reportKind=real`, an unguessable parent slug ending in at least 16 hex characters, and a pre-provisioned `access_group_id` in the protected runtime. Passwords and hashes never enter Git.

## Security boundary

- Source is read with `git show` from the exact 40-character satellite SHA; the SHA must be on satellite `main`.
- Package and approval files are pinned by SHA-256. Renderer/engine/template files must match canonical grainee-v2 byte-for-byte or publication stops with `renderer_drift`.
- Drafts, unnamed/invalid human approval, schema v4, unapproved Journey Graph, missing Top 3, demo-to-real conversion and public real-client spoofing are rejected.
- Secret-like keys, known credential patterns and credential-bearing URLs are rejected before import.
- The request cannot contain commands, scripts, shell, SSH or arbitrary destination paths.
- Destination paths are computed only from validated slugs. The bridge writes report JSON/HTML, generated catalog files, the protected-path registry for private packages and its own audit record. It cannot copy arbitrary satellite files.
- DEC-829 treats the renderer, validation, bridge, deploy and timer files as grainee-authoritative: a satellite-only edit or deletion is overwritten from grainee and can never become production code through ordinary mirroring. The satellite's writable publication input is limited to the artifact/request namespace.
- Client HTML is rendered only by the canonical renderer and is checked for noindex, review anchors, reviewer/selector names and walkthrough cards/URLs.
- Real routes fail closed unless their server-side access group already exists. Production smoke requires unauthenticated gate, wrong-password rejection and authenticated session/report checks; the smoke password is supplied only from the root-owned VPS environment.
- One systemd service lock serializes mirror/import/deploy. A request ID cannot be reused with different source SHA or digest.

## Durable result

The result records source satellite SHA, package digest, canonical imported SHA, deployed SHA, exact live URLs, per-route smoke, validation status and any terminal error. `success` is never written before live smoke passes.
