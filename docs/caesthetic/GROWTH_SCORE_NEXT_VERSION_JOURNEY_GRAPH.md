---
owner: CAESTHETIC
status: active_implementation_profile
version: 1.4
updated: 2026-09-02
scope: canonical Growth Score visual system, Cross-Surface Journey Graph, automated link-integrity diagnostics, Broken Connections Map and Lead-to-Revenue visual branch
parent: docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
implementation_parent: docs/caesthetic/growth_score_spec.md
schema_authority: docs/caesthetic/growth_score_spec.md#33-cross-surface-journey-graph-evidence-artifact
renderer_authority: docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md#31-cross-surface-journey-graph-evidence-and-renderer-contract
pricing_authority: docs/ssot/CAESTHETIC_LEAD_TO_REVENUE_CHECK.md
---

# CAESTHETIC Growth Score — Visual & Journey Graph implementation profile

> The legacy filename contains `NEXT_VERSION` for compatibility with existing references. The content is no longer a proposal: this is the active implementation profile subordinate to the Client Report Standard and detailed Growth Score spec.

The canonical schema/data contract is `docs/caesthetic/growth_score_spec.md` §3.3. The client-facing placement, visual order, review anchors, commercial/claim boundaries and production acceptance are in `docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md`. This profile cannot override either authority.

The implementation remains additive to schema v5 / template 5.2. New authoring includes `journeyGraph`; frozen pre-2026-09-02 v5.2 reports remain reproducible without silent migration. The graph never changes Four Surfaces, weights, scores, Primary Constraint or Top 3 automatically.

## 1. Canonical visual story

The shared report template across aesthetic, dental and beauty contexts uses this owner-facing story:

`Owner tension → Hero Client Journey Map → Four-Surface snapshot → Broken Connections Map → Top 3 leaks → competitor decision → final system synthesis → implementation decision → Lead-to-Revenue Map → next path → founder note`.

The story is mapped inside the existing Intro + nine canonical machine sections. It does not create a tenth section or a separate report product.

The `Where Clients Are Gained - and Lost` Hero is the one explicit exception to dynamic diagnostic rendering: it is the immutable owner-approved raster defined in §2. Broken Connections and the remaining evidence-driven diagnostic views keep their deterministic renderer contracts.

## 2. Hero Client Journey Map

Purpose: show the approved owner-facing explanation of how clients are gained and lost before Lead Intake.

Canonical title: **`Where Clients Are Gained - and Lost`**.

The sole visual authority is the owner-uploaded file copied byte-for-byte to:

`site-caesthetic/assets/img/growth-score/where-clients-are-gained-and-lost--sha256-64d54a5a5fbb1aad.png`

- SHA-256: `64d54a5a5fbb1aaddbfdc9f7641103a0beab53c09e8b79ff38892e8a3348ca05`;
- byte length: `1,056,049`;
- intrinsic dimensions: `6912×3456`;
- MIME: `image/png`.

The renderer emits this exact file through one `<img>`. It must not generate, trace, redraw, reconstruct, translate, recolor, crop, annotate or overlay the visual in HTML, SVG, canvas, CSS or another image format. It must not create an alternate mobile composition or transformed `srcset` derivative. Proportional viewport scaling of the intact PNG is allowed. Substitution is forbidden without explicit owner approval, a canon change and a new hash guard.

### Representative journeys

Retain no more than three continuous evidence-backed paths in the machine artifact:

1. `strongest` — best observable route toward Lead Intake, if one exists;
2. `primary_constraint` — route containing the main verified friction/break;
3. `supporting` — materially different route showing another relevant dependency.

These are representative paths, not claims about tracked individual patients. They support analysis, Broken Connections and evidence drill-down; they do not alter the locked Hero raster. If evidence is incomplete, keep paths absent or gray in the evidence-driven views. Never invent a green success path for visual balance.

## 3. Cross-Surface Journey Graph

The Cross-Surface Journey Graph is a structured evidence artifact inside Cross-Surface diagnostics. It is **not** a fifth surface, a new score, a competitor score, a tracked-patient dataset or an internal-conversion diagnosis.

### Asset graph

Machine graph of observable public assets/actions, including as applicable:

