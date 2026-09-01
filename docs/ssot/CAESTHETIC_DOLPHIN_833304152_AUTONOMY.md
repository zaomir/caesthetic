# CAESTHETIC Dolphin `833304152` autonomy

**Status:** ACTIVE SSOT  
**Effective:** 2026-08-31  
**Authority:** founder directives “отмени все запреты” + “InMail нужно как можно больше” + `DEC-870` + `DEC-871` + `DEC-872`  
**Runtime:** `zaomir/grainee-v2` → VPS2402 → Dolphin profile `833304152`  
**Volume parent:** `docs/ssot/OUTBOUND_VOLUME_AND_LIMIT_GOVERNANCE.md`

## 1. Decision

Routine, evidence-bounded social actions for the CAESTHETIC identities inside Dolphin profile `833304152` no longer require per-action owner approval.

The runtime may autonomously execute, verify and log:

- LinkedIn notification and inbox triage;
- replies to verified inbound LinkedIn messages within the approved reply boundary;
- relevant LinkedIn comments;
- Sales Navigator saves;
- exact-role qualification of accepted Sales Navigator saves into the protected CAESTHETIC InMail queue;
- eligible connection requests;
- triggered LinkedIn DMs and protected-queue InMail;
- Facebook notification and Messenger triage, reactions, comments and verified replies where the adapter can confirm the latest inbound message and the accepted outgoing state;
- `@caesthetic.growth` story views, likes, follows, follow-backs, follow-back thank-you messages and fact-gated comments;
- publication of content that has passed the project evidence, claims, rights and identity gates;
- TikTok inbox/comment triage and write actions when a verified adapter and an eligible asset or inbound target exist.

Zero caps and blanket `observe`, `owner_review`, `human_publish`, `invite-cap` or `read-only` defaults do not apply to routine actions that the executable production manifest and verified adapter authorize for this profile.

This does **not** make raw activity volume the objective. The objective is maximum qualified commercial throughput under evidence, suppression, identity, platform-state, downstream-capacity and accepted-state gates.

## 2. Limit semantics

Limits are controls, not approval gates and not quotas. Unless current official platform documentation or live account state supports a number, it is an **internal** ceiling rather than a platform limit.

The effective value is determined in this order:

```text
live platform/account stop or entitlement
→ active runtime guard
→ executable manifest binding
→ documented provisional ceiling
```

A higher stale manifest value never overrides a lower active runtime guard. `0` actions is correct when there is no qualified opportunity.

## 3. Canonical effective limits and policies

| Action class | Canonical effective policy | Limit class | Interpretation |
|---|---|---|---|
| LinkedIn inbound replies | no numeric count cap | verified-inbound policy | Process all verified unread threads. Acknowledgements may need no reply. Substantive commercial, pricing, complaint, legal, medical, mandate or scope-changing replies escalate to a named human owner. The manifest value `linkedin_replies=20` is legacy/non-binding and must not be reported as an effective limit. |
| Protected InMail | no internal daily / weekly / monthly count cap | platform entitlement + qualification + time budget | Drain every qualified protected-queue row until live InMail credits, platform stop, challenge/login/identity failure, empty qualified inventory or the pulse wall-clock budget ends. The next pulse continues. `DEC-870` is binding. |
| LinkedIn comments | up to `7/day` | provisional public-action risk ceiling | Maximum, not target. Use only relevant fresh-author inventory; thin qualified inventory correctly produces fewer or zero comments. No increase is approved by this review. |
| Sales Navigator saves | up to `25/day` | research/downstream-capacity ceiling | Private research throughput. Accepted saves now feed the qualification pipeline; the save itself is still not send authority. |
| Connection requests | up to `5/day`, `25/week`, maximum `2/tick` | provisional public-action risk ceiling | Warm/relevant candidates only. Review acceptance, replies, ignored invitations, warnings and qualified dialogue before any increase. These are internal values, not claimed LinkedIn limits. |
| Standalone LinkedIn DM | manifest contains `2/day`, `10/week`; no active standalone cold-DM worker consumes them | legacy/reserved, non-binding | Do not report these values as live throughput. Triggered follow-up and one-unanswered-message rules remain. Remove or reclassify the fields before activating a standalone DM campaign. |
| Facebook reactions/comments | up to `5/day` in the full runner | experimental public-engagement ceiling | Not a quota. Generic feed activity without relevance evidence may correctly be `0`; no increase is approved. |
| Instagram story views | guarded AM+PM maximum `20/weekday` when both idle slots run | bounded maintenance ceiling | Not a KPI or quota. The session skips when LinkedIn/InMail owns the profile lease. |
| Instagram likes | guarded AM+PM maximum `7/weekday` when both idle slots run | bounded maintenance ceiling | Not a KPI or quota. |
| Instagram outbound follows | guarded maximum `2/weekday` | effective runtime ceiling | The active guard is the reporting truth. The manifest value `5` is stale/non-effective until harmonized. |
| Instagram follow-backs | guarded maximum `2/weekday` | effective runtime ceiling | The active guard is the reporting truth. The manifest value `5` is stale/non-effective until harmonized. |
| Instagram fact-gated comments | guarded maximum `2/weekday` | effective runtime ceiling | The active guard is the reporting truth. The manifest value `3` is stale/non-effective until harmonized. |
| Approved content publishing | `2/run` | batch cap | Publish only approved due content. This is not a requirement to create filler or publish twice. |
| Work window / pulse | weekdays `09:00–17:00 America/New_York`; randomized every `150–210 min` | schedule/time budget | Founder cadence from `DEC-872`. The daemon randomizes `9000–12600` seconds after each completed tick; it is not a fixed cron. |

