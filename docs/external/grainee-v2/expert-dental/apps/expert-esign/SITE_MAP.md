---
owner: RAIMOV healthcare + Engineering
status: test-runtime
project: Expert Dental e-sign
updated: 2026-09-04
standard: docs/ssot/WEBSITE_STUDIO_STANDARD.md
---

# SITE_MAP — Expert Dental e-sign TEST

| URL | Purpose | Audience | Proof | Primary action | Indexing |
|---|---|---|---|---|---|
| `/esign/` | Staff and managed-iPad test shell | Clinic staff | Authenticated runtime state | Sign in / open synthetic workflow | noindex |
| `/esign/healthz` | Deployment and fail-closed status | Operations | SHA, mode, providers, storage | Inspect only | noindex |
| `/esign/api/*` | Authenticated application API | Clinic staff/runtime | Server validation and audit | Workflow-specific | noindex |
| `/esign/webhooks/:provider` | Signed provider event ingress | Provider runtime | HMAC/vendor verification and idempotency | Event receipt | noindex |

## Internal linking

The application shell is the only human entry point. Health, API, signing-code
and webhook routes are not navigation pages and are not linked for discovery.

## Redirects

| From | To | Status | Reason |
|---|---|---:|---|
| `/esign` | `/esign/` | 308 | Canonical trailing-slash application path |

## Excluded routes

- No public marketing, SEO or patient-acquisition pages.
- No directory listing, public evidence export or provider console.
- Real-patient and `IN_USE` form routes remain unavailable.
