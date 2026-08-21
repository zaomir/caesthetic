---
owner: CAESTHETIC
status: active
version: 1.2
updated: 2026-08-14
scope: Growth Score walkthrough speaker, script, scene, approval and lifecycle canon
parent: docs/ssot/CAESTHETIC.md
related:
  - docs/caesthetic/growth_score_spec.md
  - docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md
  - docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md
  - docs/ssot/CAESTHETIC.md
---

# CAESTHETIC — Valerie Growth Score Walkthrough SSOT

This file is the canonical production authority for the human-facing video walkthrough that accompanies an approved CAESTHETIC Growth Score. It is subordinate to `docs/ssot/CAESTHETIC.md`, `docs/caesthetic/growth_score_spec.md` and `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md` and may not override Growth Score evidence, scoring or product rules.

## 1. Purpose

The walkthrough is not a spoken copy of the cockpit and not a generic sales video. It is a personalised owner review that explains, in 3–8 minutes, what is already working, the binding growth constraint, the decisive evidence, the three highest-priority actions, one `Do Not Fund Yet`, and the optional implementation path.

Target owner takeaway:

> I understand what is wrong, I know what to do, and CAESTHETIC already understands the work well enough to make implementation easier.

## 2. Fixed presenter and visual identity

- Presenter: **Valerie Petra**.
- Public role: **CAESTHETIC Growth Advisor**.
- Valerie is always the walkthrough presenter for the US Growth Score flow.
- Visual identity: one consistent premium-office look; do not vary rooms/outfits as a content gimmick.
- Tone: calm expert, precise, non-defensive, non-salesy.
- Language: English only for the US product.
- Video mix target: approximately 20–30% Valerie on screen and 70–80% cockpit/evidence.
- English subtitles are mandatory.
- The free Growth Score walkthrough is a one-time snapshot. A later Sprint/Day-30/monthly review is a new video artifact, not an edit of the original walkthrough.

## 3. Evidence gate

A script may be compiled only from approved state:

- `approved_report`;
- `verified_fact_set`;
- `humanDiagnosis`;
- approved `problem_inventory`;
- approved `remediation_tasks`;
- approved Competitive Decision Analysis, including named-competitor evidence and Market Practice Gap decisions where applicable.

Forbidden as spoken facts:

- AI draft output;
- unverified candidate evidence;
- client self-report presented as verified fact;
- unsupported estimates or causal claims.

If a required variable is unavailable, the sentence must be rewritten or omitted. The system must never invent a substitute fact.

## 4. Spoken-content rules

Valerie must:

1. mention the owner/practice, location and at least one approved clinic-specific detail within the first 20 seconds;
2. begin with a real evidence-backed strength;
3. name all four surfaces once: Search, Website, Social, Reputation;
4. discuss in detail only the strongest and weakest surfaces;
5. explain one binding constraint;
6. use named competitors and state the `Defend / Close / Differentiate / Do not copy` decision when comparison is applicable;
7. include a Market Practice Gap recommendation only when approved evidence supports `Keep / Evaluate / Pilot / Replace / Do not adopt`; never convert public adoption into an unreviewed clinical claim;
8. cover exactly three top priorities;
9. keep implementation guidance short in speech while the cockpit contains the full executable steps;
10. include exactly one `Do Not Fund Yet` recommendation from the approved Score;
11. explicitly state that the owner may implement internally or use another provider;
12. explain why CAESTHETIC is easier/faster because the evidence, sequence, dependencies and acceptance logic are already understood;
13. end on the binding constraint and next action, not on a hard sell.

Valerie must not:

- say the Overall Score aloud;
- read every score sequentially as the main story;
- explain score weights unless needed for a specific objection;
- discuss Mystery Shopper as part of the Free Score; that check may be introduced later only if the client continues and the applicable scope permits it;
- mention the Sprint price in speech; pricing remains on the page and in canonical pricing authority;
- explain or sell Growth System in the Free Score walkthrough;
- promise rankings, patients, bookings or revenue;
- imply that every Score task is included in the 30-Day Sprint;
- imply exclusivity or lock-in;
- use generic hype such as `unlock`, `10x`, `revolutionize`, `secret`, or `game-changing`.

## 5. Master variables

Required/conditional script variables:

