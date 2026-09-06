---
owner: CAESTHETIC
status: mandatory_agent_adapter
version: 2.6
canonical_ssot: docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
canonical_repo: zaomir/grainee-v2
consistency_standard: docs/ssot/CAESTHETIC_4444_CONSISTENCY_STANDARD.md
canonical_ref: zaomir/grainee-v2 origin/main resolved at run start
updated: 2026-09-06
---

# Growth Score audit — mandatory AI-agent enforcement

This is a fail-closed execution adapter for every AI agent operating in
CAESTHETIC through `zaomir/grainee-v2` or its `zaomir/caesthetic` satellite.
It does not replace or amend the canonical SSOT. If this adapter conflicts with the canonical file, stop, report `BLOCKED: audit policy
drift`, and use the canonical SSOT only after the conflict is resolved.

## 1. Universal pre-router

Apply this before repository, project, task, skill or tool routing.

This pre-router triggers on any mention or semantic equivalent of:

- `аудит`;
- `Growth Score`;
- `Multi-Location Growth Score`;
- `score`;
- `diagnostic`;
- `audit report`;
- `проверка бизнеса`;
- `поиск утечек`;
- `Top 3 gaps`;
- `binding constraint`.

If there is no active `growth_score_audit` interview, the first sentence of
the response must be exactly:

`Вы создаёте новый аудит? Ответьте на вопросы.`

The same response must begin the Manager Interview. If an interview is already
active, continue with the missing questions and do not repeat the opening.

For a request as simple as `сделай аудит X`, the first operational action is
the authority preflight in §2 and launch of this canonical audit workflow, not
research into X.

## 2. Mandatory current-main authority preflight

Before any substantive work, resolve the current `zaomir/grainee-v2` `main`
and read these authorities from that same current ref, in order:

1. `docs/ssot/CAESTHETIC.md`
2. `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md`
3. `docs/caesthetic/growth_score_spec.md`
4. `docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md`
5. `docs/caesthetic/GROWTH_SCORE_NEXT_VERSION_JOURNEY_GRAPH.md`
6. `docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md`
7. `docs/ssot/CAESTHETIC_4444_CONSISTENCY_STANDARD.md`
8. for competitor work: `docs/ssot/COMPETITIVE_DECISION_ANALYSIS_STANDARD.md`
9. for evidence or impact work: `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
10. for publication work: `docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md`

Items 1–7 are mandatory for every matched task. Items 8–10 become mandatory
when the task reaches or requests the stated scope. The consistency standard
is the mandatory method module of the existing master/spec/SOP authorities,
not a competing product canon or scoring authority.

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
- the method for selecting exactly 10 query phrases, query language/geography
  and frequency provenance; discovery of Instagram, Facebook, TikTok and YouTube;
  post text, video transcripts, user comments, practice replies and review coverage;
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

Every audit also applies `caesthetic-4444-commercial-core/1.0.0`. Research must
compare whether priority-service demand language, precise long-tail booking-intent
queries, service/provider/location vocabulary and proof remain coherent across the
four surfaces. The final commercial narrative leads with the approved 4444 priority
and the `$2,500` 30-Day Growth Sprint as CAESTHETIC's primary implementation action.
Name changes and isolated technical repairs remain evidence-backed instructions or
dependencies, not the main product. The `$500` Lead-to-Revenue Check remains the
secondary branch governed by `check500-two-placement/1.0.0`.

### 6.1 First research block: *Соответствие* 4444

Apply `caesthetic-4444-consistency-first/1.0.0` from
`docs/ssot/CAESTHETIC_4444_CONSISTENCY_STANDARD.md` before the other full-research
blocks, after named-manager Research Alignment approval.

Freeze exactly 10 relevant long-tail query phrases with source, market, date,
intent and verified/candidate frequency status. Use the same set across Search,
Website, Social and Reputation. Produce the 10 × 4 correspondence matrix with
source-level drill-down and explicit coverage; do not swap phrases per surface.

Discover and verify ownership on Instagram, Facebook, TikTok and YouTube.
Inspect available post text, video descriptions and video transcripts separately,
then user comments, practice comment replies, reviews and owner review replies.
A profile-only or follower-count check is not completed Social research.

Enforce `platform-access-pass/1.0.0` in consistency standard §5.1 and Production SOP §7: every new or explicitly resumed research pass covers Instagram, Facebook, TikTok, YouTube and Google Maps / GBP. Prefer available Aside or another available user-authorized browser; recheck the actual session. If login blocks reading, immediately remind the user to sign in in that browser, naming the platform, exact URL and unread material. Passwords/2FA stay in the browser, never chat or evidence. Continue independent research and retry the pending source after sign-in, updating per-platform provenance and coverage. No login is needed for already readable public YouTube/Maps material. A login prompt is an access limitation, not proof of private content or absence. Ordinary authorized sign-in permits public-source reading only; do not read DMs/private groups, request clinic/admin access, or react/publish/send messages under this research instruction.


Keep `exact_match`, `semantic_match`, `contradiction`, `not_found_in_sample`
and `insufficient_evidence` distinct. Inaccessible content is not an absent
phrase. Human verification is required for automatic transcript matches. Keep
practice-authored text separate from independent patient speech; never force
keywords into reviews/comments, bypass access restrictions or invent frequency.

The first research check is «Проверка *соответствия* ключевых фраз»; reader order is separate.
A material, verified correspondence failure may be proposed as the first problem;
it is not an automatic binding constraint or Top 3 selection. Show coherent
language as a strength and unavailable evidence as unavailable. Preserve the
full Gap Inventory, competitor work, existing weights and named-human decisions.

For an existing case, resume its approved scope and query version. Do not restart
an active interview or silently research, rescore, regenerate or publish a frozen
report because the method changed. Ordinary editorial/design changes do not
change the approved facts, Top 3 or other locales.

## 7. Human-only decisions and delivery gates

AI may build the complete Gap Inventory, candidate risk order, draft binding
constraint, Repair Plans and candidate Focus Selection. All remain internal and
non-publishable.

A named human must verify evidence and manually select exactly one Primary Gap
plus exactly two Supporting Gaps. The lowest surface score never automatically
becomes the Primary Gap. For Multi-Location there is one shared final Top 3
selection total and one named focus location.

No compilation before human Focus Selection; no publication before report
approval; no delivery before server-side password/access QA. Real reports live
only under `https://caesthetic.com/score/` with an unguessable route and
`noindex`. Catalog registration is automatic; public listing requires a
synthetic report or explicit client permission.

