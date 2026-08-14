# CAESTHETIC / aesthetic audience lists — location & use

**Status:** ACTIVE pointer  
**Date:** 2026-08-14  
**Owner:** platform / CAESTHETIC ops  
**Related:** `CAESTHETIC_EMAIL_TO_IG.md` · `CAESTHETIC_IG_LOOKUP.md` · `OUTREACH_USERNAME_REGISTRY.md` · `CAESTHETIC_IG_GROWTH_PROGRAM.md` · `CAESTHETIC_PRACTITIONER_GROWTH_TO_SUPPLY_FUNNEL.md` · `OUTREACH_SELECTIONS.md` · `docs/ssot/data/outreach-username-registries.yaml` · `docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md` · DEC-781 · DEC-791 · DEC-793 · DEC-818 · DEC-819 · DEC-821 · **DEC-822** · DEC-824 · **DEC-827**

**Two-base Apify pass (preferred for students):** `scripts/outreach/cae_ig_schools_students_apify.py` — schools DB + students DB (followers + post engagers). Rebuild without spend: `cae_ig_two_base_rebuild.py`. Legacy single-workbook pass (2026-08-02) remains valid for Priority A warm queue until Sheet reseed.

**Phase-1 owner harvest (TASK-814):** `scripts/outreach/cae_ig_medspa_usernames_apify.py` — 9-city Instagram username-only under `$15` hard cap. Agent card: `docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md`.

---

## 1. What we found (2026-08-05 hunt + 2026-08-09 two-base + 2026-08-14 TASK-814)

Private data stays on Dropbox — **not** in Git.

| Asset | Path | Rows (approx) | What it actually is |
|-------|------|---------------|---------------------|
| **Schools IG (two-base)** | `dropbox:CAESTHETIC/audience/two-base-2026-08-09/schools.csv` | **71** | School / academy handles: seed + Apify `keywordDiscovery` (+ expand). **20** harvested for followers. Partner track + next harvest seeds. |
| **Students IG (two-base)** | `dropbox:CAESTHETIC/audience/two-base-2026-08-09/students.csv` | **1142** | Followers of 20 academies + post likers/commenters/tags. Segments A/B/C/X. Tag: `audience=aesthetic_student_or_trainee_unverified`. Spend total **$13.19 / $15**. |
| **Students Priority A** | `…/two-base-2026-08-09/students_priority_a.csv` | **5** | Strict bio `student/trainee/graduate` — tiny; do not treat as only queue. |
| **Students Priority B** | filter `priority=B` in `students.csv` | **322** | Aesthetic pro/practice who follow academies — primary warm follow pool for `cae_ig` owners/grads narrative. |
| **Aesthetic academy student IG (legacy)** | `dropbox:CAESTHETIC/audience/aesthetic_academy_student_contacts_2026-08-02.xlsx` | **941** | Prior single-workbook discovery (post tags/comments only; schools were seed input). Still registered. |
| **9-city med-spa IG harvest (TASK-814)** | `dropbox:CAESTHETIC/icp/9-city-ig-usernames-2026-08/master_usernames.csv` | **746** | Instagram-only Phase-1 city harvest ($14.90 / $15). Proxy ICP strong/weak. **NON-EXECUTION** discovery + registry `incoming/`. Agent card: `docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md`. |
| **US spa IG execution registry (Phase 1)** | `dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json` via `docs/ssot/data/outreach-username-registries.yaml` | 174 bootstrap / 161 claimed after deny | Resolve CURRENT → immutable release. Selection **`CAE_MEDSPA_IG_FINAL_V1`** / `sel_cae_medspa_ig_final_v1`. Dolphin `833304152`. Writes still need an approved wave (DEC-819). No username qualification evidence gates (DEC-821). |
| **US spa IG dated export (NON-EXECUTION)** | `dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/canonical_master.csv` | 174 | Historical DEC-818 classification/build artifact. **Not** Dolphin/execution authority. |
| **Dolphin/SBO coverage queue** | `dropbox:CAESTHETIC/audience/cae-ig-dolphin-queue/` (+ local `tmp/cae-ig-queue/`) | **1431** | Built from candidate 1441 − CURRENT deny. TASK-814 strong ranked first. Builder `cae_ig_build_dolphin_queue.mjs`. Runner `run-cae-ig-869-day1-833304152.mjs`. **Not** FINAL/CURRENT. |
| **Med spa / practice IG candidate (NON-EXECUTION)** | `dropbox:CAESTHETIC/audience/medspa-ig-outreach-v1/registry.csv` | **1441** | Candidate selection `CAE_MEDSPA_IG_V1` / `sel_cae_medspa_ig_v1`. Rebuilt 2026-08-14 from TASK-814 (746) ∪ xlsx practice ∪ students practice. **Not** execution. Tool: `scripts/outreach/cae_medspa_ig_selection.py`. |
| **Aesthetic list** | `dropbox:Macs/Aesthetic list - Sheet1.csv` | ~9 060 | **Email** contacts (name/city/state/country). Domains = aesthetic industry (e.g. clinic/brand corporate mail). US/UK/AU/CA heavy. Closest live “aesthetic professional / trainee-adjacent” email base. |
| **1k list** | `dropbox:Macs/1k list - Sheet1.csv` | ~1 100 | US **email** list (same schema). Not Instagram usernames. |
| **10k list** | `dropbox:Macs/10k list - Sheet1.csv` | ~10 000 | US **email** list (same schema). Broader healthcare/admin mix — not student IG. |
| **7100 usernames** | `dropbox:Macs/7100 username unionpayru.txt` | 7 100 `@…` | Username file — **UnionPay RU** by filename. **Do not** treat as aesthetic students. |