- GBP / Maps listing;
- branded search/owned result;
- website homepage;
- treatment/service page;
- contact page;
- booking destination/form;
- social profile;
- link-in-bio destination;
- review listing/context;
- phone/message/appointment action;
- `lead_intake` boundary node.

Each node retains surface ownership, destination/action identity, source, collection date, observability and evidence references.

### Surface graph

Owner-facing aggregation of the asset graph to:

`Search / Maps · Website · Social · Reviews · Lead Intake`.

Hero and Broken Connections views use this aggregate graph. Evidence drill-down retains asset-level detail.

## 4. Automated graph research pipeline

### A — resolve the public entity

Freeze the approved practice identity/location and canonical public asset candidates. Do not merge similarly named businesses by inference.

### B — discover public assets/actions

Collect observable destinations/actions from each surface:

- Maps/GBP: website, appointment, phone, services and other visible actions;
- Website: service paths, contact/booking actions, social/outbound profile links;
- Social: bio link, link-in-bio, phone/message actions, local/service context;
- Reputation: business/listing continuation actions and trust context that are actually observable.

### C — canonicalize destinations

Resolve redirects and normalize domains, paths and actions. Record the final destination, not only anchor text.

### D — probe discovered/expected edges

For each source → destination transition retain:

- source and target assets;
- expectation: `required | conditional | optional | observed`;
- action type;
- existence;
- HTTP/final destination where applicable;
- technical state;
- owned/third-party/unknown destination;
- next-action availability;
- source intent and destination relevance;
- identity, location, treatment/service, offer and proof continuity;
- evidence reference and collection date.

### E — calculate reachability

Do **not** require every surface to link directly to every other surface.

For each observable entry surface calculate the best valid route to `lead_intake` within the approved `max_hops` of 2–3 transitions.

Derived outputs include:

- `reachable_to_intake`;
- shortest clean hop count;
- alternate clean route;
- friction-only route;
- no valid route;
- loop;
- orphan;
- dead end;
- destination mismatch;
- technical break;
- context break.

### F — semantic continuity

AI may assist with anchored comparison of source versus destination across:

- business identity;
- location/geography;
- priority treatment/service;
- offer / next step;
- positioning;
- proof continuity.

This does not become an automatic Class A fact. Semantic mismatch severity remains human-reviewed.

## 5. Candidate graph diagnostics

The system may surface candidate gaps such as:

- missing route to an appropriate owned/intake destination;
- dead edge;
- misdirected edge;
- duplicate-action collapse;
- platform loop;
- orphaned public asset;
- excessive-hop friction;
- identity break;
- location break;
- treatment/service context break;
- offer/next-step break;
- proof continuity break;
- booking/enquiry break.

Absence of an optional cross-link is not a leak. A red missing/broken edge requires an explicit expectation rule or observed failure.

## 6. Edge states

Each assessed transition uses one state:

- `clean` / green — next step exists, is relevant and works;
- `friction` / amber — viable path exists but adds material ambiguity, hops or context loss;
- `broken` / red — confirmed dead/misdirected path or a human-approved required/conditional route is absent;
- `not_assessed` / gray — evidence is unavailable or the transition was not meaningfully assessed.

Technical integrity and context integrity are stored separately. A technically working link may still have semantic/context friction or break.

Do not label a person as a `lost client` from structural friction alone. Use `confirmed break`, `friction` or `at risk` unless an observable failure occurred.

## 7. Broken Connections Map

Purpose: show the system architecture rather than prospect stories.

Placement: after the Four-Surface snapshot and before the Top 3 owner presentation, while detailed edge evidence remains available later in `evidence-and-competitors`.

Nodes:

`Search / Maps · Website · Social · Reviews · Lead Intake`.

Use one fixed canonical node order for cross-report comparability.

Rendering:

- green solid arrow — verified clean transition;
- amber dotted arrow — friction-heavy/indirect transition;
- red split/broken arrow with `×` — confirmed broken/misdirected/required-missing route;
- gray faint edge — not assessed when it is meaningful to show;
- no edge for irrelevant/optional relationships that were not assessed.

Optional summary may show counts such as:

`2 clean paths to intake · 1 confirmed break · 2 friction routes · 1 not assessed`.

