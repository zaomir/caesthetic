# First-cohort checklist — trust / copy lane

Use with Lane A (qualification / CURRENT) and email deliverability GO. This file does not authorize sends.

**Cold IG DM:** OFF  
**LinkedIn identity:** leave unchanged until OPEN_DECISION closes. First cohort can run **without** LinkedIn ABM.

---

## A. Activation-ready accounts (inputs from other lanes)

- [ ] Account passed DEC-845 qualification (US, patient-facing, independent/local, website, owner/decision-maker)
- [ ] Tier A or B with a current signal (or explicit city-context fallback documented)
- [ ] One opening narrative marker stored (one signal class)
- [ ] Owner/practice email verified (EmailVerifier)
- [ ] Suppression / conflict / do-not-contact clear
- [ ] `{{verifiedSignal}}` filled from the opening library — not a leak line
- [ ] Instantly custom fields mapped (`firstName`, `practiceName`, `city`, `state`, `verifiedSignal`, `verifiedSignal2`, `scoreUrl`)

If any box is empty, the row is not in the first cohort.

---

## B. Sequence

- [ ] Instantly campaign `cae_first_lead_seq_v1` loaded from `docs/copy/caesthetic/en/first-lead/email-3touch.md`
- [ ] Touch URLs use UTM `email / outbound / first_lead / seq_t1|t2|t3`
- [ ] Stop-on-reply enabled
- [ ] Named Unibox owner + same-business-day SLA
- [ ] Reply playbook open beside the inbox
- [ ] Native Instantly unsubscribe footer on
- [ ] No attachment, no calendar, no Sprint price in the three touches
- [ ] Founder Instantly GO + deliverability acceptance already recorded (not this lane)

---

## C. Trust surfaces (this lane’s audit)

- [x] `@caesthetic.growth` display name is Score-led
- [x] Bio link resolves to `/growth-score/` with IG UTMs (HTTP 200)
- [ ] Founder/external: consider canonical emoji-free US bio (not applied here)
- [ ] Founder/external: rename highlight **PAY** (not applied here)
- [x] Site home + `/growth-score/` CTA = Growth Score, not Sprint checkout
- [x] Cold DM remains off
- [x] LinkedIn excluded from first-cohort trust check until identity decision
- [ ] ManyChat live comment→DM→Score test (optional for first email/partner leads; copy is packed)

---

## D. Score request

- [ ] Operator can paste the correct tagged URL in a reply in under a minute
- [ ] Intake records UTM on the lead
- [ ] Capacity stated: 2–3 human-approved Scores / week until measured
- [ ] No mini-audit sent to “earn” the request
- [ ] Sprint discussed only after Score, as written scope, not as the opening offer

---

## E. Partners (parallel, not a send blocker)

- [ ] First 10–20 warm partner names are a founder list (this pack does not invent them)
- [ ] One-pager + intro copy ready
- [ ] Partner URLs use `utm_source=partner`
- [ ] No unapproved revenue share in the intro

---

## Go / no-go for copy lane

Copy lane is **GO** for loading the Instantly sequence and using reply/partner/ManyChat words.

Copy lane is **NO-GO** for:

- sending without qualification + deliverability GO
- LinkedIn profile edits
- enabling cold DMs
- turning on ManyChat AI Replies