**Master ingest (founder GO 2026-08-13):** two-base loaded into VDS masters via `scripts/outreach/apply_cae_ig_two_base_to_masters.py`. Markers: companies `CAESTHETIC IG schools` / `CAESTHETIC IG students` + `cae_ig_audience` + `not_supply_eligible`; contacts.source `CAESTHETIC IG students` + `not_supply_eligible`. Instagram column filled (bare username). **Still not supply-eligible** — username ≠ licence.  
**Backup:** `data/master/backups/pre_cae_ig_two_base_20260813T143408Z` · **Report:** `docs/reports/CAESTHETIC_IG_TWO_BASE_MASTER_INGEST_20260813.md`.

**Candidate rebuild (2026-08-14):** `cae_medspa_ig_selection.py --apply --export --upload-dropbox` → **1441** tagged on VDS masters (`sel_cae_medspa_ig_v1`). Backup: `data/master/backups/pre_cae_medspa_ig_20260814T135402Z`. Report: `docs/reports/CAE_MEDSPA_IG_SELECTION_20260814.md`. Still **NON-EXECUTION**.

**Execution selection (DEC-819):** `CAE_MEDSPA_IG_FINAL_V1` / `sel_cae_medspa_ig_final_v1` — resolve `CURRENT.json` only. Candidate `sel_cae_medspa_ig_v1` (`CAE_MEDSPA_IG_V1`, **1441**) remains a **NON-EXECUTION** tag layer on masters. Report: `docs/ssot/reports/cae_ig_outreach_readiness_2026-08-13.md`. SSOT: `OUTREACH_SELECTIONS.md` § `CAE_MEDSPA_IG_FINAL_V1`.

---

## 2. How to use (recommended)

### A0. US spa business IG registry — Phase 1 owner/practice queue (DEC-819)

**Execution pointer:** `dropbox:CAESTHETIC/audience/us-spa-ig-master/CURRENT.json`  
**Git pointer:** `docs/ssot/data/outreach-username-registries.yaml`  
**Index:** `dropbox:CAESTHETIC/audience/REGISTRY_INDEX.json`  
**Selection:** `CAE_MEDSPA_IG_FINAL_V1` / `sel_cae_medspa_ig_final_v1`  
**Dolphin:** `833304152` (`B_CAE_IG` / Motion D)

Resolve CURRENT → immutable release → **approved** wave → dry-run (`cae_ig_dolphin_current_dryrun.mjs`) → human-approved social actions. Instagram writes are forbidden until that chain is complete.

Bootstrap CURRENT (`r20260813T154900Z-bootstrap`, status `BOOTSTRAP_CURRENT_WITH_DENY_OVERLAY`) may claim 161 `ready_for_warm` after a 10-username deny overlay. That overlay is not write approval; an **approved** wave is still required. Do not use dated export `us-spa-ig-master-2026-08/` or `sel_cae_medspa_ig_v1` as execution. Do not apply Gate A/B / `needs_qualification` evidence gates (DEC-821). `CURRENT.json` is not edited here.