```text
[OWNER_FIRST_NAME]
[PRACTICE_NAME]
[CITY]
[STATE]
[OPENING_PERSONAL_DETAIL]

[STRONGEST_SURFACE]
[STRONGEST_FACT_1]
[STRONGEST_FACT_2]
[WEAKEST_SURFACE]
[WEAKEST_FACT_1]
[WEAKEST_FACT_2]

[BINDING_CONSTRAINT]
[BINDING_CONSTRAINT_PLAIN_ENGLISH]

[COMPETITOR_1]
[COMPETITOR_1_EVIDENCE]
[COMPETITOR_2]
[COMPETITOR_2_EVIDENCE]

[DECISIVE_EVIDENCE_1]
[DECISIVE_EVIDENCE_2]

[TOP_1_TITLE]
[TOP_1_WHY]
[TOP_1_ACTION]
[TOP_2_TITLE]
[TOP_2_WHY]
[TOP_2_ACTION]
[TOP_3_TITLE]
[TOP_3_WHY]
[TOP_3_ACTION]

[DO_NOT_FUND]
[DO_NOT_FUND_REASON]

[ISSUE_COUNT]
[HIGH_PRIORITY_COUNT]
[SYSTEM_COUNT]
[DEPENDENCY_COUNT]
[SPECIALIST_ROLE_COUNT]

[SEARCH_SCORE]
[WEBSITE_SCORE]
[SOCIAL_SCORE]
[REPUTATION_SCORE]
```

`[OPENING_PERSONAL_DETAIL]` and the strongest/weakest facts must be approved evidence-backed spoken clauses without terminal punctuation. Competitor variables are conditional on an applicable approved comparison; burden counts and the four surface scores are optional. The Overall Score has no spoken variable because it must not be read aloud.

## 6. Canonical master script

### 6.1 Opening — Valerie on camera

> Hi [OWNER_FIRST_NAME]. I reviewed [PRACTICE_NAME] in [CITY], [STATE], across your Google presence, website, social presence and reputation. One specific detail I noticed immediately was this: [OPENING_PERSONAL_DETAIL]. There are a few things worth improving, but I want to start with what is already working well.

### 6.2 Objective strength — show strongest evidence

> Your strongest area today is [STRONGEST_SURFACE]. [STRONGEST_FACT_1]. [STRONGEST_FACT_2]. That matters because it tells us the practice already has something valuable to build on. The problem is not that everything is broken.

### 6.3 Four-surface snapshot

> We looked at four surfaces: Search, Website, Social and Reputation. Your strongest surface is [STRONGEST_SURFACE], and your weakest is [WEAKEST_SURFACE]. [WEAKEST_FACT_1]. [WEAKEST_FACT_2]. I would not focus too heavily on the individual scores themselves. They are useful as a guide. What matters more is what the evidence tells us to fix first.

### 6.4 Binding constraint

> The main constraint I found is [BINDING_CONSTRAINT]. In practical terms, [BINDING_CONSTRAINT_PLAIN_ENGLISH]. This is the issue I would address before trying to increase activity elsewhere.

### 6.5 Decisive evidence

> The first reason is this: [DECISIVE_EVIDENCE_1]. And the second is: [DECISIVE_EVIDENCE_2].

When competitor comparison is applicable:

> For comparison, [COMPETITOR_1] is currently showing [COMPETITOR_1_EVIDENCE]. [COMPETITOR_2] is showing [COMPETITOR_2_EVIDENCE]. That does not necessarily mean they provide a better patient experience. It means their patient-acquisition setup is currently stronger in this part of the journey.

Then state the approved decision, not only the observation:

> The strategic decision from that comparison is to defend [DEFEND], close [CLOSE], differentiate through [DIFFERENTIATE], and not copy [DO_NOT_COPY]. This comparison [BINDING_CONSTRAINT_EFFECT] and [TOP_PRIORITY_EFFECT].

When an approved Market Practice Gap is applicable:

> We also found a market-practice shift worth [KEEP_EVALUATE_PILOT_REPLACE_OR_REJECT]: [MARKET_SHIFT]. Newer is not automatically better, so the recommendation is [MODERNIZATION_RECOMMENDATION], subject to [SPECIALIST_OR_REGULATORY_VALIDATION].

For any drug, device, material or clinical-protocol implication, the spoken script must say that qualified clinical and regulatory review is required before a practice change. The walkthrough may explain the patient-decision or business implication; it may not declare clinical obsolescence, safety or superiority from marketing evidence.

### 6.6 Top 3

> The first thing I would fix is [TOP_1_TITLE]. Why first? [TOP_1_WHY]. The practical action is [TOP_1_ACTION].

