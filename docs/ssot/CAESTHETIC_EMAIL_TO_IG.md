---
document_id: ENT-DOC-CAE-EMAIL-TO-IG
title: CAESTHETIC Email → Instagram sequencing (Phase-1)
status: canonical-draft
authority: CAESTHETIC / marketing
owner: Marketing / platform
created: 2026-08-14
last_reviewed: 2026-08-14
related:
  - docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md
  - docs/ssot/CAESTHETIC_IG_REACH_PLAYBOOK.md
  - docs/ssot/CAESTHETIC_IG_CONTENT_PLACEMENT.md
  - docs/ssot/CAESTHETIC_AUDIENCE_LISTS.md
  - docs/ssot/OUTREACH_SELECTIONS.md
  - docs/ssot/SOCIAL_ADAPTER_INSTAGRAM.md
  - docs/ssot/SOCIAL_INBOUND_INVITE_FOLLOWUP.md
  - docs/founder-notes/DEC-823.md
  - docs/founder-notes/DEC-824.md
  - docs/ssot/EMAILVERIFIER_IO.md
  - docs/ssot/MASTER_CONTACTS.md
---

# CAESTHETIC — Email → Instagram sequencing (Phase-1)

## 0. Decision

Instagram alone cannot cover ~1,400 Phase-1 handles at follow pace. **Email carries volume; Instagram carries familiarity and trust.**  

Sequence for one practice:

```text
Day 0  IG touch (story-view ± like) on @caesthetic.growth
Day 1–2  optional second soft IG touch if Tier A
Day 2    Email #1 (Instantly) — observation + one question + Score CTA
Day 5    Email #2 — different angle / one diagnostic fact
Day 9    Email #3 — soft break-up / leave door open
Anytime  if they follow-back → thanks DM (no link); if they reply email → human
```

Cold DM on Instagram remains **off**. Thanks DM after follow-back remains **on** (DEC-823).

This document is the SSOT for the Email→IG lane. It does **not** unlock Instantly send without founder GO + deliverability check.

## 1. Jobs of each channel

| Channel | Job | Not the job |
|---------|-----|-------------|
| Instagram coverage | Be seen; create name familiarity | Clear 1,400 with follows |
| Instagram feed/Reels/Stories | Teach category + Score; earn saves | Hard sell Sprint in first touch |
| Email (Instantly) | Volume outreach with owner/practice email | Replace IG trust surface |
| Meta ads | Later retargeting / reach (needs Pixel) | Not this week without DEC + Pixel ID |

## 2. Universe and identity

- IG queue: `sel_cae_medspa_ig_v1` / Dolphin coverage queue (~1431 after deny). Pointers: `CAESTHETIC_AUDIENCE_LISTS.md`, `cae_ig_task814_harvest_agent_card_2026-08-14.md`.
- Email universe: only rows with **verified owner/practice email** after enrichment. Username alone is not an email.
- One company = one opening narrative (MARKETING_SYSTEM_STANDARD).
- Tag contacts: `cae_ig_audience`, `sel_cae_medspa_ig_v1`, `not_supply_eligible` until Stage 4.

## 3. Prerequisites before first Instantly send

1. Founder **GO** for Instantly volume (DEC-824 deferred email to 2026-08-14 reminder).
2. Mailboxes on `caesthetic.co` warmed and deliverability checked.
3. Enrichment: handle → practice/owner email (manual research, site contact, GBP, or approved enrichment tool). **Do not invent emails.**
4. Verify every address via EmailVerifier.io SSOT before Instantly.
5. Suppression: do_not_contact, prior Toxifillers product narrative, stop/complaint, CURRENT deny overlay.
6. Conflict: no Instantly + aggressive IG write on same company same hour.
7. Pixel/ads are **separate** — empty `metaPixelId` blocks ad attribution; do not wait on Pixel to start email after GO.

## 4. Enrichment pipeline (handle → email)

```text
private IG master / masters tagged sel_cae_medspa_ig_v1
  → research owner/practice email (public sources only)
  → write to staging (Dropbox / private sheet / master_contacts)
  → EmailVerifier.io
  → Instantly list (verified only)
```

Privacy: no username/email CSVs in git. Dropbox under `CAESTHETIC/audience/`.

Minimum fields for Instantly row: `email`, `first_name` (or practice), `city`, `state`, `instagram_username` (custom), `narrative=MEDSPA_GROWTH` or `GROWTH_SCORE`.

## 5. Email copy rules (plain text)

- Subject: observation or question — not “Free Growth Score!!!”.
- Body: 4–7 short lines. One fact. One question. One CTA to Growth Score URL.
- No Toxifillers / grey SKU. No fabricated case studies.
- Personalisation from public IG/GBP/site only.
- Same company never gets identical opening twice.

Example skeleton (EN):

```text
Subject: {{city}} med spa — response window?

{{first_name}} —

I looked at how independent aesthetic practices in {{city}} lose demand between Google, site, social and reviews — not from lack of ads.

Quick question: when a high-ticket enquiry hits after hours, who owns the first reply?

If useful, I can run a free Growth Score (human-verified, four surfaces) and send a short walkthrough:
{{score_url}}

— Valerie / CAESTHETIC
```

## 6. Instagram side of the sequence

| When | Action | Cap / rule |
|------|--------|------------|
| Day 0 | Story-view (± like if recent post) | Coverage runner caps |
| Day 0–1 | Do **not** cold DM | DEC-823 |
| If follow-back | Thanks DM, no link | DEC-823 |
| During email window | Keep publishing Score/diagnostic content | Calendar |
| If email reply | Stop Instantly sequence; human reply; optional Score | |

Do not require email enrichment before continuing IG coverage. Coverage and email enrich in parallel after GO.

## 7. KPI

Primary:
- verified emails enriched / week
- Instantly delivers + replies
- Score starts attributed to email UTM
- IG profile visits in same week as email open (directional)

Secondary:
- follow-backs among emailed cohort
- unsubscribe / bounce (must stay healthy)

## 8. Forbidden

- Upload IG handles alone to Meta Custom Audiences (Meta matches email/phone; handles do not work; purchased-list upload forbidden in CAESTHETIC SSOT).
- Buy followers, fake views, engagement pods, or gray “boost” farms.
- Cold DM the queue to “warm email”.
- Same Instantly blast copy to all cities.
- Sending before EmailVerifier pass.

## 9. Action plan (short)

1. Founder GO Instantly + confirm deliverability on 8× `caesthetic.co` mailboxes.
2. Enrich top Tier A / TASK-814 strong (~200–400) handle→email; verify.
3. Build Instantly 3-touch sequence + UTMs to Growth Score.
4. Keep Dolphin coverage AM/PM running (familiarity before/during email).
5. Measure replies + Score starts for 14 days; then expand enrichment.

## 10. Related ops

- Placement + amplification: `docs/ssot/CAESTHETIC_IG_CONTENT_PLACEMENT.md`
- Reach playbook: `docs/ssot/CAESTHETIC_IG_REACH_PLAYBOOK.md`
- Coverage timers: `docs/ssot/reports/cae_ig_coverage_ops_2026-08-14.md`
- Reel library: `CAESTHETIC_OWNER_MARKETING_QUESTIONS.md` §8
- HeyGen combine: `CAESTHETIC_HEYGEN_PRODUCTION_SYSTEM.md`
- Pricing/Score URL: site-caesthetic pricing module / live site — never invent price in email
