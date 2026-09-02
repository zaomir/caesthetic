---
owner: CAESTHETIC
status: proposed
version: 0.1
updated: 2026-09-02
scope: next-version Growth Score visual system, Cross-Surface Journey Graph, automated link-integrity diagnostics and Lead-to-Revenue visual branch
parent: docs/ssot/CAESTHETIC_GROWTH_SCORE_CLIENT_REPORT_STANDARD.md
implementation_parent: docs/caesthetic/growth_score_spec.md
non_authoritative_until_approved: true
---

# CAESTHETIC Growth Score — Next Version Journey Graph (proposal)

This working document preserves the founder-approved direction discussed on 2026-09-02 for the next Growth Score visual/diagnostic version. It is **not active SSOT yet** and must not override the current schema-v5 / template-5.2 contract until explicitly promoted.

## 1. Visual system direction

The next client report keeps one shared template across aesthetic, dental and beauty contexts. The visual story is:

`Owner question → Hero Client Journey Map → Four Surface snapshot → Cross-Surface Broken Connections Map → Top 3 leaks → competitors → final system synthesis → implementation choices → optional Lead-to-Revenue Check visual → next path → founder note`.

The hero is a deterministic HTML/SVG component, not an AI-generated raster image.

### Hero geometry

- client logo fixed in the centre;
- a separate `LEAD INTAKE` ring surrounds the logo and marks the boundary between the public patient-decision system and the internal conversion/patient-operations layer;
- exactly four fixed orbital **slots** surround the centre;
- those slots are populated by `Search / Maps`, `Website`, `Social`, `Reviews`;
- up to three external prospect icons occupy fixed outer entry positions;
- representative evidence-backed journeys are drawn from prospects through surface nodes toward Lead Intake;
- green = clean path, amber = friction, red = confirmed break, gray = not assessed;
- Primary Constraint receives `FIX FIRST` emphasis; Supporting Gaps remain visually secondary;
- Cross-Surface Consistency is shown as an orbit/connection state, never a fifth surface.

The geometry is fixed for brand consistency. The **surface assignment to the four orbital slots may be permuted** to reduce path crossings and make the selected journeys readable. Surface identity is always explicit through icon + label; the four surfaces themselves never change.

## 2. Three complementary visual questions

The next report should use three visual layers rather than force one diagram to answer everything.

1. **Hero Client Journey Map — patient viewpoint.** Where does a prospect experience a clean path, friction or a confirmed break before Lead Intake?
2. **Broken Connections Map — system viewpoint.** Which transitions between public assets/surfaces and Lead Intake are missing, broken, misdirected, circular or semantically inconsistent?
3. **Lead-to-Revenue Map — internal operating viewpoint.** What happens after an enquiry is received? This remains gray/not assessed in the Free Growth Score and becomes evidence-coloured only after an approved internal conversion check or Sprint access.

## 3. Cross-Surface Journey Graph

The proposed new diagnostic layer is `Cross-Surface Journey Graph`. It deepens existing `cross.conversion_continuity`, `cross.identity_coherence`, `cross.positioning_coherence` and related surface metrics. It does **not** create a fifth surface or automatically create a new score.

### 3.1 Two graph levels

#### Asset graph

Machine graph of observable public assets/actions, for example:

- GBP / Maps listing;
- branded search result / owned result;
- website homepage;
- treatment/service page;
- contact page;
- booking destination/form;
- social profile;
- link-in-bio destination;
- review surface/listing;
- phone/message/appointment action;
- `lead_intake` boundary node.

Each asset node records surface ownership, URL/action identity, source, collection date, observability and evidence references.

#### Surface graph

Owner-facing aggregation of the asset graph to the fixed nodes:

`Search / Maps · Website · Social · Reviews · Lead Intake`.

The hero and Broken Connections Map render this aggregate graph, while evidence drill-down can expose asset-level details.

## 4. Automated research pipeline

### Step A — resolve the public entity

Freeze the approved practice identity/location and canonical public asset candidates. Do not merge similarly named businesses by inference.

### Step B — discover public assets

Collect observable destinations/actions from each surface:

- Maps/GBP: website, appointment, phone, services, visible social links where available, review context;
- Website: internal service paths, contact/booking actions, social links, outbound review/profile links;
- Social: bio link, link-in-bio, phone/message actions, local/service context;
- Reputation: public listing context, business actions/destinations available from the review/listing experience.

