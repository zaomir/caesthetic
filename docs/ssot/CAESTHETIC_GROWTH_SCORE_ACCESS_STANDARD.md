---
owner: CAESTHETIC / Platform
status: active
version: 1.0
created: 2026-09-03
updated: 2026-09-03
scope: client access policy for real CAESTHETIC Growth Score reports
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
