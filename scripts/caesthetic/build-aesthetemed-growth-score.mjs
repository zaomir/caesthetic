#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGrowthScoreReportTemplate } from "./growth-score-report-template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const collectedAt = "2026-08-21";
const approvedAt = process.env.AESTHETEMED_APPROVED_AT || "2026-08-21T02:25:02Z";
const slug = "aesthetemed-public-evidence-7c3e91b4a8f26d50";
const maps = "https://www.google.com/maps/place/Aesthetemed+Beauty+%26+Wellness+Clinic/@25.9411689,-80.1410162/";
const website = "https://aesthetemed.com/";
const contact = "https://aesthetemed.com/Contact/";
const instagram = "https://www.instagram.com/aesthetemed/";
const facebook = "https://www.facebook.com/aesthetemed";
const vip = "https://www.vipaestheticcenter.com/";
const vipReviews = "https://reviews.birdeye.com/vip-aesthetic-center-med-spa-168808412985315";
const kami = "https://kamiaesthetics.com/";
const kamiFaq = "https://kamiaesthetics.com/faq";
const bogat = "https://www.bogat.com/";

const unavailable = (metric_id, label, reason) => ({
  metric_id, label, raw_value: null, normalized_score: null, evidence_class: "A",
  source: null, collected_at: null, reviewer_status: "pending", finding: undefined,
  unavailable_reason: reason,
});
const approved = (metric_id, label, raw_value, normalized_score, source, finding) => ({
  metric_id, label, raw_value, normalized_score, evidence_class: "A", source,
  collected_at: collectedAt, reviewer_status: "approved", finding,
});