**Historical DEC-818 build artifact (NON-EXECUTION):** `dropbox:CAESTHETIC/audience/us-spa-ig-master-2026-08/canonical_master.csv` plus `lane_b_audit.json`. Git-safe method docs: `docs/research/caesthetic-us-spa-ig-master-2026-08/CLASSIFY.md` and aggregate-only `manifest.json`.

### A0c. TASK-814 9-city harvest — discovery + incoming (NON-EXECUTION)

**Agent card (read first):** `docs/ssot/reports/cae_ig_task814_harvest_agent_card_2026-08-14.md`  
**Canonical private master:** `dropbox:CAESTHETIC/icp/9-city-ig-usernames-2026-08/master_usernames.csv`  
**Registry incoming:** `dropbox:CAESTHETIC/audience/us-spa-ig-master/incoming/task814-2026-08-14/` (`SOURCE.json` + `usernames.csv`)  
**Git aggregates:** `docs/research/caesthetic-9-city-icp-2026-08/{REPORT.md,manifest.json}`  
**Harvester:** `scripts/outreach/cae_ig_medspa_usernames_apify.py`

| Metric | Value |
|--------|------:|
| Deduped usernames | 746 |
| `icp_proxy_strong` | 617 |
| `icp_proxy_weak` | 129 |
| Apify spend | $14.8971 / $15 |

**Agent use:**

1. Research / queue expansion / email enrichment planning — pull private master via rclone (never commit).  
2. Candidate rebuild — `python3 scripts/outreach/cae_medspa_ig_selection.py --build-registry --upload-dropbox` (includes this master).  
3. Next **execution** release — fold `incoming/task814-2026-08-14/` into a new immutable release, then move `CURRENT.json` last (DEC-819). Until then, Dolphin writes stay on bootstrap CURRENT only.  
4. Do **not** IG follow/like/comment/DM from this CSV without an approved wave.

**Job:** private Phase-1 Instagram audience routed to the CAESTHETIC Growth Score narrative on `B_CAE_IG` / Motion D. Audience composition is whatever CURRENT.json / its release contains. This pointer does **not** define US geo evidence, patient-facing confirmation, or `needs_qualification` gates (DEC-821).

Required row tags in the private master:

- `project=caesthetic`
- `country=US`
- `surface=B_CAE_IG`
- `motion=motion_d`
- `audience=caesthetic_us_aesthetic_business`
- `source=<source_id>`
- `market=<state/city>`
- `dm_eligible=false`

Historical DEC-818 builder labels may still exist on private CSV rows (`ready_for_warm` / `needs_qualification` / `suppressed`). They are data leftovers, not a live qualification methodology. Dry-run continues to skip `research`/`suppressed` rows as suppression/queue filters, not as evidence gates.

Hard rules:

1. Private row-level usernames stay on Dropbox only; do not commit source CSVs, canonical masters, or row exports to git.
2. This master does **not** unlock student/VOC Phase-0. `scripts/caesthetic/lib/phase1_fail_close.py` remains the gate for those paths.
3. `dm_eligible=false` is fixed at master-build time. A username list is not a send approval; Instagram outreach still requires the launch package and ramp rules in `OUTBOUND_LED_DEMAND_GENERATION_STANDARD.md` and `SOCIAL_ADAPTER_INSTAGRAM.md`. Phase-1 warm cadence for `@caesthetic.growth` is DEC-822 (paced waves, unique openings, 10–20+ min gap, follow-back ramp 5+3→20–30/day). DEC-822 is not wave approval.
4. Chain, academy/student, consumer and non-US rows are retained only for audit/suppression context.
5. Historical Google Maps CA/FL/NY/NJ workbooks (~27k business rows) are inventoried as sources; website cells with bare `http://www.instagram.com` (no profile path) do **not** yield usernames — never invent handles from business names/domains.
6. Dolphin Phase-1 dry-run (CURRENT): `scripts/caesthetic/cae_ig_dolphin_current_dryrun.mjs` (Lane B). Legacy dated-export dry-run `us_spa_ig_dolphin_phase1_dryrun.mjs` remains a DEC-818 fixture consumer — **not** execution authority.

#### Read-only ManyChat lookup projection

