# CAESTHETIC Dolphin `833304152` autonomy

**Status:** ACTIVE SSOT  
**Effective:** 2026-08-31  
**Authority:** founder directive “отмени все запреты”  
**Runtime:** `zaomir/grainee-v2` → VPS2402 → Dolphin profile `833304152`

## 1. Decision

Routine, evidence-bounded social actions for the CAESTHETIC identities inside Dolphin profile `833304152` no longer require per-action owner approval.

The runtime may autonomously execute, verify and log:

- LinkedIn notification and inbox triage;
- replies to verified inbound LinkedIn messages;
- relevant LinkedIn comments;
- Sales Navigator saves;
- eligible connection requests;
- triggered LinkedIn DMs and protected-queue InMail;
- Facebook notification and Messenger triage, reactions, comments and verified replies where the adapter can confirm the latest inbound message and the accepted outgoing state;
- `@caesthetic.growth` story views, likes, follows, follow-backs, follow-back thank-you messages and fact-gated comments;
- publication of content that has passed the project evidence, claims, rights and identity gates;
- TikTok inbox/comment triage and write actions when a verified adapter and an eligible asset or inbound target exist.

Zero caps and blanket `observe`, `owner_review`, `human_publish`, `invite-cap` or `read-only` defaults do not apply to these routine actions for this profile when the executable production manifest authorizes the action.

## 2. Production limits

Limits are risk controls, not approval gates. The executable production manifest controls the active values. Initial operating caps are:

- LinkedIn comments: `7/day`;
- Sales Navigator saves: `25/day`;
- connection requests: `5/day`, `25/week`;
- LinkedIn DM: `2/day`, `10/week`;
- InMail: `2/day`, `10/week`, `50/month`;
- Facebook meaningful reactions/comments: `5/day`;
- Instagram outbound follows: `5/day`;
- Instagram follow-backs: `5/day`;
- Instagram fact-gated comments: `3/day` across the AM/PM sessions;
- approved browser-published content: `2/run`.

Caps may be reduced automatically by platform state or recent action history. They must not be raised by bypassing platform controls.

## 3. Non-negotiable stops

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

When a verified adapter is unavailable, the action is permitted by policy but remains fail-closed technically until verification exists. `Insufficient evidence / Not assessed` is preferred to an unverified write.

## 4. Execution ownership

- `social-fleet.service` owns the normal LinkedIn/Facebook cycle and profile lease.
- CAESTHETIC Instagram coverage timers own the bounded Instagram sessions and must pause/restore `social-fleet.service` to prevent profile overlap.
- protected InMail is resolved only from `/var/lib/social-fleet/protected/caesthetic-inmail-production-queue.json`.
- every write must produce local evidence and append/project an accepted-state event where supported.

## 5. Acceptance

This decision is implemented only when:

1. production config has non-zero authorized caps;
2. invite-cap is disabled for eligible connections;
3. inbound LinkedIn reply and protected InMail workers are part of the live cycle;
4. Facebook engagement and approved-content workers are part of the live cycle;
5. CAESTHETIC Instagram coverage timers are enabled with fact-gated comment sending;
6. deployment evidence records the deployed SHA and active services/timers;
7. a production smoke ends in a verified terminal state or names a real platform blocker.