const surfaces = [
  {
    id: "search", summary: "Search scoring is withheld because no geo-grid, live GBP rating/count, or full category evidence was available.",
    owner_card: { strength: "A resolved Medical Spa entity is publicly identifiable.", problem: "Public address, phone and hours fields conflict inside the owned website markup.", priority: "HIGH" },
    metrics: [
      unavailable("map_visibility", "Map visibility", "No Local Falcon or equivalent geo-grid was available."),
      unavailable("gbp_treatment_category_completeness", "GBP category and treatment completeness", "Only the Medical Spa category was resolved; GBP services and secondary categories were unavailable."),
      approved("entity_integrity", "Entity integrity", { maps_name: "Aesthetemed Beauty & Wellness Clinic", maps_category: "Medical Spa", address_values: ["Suite 100", "Suite 303"], phone_values: ["786-966-7878", "954-231-0602"], hours_values: ["Mon-Sat 9-7; Sun 9-5", "all days 9-5", "Mon-Fri 9-7; Sat 9-5"] }, 35, `${maps}; ${website}; ${contact}`, "Owned website markup contains conflicting suite, phone and hours values, so public entity integrity is not yet clean."),
      unavailable("gbp_conversion_readiness", "GBP conversion readiness", "Live GBP action fields and destination paths were not directly inspected."),
      unavailable("freshness", "Search freshness", "No dated GBP posts, photos or service changes were captured."),
      unavailable("branded_search_control", "Branded-search control", "A reproducible branded SERP inspection was not captured."),
    ],
  },
  {
    id: "website", summary: "The site presents broad treatment coverage and visible contact paths; identity consistency and proof specificity are the main public-evidence gaps.",
    owner_card: { strength: "Broad services and visible WhatsApp, call and Zenoti paths are present.", problem: "Provider/device proof and booking logistics are less explicit than selected alternatives, while owned identity data conflicts.", priority: "HIGH" },
    metrics: [
      approved("booking_friction", "Booking friction", { visible_actions: ["Book on WhatsApp", "Call Now"], booking_destination: "Zenoti services link present", limitation: "No form submission or full mobile completion test" }, 70, `${website}; https://aesthetemedllc.zenoti.com/webstoreNew/services`, "Visible WhatsApp, phone and Zenoti paths provide several enquiry options, but end-to-end booking completion was not tested."),
      approved("treatment_clarity", "Treatment clarity", { subject: ["injectables", "Morpheus8", "Endolift", "UltraClear", "IPL", "GLP-1", "IV", "Hydrafacial", "FUE"], comparison_sources: [vip, kami, kamiFaq, bogat] }, 78, `${website}; ${vip}; ${kami}; ${kamiFaq}; ${bogat}`, "The site clearly presents a broad aesthetics, wellness and hair-restoration range; selected competitors provide stronger treatment-level expectation or logistics detail."),
      unavailable("mobile_performance", "Mobile performance", "No defensible Lighthouse or equivalent measurement was available."),
      unavailable("above_fold_conversion", "Above-fold conversion", "CTA presence was found in public HTML, but no reliable mobile viewport inspection was available."),
      approved("clinician_trust_proof", "Clinician and trust proof", { subject_claims: ["Experienced Practitioners", "Full Face Assessment", "team content"], comparison: "Selected competitors expose more provider, credential or device specificity" }, 55, `${website}; ${vip}; ${bogat}`, "Trust and team claims are visible, but provider credentials, device ownership and treatment-level expectations are less specific than selected local alternatives."),
      unavailable("mystery_shopper", "Mystery Shopper", "Not performed; no form was submitted and no patient was impersonated."),
      unavailable("technical_booking_integrity", "Technical booking integrity", "Booking destinations were identified, but no end-to-end submission or appointment creation was performed."),
    ],
  },
  {
    id: "social", summary: "Official profiles were identified, but content recency, treatment proof and profile-to-booking continuity were not inspected reliably.",
    owner_card: { strength: "The owned website links Instagram and Facebook profiles.", problem: "Content and profile-to-booking evidence was insufficient.", priority: "MEDIUM" },
    metrics: [
      unavailable("priority_treatment_presence", "Priority-treatment presence", "Official account content was not inspected."),
      unavailable("clinician_expertise", "Clinician expertise", "Official account content was not inspected."),
      unavailable("proof_quality", "Proof quality", "Official account content was not inspected."),
      unavailable("recency", "Social recency", "No reliable post dates or cadence window was captured."),
      unavailable("profile_to_booking", "Profile-to-booking continuity", "The social profile booking path was not tested."),
      unavailable("local_offer_clarity", "Local offer clarity", `Website-linked profiles: ${instagram} and ${facebook}; profile content was not inspected.`),
    ],
  },
  {
    id: "reputation", summary: "A bounded on-site testimonial widget shows detailed positive treatment and practitioner proof, but live GBP depth, velocity and response behavior were unavailable.",
    owner_card: { strength: "The inspected nine-item widget includes repeated practitioner and treatment-specific statements.", problem: "The sample is self-selected, undated and cannot establish live Google review performance.", priority: "MEDIUM" },
    metrics: [
      unavailable("review_velocity_90d", "90-day review velocity", "Dated live-platform reviews were unavailable."),
      unavailable("rating", "Public rating", "No direct live GBP rating/count was captured; contradictory aggregator values were excluded."),
      approved("review_depth", "Review depth", { subject_sample: "9 Google-attributed testimonials embedded on the owned site", subject_repeated_positive: { professional_or_knowledgeable: 5, clean_or_organized: 2, treatment_or_result_detail: 4 }, competitor_samples: { vip: "Birdeye 4.8/742 snapshot plus two independent price/offer excerpts", kami: "Owned-site 5.0/113 statement with one dated excerpt; recurrence insufficient", bogat: "Owned-site testimonials repeat clean/luxury and knowledgeable/professional themes" }, limitation: "bounded self-selected or aggregator samples; not representative live GBP corpora" }, 68, `${website}; ${vipReviews}; https://www.groupon.com/biz/hallandale-beach-fl/vip-aesthetic-center; https://laserhairremovalnearby.com/fl/hallandale-beach/vip-aesthetic-center-med-spa-168328586460109556/; ${kami}; ${bogat}`, "The bounded subject widget contains repeated practitioner, cleanliness and treatment-detail themes; labelled competitor proxies support only the disclosed comparison themes, not live GBP performance."),
      unavailable("recency", "Review recency", "The embedded testimonial sample is undated."),
      unavailable("response_coverage", "Response coverage", "Owner responses were not observable in the bounded site widget."),
      unavailable("response_speed", "Response speed", "Review and response timestamps were unavailable."),
      unavailable("negative_review_handling", "Negative-review handling", "No eligible negative-review response sample was available."),
      approved("treatment_clinician_proof", "Treatment and clinician proof", { sample_size: 9, treatment_or_result_mentions_at_least: 4, examples: ["Morpheus8", "laser hair removal", "FUE", "weight loss"] }, 70, website, "At least four items in the bounded widget mention a treatment or stated result; this does not substitute for a live-platform review sample."),
    ],
  },
];