Each assessed edge opens source, destination, observed behavior, why it matters, evidence/date and repair implication.

## 8. Relationship to current metrics and scoring

The Journey Graph is an evidence artifact. It feeds existing metrics only as `effect: evidence_only`, especially:

- `search.gbp_conversion_readiness`;
- `search.entity_integrity`;
- `website.booking_friction`;
- `website.technical_booking_integrity`;
- `social.profile_to_booking`;
- `cross.conversion_continuity`;
- `cross.identity_coherence`;
- `cross.positioning_coherence`;
- `cross.proof_continuity`.

It does not change the current 30/25/15/30 surface weights, add a new scored surface, fill coverage automatically, select Top 3 or choose the binding constraint. Any scoring change requires separate explicit canon approval.

## 9. Lead-to-Revenue Map

This is the separate lower-page internal operating visual. It is not part of the Four Surfaces.

Required spine:

`LEAD RECEIVED → RESPONSE → QUALIFICATION → BOOKING → CONFIRMATION → SHOW → CONSULTATION → PAYMENT`.

State system:

- green `WORKING`;
- amber `FRICTION`;
- red `CONFIRMED LEAK`;
- gray `NOT ASSESSED`.

In Free Growth Score, stages remain gray unless valid internal evidence exists. After an approved internal conversion check or Sprint access, stages may be evidence-coloured.

If an upstream stage is red, downstream stages do not automatically become red; they remain gray if they were not reached/assessed. A factual no-response/drop-off observation does not by itself justify a causal diagnosis about staff, CRM, training or capacity.

The active pricing authority now approves **`Lead-to-Revenue Check · $500`**. If the Check continues directly into the next CAESTHETIC Sprint for the verified constraint, the $500 is credited once toward the $2,500 Sprint total. The map remains gray in outside-in Growth Score and makes no enquiry, booking, patient, revenue, ROI or internal-cause claim without the required evidence.

## 10. Human review boundary

Automation may discover/test public graph edges and propose candidate gaps. It may not autonomously declare the binding constraint or select Top 3.

Named-human approval covers:

- entity/location resolution;
- whether a missing route was genuinely expected;
- semantic/context mismatch findings;
- `friction` versus `broken` severity;
- gap inclusion;
- Primary + Supporting selection;
- final system synthesis.

Missing evidence remains `not_assessed`, never red by default. Reviewer identity stays internal and is not rendered to the client.

## 11. Canonical visual review anchors

In Russian internal review mode only, major visual blocks may carry these small anchors:

- `1101` Hero / Client Journey Map;
- `1102` Four-Surface snapshot / Broken Connections Map;
- `1103` Top 3;
- `1104` competitor decision;
- `1105` final synthesis / Do Not Fund reminder;
- `1106` implementation decision;
- `1107` Lead-to-Revenue Map;
- `1108` next path;
- `1109` founder note.

They are presentation-review metadata, not machine-section numbers or evidence. They disappear after `APPROVE`.

## 12. Mobile implementation

At mobile width:

- show the same exact approved Hero PNG, scaled proportionally with no crop, redraw, overlay or substitute;
- keep Journey Graph evidence and representative-route detail outside the locked Hero in the existing evidence-driven views;
- stack Four-Surface cards;
- preserve Broken Connections edge identity/state in a mobile graph;
- show Primary Focus Gap open and Supporting collapsed;
- keep tables inside contained scroll wrappers;
- render Lead-to-Revenue as a vertical pipeline;
- keep touch targets at least 44px;
- do not allow an early sticky CTA to cover diagnosis.

## 13. Canonical implementation principle

The three complementary diagnostic visuals answer three different questions:

1. **Hero Client Journey Map — approved explanatory viewpoint:** the exact owner-approved visual, without dynamic evidence binding or substitution.
2. **Broken Connections Map — system viewpoint:** which public transitions are missing, broken, misdirected, circular or semantically inconsistent?
3. **Lead-to-Revenue Map — internal operating viewpoint:** what happens after enquiry, and which stages are genuinely assessed?

Together they express the CAESTHETIC logic without creating a generic service menu:

`How demand reaches the practice → where the public system breaks → what happens after the enquiry`.