> Second, I would address [TOP_2_TITLE]. [TOP_2_WHY]. The practical action is [TOP_2_ACTION].

> Third, I would work on [TOP_3_TITLE]. [TOP_3_WHY]. The practical action is [TOP_3_ACTION].

### 6.7 Do Not Fund Yet — mandatory

> There is also one thing I would not spend more money on yet: [DO_NOT_FUND]. [DO_NOT_FUND_REASON]. I would revisit that only after the higher-priority constraints above are addressed.

### 6.8 Owner agency / DIY

> Everything we found is documented in your Growth Score below this video. You will see the problems, the evidence behind them, the implementation steps, dependencies and the definition of done. You can use that plan with your own team, implement it yourself, or give it to another provider. The Growth Score is designed to be useful even if you never work with CAESTHETIC.

### 6.9 Why CAESTHETIC

Use the numerical burden statement only when all counts are derived from the approved report.

> Where CAESTHETIC can make this easier is implementation and coordination. In this Score we identified [ISSUE_COUNT] evidence-backed issues, including [HIGH_PRIORITY_COUNT] high-priority items across [SYSTEM_COUNT] systems. The work involves approximately [DEPENDENCY_COUNT] dependencies and [SPECIALIST_ROLE_COUNT] different specialist roles. We already understand the evidence, the priority order and how the tasks depend on one another. That means you do not have to brief several different specialists from scratch or work out the sequence yourself.

When any burden count is unavailable, omit the numerical sentence and retain the qualitative coordination argument.

### 6.10 Sprint transition

> If you want to implement this internally, your complete plan is below. If you would rather have us coordinate the priority work, you can also review the 30-Day Growth Sprint. The Sprint scope is confirmed separately around the highest-value executable priorities in this diagnosis.

### 6.11 Closing — Valerie larger on screen

> The most important takeaway for [PRACTICE_NAME] is simple: [BINDING_CONSTRAINT_PLAIN_ENGLISH]. Fix that first, then reassess what deserves more investment. Your full evidence and implementation plan are below.

## 7. Chapters

Every final walkthrough must expose chapter timestamps for:

1. Strength
2. Four Surfaces
3. Main Constraint
4. Evidence & Competitive Decision
5. Top 3
6. Do Not Fund
7. Next Step

The final edit generates actual timestamps. Captions/transcript should remain machine-readable so the cockpit may seek directly to a chapter.

## 8. Production scene contract

The canonical edit pattern is:

```text
Valerie personal opening
→ strongest evidence / cockpit
→ four-surface snapshot
→ Valerie constraint bridge
→ decisive evidence + named competitors
→ Top 3 cards / implementation previews
→ Do Not Fund Yet
→ owner DIY / complete plan
→ Why CAESTHETIC coordination burden
→ Valerie optional Sprint transition + closing
```

Do not produce the walkthrough as a continuous talking head. The cockpit and evidence are the primary visual object.

## 9. Approval and learning

- The founder personally approves the first **3–5** exemplar walkthroughs.
- Founder corrections are recorded as versioned walkthrough rules/examples; they do not remain only in chat history.
- After the exemplar set is approved, the system may generate routine walkthroughs without founder pre-approval, provided the underlying Growth Score is human-approved and all script/evidence gates pass.
- Walkthrough rule changes require versioning and an auditable change note.
- A correction from one client must not silently become a global rule without deliberate promotion.

## 10. Lifecycle

```text
Free Growth Score
→ one-time Growth Score Walkthrough

30-Day Sprint
→ new Day-30 Growth Review

Recurring work, when applicable
→ new Monthly Growth Review
```

Each later review represents a new business state and must preserve its own evidence/date/version. Do not rewrite the historical Free Score walkthrough after implementation.

## 11. CTA policy

- Immediately around the video/cockpit, the owner must have a clear path to the implementation plan.
- The Sprint CTA belongs in the cockpit flow after value is demonstrated.
- The walkthrough itself may mention the optional 30-Day Sprint but does not state the price.
- Sprint pricing authority is `site-caesthetic/src/config/pricing.ts`; the script, report fixture and renderer must not create a second price source.
- Growth System is outside the Free Score walkthrough narrative.

## 12. Canonical narrative sequence

```text
Evidence
→ Constraint
→ Competitive Decision / Market Practice Gap where applicable
→ Top 3
→ Do Not Fund
→ Owner Agency
→ Why CAESTHETIC
→ Optional Sprint
```