const crossSurface = {
  summary: "The owned website communicates a coherent broad proposition, but conflicting identity fields and incomplete social/GBP evidence prevent a Cross-Surface score.",
  metrics: [
    unavailable("treatment_presence", "Treatment presence", "Treatment coverage was not observable across all four surfaces."),
    approved("positioning_coherence", "Positioning coherence", { owned_site: "Beauty & Wellness Clinic / Med Spa", service_breadth: "aesthetics, wellness and hair restoration", limitations: "social and live GBP content not fully inspected" }, 72, `${website}; ${maps}`, "The resolved Maps category and owned-site proposition align at a broad Med Spa level, while full cross-surface treatment positioning remains unverified."),
    unavailable("proof_continuity", "Proof continuity", "Proof was observed on the website and embedded testimonial widget, but not across all four surfaces."),
    unavailable("conversion_continuity", "Conversion continuity", "GBP and social origin paths were not tested end to end."),
    approved("identity_coherence", "Identity coherence", { consistent_name: "Aesthetemed Beauty & Wellness Clinic", conflicts: ["Suite 100 vs Suite 303", "786-966-7878 vs 954-231-0602", "three hours representations"] }, 35, `${maps}; ${website}; ${contact}`, "Name and broad location resolve, but suite, phone and hours conflicts weaken identity continuity across owned public data."),
  ],
};

const problem_inventory = [
  { id: "P1", surface: "search", title: "Owned public identity fields conflict", evidence_refs: ["search.entity_integrity", "cross.identity_coherence"], impact: "Conflicting suite, phone and hours values can create choice and routing uncertainty.", task_refs: ["T1"], suggested_horizon: "Immediate", status: "diagnosed", priority: "high", complexity: "Medium" },
  { id: "P2", surface: "website", title: "Provider, device and treatment-expectation proof is uneven", evidence_refs: ["website.treatment_clarity", "website.clinician_trust_proof"], impact: "Selected local alternatives expose more specific credentials, devices, before/after structure or treatment expectations.", task_refs: ["T2"], suggested_horizon: "30 days", status: "diagnosed", priority: "high", complexity: "Medium" },
  { id: "P3", surface: "social", title: "Official social identity and booking continuity are not verified", evidence_refs: ["cross.positioning_coherence", "cross.identity_coherence"], impact: "The owned site links social profiles, but account ownership and profile-to-booking continuity were not evidenced.", task_refs: ["T3"], suggested_horizon: "Immediate", status: "diagnosed", priority: "high", complexity: "Low" },
  { id: "P4", surface: "reputation", title: "Live reputation performance is not assessable from the available sample", evidence_refs: ["reputation.review_depth", "reputation.treatment_clinician_proof"], impact: "The self-selected, undated widget supports narrow positive observations but not rating, velocity, response or negative-handling conclusions.", task_refs: ["T4"], suggested_horizon: "30-90 days", status: "diagnosed", priority: "medium", complexity: "Medium" },
];

