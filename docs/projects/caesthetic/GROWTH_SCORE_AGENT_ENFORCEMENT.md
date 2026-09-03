---
owner: CAESTHETIC
status: mandatory_agent_adapter
version: 2.4
canonical_ssot: docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
canonical_repo: zaomir/grainee-v2
satellite_repo: zaomir/caesthetic
canonical_sop_version: 2.8
canonical_ref: zaomir/caesthetic main resolved at run start; production import verifies exact SHA
updated: 2026-09-03
---

# Growth Score audit — mandatory AI-agent enforcement

This is a fail-closed execution adapter for every AI agent operating in
`zaomir/caesthetic`. It does not replace or amend the canonical SSOT. If this
adapter conflicts with the canonical file, stop, report `BLOCKED: audit policy
drift`, and use the canonical SSOT only after the conflict is resolved.

Do not create an ad-hoc audit document, substitute a generic audit template or
skip to research because the manager supplied a business name or URL.

An agent with access only to `zaomir/caesthetic` uses the complete local
authority chain in §2 and must not ask the manager to open `grainee-v2`.
Authoring is allowed here; production import and deploy remain gated by the
exact-SHA publish control plane and `grainee-v2`. If the local adapter and local
mirrored SOP disagree, stop with `BLOCKED: audit policy drift`.

## 1. Universal pre-router

Apply this before repository, project, task, skill or tool routing.

**Minimal trigger rule:** normalize case, Unicode dashes and spacing. If the
message contains any whole dictionary phrase below, or the standalone English
word `audit` / Russian word `аудит` in an ordinary grammatical form, route to
the canonical `growth_score_audit` intent before any other routing. Do not
infer a different audit product inside this repository.

### Russian dictionary

`аудит`, `бизнес-аудит`, `маркетинговый аудит`, `аудит маркетинга`, `аудит
роста`, `аудит клиники`, `аудит салона`, `аудит локации`, `аудит сети`,
`сетевой аудит`, `аудит филиалов`, `мульти-локационный аудит`,
`мультилокационный аудит`, `мини-аудит`, `оценка роста`, `диагностика роста`,
`маркетинговая диагностика`, `диагностика 4444`, `разбор 4444`, `гроус скор`,
`проверка бизнеса`, `поиск утечек`.

### English dictionary

`Growth Score`, `Free Growth Score`, `Partner Growth Score`, `Growth Score
audit`, `Multi-Location Growth Score`, `MultiLocation Growth Score`, `multi-site
Growth Score`, `network Growth Score`, `growth assessment`, `written growth
assessment`, `growth diagnostic`, `business audit`, `marketing audit`, `digital
audit`, `online presence audit`, `clinic audit`, `practice audit`, `salon
audit`, `location audit`, `network audit`, `multi-location audit`, `multi-site
audit`, `four-surface audit`, `4444 audit`, `mini-audit`, `1-minute leak`, `leak
diagnosis`, `score`, `diagnostic`, `audit report`, `Top 3 gaps`, `binding
constraint`.

The executable dictionary is
`scripts/caesthetic/growth-score-intent-router.mjs`. The lists above and the
executable dictionary must change in the same reviewed release.

If there is no active `growth_score_audit` interview, the first sentence of the
response must be exactly:

`Вы создаёте новый аудит? Ответьте на вопросы.`

The same response must begin the Manager Interview. If an interview is already
active, continue with the missing questions and do not repeat the opening.

For a request as simple as `сделай аудит X`, the first operational action is
the authority preflight in §2 and launch of this canonical audit workflow, not
research into X.

## 2. Mandatory current-main authority preflight

Before any substantive work, resolve the current `zaomir/caesthetic` `main`
and read these authorities from that same current ref, in order:

1. `docs/ssot/CAESTHETIC.md`
2. `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md`
3. `docs/caesthetic/growth_score_spec.md`
4. `docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md`
5. `docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md`
6. `docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`
7. for competitor work: `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`
8. for evidence or impact work: `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
9. for publication work: `docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md`

Items 1–6 are mandatory for every matched task. Items 7–9 become mandatory
when the task reaches or requests the stated scope.

The authority order is:

`active master SSOT → Client Report Standard → growth_score_spec → Production SOP → implementation profile → working docs`.

If a required authority is missing, unreadable or unavailable on the resolved
current `main`, stop before substantive work and report `BLOCKED: missing
authority <path>`, including the unresolved path and ref. Do not reconstruct,
infer or complete the canon from chat/model memory, an older checkout or a
lower-authority working document.

Four Surfaces means exactly:

1. Search / Google Business Profile;
2. Website;
3. Social;
4. Reputation / Reviews.

Cross-Surface Consistency, Lead Intake, Lead-to-Revenue and Paid Ads are not a
fifth surface.

After this authority preflight, implementation must use only
`scripts/caesthetic/growth-score-report-template.mjs`,
`scripts/caesthetic/growth-score-workflow.mjs`,
`scripts/caesthetic/render-growth-score.mjs` and the publish control plane
already named above. These are implementation/runtime contracts, not higher
product authorities.

## 3. Mandatory Manager Interview

Reuse facts already supplied and ask only for missing information, but do not
skip any applicable field:

1. new or existing audit;
2. single-location or Multi-Location format;
3. business/project name and aliases;
4. official public links and profiles;
5. exact target location or full location list;
6. business model, core offer and target audience;
7. priority services, treatments or products;
8. known competitors and why they are relevant;
9. client goal or reason for the audit;
10. report language, recipient and named approving manager;
11. rebrand, relocation, duplicate, closure or ownership ambiguity;
12. previously collected public observations;
13. exclusions and scope constraints;
14. for Multi-Location: shared/local assets, different markets or service
    mixes, suspected focus location and excluded branches.

The Manager Interview gate passes only when at least one unambiguous public
identifier, the format and the scope are resolved.

## 4. Public/open-source-only boundary

Both audit formats use public/open sources only. Manager statements remain
`self_reported` context until independently verified from public evidence.

Never request or use as audit evidence:

- CRM, EHR, patient records, PHI or credentials;
- GA4, GSC, ad-account or vendor access;
- internal revenue, profit, lead, booking, conversion or show-rate data;
- calls, messages, email, WhatsApp, reception transcripts, staffing or
  internal-workflow assertions;
- mystery-shopper calls, messages, form submissions or appointment creation.

Public booking/enquiry paths may be inspected only up to non-submission. Never
send a form, message or test enquiry, make a call or create an appointment.

## 5. Research Alignment gate

After the interview, perform only quick, non-scored public reconnaissance.
Return a versioned Research Alignment Card containing:

- business understanding and resolved public entities;
- exact format, locations and deliverables;
- Four-Surface scope and public-only limitations;
- 3–5 proposed competitors with URLs and selection reasons;
- Multi-Location topology where applicable;
- proposed queries, geography, observation windows, review sample and path
  checks;
- unknowns, exclusions and `Insufficient evidence` items;
- planned research and the decisions reserved for the manager.

Ask for an explicit decision from the named manager:

- `APPROVE` — approve that exact alignment version; or
- `CLARIFY` — correct it, issue a new version and request approval again.

Full research, scoring and conclusions are blocked until a named manager
approves a specific Research Alignment version with a timestamp.

## 6. Full research and evidence

After approval, research exactly Search/GBP, Website, Social and
Reputation/Reviews. Treat Cross-Surface Consistency as an unweighted layer and
Competitive Decision Analysis as a cross-cutting, unscored layer.

Every evidence item must retain subject/location identity, surface and metric
where applicable, source URL or reproducible path, collection timestamp,
method/comparison window, proposed evidence class, reviewer status,
limitations and supersession link. Missing or contradictory evidence is
`Insufficient evidence`, never zero and never an invented fact.

Competitors must be selected by a disclosed, comparable rule. Visible public
activity is not proof of commercial effectiveness.

## 7. Human-only decisions and delivery gates

AI may build the complete Gap Inventory, candidate risk order, draft binding
constraint, Repair Plans and candidate Focus Selection. All remain internal and
non-publishable.

A named human must verify evidence and manually select exactly one Primary Gap
plus exactly two Supporting Gaps. The lowest surface score never automatically
becomes the Primary Gap. For Multi-Location there is one shared final Top 3
selection total and one named focus location. This Focus Selection defines the
proposed 30-Day Growth Sprint priority scope; it is not a generic backlog.

Managers may use the informal phrase `1 Primary + 2–3 Supporting` while
discussing Sprint candidates. The current approved schema-v5 report contract is
still exactly one Primary plus two Supporting Gaps. If a manager requires a
third Supporting Gap in final Focus Selection, stop with `BLOCKED: focus
cardinality conflict`; do not silently drop it or publish outside the current
template. A third final Supporting Gap requires a versioned method, schema,
renderer and validator release.

No compilation before human Focus Selection; no publication before report
approval; no delivery before server-side password/access QA. Real reports live
only under `https://caesthetic.com/score/` with an unguessable route and
`noindex`. Catalog registration is automatic; public listing requires a
synthetic report or explicit client permission.

For Multi-Location, publish one comparative network overview as the package
entry point and one linked full current-schema report for the named focus
location. Both pages share the same access group and approved Focus Selection.
After access QA, deliver the protected parent/standalone link to the client;
never describe a local file, preview URL or unverified route as delivery.

## 8. Canonical stage order

Every audit follows this order without shortcuts:

```text
Manager Interview
→ Quick, non-scored public reconnaissance
→ Business + competitor understanding in a versioned Research Alignment Card
→ Named-manager APPROVE
→ Full public/open-source research
→ Complete Gap Inventory
→ Internal AI candidate risk order
→ Named-human Focus Selection
→ Approved report
→ Server-side password + route/noindex/access QA
→ Protected link delivered to client
```

## 9. Fail-closed rule

If an agent cannot satisfy a gate, access the canonical rules, establish public
provenance, identify the approving manager or preserve the required evidence,
it must stop the affected stage and report `BLOCKED` with the exact missing
requirement. It must not improvise, weaken a gate or treat a draft as approved.