`lookup-caesthetic-instagram` resolves the same `CURRENT.json` pointer and immutable release, applies the CURRENT deny overlay, then enriches output fields only through exact normalized-username equality against canonical VDS `master_companies.csv`. It writes a private RLS projection for low-latency reads; that projection is not a new master, selection, wave or write authority. No candidate/datestamped export, business-name/domain/city similarity or biography inference may enter the lookup. API contract and ManyChat Custom Fields are canonical in `CAESTHETIC.md` §4.1.


### A0b. Med spa / practice IG — candidate collect (`sel_cae_medspa_ig_v1`, NON-EXECUTION)

**Candidate private registry:** `dropbox:CAESTHETIC/audience/medspa-ig-outreach-v1/`  
(`registry.csv` · `usernames.txt` · `SUMMARY.json` · `MANIFEST.json`)  
**Live count (2026-08-14):** **1441** unique (`9city_medspa` 746 + `xlsx_practice` 390 + `students_practice` 322; overlaps deduped).

This is a **candidate / NON-EXECUTION** outreach tag layer on VDS masters. Phase-1 Dolphin execution reads **CURRENT.json** (§A0), never this registry and never `sel_cae_medspa_ig_v1` alone.

**Master tag (fast filter):**

| Field | Tag |
|-------|-----|
| `master_companies.tags` | `sel_cae_medspa_ig_v1` |
| `master_contacts.source` | `sel_cae_medspa_ig_v1` |
| narrative marker | `narrative_MEDSPA_GROWTH` |
| always with | `cae_ig_audience`, `not_supply_eligible` |

```bash
# rebuild registry + re-tag masters + export wave slice
python3 scripts/outreach/cae_medspa_ig_selection.py --apply --export --upload-dropbox
```

**Inclusion:** TASK-814 9-city medspa harvest ∪ students/xlsx `aesthetic_professional_or_practice` (practice slice).  
**Not:** academies/schools, unclear/student-only, UnionPay RU usernames, email-only Aesthetic list.  
**Send rules:** warm-first on `@caesthetic.growth` (DEC-781); list ≠ DM approval.

### A0d. Dolphin / SBO coverage queue (DEC-823/824 day pipeline)

**Builder:** `node scripts/caesthetic/cae_ig_build_dolphin_queue.mjs`  
**Local:** `/var/www/grainee-v2/tmp/cae-ig-queue/queue.txt` (legacy sync: `tmp/cae-ig-869/`)  
**Dropbox:** `dropbox:CAESTHETIC/audience/cae-ig-dolphin-queue/`  
**Coverage day (DEC-824, preferred):** `bash scripts/caesthetic/cae_ig_run_coverage_day.sh` → `run-cae-ig-coverage-day-833304152.mjs`  
**Legacy follow-only:** `run-cae-ig-869-day1-833304152.mjs`  
**Owner-warm slice:** `tmp/cae-ig-queue/owner_warm_priority_a.json` → `run-cae-ig-owner-warm-833304152.mjs`

Rebuild the queue after any candidate/TASK-814 refresh. Counts (2026-08-14): raw **1441**, deny **10**, queue **1431**, TASK-814 strong prioritized **610**. Follow/story caps unchanged (DEC-822/824). This queue is for coverage/day follows — it does **not** replace `CURRENT.json` FINAL waves.

### A. Aesthetic list (email) — primary email base

**Job:** B2B education / growth dialogue for aesthetic-industry professionals (Motion D + optional Motion A account-based email).  
**Not:** patient acquisition; Toxifillers product blast; unlicensed student inject pitch.

Pipeline:

1. **Import staging only** (local/VDS tmp or private Sheet) — never commit CSV to git.  
2. **Segment** by domain / country / role guess (clinic brand vs distributor vs spa chain).  
3. **Suppression + conflict** vs master contacts / Instantly / prior campaigns.  
4. **One opening narrative** per account from funnel Stage 2 — prefer `INJECTOR_GROWTH` / `PRACTICE_LAUNCH` / `ACADEMY_GRADUATE_SUPPORT` / `MEDSPA_GROWTH`.  
5. **Email first** (Instantly plain-text): one question + one CTA to Growth School / assessment / checklist — **not** product catalogue.  
6. After reply → Stage 3 value delivery → Stage 4 classify trainee vs newly-qualified vs practising → only then supply path if eligible.

### B. Instagram usernames (registered student workbook)

**Canonical file:** `dropbox:CAESTHETIC/audience/aesthetic_academy_student_contacts_2026-08-02.xlsx`