const remediation_tasks = [
  { id: "T1", problem_refs: ["P1"], outcome: "One owner-approved suite, phone and hours set appears consistently across public owned data.", steps: ["Confirm the authoritative address, phone and hours with the owner.", "Update visible contact content, booking modal, Yoast schema and custom schema.", "Re-crawl and compare every emitted identity field."], evidence_refs: ["search.entity_integrity", "cross.identity_coherence"], prerequisites_access: ["Website CMS and schema access", "Owner-approved canonical NAP and hours"], dependencies: [], sequence: { order: 1, rationale: "Identity normalization precedes traffic or booking-path expansion." }, owner_role: "Web administrator with local-entity/schema experience", effort_complexity: "Medium — several templates and schema emitters must agree", implementation_risk: "A partial update can preserve conflicts; use a post-change field inventory.", horizon: "Immediate implementation; verify after deploy", acceptance_evidence: ["Rendered-page and structured-data export show one suite, phone and hours set", "Visible contact and booking modal match"], next_action: "Freeze the owner-approved NAP and hours record." },
  { id: "T2", problem_refs: ["P2"], outcome: "Priority treatment paths expose attributable provider/device proof, expectations and a clear next step.", steps: ["Select priority treatments from observed demand and owner strategy.", "Add verified provider credentials and device ownership only where documented.", "Add candidacy, session, downtime, proof and booking-logistics modules."], evidence_refs: ["website.treatment_clarity", "website.clinician_trust_proof"], prerequisites_access: ["Qualified clinical/compliance review", "Verified provider credentials and approved media"], dependencies: ["T1"], sequence: { order: 2, rationale: "Proof modules should inherit the corrected identity and booking destinations." }, owner_role: "Clinical content owner, web editor and compliance reviewer", effort_complexity: "Medium — evidence collection and clinical review are required", implementation_risk: "Unverified clinical or outcome claims; require source and approval for every claim.", horizon: "30 days for selected priority pages", acceptance_evidence: ["Live priority pages identify verified provider/device context", "Expectation and booking modules pass content review"], next_action: "Choose the first two priority treatment pages and assemble their proof inventory." },
  { id: "T3", problem_refs: ["P3"], outcome: "One verified official social identity leads to the corrected owned booking path.", steps: ["Confirm official account ownership.", "Remove or clarify ambiguous owned links where applicable.", "Test bio-to-treatment-to-booking paths without submitting a form."], evidence_refs: ["cross.positioning_coherence", "cross.identity_coherence"], prerequisites_access: ["Social account ownership confirmation", "Website access"], dependencies: ["T1"], sequence: { order: 3, rationale: "Social destinations should point to the normalized identity and booking path." }, owner_role: "Social profile owner and web administrator", effort_complexity: "Low — verification and link correction", implementation_risk: "Editing the wrong account; confirm ownership before changes.", horizon: "Immediate after identity normalization", acceptance_evidence: ["Owner-approved account registry", "Recorded profile-to-booking path test"], next_action: "Confirm which Instagram and Facebook profiles are owner-controlled." },
  { id: "T4", problem_refs: ["P4"], outcome: "A reproducible live-platform reputation baseline is available.", steps: ["Capture direct GBP rating and count.", "Sample dated reviews under one disclosed window.", "Count response coverage, observable speed and repeated themes without review gating."], evidence_refs: ["reputation.review_depth", "reputation.treatment_clinician_proof"], prerequisites_access: ["Direct public GBP review access", "Documented sampling rule"], dependencies: [], sequence: { order: 4, rationale: "This is an evidence-completion task and does not block identity correction." }, owner_role: "Reputation analyst", effort_complexity: "Medium — dated sampling and recurrence checks", implementation_risk: "Biased sampling or overgeneralization; preserve the window, counts and excerpts.", horizon: "30 days", acceptance_evidence: ["Dated review export or reproducible evidence sheet", "Computed coverage and recurrence with sample size"], next_action: "Capture the live GBP baseline using a fixed sampling window." },
];

