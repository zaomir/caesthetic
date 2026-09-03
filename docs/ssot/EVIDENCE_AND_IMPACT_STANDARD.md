---
owner: GRAINEE / ROV / EVO
status: active
version: 1.0
created: 2026-08-13
updated: 2026-08-13
scope: universal evidence classification, intervention lifecycle, adoption, impact verification, attribution and learning standard for marketing/growth decisions
applies_to: all knowledge domains and runtime projects
parent: docs/ssot/MARKETING_SYSTEM_STANDARD.md
related:
  - docs/ssot/BEHAVIORAL_COMMUNICATION_SYSTEM.md
  - docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md
  - docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md
---

# EVIDENCE_AND_IMPACT_STANDARD

## 1. Purpose

This is the global marketing-canon module for **evidence, constraints, interventions, adoption, impact and attribution**.

It is not a second architecture canon. Parent authority remains `docs/ssot/MARKETING_SYSTEM_STANDARD.md`. Human-facing epistemic labels remain aligned with `docs/ssot/BEHAVIORAL_COMMUNICATION_SYSTEM.md`.

Scope:

> universal evidence classification, intervention lifecycle, adoption, impact verification, attribution and learning standard for marketing/growth decisions.

This file is a logical contract. It does not prescribe Supabase, Directus, Notion or any other storage stack.

Project adapters may add local classes, vertical metrics and source-system rules. They may not silently weaken these definitions. CAESTHETIC Growth Ledger, Class A/Class B labels and clinic-specific measurement remain project adapters, not the global authority.

## 2. Evidence classes

Every material factual, numeric, comparative or diagnostic claim uses exactly one primary evidence class.

These classes are the same family as the Behavioral Communication System epistemic labels. This module is the growth-decision authority for how those classes enter constraints, interventions and impact claims.

| Class | Meaning |
|---|---|
| **Observed** | A directly observed fact, without calculation. |
| **Measured** | A metric produced by a defined measurement source or procedure. |
| **Calculated** | A result of a mathematical transformation of known inputs. |
| **Benchmark** | A comparison against a defined reference group. |
| **Estimated** | An assessment based on explicit assumptions. |
| **Illustrative** | An example used only to explain mechanics. |

### 2.1 Class rules

- **Observed** is not causation.
- **Measured** is not automatically representative.
- **Calculated** does not improve the quality of its inputs.
- **Benchmark** requires cohort, source, period, sample size / availability and limitations. It is not a universal norm.
- **Estimated** requires explicit assumptions. An estimate is not a measurement and not a result.
- **Illustrative** is not a forecast, expected result, case or evidence.

`Hypothesis` remains a communication and intervention construct. It is not an evidence class. Do not mix a hypothesis with Observed, Measured or Calculated evidence.

Do not invent pseudo-precise scores such as `83.7/100` without proven calibration.

## 3. Constraint standard

A constraint is a stated limit on growth that a decision can act on.

A constraint record must contain:

- statement;
- evidence;
- evidence confidence;
- probable impact;
- missing evidence;
- dependencies;
- fixability;
- owner;
- decision implication;
- validation condition.

Allowed confidence concepts:

```text
Confirmed
Probable
Needs More Evidence
```

There is at most one primary **binding constraint** at a time for a given owner-facing decision surface.

A constraint without evidence is a hypothesis, not a diagnosis.

## 4. Intervention standard

A material intervention must contain:

```text
problem / constraint
baseline
hypothesis
selected change
owner
executor
dependencies
budget / resource
decision date
start date
adoption criterion
impact criterion
evidence horizon
evidence
next decision
```

An intervention without a baseline cannot later claim impact.

An intervention without an owner is not ready for approval.

## 5. Lifecycle

Canonical state machine:

```text
Proposed
→ Validated
→ Prioritized
→ Approved
→ In Progress
→ Shipped
→ Adopted
→ Impact Verified
```

Additional states:

```text
Maturing
Blocked
Stopped
No Impact Observed
Insufficient Evidence
Rejected
Replaced
```

### Definitions