**Counts (Summary sheet):** 941 total usernames · 344 new · 597 original list · ~260 email contacts · 657 Instagram-only · 18 academies/orgs excluded from contact use.

**Segment priority for outreach (All Usernames):**

| Priority | Segment / signal | Use |
|----------|------------------|-----|
| A | `academy_post_candidate` + high/medium confidence | Warm engage first; cold DM only after W2 content live |
| A | `student_or_new_practitioner` | Same; tiny set — treat carefully |
| B | `aesthetic_professional_or_practice` with academy-post evidence | Growth narrative OK; not “student” framing |
| C | `unclear` / weak signal | Research / creative lookalike only — **no cold DM** |
| X | `academy_or_training_org` | Partner track (§9.4 funnel) — not student DM blast |

**Rules:**

1. Tag every row: `audience=aesthetic_student_or_trainee_unverified` (username ≠ licence).  
2. Run **DEC-781 ramp** on `@caesthetic.growth` only — **never** a second outreach IG on Dolphin `833304152` (same fingerprint as Valerie LI + Lana FB).
3. Opening narrative = **`ACADEMY_GRADUATE_SUPPORT`** or `PRACTICE_LAUNCH` only. No link in first DM. No Toxifillers/grey SKU.  
4. Use list for (order matters — see `CAESTHETIC_IG_GROWTH_PROGRAM.md` §12):  
   - seed lookalike creative research for student pillars S1–S4;  
   - warm discovery (follow/like/comment) before any DM;  
   - optional slow cold DM after W2 of IG content program (DEC-791 + DEC-793);  
   - comment-to-DM inbound remains primary growth lever.  
5. KPI = dialogues / asset requests / Stage 4 upgrades — **not** raw sends (`funnel` §13.3).

### C. What not to do

- Blast Aesthetic email list as if they were Instagram usernames.  
- Use `7100 username unionpayru.txt` for CAESTHETIC.  
- Pitch products to unverified students (funnel hard ban).  
- Merge student IG into `master_contacts` as supply-eligible.  
- Run overnight IG sends (DEC-790).  
- Treat all 941 as one undifferentiated cold blast.

---

## 3. Sheet staging schema — `Audience_IG_Students`

Private SIMON_OPS (or staging) tab — **not** in git. One row per username.

| Column | Type | Notes |
|--------|------|-------|
| `username` | text | without `@` |
| `profile_url` | url | `https://instagram.com/{username}` |
| `source` | enum | `workbook_2026-08-02` \| `manual` \| `warm_inbound` |
| `segment` | text | from workbook Segment |
| `confidence` | enum | `high` \| `medium` \| `low` \| `unverified` |
| `stage_guess` | enum | `TRAINEE` \| `NEWLY_QUALIFIED` \| `PRACTISING_*` \| `UNKNOWN` (funnel Stage 4) |
| `priority` | enum | `A` \| `B` \| `C` \| `X` |
| `narrative` | enum | `ACADEMY_GRADUATE_SUPPORT` \| `PRACTICE_LAUNCH` \| — |
| `last_touch_utc` | datetime | |
| `touch_type` | enum | `like` \| `comment` \| `follow` \| `warm_dm` \| `cold_dm` \| `inbound` |
| `status` | enum | `research` \| `warm_queue` \| `touched` \| `replied` \| `asset_sent` \| `stage4` \| `suppressed` \| `blocked` |
| `notes` | text | short; no medical claims |

Suppression: skip if already in Instantly/master conflict or prior Toxifillers product narrative on same account.

---

## 4. Ops checklist

1. ✅ Canonical workbook on Dropbox (`CAESTHETIC/audience/…xlsx`).  
2. ✅ Sheet tab `Audience_IG_Students` seeded Priority A (**46** rows, 2026-08-05) via `scripts/caesthetic/seed-ig-students-w34.py`.  
3. ✅ W34 maker pack DRAFT on Sheet: `COPY-CAE-017…020` / `CAL-2026W34-01…03` + `CAL-2026W34-ST` (founder **APPROVED** still required before publish).  
4. Align warm engage with `CAESTHETIC_IG_GROWTH_PROGRAM.md` §12 — DMs reference live posts after W2.  
5. Academy partnership shortlist remains parallel primary volume channel (funnel §9.4).  
6. Re-run / expand discovery only via `CAESTHETIC_IG_STUDENT_DISCOVERY_APIFY.md` (budget cap, same actors, Dropbox register).