const insufficient = (finding, limitation) => ({ status: "insufficient_evidence", finding, evidence_refs: [], limitation });
const observed = (finding, refs) => ({ status: "observed", finding, evidence_refs: refs });
const src = (url_or_snapshot, source_type, sample_note) => ({ url_or_snapshot, source_type, collected_at: collectedAt, sample_note });
const competitor = ({ id, name, address, site, social, websiteFinding, reputationFinding, themesPositive = [], themesNegative = [], strengths, risks, choice, advantage, gap, extraSources = [] }) => ({
  id, name, competitor_type: "local", selection_reason: `Named local patient-choice alternative with overlapping aesthetics services near Hallandale Beach/Aventura.`, branch_scope: address,
  patient_choice_reason: choice, observable_advantage: advantage, observable_gap: gap,
  repeat: "Repeat clear treatment navigation and decision-useful logistics where evidence supports it.", improve: "Use verified provider, device and expectation proof without copying unsupported claims.", do_not_copy: "Do not copy unqualified superlatives, promo-first framing or unverified outcome claims.",
  strategic_implication: "Treatment breadth should be paired with specific proof and a low-ambiguity next step.", constraint_effect: "The comparison reinforces the need to remove public identity ambiguity and strengthen choice proof.", priority_effect: "Supports priorities P1 and P2.", modernization_implication: "Evaluate provider/device specificity and treatment expectation modules with qualified review.",
  strengths, weaknesses_or_risks: risks, limitations: "Social content, live GBP response behavior and a directly comparable geo-grid were insufficient evidence; reputation proxies are labelled by source.",
  sources: [src(site, "website", "Direct public website inspection"), src(social, "social", "Official profile identified; content not inspected"), ...extraSources],
  surface_evidence: { search: insufficient("Insufficient evidence — no direct comparable GBP/geo-grid capture.", "Direct live GBP comparison was unavailable."), website: observed(websiteFinding, ["website.treatment_clarity", "website.clinician_trust_proof"]), social: insufficient("Insufficient evidence — profile identified but posts and recency were not inspected.", "Content sample unavailable."), reputation: reputationFinding ? observed(reputationFinding, ["reputation.review_depth"]) : insufficient("Insufficient evidence — no direct comparable live-platform corpus.", "Only self-published or incomplete evidence was available.") },
  repeated_positive_themes: themesPositive, repeated_negative_themes: themesNegative,
  evidence_refs: ["website.treatment_clarity", "website.clinician_trust_proof"],
});
const theme = (theme, mentions, sample_size, window, evidence_refs) => ({ theme, mentions, sample_size, window, evidence_refs });
const entries = [
  competitor({ id: "vip", name: "VIP Aesthetic Center Med Spa", address: "2500 E Hallandale Beach Blvd Ste 209, Hallandale Beach", site: vip, social: "https://www.instagram.com/vipaestheticcentermedspa/", websiteFinding: "Clear injectables/laser focus, named medical director, appointment CTA, FAQs and named modalities.", reputationFinding: "Birdeye showed 4.8/742 while Medical Spa Locator showed 4.8/644, so both are aggregator proxies rather than a live GBP count.", themesPositive: [theme("Reviewers in the five inspected aggregator excerpts report friendly, professional or welcoming staff.", 2, 5, "Five Birdeye excerpts inspected 2026-08-21", ["reputation.review_depth"])], themesNegative: [theme("Independent public excerpts repeat price, fee or offer-clarity concerns.", 2, 2, "Cross-source excerpts inspected 2026-08-21", ["reputation.review_depth"])], strengths: ["Named medical director", "Focused treatment proposition", "Clear appointment CTA"], risks: ["Aggregator review-count variance", "Repeated price/offer-clarity reports require careful interpretation"], choice: "A patient may value named medical leadership and a focused injectable/laser proposition.", advantage: "More explicit provider credentials and modality focus.", gap: "Public price/offer clarity is a repeated reviewer-reported risk.", extraSources: [src(vipReviews, "review_platform", "Birdeye aggregator snapshot 4.8/742; five visible excerpts inspected"), src("https://www.medicalspalocator.com/med-spa/vip-aesthetic-center-med-spa-aventura-fl", "directory", "Medical Spa Locator aggregator snapshot 4.8/644"), src("https://www.groupon.com/biz/hallandale-beach-fl/vip-aesthetic-center", "directory", "One independent price/offer excerpt"), src("https://laserhairremovalnearby.com/fl/hallandale-beach/vip-aesthetic-center-med-spa-168328586460109556/", "directory", "Second independent price/offer excerpt")] }),
  competitor({ id: "kami", name: "Kami Aesthetics", address: "2999 NE 191st St Floor 9, Aventura", site: kami, social: "https://www.instagram.com/kami.aesthetic/", websiteFinding: "Detailed treatment taxonomy, treatment-specific before/after examples and booking/parking FAQ.", reputationFinding: "The owned site states 5.0/113 Google reviews but exposes only one dated excerpt; recurrence is insufficient.", strengths: ["Treatment taxonomy", "Before/after layout", "Booking and parking logistics"], risks: ["Review count is self-published and not live-GBP verified", "No repeated review themes established"], choice: "A patient may value visible before/after structure and practical booking logistics.", advantage: "More explicit proof layout and visit logistics.", gap: "Live GBP and response behavior were unavailable.", extraSources: [src(kamiFaq, "website", "Direct FAQ inspection"), src("https://www.tiktok.com/@kamiaesthetics", "social", "Official profile identified; content not inspected")] }),
  competitor({ id: "bogat", name: "Bogat Aesthetics & Wellness", address: "800 N Federal Hwy Unit 805, Hallandale Beach", site: bogat, social: "https://www.instagram.com/bogat_aesthetics/", websiteFinding: "Provider-specific pages, physician oversight, named devices and treatment expectation/session/downtime guidance.", reputationFinding: "Owned-site testimonials repeat clean/luxury and knowledgeable/professional themes; no live Google corpus was verified.", themesPositive: [theme("Site-hosted testimonials repeat clean or luxury environment and knowledgeable or professional care.", 2, 2, "Owned-site testimonial sample inspected 2026-08-21", ["reputation.review_depth"])], strengths: ["Provider and device specificity", "Treatment education", "Consultation clarity"], risks: ["Testimonials are self-published", "Live reputation depth and responses unavailable"], choice: "A patient may value physician oversight, named devices and explicit treatment expectations.", advantage: "More specific provider/device ownership and expectation guidance.", gap: "No verified live-platform reputation baseline was available.", extraSources: [src("https://www.bogat.com/services/aesthetics/laser-treatments/laser-hair-removal/", "website", "Treatment detail inspection"), src("https://www.bogat.com/services/aesthetics/face-treatments/botox/", "website", "Treatment detail inspection")] }),
];

