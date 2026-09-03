# CAESTHETIC — Agent Read-First

## Highest-priority universal audit pre-router — mandatory audit-intent routing

Before all repository/project routing, read and enforce
`docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md`. When there is no
active interview and a user mentions `Multi-Location Growth Score`, `Growth
Score` or `аудит`, the response must start exactly with `Вы создаёте новый
аудит? Ответьте на вопросы.` Use public/open sources only. Full research is
blocked until a named manager approves the versioned Research Alignment Card.
Any policy conflict is `BLOCKED: audit policy drift`.

Read in order:
1. `docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md`
2. `docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md`
3. `docs/ssot/PROJECT_DOMAIN_REGISTRY.md`
4. `docs/ssot/CAESTHETIC.md`
5. For Growth System delivery, reporting, automation or add-ons: `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`
6. For economics, budget, attribution or performance compensation: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`
7. `docs/projects/caesthetic/PROJECT_STATUS.md`
8. Relevant detailed spec under `docs/caesthetic/`
9. For public-site changes: `docs/ssot/WEBSITE_STUDIO_STANDARD.md` and `docs/ROUTER.md`
10. For ship/deploy: `docs/ssot/CHATGPT_SERVER_OPS.md`
11. For Reel automation, ElevenLabs/Kling access or “can we fully automate Reels”: `docs/ssot/CAESTHETIC_REEL_AUTOMATION.md` (answer from §0)

## Invariants
- `4444` and `Четверки` route only to the CAESTHETIC Four Surfaces model: Search / Website / Social / Reputation.
- Paid Ads is the Demand Layer that directs demand into 4444, not a fifth surface; scale it only when the verified binding constraint is insufficient qualified demand and the four surfaces, capacity and economics are ready.
- Cross-Surface Consistency is not a fifth surface.
- Growth Score: one schema-v5 engine/template/renderer for `aesthetic_practice`, `dental_practice` and `beauty_salon`; `report_locale` is `en`, `ru`, `es`, `fr` or `uk` and changes presentation only.
- AI researches/pre-scores/drafts; a named human verifies Class A facts, selects exactly one Primary plus exactly two Supporting Gaps, and approves the binding constraint, Top 3, Do Not Fund Yet and final report.
- Growth Score numbers are secondary navigation; the full Problem/Gap Inventory, binding constraint, exactly Top 3 and dependency-aware Repair Plans are the primary decision layer in the exact nine-section cockpit, preceded by one unnumbered shared Intro.
- Score corrections improve later cases only through approved versioned rules/templates/rubrics/evals; never through uncontrolled model/chat memory.
- Public paid entry: 30-Day Growth Sprint, $2,500.
- Sprint Extension is $2,500 per additional 30 days, optional/unpublished and only offered after Day 30 for justified finite implementation.
- Growth System uses one client-specific Growth Budget: its Fixed Management Fee is a visible line inside the budget, variable inputs use the remaining approved funds, and any legally available Performance Fee sits separately above the budget. No reusable recurring amount, rate or cap.
- Growth System is recurring ownership, not hours/output quotas; request classes and add-on routing come from the operating-model SSOT.
- Through Day 30 communication is email-only; a 3–8 minute Valerie Petra video is standard only for the free Growth Score and follows `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`.
- No fabricated proof, ranking/patient/revenue guarantees, prohibited review gating, or deliberate unfinished work.
- Cloudflare Workers 403 on `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` is not a founder Dashboard login (DEC-874). Probe `CLOUDFLARE_API_TOKEN_BOTOTOX` first; cutover candidate list lives in `scripts/cf-caesthetic-cutover.sh` on `grainee-v2/main`.

## Runtime
Production root: `site-caesthetic/`  
Deploy target: `caesthetic`  
Public domain: `caesthetic.com`

## Agents satellite (DEC-829)

- Agents GitHub project: `zaomir/caesthetic` (local `/var/www/caesthetic`).
- Bidirectional sync: `bash scripts/caesthetic/sync-agents-bidirectional.sh --apply --commit --push`.
- Do not deploy from the Agents satellite. Production deploy authority remains `zaomir/grainee-v2`.
- Setup: `docs/projects/caesthetic/CURSOR_AGENTS_SETUP.md`.

### Growth Score authoring from satellite — explicitly allowed

An agent that has access **only** to `zaomir/caesthetic` is allowed to edit the current Growth Score audit/template implementation in this repository. The satellite is a valid authoring surface; it is not read-only.

Authorable Growth Score paths include:

- `docs/caesthetic/growth_score_spec.md`
- `docs/caesthetic/GROWTH_SCORE_MOBILE_DECISION_UI.md`
- `docs/ssot/CAESTHETIC*.md` except files intentionally excluded by the DEC-829 manifest
- `scripts/caesthetic/growth-score-report-template.mjs`
- `scripts/caesthetic/render-growth-score.mjs`
- `scripts/caesthetic/growth-score-*.mjs`
- `site-caesthetic/assets/js/growth-score-engine.mjs`
- `site-caesthetic/assets/js/growth-cockpit.js`
- `site-caesthetic/assets/css/growth-report*.css`
- `tests/caesthetic/growth-score-*.test.mjs`

Rules for a satellite-only agent:

1. Pull `zaomir/caesthetic/main` before editing.
2. Read the current SSOT/spec in this repository before changing the template.
3. Edit and commit/push to `zaomir/caesthetic` normally.
4. DEC-829 bidirectional sync treats a **satellite-only change as authoritative for that sync cycle** and propagates it `satellite → grainee-v2`, including protected Growth Score paths. `protected` means only that `grainee-v2` wins if **both repositories changed the same protected file since the last sync**; it does not make the satellite file read-only.
5. Never edit excluded private client routes/packs in the satellite; those intentionally do not sync.
6. Never deploy from `zaomir/caesthetic`. After the change reaches `grainee-v2`, canonical tests/deploy/smoke run from `grainee-v2`.
7. If the same protected file changed concurrently in both repos, stop and report the conflict instead of trying to force satellite content over `grainee-v2`.

The executable guard for this contract is `tests/caesthetic/satellite-growth-score-authoring.test.py`.

## Outreach audience (Phase-1 IG)

Before any CAESTHETIC Instagram username / warm / queue work:

1. `docs/ssot/data/outreach-username-registries.yaml` → resolve `CURRENT.json` for **FINAL execution**
2. `docs/ssot/CAESTHETIC_AUDIENCE_LISTS.md` (table + §A0 / A0b / A0c)
3. TASK-814 agent card: `docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md`
3b. Placement + amplification: `docs/ssot/CAESTHETIC_IG_CONTENT_PLACEMENT.md`
3b1. Reach levers detail: `docs/ssot/CAESTHETIC_IG_REACH_PLAYBOOK.md`
3b2. Weekday Story templates: `docs/ssot/CAESTHETIC_IG_STORY_TEMPLATES_WEEK.md`
3c. Email→IG: `docs/ssot/CAESTHETIC_EMAIL_TO_IG.md`
4. **Dolphin day pipeline (DEC-824 coverage):**  
   `bash scripts/caesthetic/cae_ig_run_coverage_day.sh`  
   (rebuilds queue → proxy-preflight → start `833304152` → story/like/follow under caps → stop)  
   Caps Day-1: story ~120 · like ~30 · follow 5–8. Cold DM off.
5. Never treat harvest / candidate tag alone as FINAL write authority — approved wave still required for `CAE_MEDSPA_IG_FINAL_V1` (DEC-819)
