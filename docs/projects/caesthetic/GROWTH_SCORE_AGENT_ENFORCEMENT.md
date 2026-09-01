---
owner: CAESTHETIC
status: mandatory_agent_adapter
version: 2.3
canonical_ssot: docs/ssot/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP.md
canonical_repo: zaomir/grainee-v2
canonical_ref: zaomir/grainee-v2 origin/main resolved at run start
updated: 2026-09-01
---

# Growth Score audit — mandatory AI-agent enforcement

This is a fail-closed execution adapter for every AI agent operating in
`zaomir/caesthetic`. It does not replace or amend the canonical SSOT. If this
adapter conflicts with the canonical file, stop, report `BLOCKED: audit policy
drift`, and use the canonical SSOT only after the conflict is resolved.

## 1. Universal pre-router

Apply this before repository, project, task, skill or tool routing.

If there is no active `growth_score_audit` interview and the user's message
mentions `Multi-Location Growth Score`, `Growth Score` or `аудит` (including
ordinary grammatical forms), the first sentence of the response must be
exactly:

`Вы создаёте новый аудит? Ответьте на вопросы.`

The same response must begin the Manager Interview. If an interview is already
active, continue with the missing questions and do not repeat the opening.

## 2. Mandatory Manager Interview

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

## 3. Public/open-source-only boundary

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

## 4. Research Alignment gate

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

## 5. Full research and evidence

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

## 6. Human-only decisions and delivery gates

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

## 7. Fail-closed rule

If an agent cannot satisfy a gate, access the canonical rules, establish public
provenance, identify the approving manager or preserve the required evidence,
it must stop the affected stage and report `BLOCKED` with the exact missing
requirement. It must not improvise, weaken a gate or treat a draft as approved.