const decisionItem = (title, rationale, refs) => ({ title, rationale, evidence_refs: refs });
const report = {
  ...createGrowthScoreReportTemplate(),
  schemaVersion: 4, reportState: "approved_report", reportVersion: "aesthetemed-public-evidence-v1", verifiedFactSetVersion: "aesthetemed-public-evidence-2026-08-21-v1", reportKind: "real",
  disclosure: "Independent public-evidence diagnostic prepared as a CAESTHETIC test; no client relationship is implied.",
  practice: { name: "Aesthetemed Beauty & Wellness Clinic", location: "Hallandale Beach, Florida, United States", preparedAt: collectedAt, preparedFor: "Independent public-evidence test" },
  executiveSummary: "A broad public service range and visible booking paths are already present. The first constraint is conflicting owned identity and booking information; proof specificity and social continuity follow.",
  surfaces, crossSurface,
  humanDiagnosis: {
    reviewer_status: "approved", reviewer: { name: "Alex Goldman", approved_at: approvedAt },
    objective_strength: { title: "A broad aesthetics, wellness and hair-restoration range is clearly presented with visible enquiry paths.", evidence_refs: ["website.treatment_clarity", "website.booking_friction"] },
    strongest_surface: "website",
    binding_constraint: { title: "Public entity and booking identity inconsistency", statement: "Aesthetemed is easy to identify and contact, but conflicting suite, phone and hours values inside owned public markup create avoidable uncertainty before enquiry.", demand_stage: "enquiry", evidence_refs: ["search.entity_integrity", "cross.identity_coherence"] },
    current_state: { strengths: ["Broad treatment coverage is visible.", "WhatsApp, phone and Zenoti paths are present."], constraint_label: "Conflicting owned identity fields", constraint_detail: "Suite, phone and hours values do not resolve to one consistent public record.", priority_line: "Normalize identity data before scaling traffic to affected paths." },
    top_priorities: [
      { id: "PR1", title: "Normalize NAP, hours, schema and phone", evidence_refs: ["search.entity_integrity", "cross.identity_coherence"], impact: "Removes a verified public identity conflict.", problem_refs: ["P1"], task_refs: ["T1"], why_now: "It is the first dependency for every discovery-to-booking path.", expected_effect: "One consistent public identity and destination set.", complexity: "Medium" },
      { id: "PR2", title: "Strengthen provider, device and treatment proof plus booking logistics", evidence_refs: ["website.treatment_clarity", "website.clinician_trust_proof"], impact: "Closes decision-detail gaps visible against selected alternatives.", problem_refs: ["P2"], task_refs: ["T2"], why_now: "The broad offer is already visible; proof specificity is the next choice constraint.", expected_effect: "More decision-useful priority treatment pages without unverified claims.", complexity: "Medium" },
      { id: "PR3", title: "Confirm official social identity and treatment-to-booking continuity", evidence_refs: ["cross.positioning_coherence", "cross.identity_coherence"], impact: "Creates an auditable route from verified profiles to corrected booking destinations.", problem_refs: ["P3"], task_refs: ["T3"], why_now: "Account ownership and social path evidence are not yet verified.", expected_effect: "One owner-approved profile registry and tested destination path.", complexity: "Low" },
    ],
    problem_inventory, remediation_tasks,
    do_not_do: { title: "Do not scale paid traffic to affected paths yet", rationale: "Normalize and verify the public identity and booking destinations first; this is a sequencing recommendation, not a claim about current campaign performance.", evidence_refs: ["search.entity_integrity", "cross.identity_coherence"], revisit_after: ["One owner-approved NAP, hours and phone set renders everywhere", "WhatsApp, call and Zenoti destinations pass a non-submission path check"] },
    competitors: {
      status: "applicable", selection_method: "Exactly three named Hallandale Beach/Aventura patient-choice alternatives with overlapping injectable, laser, skin or wellness services; no ranking claim.", sample_limitations: "No comparable geo-grid, complete social sample, direct live-GBP corpus or response-speed sample was available.", comparison_window: { start: collectedAt, end: collectedAt }, review_sample_rule: "Use only disclosed public samples; recurrence requires at least two eligible observations. Self-published and aggregator evidence remains labelled.", branch_scope: "Aesthetemed Hallandale Beach at 2100 E Hallandale Beach Blvd Suite 100.", entries,
      comparison_matrix: { subject_name: "Aesthetemed Beauty & Wellness Clinic", rows: [
        { entity_ref: "subject", entity_name: "Aesthetemed Beauty & Wellness Clinic", entity_type: "subject", search: "Resolved Medical Spa entity; owned suite, phone and hours values conflict.", website: "Broad service taxonomy and visible WhatsApp/call/Zenoti paths; provider proof is less specific.", social: "Insufficient evidence — official profiles identified, content/path not inspected.", reputation: "Bounded nine-item site widget only; live GBP metrics unavailable.", evidence_refs: ["search.entity_integrity", "website.treatment_clarity", "reputation.review_depth"] },
        ...entries.map((entry) => ({ entity_ref: entry.id, entity_name: entry.name, entity_type: "competitor", search: entry.surface_evidence.search.finding, website: entry.surface_evidence.website.finding, social: entry.surface_evidence.social.finding, reputation: entry.surface_evidence.reputation.finding, evidence_refs: entry.evidence_refs })),
      ] },
      decision_summary: {
        defend: [decisionItem("Defend integrated program breadth and visible enquiry pathways", "Aesthetemed already presents a broad aesthetics, wellness and hair-restoration range with WhatsApp, phone and Zenoti paths.", ["website.treatment_clarity", "website.booking_friction"])],
        close: [decisionItem("Close provider/device proof and booking-logistics gaps", "Selected alternatives expose more decision-useful credentials, devices, expectations, before/after structure or visit logistics.", ["website.treatment_clarity", "website.clinician_trust_proof"])],
        differentiate: [decisionItem("Differentiate broad aesthetics plus wellness through explicit program pathways", "Breadth becomes more useful when cross-service pathways and ownership are explicit.", ["website.treatment_clarity", "cross.positioning_coherence"])],
        do_not_copy: [decisionItem("Do not copy unsupported superlatives or promo-first framing", "Public claims and offer economics require substantiation and owner/compliance approval.", ["website.clinician_trust_proof"])],
      },
      market_practice_gap: { status: "applicable", reason: "Selected local alternatives expose more provider/device specificity and treatment expectation/proof structure.", recommendations: [
        { title: "Evaluate provider/device and treatment-expectation modules", current_state: "Aesthetemed presents broad services and general trust claims.", market_shift: "Selected alternatives expose named providers/devices, before/after structure, visit logistics or expectation guidance.", evidence_scope: "Direct public website comparison of the subject and three selected alternatives on 2026-08-21.", business_implication: "More attributable proof can reduce patient choice uncertainty without narrowing the integrated proposition.", transition_economics: "Evaluate on selected priority pages before wider rollout; no revenue outcome is assumed.", dependencies: ["Verified provider credentials", "Approved device ownership", "Qualified clinical/compliance review"], decision: "evaluate", specialist_validation: "Qualified clinical and regulatory review is required before publishing clinical, device or outcome implications.", evidence_refs: ["website.treatment_clarity", "website.clinician_trust_proof"], limitations: "This is a public marketing-structure comparison, not a clinical superiority or safety conclusion." },
      ] },
    },
    walkthrough: { status: "pending", url: null, placeholder: "Valerie Petra walkthrough pending. No recording has been generated or implied for this test." },
    coordination_burden: { diagnosed_issues: problem_inventory.length, high_priority_fixes: 3, systems_involved: null, dependencies: null, specialist_roles: null },
    roadmap_preview: { weeks: [{ label: "Days 1–7", title: "Freeze and normalize public identity fields" }, { label: "Days 8–21", title: "Build verified priority-treatment proof modules" }, { label: "Days 22–30", title: "Verify social and booking continuity; establish reputation baseline" }], disclaimer: "Illustrative sequencing only. It is not purchased scope, a delivery promise or a results guarantee." },
  },
  implementation_paths: { diy: "Use the evidence and task plan in-house.", other_provider: "Give the complete evidence and task plan to another qualified provider.", defer: "Defer implementation while preserving the evidence limitations and revisit conditions.", caesthetic: "Ask CAESTHETIC to scope selected work separately after the report." },
  why_caesthetic: { evidence_advantage: "The public evidence, limitations and dependency order are already assembled.", coordination_advantage: "The tasks connect identity, website proof, social paths and reputation evidence.", sprint_boundary: "No task is automatically included; written Sprint scope is confirmed separately.", ownership: "The report, evidence and task plan may be used without CAESTHETIC." },
  methodology: { sources: [maps, website, contact, instagram, facebook, vip, vipReviews, kami, kamiFaq, bogat], collectedAt, competitorSelection: "Three named local alternatives selected for overlapping services and patient-choice relevance; no ranking claim.", limitations: "No geo-grid, direct live GBP rating/count, 90-day review velocity, response behavior, Lighthouse measurement, social-content audit or Mystery Shopper was available. Website testimonials and aggregator snapshots are explicitly bounded and do not establish live-platform performance." },
  estimates: [],
};

const directory = path.join(root, "site-caesthetic/score", slug);
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(path.join(directory, "report.json"));
