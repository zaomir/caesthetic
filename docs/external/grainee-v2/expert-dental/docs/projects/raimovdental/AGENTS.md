# RAIMOV ecosystem — project AGENTS

**Purpose:** Expert Dental Studio growth system, RAIMOV DENTAL as Atabek Raimov's personal expert platform and master brand, evidence-aware RAIMOV WHOLE PERSON, RAIM SMILE SYSTEM, Whole-Person Study Club, Treatment Planning Intensive, future Raimov Academy, directly controlled clinic growth and future ELITE DENTAL readiness.

**Knowledge domain:** `healthcare-ecosystem`.  
**Runtime roots:** `site-raimovdental/`, `research/raimov-profile/`.  
**Operating docs:** `docs/raimov/` and related RAIMOV namespaces.

## Read first

1. `docs/ssot/RAIMOV.md` — master index, authority and current phase.
2. `docs/ssot/RAIMOV_ECOSYSTEM_PROJECT_ARCHITECTURE.md` — topology, ownership and phase gates.
3. `docs/ssot/RAIMOV_WHOLE_PERSON_BRAND.md` — owner-approved Whole-Person personal platform, claims boundary and product ladder.
4. `docs/ssot/EXPERT_DENTAL_RAIMOV_ELITE_STRATEGY.md` — clinic growth, funnel and long-term ecosystem strategy.
5. `docs/ssot/RAIMOV_DENTAL_WEBSITE_STRATEGY.md` — mandatory for website audience, depth, CTA, IA, copy, design, routes or replacement.

Reception, ads or doctor-routing copy: also read `docs/ssot/EXPERT_DENTAL_MARKETING_FAQ.md` (does not replace `PRICE_CATALOG.json`).

For any RAIM SMILE business, product, partner, content, IA, page or domain task, read `docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md` **first**. It is the single master business + content strategy; operator, partnership, page, Second Opinion, Treatment Coordinator and SmileCare 12 documents are subordinate implementation contracts.

For any public page, protected strategic preview or major redesign also read `docs/ssot/WEBSITE_STUDIO_STANDARD.md` before planning, copy, design or code.

## Allowed directories

- `site-raimovdental/**`
- `research/raimov-profile/**`
- `docs/projects/raimovdental/**`
- `docs/raimov/**`
- `docs/copy/raimov/**`
- `docs/legal/raimov/**`
- `docs/legal-templates/raimov/**`
- `docs/audits/raimov/**`
- `docs/research/raimov/**`
- `scripts/raimov/**`
- `tests/raimov/**`
- project SSOTs matched by the manifest

Founder decisions may be recorded in `docs/founder-notes/` when explicitly authorised.


## Cursor Agents satellite (DEC-783)

- Agents GitHub project: `zaomir/raimovdental` (local `/var/www/raimovdental`)
- Bidirectional sync (DEC-784): `bash scripts/raimov/sync-agents-bidirectional.sh --apply`
- Do not deploy from the Agents satellite

## CAESTHETIC workspace reference layer

Agents restricted to `zaomir/caesthetic` read this project's generated,
one-way reference at `docs/external/grainee-v2/expert-dental/`. The mirror is
not an editable SSOT. Legal/runtime changes route to `grainee-v2`; non-PHI
cross-project proposals may be authored only under
`docs/projects/caesthetic/expert-dental-contributions/` and return through the
existing DEC-829 bidirectional sync. Patient records, PHI, secrets, private
folders and raw recordings never enter either path.

## Commands

```bash
node scripts/build-raimovdental.mjs
node tests/raimovdental/run-all.mjs
pnpm website:studio:guard
pnpm check:project raimovdental
pnpm repo:check
```

## Deploy target

Static — see project router and manifest. Strategy, design or protected-preview work alone does not authorise production deploy.

## Current Stage A rule

- Stage A is a strategic presentation created by Dmitry for Atabek.
- Preliminary Atabek approval is not required.
- Atabek's response is the outcome of the presentation.
- Gate 0A is closed.
- Stage A is protected/noindex.
- Stage A may proceed to compact Site Map, design thesis, `DESIGN.md`, QA Manifest and one representative strategic page.
- Clinical cases, before/after and patient/service deep dives are not required for Stage A.
- A minimal truth register and explicit future-state labels are required.
- No mass page family before Gate 4A.

## Future public website rule

- replacement v1 is RU-only;
- owner-approved direction is Atabek's personal expert platform for complex cases;
- patient first product is RAIM SMILE Second Opinion;
- professional community is RAIMOV Whole-Person Study Club (`NOT_LAUNCHED`);
- first educational product direction is Whole-Person Treatment Planning Intensive (`NOT_LAUNCHED`);
- Raimov Academy remains a later methodology/demand/programme/evidence-gated stage;
- patient and professional routes, forms, consent and analytics remain separate;
- existing EN routes are legacy until migration mapping;
- the current production remains unchanged until Gate 6 cutover.

## Bans

- Do not use unlicensed media or uncurated facts.
- Do not edit `research/raimov-profile/evidence/` without rights and source checks.
- Do not publish ELITE DENTAL as a current franchise or partner offer.
- Do not publish a share, return, financial terms or public investment offer without legal gate approval.
- Do not claim that RAIM SMILE SYSTEM, Academy, a clinic network or international practice already operates when planned.
- Do not invite international patients to Bishkek in the replacement strategy.
- Do not change the agreed first-month commercial canon.
- Do not treat public copy, a website page or an AI-generated summary as evidence.
- Do not create case/service/patient page families for Stage A.
- Do not scale page families before one representative page passes Gate 4A.
- Do not remove legacy RU/EN routes without redirect/410 map, smoke and rollback.
- Do not change production, DNS, forms or deploy as part of Stage A strategy/design work.

## Definition of Done

- Correct clinic and website authorities used.
- Current facts, future-state labels, medical, investor-legal, privacy and rights boundaries preserved.
- RAIMOV.md and project statuses updated if phase changed.
- Stage A remains protected/noindex.
- No patient-identifiable, KYC, private investment data or secrets committed.
- Runtime changes include build, tests, route migration, forms, smoke and rollback evidence.
- Website Studio Guard, project check and repo check pass before completion.

---

*Project rules · updated 2026-08-30 · RAIMOV WHOLE PERSON adopted; NO_RUNTIME_CHANGE.*