| State | Meaning |
|---|---|
| **Shipped** | The change is actually live / delivered. |
| **Adopted** | The intended team, process or customer workflow actually uses the change. |
| **Maturing** | The change is in place, but the objective measurement horizon has not yet arrived. |
| **Impact Verified** | An observed business effect is confirmed by the agreed evidence rule. |
| **No Impact Observed** | After the agreed horizon, no material effect was found. |
| **Insufficient Evidence** | A reliable conclusion cannot be made. |
| **Blocked** | A dependency, access, approval or resource prevents progress. |
| **Stopped** | Work was deliberately halted. |
| **Rejected** | The proposal was not approved. |
| **Replaced** | Another intervention superseded this one. |

Shipping is not adoption. Adoption is not impact. Activity is not impact.

`Maturing` may be used only after the change was genuinely shipped and, where applicable, adopted. It may not hide an unstarted backlog.

Project adapters may keep a shorter owner-facing sequence such as `Shipped → Adopted → Impact → Maturing` if each state still matches these definitions.

## 6. Impact Ledger

**Impact Ledger** is a global concept. It is the logical record of whether a change created a verified business effect.

Each entry must store:

- baseline;
- intervention;
- implementation evidence;
- adoption evidence;
- observation window;
- measured/observed result;
- attribution confidence;
- alternative explanations;
- data limitations;
- status;
- decision:
  - Continue;
  - Scale;
  - Stop;
  - Replace;
  - Observe Longer.

The Impact Ledger is a logical contract, not a tech-stack prescription. A project may implement it as part of a Growth Ledger, operating workbook or other controlled store. The implementation must preserve the fields and must not silently overwrite published history.

## 7. Attribution rules

Global rule:

> Correlation ≠ causation.

An impact claim must state attribution confidence. A complex universal scientific scale is not required.

Minimum distinction:

```text
Observed change
Plausibly associated
Strong attribution evidence
Causal claim justified by suitable design
```

Do not:

- rewrite attribution after a good result;
- choose the baseline after seeing the result;
- change the measurement rule after seeing the result;
- credit whole-business growth to one intervention without sufficient grounds;
- present a cross-client correlation as causal intervention proof;
- convert missing data into a zero or into a success.

If the evidence cannot support the claim, lower the class, keep uncertainty visible, or record `Insufficient Evidence`.

## 8. AI boundary

AI may:

- classify draft evidence;
- extract structured facts;
- find missing fields;
- group patterns;
- form a draft summary;
- propose candidate constraints;
- search similar interventions;
- detect an anomaly;
- help form questions.

AI may **not** independently give a final assertion of:

- binding constraint;
- causality;
- Impact Verified;
- benchmark validity;
- performance compensation;
- legal/compliance activation.

A material conclusion requires **human verification**.

AI may not invent, interpolate or upgrade an Estimated or Illustrative statement into Observed, Measured or Calculated evidence.

## 9. Learning record

When an intervention reaches a terminal or review state, capture the learning chain defined in `docs/ssot/PRODUCTIZATION_AND_GROWTH_CONTROL_STANDARD.md`:

```text
Business / Practice Profile
→ Initial State
→ Constraint
→ Evidence
→ Intervention
→ Adoption
→ Time to Evidence
→ Observed Result
→ Decision
```

Do not publish a benchmark as authoritative when cohort, sample size, period, evidence quality or limitations are missing.

## 10. Project adapter contract

A project adapter may add:

- local evidence subclasses (for example CAESTHETIC Class A / Class B);
- vertical event taxonomies;
- source-system access and privacy gates;
- signed Measurement Schedule rules;
- storage and workflow choices.

It may not:

- treat Shipped as Impact Verified;
- hide uncertainty;
- make AI the final authority for material conclusions;
- copy one client’s rates, baselines or performance formula into global canon.

Client-specific Commercial Schedule / SOW / measurement authority remains the signed commercial source. This module governs how evidence and impact may be claimed.

---

**Global rule:** distinguish evidence class, shipping, adoption and impact. Correlation is not causation. Material AI conclusions require human verification.
