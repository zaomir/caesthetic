# Trust-surface audit — TASK-850

**Audited:** 2026-08-21  
**Canon:** DEC-845, funnel tooling SSOT, `02-CANONICAL_PROFILE_PACKAGE.md`  
**Method:** live public web for Instagram and `/growth-score/`; authenticated lookup smoke for ManyChat backend; LinkedIn from current SSOT + registry (public HTML blocked). No identity writes.

Verdict key: **PASS** = matches DEC-845 / canonical CTA. **GAP** = mismatch or unverified live step.

---

## 1. Instagram `@caesthetic.growth`

**Live URL:** https://www.instagram.com/caesthetic.growth/  
**Evidence time:** 2026-08-21, public web profile (login modal present; header/highlights/link still readable).  
**Registry (read-only):** `valeria-lana` → `https://www.instagram.com/caesthetic.growth/` · surface `B_CAE_IG` · Dolphin `833304152`. Registry not edited.

| Check | Verdict | Evidence |
|-------|---------|----------|
| Username `@caesthetic.growth` | PASS | Live title and header |
| Display name `CAESTHETIC · Growth Score` | PASS | Document title + canonical package |
| Primary CTA = Free Growth Score | PASS | Bio CTA “Get a Free Growth Score”; grid tile “FREE GROWTH SCORE” |
| Bio link → `/growth-score/` with standard UTMs | PASS | Live link `caesthetic.com/growth-score/?utm_source=instagram&utm_medium=organic_social&utm_campaign=phase1_launch&utm_content=bio` · HTTP 200, no redirect away from Score |
| Does not lead with Sprint price in bio | PASS | Bio is diagnostic / Score, not `$2,500` |
| Cold DM not presented as an action | PASS | No “DM us” CTA in header; DEC-845 still OFF |
| Bio wording vs canonical package | GAP | Live a11y bio: `🌱Growth diagnostics for med spa owners 🎯Four surfaces: Maps · Website · Social · Reviews 🚀Get a Free Growth Score → see` (+ extra emoji glyphs 🪴 ⏱️ visible behind a login modal). Canonical package is emoji-free and says **US** med spa owners. Do not apply a bio rewrite from this lane. |
| Highlights vs DEC-845 ladder | GAP | Live: **START · SCORE · 30 DAYS · PAY · PROOF**. Canonical plan: Surfaces / Score / Leaks / Sprint / Evidence. **PAY** leads with payment. Founder/external-account action required; this lane did not rename highlights. |
| Feed exists (not empty archive) | PASS | Public grid shows Clip + multiple carousels; one visible tile is Score-led, one adjacent tile shows “30-DAY…” Sprint education. Captions were not opened (login wall). Watch: Sprint may appear in grid; it must not become the cold CTA. |
| Category | GAP / stale | 2026-08-11 logged-in ops snapshot recorded Spanish category `Asesor comercial` (Business Consultant equivalent). Not re-read from a logged-in session on 2026-08-21. |

**Recommended (DO NOT APPLY from Lane C):** restore canonical three-line bio without emoji; restore “US”; rename highlight **PAY** → **EVIDENCE** (or drop it); keep Score as the only header CTA. External account action = founder (funnel SSOT §8.2).

---

## 2. ManyChat inbound → `/growth-score/`

| Check | Verdict | Evidence |
|-------|---------|----------|
| Lookup API live | PASS | `OPTIONS https://evo.do/api/v1/lookup-caesthetic-instagram` → HTTP 204. `POST` with and without `X-Lookup-Token` → HTTP 200 and stable keys `status, practice_name, city_state, website` (DEC-827). Probe username `caesthetic.growth` correctly returned `not_found` (our brand handle is not a CURRENT practice row). |
| Canonical routing copy | PASS (docs) | Comment → ack → context DM → role → owner to Score. Copy packed in `docs/copy/caesthetic/en/first-lead/manychat-inbound.md`. |
| ManyChat workspace connected / keywords / AI Replies / human handoff / UTM in the live flow | GAP | Funnel SSOT §5.8 still: backend ready, UI flow not independently verified. This lane has no ManyChat admin session. No end-to-end comment→DM→form lead was executed. |
| Cold DM engine | PASS (policy) | SSOT forbids ManyChat as a cold-DM bot. No cold DM copy was enabled. |

