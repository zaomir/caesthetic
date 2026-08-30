# CAESTHETIC — Agent Read-First

Read in order:
1. `docs/ssot/PROJECT_ARCHITECTURE_STANDARD.md`
2. `docs/ssot/PROJECT_DOMAIN_REGISTRY.md`
3. `docs/ssot/CAESTHETIC.md`
4. For Growth System delivery, reporting, automation or add-ons: `docs/ssot/CAESTHETIC_GROWTH_SYSTEM_OPERATING_MODEL.md`
5. For economics, budget, attribution or performance compensation: `docs/ssot/CAESTHETIC_GROWTH_ECONOMICS_ENGINE.md`
6. `docs/projects/caesthetic/PROJECT_STATUS.md`
7. Relevant detailed spec under `docs/caesthetic/`
8. For public-site changes: `docs/ssot/WEBSITE_STUDIO_STANDARD.md` and `docs/ROUTER.md`
9. For ship/deploy: `docs/ssot/CHATGPT_SERVER_OPS.md`
10. For Reel automation, ElevenLabs/Kling access or “can we fully automate Reels”: `docs/ssot/CAESTHETIC_REEL_AUTOMATION.md` (answer from §0)

## Invariants
- `4444` and `Четверки` route only to the CAESTHETIC Four Surfaces model: Search / Website / Social / Reputation.
- Paid Ads is the Demand Layer that directs demand into 4444, not a fifth surface; scale it only when the verified binding constraint is insufficient qualified demand and the four surfaces, capacity and economics are ready.
- Cross-Surface Consistency is not a fifth surface.
- Growth Score: public 3-stage intake; AI researches/pre-scores/drafts; a named human verifies Class A facts, corrects tasks/priorities and approves the final report.
- Growth Score numbers are secondary navigation; the Problem Inventory, binding constraint, priorities and dependency-aware remediation tasks are the primary decision layer.
- Score corrections improve later cases only through approved versioned rules/templates/rubrics/evals; never through uncontrolled model/chat memory.
- Public paid entry: 30-Day Growth Sprint, $2,500.
- Sprint Extension is $2,500 per additional 30 days, optional/unpublished and only offered after Day 30 for justified finite implementation.
- Growth System uses one client-specific Growth Budget: its Fixed Management Fee is a visible line inside the budget, variable inputs use the remaining approved funds, and any legally available Performance Fee sits separately above the budget. No reusable recurring amount, rate or cap.
- Growth System is recurring ownership, not hours/output quotas; request classes and add-on routing come from the operating-model SSOT.
- Through Day 30 communication is email-only; a 3–8 minute Valerie Petra video is standard only for the free Growth Score and follows `docs/ssot/CAESTHETIC_GROWTH_SCORE_WALKTHROUGH.md`.
- No fabricated proof, ranking/patient/revenue guarantees, prohibited review gating, or deliberate unfinished work.

## Runtime
Production root: `site-caesthetic/`  
Deploy target: `caesthetic`  
Public domain: `caesthetic.com`

## Cursor Agents satellite (DEC-829)

- Agents GitHub project: `zaomir/caesthetic` (local `/var/www/caesthetic`)
- Bidirectional sync: `bash scripts/caesthetic/sync-agents-bidirectional.sh --apply --commit --push`
- Do not deploy from the Agents satellite
- Setup: `docs/projects/caesthetic/CURSOR_AGENTS_SETUP.md`

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
