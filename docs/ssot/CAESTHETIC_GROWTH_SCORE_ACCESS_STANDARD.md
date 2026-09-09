---
owner: CAESTHETIC / Platform
status: active
version: 1.1
created: 2026-09-03
updated: 2026-09-09
scope: client access policy and hosted Russian manager-review delivery for CAESTHETIC Growth Score reports
supersedes_access_rules_in:
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
  - docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md
---

# CAESTHETIC Growth Score Access Standard

## Canonical decision

Every **real client Growth Score report** on `caesthetic.com/score/` uses only a **simple four-digit PIN**.

Client-facing access contract:

- exactly 4 numeric digits (`0000`–`9999`);
- no username;
- no email/login flow;
- no client account;
- no manually provisioned access group;
- no second factor;
- no additional client authentication layer.

Synthetic demo reports remain public and are not client reports.

## Runtime implementation

The PIN itself must not be committed to Git. Git may contain only the non-secret `pinSalt` and SHA-256 `pinHash` needed by the runtime. Because a four-digit PIN has only 10,000 possibilities, this mechanism is intentionally low-security and is used only because the founder explicitly selected convenience over stronger access control.

The existing Worker may keep an **internal route key** and a short-lived secure cookie only as implementation details so the user does not need to re-enter the PIN on every request. These are not operator-facing access groups and require no manual provisioning.

The public UX is always:

`report URL → 4-digit PIN form → report`

## Publishing rule

For every private/real package:

1. Generate a random four-digit PIN.
2. Store the plaintext PIN only in the delivery context shown to the manager/client.
3. Store `pin_salt` + `pin_hash = sha256(pin_salt + ':' + PIN)` in the publication package or protected-route manifest.
4. Runtime derives any internal access/session material automatically.
5. Publication must not block on a pre-provisioned `access_group_id` secret.
6. Production smoke must verify gate → wrong PIN rejection → correct PIN → report.

## Route policy

An unguessable route is no longer an authentication requirement. Existing opaque slugs may remain for continuity, but a real report is considered protected by the four-digit PIN, not by obscurity.

`noindex` remains an indexing/privacy directive, not an authentication layer, and stays enabled for client reports.

## Migration

Legacy real reports must move to this PIN-only contract when touched or republished. New real reports use this standard immediately.

When this file conflicts with older access-group, unguessable-route or manual-provisioning language in the Production SOP or Publish Control Plane, **this file wins for access policy**.

## Russian manager-review publication

Owner instruction, 2026-09-09T15:08:36Z: **русскую версию для проверки всегда размещать как страницу и давать ссылку**. A GitHub Markdown link, chat document, file export or planned URL is not the requested review page.

Before asking the named manager to review a Russian audit, deploy its actual rendered Russian version under `https://caesthetic.com/score/`, provide its working URL and four-digit PIN, and retain source revision, deployed SHA, page/access smoke and viewport evidence. Reuse the v6 presentation for a single location; preserve network/focus context and shared decisions for Multi-Location. A page is ready only after its exact content opens through the access path. Never return a future or unchecked URL as completed delivery.

This is an **internal review publication**, not approval or client delivery. The page must visibly retain `manager_review`, unverified facts, unfilled priority slots and eligibility limitations. Hosting the Russian draft must not require or fabricate the diagnostic approval that the page exists to obtain. Unsupported verticals, such as the existing ENT pilot, may be reviewed internally with those limitations; they do not thereby enter the approved vertical enum, frozen fact set, completed catalog or final client publication pipeline. Final evidence, focus, translation and client-release gates remain unchanged.

Use server-side PIN protection, noindex/no-store, no public catalog/sitemap listing and the existing canonical deploy workflow. `docs/caesthetic/design/review-pages.json` is a registration extension of the same design contract, not another design system or an exception list. Every registered review page is subject to the normal token, spacing, asset and browser checks; its bytes are included in release identity. Never solve publication failure by disabling the design or access gates.