For InMail specifically, old `2/day`, `10/week`, `50/month` values are superseded. They were internal conservative defaults, not LinkedIn limits. InMail throughput must maximize use of the account's actual available credits while preserving recipient qualification, suppression, idempotency, evidence and accepted-state verification.

## 4. Saved lead → qualified protected queue

Accepted Sales Navigator saves now feed a persistent qualification backlog. A saved name alone is never send authority.

The executable path is:

```text
accepted Sales Navigator save
→ exact person match
→ current decision-role verification
→ US-location verification
→ aesthetic-practice relevance verification
→ exact LinkedIn /in/ profile resolution
→ local + available master suppression checks
→ deterministic first-touch Growth Score copy
→ protected InMail queue
→ DEC-870 InMail drain
```

A row is not added when identity is ambiguous, the decision role cannot be verified, the practice/aesthetics relevance is insufficient, US location cannot be verified, the `/in/` profile cannot be resolved or suppression is hit.

Protected host-only state:

- `/var/lib/social-fleet/protected/caesthetic-sn-qualification-backlog.json` — saved-lead backlog and qualification state;
- `/var/lib/social-fleet/protected/caesthetic-linkedin-suppression.json` — CAESTHETIC LinkedIn channel suppression registry;
- `/var/lib/social-fleet/protected/caesthetic-inmail-production-queue.json` — send-capable qualified rows.

Names, profile URLs and message copy in these files remain private and must not be committed or emitted into public evidence. Reports expose counts, hashed references and stop reasons only.

The deterministic initial InMail uses only verified role/company context, offers the free human-verified Growth Score and one CTA, and does not diagnose a leak or promise ranking, patients, revenue, ROI or growth.

## 5. Non-negotiable stops

The following are not removable marketing restrictions; they are account, evidence and identity integrity controls:

- stop on CAPTCHA, checkpoint, challenge, restriction banner, `429`, `999`, suspicious-activity signal, login loss or identity mismatch;
- never bypass a platform limit or security control;
- never report a click as an action unless the accepted state is verified;
- never invent recipients, evidence, current roles, messages, claims, clients or results;
- respect suppression, idempotency and one-unanswered-message rules;
- no cold outreach to consumer patients and no patient/clinical advice;
- preserve project-origin isolation: CAESTHETIC, Toxifillers and other identities must not share narratives or claims;
- no unsupported growth, ranking, patient, revenue or ROI promises;
- public review activity must not use review gating or selective routing.

A low internal count does not by itself make browser automation compliant with current platform terms. Channel authorization, approved adapter architecture and platform policy remain separate gates.

When a verified adapter is unavailable, the action is permitted by project policy but remains fail-closed technically until verification exists. `Insufficient evidence / Not assessed` is preferred to an unverified write.

## 6. Execution ownership

- `social-fleet.service` owns the normal LinkedIn/Facebook cycle and profile lease.
- CAESTHETIC Instagram coverage timers use bounded idle sessions and yield immediately when LinkedIn/InMail holds the shared profile lease.
- the pulse handles verified inbound first, then saved-lead qualification, then protected InMail drain;
- protected InMail is resolved only from `/var/lib/social-fleet/protected/caesthetic-inmail-production-queue.json`;
- the autonomous InMail worker may send every qualified row available in the pulse; no caller may inject recipient/copy directly into the worker;
- every InMail row still requires `project_origin=caesthetic`, current-role evidence bound to the same candidate, `suppression_checked=true`, valid `approved_subject` + `approved_body`, and stable idempotency;
- live InMail credit availability is checked during execution when the adapter exposes it; a zero-credit state ends the drain without being treated as a marketing failure;
- every write must produce local evidence and append/project an accepted-state event where supported.

## 7. Remaining runtime harmonization

The remaining non-blocking cleanup is:

1. remove or mark non-binding the dead `linkedin_replies=20` and standalone-DM `2/day`, `10/week` fields;
2. align Instagram manifest values with the active guarded runtime or move them into one executable source of truth;
3. expose `limit_class` and precise stop reason consistently in every fleet evidence event;
4. measure saved-lead → qualified-candidate → protected-queue → sent → reply conversion over the 7-day / 28-day evidence windows before considering higher research/public-action ceilings.

## 8. Acceptance

The autonomy decision is implemented only when:

1. production config contains no artificial InMail `2/day`, `10/week`, `50/month` execution cap;
2. the autonomous pulse runs on randomized `150–210 minute` cadence inside the approved work window;
3. recent accepted Sales Navigator saves are automatically ingested into the qualification backlog;
4. only evidence-qualified, suppression-clear saved leads reach the protected InMail queue;
5. the autonomous pulse drains qualified protected InMail rows until live credits/platform state/time budget stops it;
6. invite-cap is disabled for eligible connections;
7. inbound LinkedIn reply, saved-lead qualification and protected InMail workers are part of the live cycle;
8. Facebook engagement and approved-content workers are part of the live cycle;
9. CAESTHETIC Instagram coverage timers remain enabled with fact-gated comment sending and yield to LinkedIn/InMail;
10. deployment evidence records the deployed SHA and active services/timers plus the qualification-only production pass result;
11. a production smoke ends in a verified terminal state or names a real platform blocker;
12. canonical reporting distinguishes effective runtime values from stale or non-binding manifest fields.
