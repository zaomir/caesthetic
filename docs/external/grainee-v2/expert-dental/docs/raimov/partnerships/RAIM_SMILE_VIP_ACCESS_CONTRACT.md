---
title: RAIM SMILE — phone-key VIP access and UX contract
status: OWNER_APPROVED_UX_CONTRACT / RUNTIME_NOT_IMPLEMENTED
version: 1.0
created: 2026-08-29
last_updated: 2026-08-29
owner: CAESTHETIC partnership operations
security_privacy_owner: to be named before implementation
decision: docs/founder-notes/DEC-862_raim-smile-caesthetic-partnership-economics-and-vip-access.md
target_surface: separate neutral VIP access route on raimsmile.com
---

# RAIM SMILE — VIP access contract

## 1. User promise and boundary

The future VIP access surface is a fast way for an eligible person under stress to reach a non-clinical coordinator. It is not login to a patient portal, identity authentication, medical triage or proof of entitlement to treatment.

**Phone number = eligibility key, not a password.**

Owner decision: no OTP on the first step. After Call/WhatsApp contact begins, the coordinator continues identity and eligibility checks through the approved operating procedure before disclosing personal, partner, plan, family or medical information.

This document specifies a future runtime contract only. No route, registry or contact CTA is implemented by accepting it.

## 2. Minimal UX

The page asks for one field only:

- telephone number.

Do not ask for name, partner, membership number, plan, symptoms, diagnosis, family member or medical operator.

When a normalized phone key matches an `active`, unexpired and non-revoked VIP registry record, show only two primary actions:

1. **Call coordinator**;
2. **WhatsApp coordinator**.

The unlocked view must not show:

- person/member name;
- partner name or logo;
- plan, clinical tier, diagnosis, symptoms or treatment;
- family members or household data;
- registry dates/status;
- medical operator identity/details beyond a generic disclosure that coordination is non-clinical and medical care is provided by a disclosed licensed operator.

The normal clinic route and approved emergency guidance remain reachable outside the VIP gate on every state. VIP access must never replace emergency services or promise a doctor response.

## 3. Neutral failure behavior

Invalid, non-matching, expired, revoked and rate-limited attempts must not confirm whether a person or phone exists in the registry.

Use one neutral response family, one HTTP status policy and materially uniform response timing/length. Example meaning, subject to final copy review:

> Мы не можем подтвердить VIP-доступ на этом шаге. Проверьте номер или используйте обычный маршрут клиники. При неотложной ситуации воспользуйтесь указанным экстренным маршрутом.

Do not display `not found`, `expired`, partner name, masked identity or account-status hints. Client-side code must not receive the registry record or a distinguishable mismatch reason.

## 4. Lookup and registry contract

Input processing is server-side:

1. parse with a maintained phone-number library;
2. normalize to canonical E.164;
3. reject invalid/ambiguous input through neutral behavior;
4. compute `lookup_key = HMAC-SHA-256(environment_secret, normalized_e164)`;
5. compare the HMAC key to an indexed registry field;
6. require `status=active`, `vip_starts_at <= now < vip_expires_at` and `revoked_at=null`;
7. return only a short-lived capability sufficient to render the two approved CTA.

Requirements:

- raw or simply hashed phone numbers are not lookup indexes;
- environment HMAC secret stays outside Git/database and supports controlled rotation;
- raw phone is not written to URL/query string, referrer, analytics, application log or error tracker;
- database access is least-privilege and server-only;
- cache TTL cannot outlive the earliest VIP expiry/revocation check;
- automatic revocation on VIP expiry is required and must work without a manual cleanup job;
- manual revocation invalidates cached capability promptly;
- registry imports are versioned, reconciled and owned; a partner never receives query access.

## 5. Rate limiting and anti-enumeration

Before release, security review must set measured thresholds for:

- per-IP/network attempts;
- per-session/device attempts;
- per-HMAC-key attempts;
- burst and rolling-window limits;
- progressive cooldown/challenge after suspicious activity;
- bot/WAF signals and alerting;
- coordinator contact-capability replay.

Controls must avoid both phone enumeration and denial of service against one VIP number. Success and failure paths use uniform outward behavior; internal alerting may distinguish risk classes without exposing them to the requester.

## 6. Audit and privacy

Append-only security audit records may contain:

- event ID/time;
- privacy-safe HMAC lookup key or separately rotated audit token;
- outcome class (`allowed`, `neutral_denied`, `rate_limited`, `revoked_or_expired`) available only to authorised security/operations users;
- rule/version, coarse risk signal and request correlation ID;
- CTA issued/used and coordinator handoff status;
- revocation/expiry event and owner.

Audit records must not contain raw phone, name, partner, plan, diagnosis, family data, message text or medical narrative. Retention, access, breach response and deletion policy require privacy approval before implementation.

Public analytics may record only non-personal aggregate events such as `vip_access_started`, `vip_access_result_neutral`, `vip_coordinator_call_started` and `vip_coordinator_whatsapp_started`. It must not contain phone/HMAC, partner/member identifiers or success-specific dimensions that enable inference.

## 7. Coordinator handoff and availability language

After contact, the coordinator verifies identity/eligibility using an approved script before disclosing any protected information. The coordinator remains non-clinical and escalates symptoms/emergency language to the approved medical/emergency route.

Public or partner copy may say **after-hours / 24-7 non-clinical VIP coordination** only when staffing, backup, covered-hours schedule, measured response SLA, escalation and operator capacity are operational. It must never say or imply `24/7 medical care`, round-the-clock doctor availability or emergency treatment.

## 8. Release gates and acceptance tests

Runtime release requires all of:

- active registry owner/source, start/expiry/revocation process and reconciliation test;
- privacy/security threat model and counsel-approved disclosure/retention;
- HMAC-secret creation/rotation/revocation runbook;
- unit/integration tests for normalization, invalid numbers, exact active match, expiry, revocation and cache invalidation;
- rate-limit and enumeration resistance tests, including uniform response behavior;
- tests proving no raw phone/PII in URL, HTML, analytics, logs or error payloads;
- CTA allowlist and coordinator-number ownership/availability verification;
- mobile accessibility and emergency/ordinary-clinic route checks;
- staging QA, rollback and explicit runtime release GO.

Until these gates close, status remains `RUNTIME_NOT_IMPLEMENTED`; canonical UX approval is not evidence of a live VIP route.