### Step C — canonicalize destinations

Resolve redirects and normalize domains/paths/actions. Record final destination rather than trusting anchor text.

### Step D — probe every discovered edge

For each source → destination transition record:

- edge exists;
- source asset;
- target asset/surface;
- action type (`link`, `book`, `call`, `message`, `native_navigation`, etc.);
- HTTP/final destination where applicable;
- working / broken / redirected;
- owned / third-party / unknown destination;
- destination relevance to the source intent;
- location context preserved;
- service/treatment context preserved;
- identity coherence preserved;
- next action available;
- evidence ref + collection date.

### Step E — calculate reachability rather than requiring every possible direct link

Do **not** require all four surfaces to directly link to one another. That would manufacture gaps.

For each observable entry surface, calculate the best valid path to `lead_intake` within a small hop limit (recommended max 2–3 transitions).

Key outputs:

- `reachable_to_intake`;
- shortest clean hop count;
- alternate clean route available;
- friction route only;
- no valid route;
- loop detected;
- orphaned asset;
- destination mismatch;
- context lost between steps.

### Step F — semantic continuity check

AI may compare source promise/context with destination content for:

- business identity;
- geography/location;
- priority service/treatment;
- offer/next step;
- positioning;
- proof continuity.

This is an AI-assisted inference/anchored assessment, not an automatic Class A fact. Final gap severity remains human-approved under the existing evidence policy.

### Step G — graph diagnostics

The system should automatically surface candidate cross-surface gaps such as:

- **Missing route to owned destination** — e.g. Maps has no usable Website/Appointment path and no clean direct intake route;
- **Dead edge** — link/action returns failure or unusable endpoint;
- **Misdirected edge** — source says Website/Book but destination is unrelated or wrong geography/service;
- **Duplicate-action collapse** — e.g. Website and Appointment both lead to the same Instagram profile without a distinct booking path;
- **Platform loop** — Social → Social or Maps → Instagram → another Instagram without reaching an owned/intake destination;
- **Orphan surface** — useful public asset exists but is not reachable from the rest of the system or has no reasonable next step;
- **Excessive hop friction** — a viable action exists only after unnecessary hops;
- **Identity break** — business name/location/entity changes materially across a transition;
- **Offer/context break** — user enters for treatment/service X but destination does not preserve that intent;
- **Proof break** — evidence/trust created on one surface cannot be continued at the destination;
- **Booking break** — interest reaches a public surface but there is no usable enquiry/booking action.

Absence of an optional cross-link is not a leak. A red `broken/missing` edge requires an explicit expectation rule or an observed path failure.

## 5. Edge expectation policy

The graph uses route expectations, not a naïve 4×4 requirement matrix.

Recommended baseline rules:

- every observable public entry surface should have a clean route to `lead_intake` directly or through an appropriate controlled destination;
- Search/Maps should normally expose a usable Website and/or direct enquiry/appointment route where the business publicly claims one;
- Website must have a usable enquiry/booking route for the audited priority offer;
- Social should provide a usable path to a controlled destination or direct enquiry/booking action;
- Reputation must support trust and a reasonable return/continuation path within the business listing/context; it is not required to directly link to every other surface;
- optional Website↔Social, Website↔Reviews or other cross-links are assessed only where they materially support the patient decision; their absence is not automatically a defect.

Vertical-specific vocabulary may adapt the expectation description without changing Four Surfaces.

## 6. Edge status

Each evidence-backed transition uses one state:

- `clean` / green — next step is available, relevant and works;
- `friction` / amber — path exists but adds material ambiguity, hops or context loss;
- `broken` / red — confirmed dead/misdirected path or required route is absent;
- `not_assessed` / gray — evidence is unavailable or the transition is not meaningfully assessed.

Do not label a person as a `lost client` from structural friction alone. Use `confirmed break`, `friction` or `at risk` unless an observable failure occurred.

## 7. Representative hero journeys

The hero should not pretend to display tracked individual patients. Journeys are labelled as representative evidence-backed paths unless real analytics supports otherwise.

Select up to three:

1. **strongest path** — best observable route toward Lead Intake, if one exists;
2. **Primary Constraint path** — route containing the main verified break/friction;
3. **Supporting/Cross-Surface path** — a materially different route that demonstrates another relevant system dependency.

If evidence is incomplete, render fewer journeys or gray segments. Never invent a green success path merely to balance the graphic.

## 8. Adaptive orbital layout

To preserve one recognisable composition while avoiding tangled lines:

- centre position is fixed;
- Lead Intake ring is fixed;
- four orbital coordinates are fixed;
- three prospect entry coordinates are fixed;
- the assignment of the four surface types to the four orbital slots is chosen automatically from the 24 possible permutations.

A simple layout cost function should minimize, in this order:

1. route crossings;
2. overlapping labels/edge markers;
3. total route bends/length;
4. distance from each prospect entry to its first journey node;
5. unnecessary deviation from a preferred canonical orientation.

This gives every report a recognisable template without forcing unreadable path intersections.

For the **Broken Connections Map**, use a fixed canonical surface order for easier comparison between reports; only the hero uses adaptive slot assignment.

## 9. Broken Connections Map

Place this secondary visual after the Four Surface snapshot and before the Top 3 accordion when cross-surface evidence is meaningful.

Purpose: show system architecture rather than prospect stories.

Nodes:

`Search / Maps · Website · Social · Reviews · Lead Intake`.

Rendering:

- green solid arrow — verified clean transition;
- amber dotted arrow — existing but friction-heavy/indirect transition;
- red split arrow with `×` — confirmed broken/misdirected/required-missing route;
- gray faint edge — not assessed when worth showing;
- no edge at all for relationships that are irrelevant/optional and were not assessed.

Optional compact summary:

`2 clean paths to intake · 1 confirmed break · 2 friction routes · 1 not assessed`.

Each edge is clickable/tappable to open:

- source;
- destination;
- observed behavior;
- why it matters;
- evidence/date;
- repair implication.

This map is part of Cross-Surface diagnostics, not a new product surface.

## 10. Relationship to current scoring

Initial next-version implementation should **not change the existing 30/25/15/30 surface weights or add a new scored surface**.

The graph becomes a structured evidence artifact feeding existing metrics, especially:

- `search.gbp_conversion_readiness`;
- `search.entity_integrity`;
- `website.booking_friction`;
- `website.technical_booking_integrity`;
- `social.profile_to_booking`;
- `cross.conversion_continuity`;
- `cross.identity_coherence`;
- `cross.positioning_coherence`;
- `cross.proof_continuity`.

A later scoring change requires separate explicit canon approval.

## 11. Lead-to-Revenue Check visual branch

A second, separate graphic appears lower in the report to break up long text and show the internal layer.

Free Growth Score state:

`Lead received → Response → Qualification → Booking → Confirmation → Show → Consultation → Payment`

All stages are gray/not assessed unless valid internal evidence exists.

After an approved internal conversion check or Sprint access, stages may become green/amber/red/gray from real evidence. This graphic never retroactively turns internal causes into outside-in findings.

The proposed `$500` commercial amount remains **non-canonical until pricing authority explicitly approves it**. The visual/data contract should therefore store `check_offer_price` as configuration, not hardcoded report copy.

## 12. Proposed next-version visual order

1. Hero owner question + Hero Client Journey Map.
2. Four Surface snapshot cards.
3. Cross-Surface Broken Connections Map.
4. Top 3 leak accordions + Full Gap Inventory drill-down.
5. Competitive Decision Analysis.
6. Final system synthesis + Do Not Fund Yet.
7. DIY / separate specialists / CAESTHETIC / defer decision.
8. Lead-to-Revenue internal map and optional internal-check branch.
9. What happens next.
10. Founder personal note.

The current machine contract may continue to remain Intro + nine canonical sections; these visual chapters must be mapped inside it unless a separate version migration is approved.

## 13. Human review boundary

Automation may discover and test public graph edges and propose candidate leaks. It may not autonomously declare a binding constraint or change Top 3.

Human review must approve:

- entity resolution;
- whether a missing edge was genuinely expected;
- semantic mismatch findings;
- severity (`friction` vs `broken`);
- candidate gap inclusion;
- Primary + Supporting selection;
- final owner-facing synthesis.

Missing evidence remains `not_assessed`, never a red edge by default.