**Launch implication:** first email/partner cohort does not wait on ManyChat. Manual IG inbox can use the same inbound copy. Do not turn on AI Replies until the 20–30 scenario test exists.

---

## 3. LinkedIn trust surface

**Registered URL (read-only):** `https://www.linkedin.com/in/valeriia-petrova-uk/`  
**Public CAESTHETIC face:** Valerie Petra (`docs/ssot/CAESTHETIC.md`)  
**This lane:** no profile, headline, banner, About, Featured, or registry writes.

| Check | Verdict | Evidence |
|-------|---------|----------|
| Session/account exists | PASS (SSOT) | Funnel SSOT §5.6: technically live; Dolphin readiness recorded |
| Public narrative = CAESTHETIC Growth Score | GAP | Funnel SSOT §5.6 (2026-08-21): indexed name `VALERIIA PETROVA`; headline/company context ROVLEX; About = Founder of ROVLEX INT / reputation management; CAESTHETIC is not the dominant public narrative |
| Name match vs site | GAP | Site uses **Valerie Petra**. LinkedIn vanity uses **Valeriia Petrova**. Trust mismatch. |
| CAESTHETIC site links to LinkedIn | PASS (correctly withheld) | `CAESTHETIC.md`: no LinkedIn URL on public runtime until identity is confirmed |
| First-cohort LinkedIn ABM | GAP | Cannot be the professional trust check until founder Option A or B is chosen |
| Public HTML fetch 2026-08-21 | GAP (blocked) | Anonymous LinkedIn returned no usable profile HTML (HTTP 999 / empty 301). Browser tab did not render the public profile. Verdict therefore rests on current SSOT, not a fresh OG scrape. |

Parked copy and options: `OPEN_DECISION_linkedin-identity.md`. **Do not apply.**

---

## 4. CTA inventory (all first-lead surfaces)

| Surface | Live / packed CTA | vs DEC-845 | Verdict |
|---------|-------------------|------------|---------|
| IG bio | Get a Free Growth Score + Score URL | Canonical offer | PASS (product) / GAP (emoji/US wording) |
| IG highlights | START / SCORE / 30 DAYS / **PAY** / PROOF | Do not lead with price | GAP on PAY |
| IG grid (visible tiles) | FREE GROWTH SCORE; 30-DAY… | Score may educate Sprint; must not cold-sell Sprint | WATCH |
| Site home | `Get your Growth Score` → `/growth-score/` | Canonical | PASS (`site-caesthetic/index.html`) |
| `/growth-score/` | `Start my Growth Score`; page does not quote `$2,500` | Canonical; Sprint mentioned only as optional later step | PASS (HTTP 200) |
| Email sequence | Score URL only | Sprint not a cold offer | PASS (pack) |
| Partner copy | Complimentary independent Growth Score | No “send us clients” lead | PASS (pack) |
| LinkedIn public CTAs | Unknown / ROVLEX-shaped | One narrative | GAP until identity decision |
| Cold IG DM | None enabled | OFF | PASS |

Site `/growth-score/` mentions human-verified diagnosis and uses the word “review” inside the Reputation surface description, not as a CTA. Copy pack CTAs do not use “reviews.”

---

## 5. Confirmations for parent

- Cold Instagram DM remains **OFF**. No enabled cold-DM play was drafted.
- LinkedIn identity, headline, banner, and `social-account-registry.yaml` were **not** changed.
- Remaining founder decision: LinkedIn identity Option A vs B (see OPEN_DECISION).
