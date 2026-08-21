---
owner: CAESTHETIC
status: canonical
version: 1.0
created: 2026-08-19
updated: 2026-08-19
scope: Format B episode topic bank, admission gate, rotation model and pilot selection
parent: docs/ssot/CAESTHETIC_REEL_FORMAT_B.md
authority: DEC-841 (Format B v1.1 decision note)
---

# CAESTHETIC Reel Format B — Topic Bank

## 0. Status and authority

This file is **canonical**. `DEC-841` issued Format B v1.1 (`42–45s`, three
Valerie appearances, mandatory Pause Trigger, mandatory `NOT YET → UNTIL`
block, track-selected CTA — see `CAESTHETIC_REEL_FORMAT_B.md` §0A), so the
topics below may be compiled into scripts under
`format_system: CAESTHETIC Reel Format B v1.1`.

`CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` V3.2 §0 FREEZE requires that
structure, timing, CTA route, Valerie role and evidence rules change only
through a versioned decision note, with no silent edits inside a batch. Any
further change to the v1.1 contract needs its own versioned note; this file
does not grant that authority on its own.

Until the Evidence Bank contains real units, **every topic here is
`Illustrative`** and each episode must carry `MODEL EXAMPLE — NOT A CLIENT
CASE` per Format B v1.0 §1 (carried forward by v1.1 §0A).

## 1. What Format B is for

```text
Format A identifies a leak.
Format B establishes the order of action.
```

Format B is the public, anonymized expression of the Growth Score
`humanDiagnosis` object (`growth_score_spec.md` §5.2):

```text
objective_strength → binding_constraint → priorities → one do_not_do
```

A topic qualifies only if it yields **exactly one binding constraint and
exactly one premature investment**. A list of equally weighted problems is
Format A material, however long it runs.

## 2. Topic formula

```text
X looks like a reasonable investment.
Y must be fixed first.
X becomes reasonable only after condition Z.
```

`X` must be a genuinely plausible investment the owner is actually
considering. If `X` is obviously wrong, the episode collapses into
"do not do dumb things" and carries no insight. The tension of Format B
comes from `X` being defensible.

On screen:

```text
FIX FIRST → [one priority]
NOT YET   → [one premature investment]
UNTIL     → [one verifiable unlock condition]
```

`NOT YET` is sequencing, never prohibition (V3.2 §6).

## 3. Admission gate

An episode compiles as Format B only when the manifest carries:

```yaml
evidence_ids:        # minimum two distinct ids
priority_rationale:  # why this priority precedes the other
fix_first:           # one concrete priority
not_yet:             # one premature investment
until:               # one verifiable unlock condition
pause_trigger:       # question specific to this episode's evidence
derived_episodes:    # minimum two candidate Format A cutdowns
illustrative:        # true until the underlying evidence units are real
```

Fewer than two `evidence_ids` → the topic remains Format A.
Missing `priority_rationale` → the episode does not compile.

## 4. Season-1 topic bank

Season 1 stays inside the four canonical surfaces plus reactivation. Track
labels use `B-cold` / `B-warm` and must be recorded per episode; the two
tracks are never judged by the same metric (V3.2 §1).

| # | Topic | Evidence combined | FIX FIRST | NOT YET | UNTIL | Track |
|---|---|---|---|---|---|---|
| B1 | More traffic? Not yet. | Ad click lands; offer unclear; booking path awkward | Strongest post-click break | More ad budget | Click-to-booking path is clear and verifiable | B-cold |
| B2 | Five stars do not mean a strong reputation | Rating; 90-day freshness; sample depth; owner responses | Restore a steady, credible review flow | Paid review-collection service or reputation package | Reviews are recent, specific and sustained | B-cold |
| B3 | More new patients? Not yet. | Existing contact base; no reactivation motion; new-lead spend | Work the base already owned | Buying new leads | Existing contacts have been contacted and measured | B-cold |
| B4 | A competitor is ahead on one thing, behind on another | Named-competitor evidence across two surfaces | Defend / Close — pick one | Copying their whole playbook | The gap that actually affects the patient path is identified | B-cold |
| B5 | A beautiful website can still lose patients | Design quality; unclear offer; weak proof; buried CTA | Message, proof and booking path | Full redesign | Basic conversion leaks are closed and measured | B-cold |
| B6 | Ranking high on Maps, getting too few calls | Position; photos; services; hours; conversion elements | GBP conversion readiness | More local SEO or local traffic | Existing visibility converts to calls and taps | B-cold |
| B7 | More content or more proof? | Publishing volume; thin proof; no decision answers | Build a proof library | More production volume | Each surface carries relevant proof | B-cold |
| B8 | Discounts can hide the real growth problem | Frequent promos; price-led communication; unproven premium position | Value and proof | The next discount campaign | The offer reads as valuable without a price incentive | B-cold |
| B9 | After the chat replies — what happens next? | Public chat/scheduler flow; next step; escalation path | A clear next step after first response | Adding conversational automation | The same path works when a human runs it | B-cold |
| B10 | Which surface deserves the next growth dollar? | One weak surface across four | The single binding constraint | Spreading budget evenly | The constraint is removed and the effect confirmed | B-warm |
| B11 | Three visible problems. Only one goes first. | Three observations, one dependency chain | The prerequisite problem | Parallel work on all three | The dependency is cleared | B-warm |

**B9 note.** The topic is framed as *what happens after the reply*, which is
publicly observable, rather than *do you need an AI receptionist*, which is
an opinion and unobservable from outside. The AI-front-desk category is
currently the loudest competing pitch in this market; a Reel that merely
says "you reply slowly" reads as a vendor ad. The differentiator is the
sequence, not the gap.

