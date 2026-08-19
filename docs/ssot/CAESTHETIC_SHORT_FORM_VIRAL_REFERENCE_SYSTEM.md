---
owner: Growth / Social OS
status: active
type: ssot
created: 2026-08-19
last_updated: 2026-08-19
applies_to: CAESTHETIC Instagram short-form reference research
links_to:
  - docs/ssot/SOCIAL_GROWTH_OPERATING_SYSTEM.md
  - docs/ssot/SOCIAL_ADAPTER_INSTAGRAM.md
  - docs/ssot/TOXIFILLERS_IG_REFERENCE_RESEARCH_SYSTEM.md
  - docs/projects/caesthetic/operations/ig-growth/11-ENTERTAINMENT_REELS_ROTATION_PLAN.md
---

# CAESTHETIC Short-Form Viral Reference System

This is the CAESTHETIC sync-safe profile of the reusable method for finding, scoring, saving and adapting short-form video references. It is performance-first, then ICP-filtered. For Phase 1 it protects the informational Reel engine and treats entertainment primarily as owner-language/VOC capture, not broad reach.

## 1. Principle

Do not start from “looks relevant.” Start from proven distribution, then test whether the mechanism can be safely adapted to the target niche.

A reference can be valuable because of its hook, edit rhythm, narrative contrast, comment trigger, save trigger or visual pattern even when the original account is outside the exact niche.

## 2. Niche config

Every niche must define:

| Field | Meaning |
|---|---|
| `audience` | Who the post must ultimately speak to. |
| `primary_platform` | IG, TikTok, Shorts or mixed. |
| `source_queries` | Hashtags, keywords, account types and adjacent niches to search. |
| `hard_exclusions` | Topics or claims that cannot be used. |
| `rights_policy` | Reference-only vs licensed/repostable assets. |
| `adaptation_lanes` | Educational, entertainment, proof, product, community, etc. |
| `performance_floor` | Minimum views/comments/likes or relative account outperformance. |
| `fit_threshold` | Minimum audience and brand fit before production. |
| `compliance_gate` | Claims, privacy, regulated-content checks. |

## 3. Source expansion

Use three rings:

1. **Core niche:** exact hashtag/account/topic.
2. **Adjacent niche:** same audience psychology, different surface.
3. **Mechanic niche:** unrelated category with a reusable hook/edit/comment pattern.

For each candidate, record source ring. Do not reject adjacent/mechanic references just because the subject is different.

## 4. Scoring

Score in two passes.

### 4.1 Performance score

Rank first by:

1. views or plays;
2. comments as discussion signal;
3. likes;
4. follower-adjusted outperformance if available;
5. recency when choosing between similar candidates.

### 4.2 Adaptation score

Score 0–2 for each:

| Factor | 0 | 1 | 2 |
|---|---|---|---|
| Hook portability | niche-bound | partly portable | can be reused as a structure |
| Audience fit | wrong buyer | adjacent | direct ICP |
| Brand fit | off-tone | usable with changes | natural fit |
| Save/share value | low | moderate | high |
| Repeatability | one-off | limited | series-ready |
| Production feasibility | hard | moderate | easy |
| Compliance/rights safety | risky | manageable | clean |

Use top performers with low adaptation score as hook references only, not content concepts. Trend-audio references must pass a CAESTHETIC business-account audio availability check before scripting.

## 5. Required outputs

Use RAW/CLEAN separation.

CLEAN Git dataset columns:

`reference_id · source_platform · source_query · source_ring · source_theme · adaptation_lane · borrowable_mechanic · quarantine_status · risk_note · rights_basis · frame_review_status · expiry · production_status`

RAW provenance dataset outside Git:

`reference_id · source_url · saved_filename · creator_handle_if_needed · caption_or_topic_if_needed · views · likes · comments · collection_date · storage_note`

RAW may live in restricted Dropbox only. Do not copy RAW source URLs, creator handles, profile details or shortcode filenames into Git.

Required deliverables:

1. ranked list;
2. downloaded or bookmarked references;
3. RAW provenance manifest outside Git;
4. CLEAN classified adaptation map in Git;
5. schedule recommendation that protects informational Reel throughput;
6. compliance/rights status;
7. revalidation date, normally no later than six weeks after collection.

## 6. Measurement and testing limits

Entertainment/VOC posts are not primarily reach assets. For CAESTHETIC Phase 1, the primary KPI is usable owner/operator verbatim output, measured differently by surface:

- feed/Reel prompts: public comments;
- Stories open questions: DM replies manually captured into the VOC bank;
- option polls: engagement only, not verbatim VOC.

Organic Reel cadence cannot isolate Valerie/avatar/opener variables. At one protected informational Reel per week, the A→A→A→B cycle produces roughly four comparable posts per month and themes remain confounded. Valerie/opening tests belong in a paid or otherwise controlled distribution layer, not in organic conclusions from a few posts.

## 7. Rights rule

Public videos are not automatically reusable assets. Unless explicit permission/licence is documented, they are **reference-only**.

Permitted without further rights approval:

- analyze performance;
- describe patterns internally;
- recreate original footage/scripts using the brand’s own assets;
- use public UI screenshots only when separately allowed by the niche compliance gate.

Not permitted without approval:

- reposting downloaded videos;
- using the creator’s audio/voiceover if not licensed;
- copying captions word-for-word;
- implying endorsement, client relationship or result.

## 8. CAESTHETIC profile

For CAESTHETIC, the working core is E3 owner-operator POV, E0 broad med-spa reach mechanics and E5 conversation starters from `docs/ssot/CAESTHETIC_ENTERTAINMENT_VOC_TOPIC_BANK.md`. E1 clinic-floor humor and E2 front-desk skits are quarantined until owner-quality audience composition and neighbor effects are proven. The entertainment lane is controlled by `docs/projects/caesthetic/operations/ig-growth/11-ENTERTAINMENT_REELS_ROTATION_PLAN.md` and the CLEAN reference map is `docs/ssot/CAESTHETIC_ENTERTAINMENT_REELS_REFERENCE_MAP.md`.