## 8. Fail-closed rule

If an agent cannot satisfy a gate, access the canonical rules, establish public
provenance, identify the approving manager or preserve the required evidence,
it must stop the affected stage and report `BLOCKED` with the exact missing
requirement. It must not improvise, weaken a gate or treat a draft as approved.


## 2026-09-06 — Publication eligibility and commercial materiality

Apply `docs/ssot/CAESTHETIC_PRODUCTS_AND_SERVICES.md` §2.1 (`report-value-gate`),
owner directive #1521, before publishing findings, answers, priorities, repair
plans or offers. Every client-visible task maps to a supported catalog module
and its actual eligibility/horizon. An out-of-catalog task stays internal until
a named CAESTHETIC manager discusses and explicitly decides its exact publication
and scope. A general implementation request is not that case-specific decision.

Separate patient-choice/enquiry materiality from the value of CAESTHETIC delivery.
Do not justify a $2,500 Sprint with an isolated outdated name, typo or other easy
DIY correction. Small observations belong in a compact final team-fixes section;
they are not lost-client evidence or a Top 3 sales argument. A quick but genuinely
urgent broken-path fix should be disclosed for immediate correction, without
inflating the paid scope. First-month selection requires evidence, a supported
intervention, meaningful client value, feasible deliverable/dependencies and a
verification criterion. Missing research is not itself a business leak. If the
material priority set is not yet supported, research further rather than fill
it with minor errors. Preserve the human selection gate and the existing
Primary + two Supporting schema. Longer/recurring eligible work is shown later.
The optional $500 Check remains the separately authorized post-enquiry branch.


The owner-approved Spoken reader direction is now four open questions followed
by one unnumbered Connect4 consistency conclusion, then evidence-backed Month-1
scope. Apply `caesthetic-choice-synthesis/1.0.0` in the Client Report Standard;
do not retain the superseded fifth numbered question or force a consistency
failure to sell Connect4. Research order and final human approval remain intact.