## 5. Pause Trigger register

Pause Trigger is never a reusable line. It must follow from the evidence
shown in that episode.

| Topic area | Pause Trigger |
|---|---|
| Booking path | How many taps does it take to book with you? |
| Website | Can a new patient understand your offer in five seconds? |
| Reputation | How many of your reviews were written in the last 90 days? |
| Maps | What does a patient see before they tap Call? |
| Social | Does your content answer a decision question, or fill the feed? |
| Cross-surface | Would a patient describe your practice the same way after all four? |
| Reactivation | When did you last contact the patients you already have? |

## 6. Rotation: A feeds B

Format B is produced as a synthesis of already-published Format A episodes,
not as a standalone slot on a calendar.

```text
A: one leak
A: one reputation gap
A: one social-to-booking break
B-cold: which of the three goes first, and why
A: FIX FIRST cutdown
A: NOT YET / UNTIL cutdown
```

Rationale: the admission gate requires two distinct `evidence_ids`. When A
runs first, the second unit already exists and B becomes close to free —
it assembles material that is already captured, redacted and approved. This
ordering is a production condition, not a scheduling preference.

Frequency is not fixed in advance. Measure real production cost, saves,
profile visits, Score applications and usable `derived_episodes` across the
pilots before setting cadence.

## 7. Pilots

Three `B-cold` pilots. All three are producible from public sources, none
duplicates `CAE-REEL-B-001`, and each yields at least two Format A cutdowns.

1. **B2** — Five stars do not mean a strong reputation
2. **B3** — More new patients? Not yet. (reactivation)
3. **B4** — A competitor is ahead on one thing, behind on another

**No second `B-warm` episode until `CAE-REEL-B-001` reports.** B-001 is
already a warm episode with product reveal. Producing a second warm episode
before profile-visit and Score-application data exists is an unmeasured bet.

## 8. Rejected, merged and deferred

### 8.1 Collision with CAE-REEL-B-001

`CAE-REEL-B-001` already occupies the cross-surface / trust-leak topic. Its
master VO states the thesis directly. The following proposed topics were the
same episode restated and are **removed**:

- Four surfaces. Four different stories.
- A practice can make $200K a month — and still lose patients every day.
- Four surfaces look healthy separately — but fail as a system.

### 8.2 Reclassified to Format A

- **How many steps from bio to booking** — one artifact, no hierarchy. It is
  also item 1 of the V3.2 §6 cold-reach backlog, already assigned to the
  short format. Producing it as B would break the admission gate in the
  first episode of the format.

### 8.3 Merged

- *Posting more is not always the answer* merged into **B7**; the two
  differed only in the wording of `X`.
- *How to decide whether you need more traffic* merged into **B1**.

### 8.4 Deferred — method opinion, not observable evidence

Growth Score evaluates externally observable marketing evidence only.
Whether a practice needs a new CRM, another administrator, a new service
line or a second location is **never** observable from outside, so Class A
evidence for these topics is structurally unavailable. These are not "later
season" topics; they are a different epistemic class.

Deferred: new CRM · hiring another administrator · launching a new service ·
readiness for a second location · staffing and training decisions.

If produced later, they require an explicit `method:` source class and
visible framing as method, not observation.

## 9. Open conflicts to resolve before scripts

1. **Format B v1.1 — resolved.** `DEC-841` (2026-08-19) issued v1.1: `42–45s`,
   three Valerie appearances, mandatory Pause Trigger, mandatory
   `NOT YET → UNTIL` block. See `CAESTHETIC_REEL_FORMAT_B.md` §0A. Scripts
   compile under `format_system: CAESTHETIC Reel Format B v1.1`.
2. **CTA conflict — resolved.** `DEC-841` keeps the Closing Card's one-CTA
   rule (V3.2 §4) and makes the CTA track-selected: `B-warm` uses
   `GET YOUR FREE GROWTH SCORE` only; `B-cold` may use a save-oriented CTA
   only when the episode manifest declares a distinct success metric and
   failure criterion for it (V3.2 §12). An episode without that declaration
   does not compile.
3. **Sprint price — resolved.** Canonical value is
   `site-caesthetic/src/config/pricing.ts` → `growthSprintUsd: 2500`.
   `docs/caesthetic/caesthetic_days_1_30.md` outreach template corrected to
   `$2,500` (2026-08-19). Any script must still read the price from
   `pricing.ts` at compile time rather than hardcoding a number, so this
   cannot drift again.
4. **Track labels vs backlog.** B1 and the cross-surface theme appear in the
   V3.2 §6 cold-reach backlog while being proposed here as warm-leaning.
   Either the labels or the backlog change, through a versioned decision.
5. **Language bank is empty.** `caesthetic_days_1_30.md` targets 40–60
   verbatim owner quotes and states that anything written in Russian and
   translated reads as translation. These topics are hypotheses derived from
   repo canon and public sources, not owner language. Write 8–10 scripts
   now; do not scale to a full season before 20–30 verbatim quotes exist.

## 10. Standing production constraints

- No identified third-party clinic in public negative analysis without
  rights, consent or an approved legal basis (V3.2 §13, §7). Public output
  is aggregate and anonymized.
- No review gating in any reputation topic (`growth_score_spec.md` §6.2).
- Reddit and forum material is Class C qualitative VOC: it selects questions
  and language, never proves that a tactic works.
- No invented clients, outcomes, response-time benchmarks, revenue loss,
  rankings or patient counts.
- Kling produces cinematic plates only; all information layers, subtitles,
  logo and CTA belong to deterministic motion compositing (Format B v1.0 §1).
