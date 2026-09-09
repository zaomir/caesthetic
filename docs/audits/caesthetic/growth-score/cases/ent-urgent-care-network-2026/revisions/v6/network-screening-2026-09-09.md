# ENT Urgent Care — Multi-Location network screening

**Status:** internal AI research artifact · manager review pending  
**Collected/compiled:** 2026-09-09  
**Declared network:** 47 locations / 16 states  
**Research boundary:** public/open sources only; no calls, forms, appointments, CRM, patient data, ad accounts or internal conversion data.  
**Use:** evidence input for the Russian Multi-Location manager-review parent and Alexander City focus child. This file is not a final client diagnosis.

## Decision framing

The screening tests one network question: **does the national ENT Urgent Care promise remain the same local reality when a patient chooses a specific branch?**

The screening does not rank clinical quality, revenue, profitability or business performance. `Fix now` means highest observed **public-path risk** in the reviewed website/entity layer. Missing evidence is `Needs verification`, never zero.

## Coverage

- 47/47 declared locations are present in this registry.
- On 40 location pages where both the generic network hours and a local schedule could be compared, **37 showed different schedules** and **3 matched**. This does not mean 37 schedules are wrong; it means the template presents two potentially different notions of availability without consistently explaining the distinction.
- **At least 11** captured location pages showed `Visit Website` without a local `Book an Appointment` action in the captured branch block. This is a confirmed minimum, not a network-wide absence claim.
- **2 declared location routes** tested during this pass returned 404: Burlington, CO and Barrington, IL.
- **2 current location pages** contained a provider heading for another city: Buffalo Grove → Orland Park; East Brainerd → Charlotte.
- Alexander City showed the clearest local identity break: the Alexander City page displayed a Huntsville address/phone while the underlying local partner source resolves Alexander City to 3368 Highway 280, Suite G-15, Alexander City, AL 35010 and 256-329-1114.
- Search/GBP, Social and Reputation depth is not equivalent for all 47 locations. These surfaces remain `Needs verification` wherever a comparable local entity/source was not resolved. No network Search, Social, Reputation or Overall score is produced.

## Repeated-pattern candidates

### P1 — Availability presentation is not location-safe

**Observed in:** 37 of 40 pages with comparable generic/local hours.  
**Interpretation:** the shared page layer often presents a standard schedule above a different local schedule. The difference may be office hours versus ENT Urgent Care availability, but that distinction is not consistently explicit.  
**Commercial relevance:** a national same-day / walk-in promise can become ambiguous at the branch level.  
**Candidate scope:** shared template + local data model.  
**AI status:** candidate Supporting Gap; human approval required.

### P2 — Local entity / provider context can drift

**Confirmed examples:** Alexander City address/phone → Huntsville; Buffalo Grove provider heading → Orland Park; East Brainerd provider heading → Charlotte.  
**Interpretation:** city, partner, provider and contact fields are not reliably isolated from shared/template content.  
**Candidate scope:** shared data mapping + branch corrections.  
**AI status:** candidate Primary Gap; human approval required.

### P3 — Declared network registry and executable routes are not fully aligned

**Confirmed examples:** Burlington and Barrington declared location routes returned 404; network/state listings have shown inconsistent state/location exposure during the crawl.  
**Interpretation:** the network directory, location registry and location routes need one canonical source of truth.  
**Candidate scope:** shared registry/router.  
**AI status:** candidate Supporting Gap; human approval required.

### P4 — Booking action is not consistently branch-specific

**Confirmed minimum:** 11 captured pages with `Visit Website` but no local `Book an Appointment` action in the captured branch block.  
**Interpretation:** this is not automatically a defect because some partners may use call/partner-site routing. The problem is lack of a consistent rule mapping each branch to its real next action.  
**AI status:** repeated implementation dependency; not promoted to a separate Top-3 slot unless human review finds it materially independent.

## Highest public-path-risk shortlist

| Rank candidate | Location | Why it is in the shortlist | AI state |
|---|---|---|---|
| 1 | Alexander City, AL | Alexander City page resolves address/phone to Huntsville; local partner data provides a different Alexander City entity; hours differ; local Book action not observed | Fix now · recommended focus |
| 2 | Buffalo Grove, IL | Provider heading names Orland Park; generic/local hours differ | Fix now |
| 3 | East Brainerd, TN | Provider heading names Charlotte; generic/local hours differ | Fix now |
| 4 | Burlington, CO | Declared location route returned 404 | Fix now |
| 5 | Barrington, IL | Declared location route returned 404 | Fix now |
| 6 | Edina, MN | Generic full-week hours versus mostly call/text local availability | Fix now |
| 7 | Roseville, MN | Generic full-week hours versus Tue/Thu 9–3 plus call/text availability | Fix now |

This is a **risk shortlist, not a worst-branch ranking**. Public evidence does not support a claim about clinical quality, patient volume, profitability or business performance.

## 47-location registry

| State | Location | Website state | Highest observed website/entity issue |
|---|---|---|---|
| AL | Alexander City | Fix now | Network page shows Huntsville address/phone; local hours differ; local Book CTA not observed |
| AL | Birmingham | Watch | Generic/local hours differ; local Book CTA not observed |
| AL | Birmingham South | Watch | Generic/local hours differ; local Book CTA not observed |
| AL | Fairhope | Watch | Generic/local hours differ; local Book CTA not observed |
| AL | Homewood | Needs verification | Comparable local-hours evidence not completed |
| AL | Huntsville | Needs verification | Declared location; current canonical route/slug needs verification |
| AL | Huntsville Medical District | Watch | Generic/local hours differ; local Book CTA not observed |
| AL | Madison | Watch | Generic/local hours differ; local Book CTA not observed |
| AL | Opelika | Watch | Generic/local hours differ |
| AL | Tuscaloosa | Watch | Generic/local hours differ; local Book CTA not observed |
| AZ | Phoenix | Protect | Generic/local hours matched in captured page; no material website identity break confirmed |
| CA | Tarzana | Watch | Generic/local hours differ; partner policy controls availability/walk-ins |
| CO | Alamosa | Watch | Generic/local hours differ; local Book CTA not observed |
| CO | Burlington | Fix now | Declared location route returned 404 during screening |
| CO | Colorado Springs — Briargate | Watch | Generic/local hours differ |
| CO | Colorado Springs — Medical Center | Watch | Generic/local hours differ; local Book CTA not observed |
| CT | Farmington | Needs verification | Only one comparable hours block was reliably captured |
| CT | Glastonbury | Watch | Generic/local hours differ |
| DE | Lewes | Watch | Generic/local hours differ |
| IL | Barrington | Fix now | Declared location route returned 404 during screening |
| IL | Buffalo Grove | Fix now | Provider heading says Orland Park; generic/local hours differ |
| IL | Oak Lawn | Watch | Generic/local hours differ |
| IL | Orland Park | Watch | Generic/local hours differ; local schedule includes Saturday |
| IL | Park Ridge | Watch | Page is branded Park Ridge but physical address is Niles; intent needs verification; current provider heading is corrected |
| IL | Rolling Meadows | Watch | Generic/local hours differ |
| MN | Edina | Fix now | Generic full-week hours conflict with local availability that is mostly call/text |
| MN | Mankato | Fix now | Generic full-week hours conflict with limited local appointment blocks/call availability |
| MN | Roseville | Fix now | Generic full-week hours conflict with Tue/Thu 9–3 plus call/text availability |
| MN | Savage | Watch | Generic hours differ from partner-controlled local hours/policies |
| MS | Corinth | Fix now | Generic hours conflict with local days that require call for availability |
| MS | New Albany | Protect | Generic/local hours matched in captured page |
| MS | Starkville | Fix now | Generic/local availability differs materially in captured screening |
| MS | Tupelo | Watch | Hours matched; local Book CTA not observed in captured page |
| MS | Tupelo Crosstown | Needs verification | Comparable local-hours evidence not completed |
| MO | Sunset Hills | Watch | Generic/local hours differ; metro/city naming context should be explicit |
| NJ | Paramus | Watch | Generic/local hours differ |
| NY | New York City | Watch | Generic/local hours differ; partner identity is separate |
| NC | Charlotte | Watch | Generic/local hours differ; partner identity is separate |
| NC | Monroe | Watch | Generic/local hours differ; local Book CTA not observed |
| SD | Sioux Falls | Needs verification | Current location resolved through legacy slug; canonical route needs verification |
| TN | Chattanooga | Watch | Generic/local hours differ |
| TN | East Brainerd | Fix now | Provider heading says Charlotte; generic/local hours differ |
| TN | Nashville | Watch | Generic/local hours differ |
| TX | Austin | Watch | Generic/local hours differ |
| TX | Dripping Springs | Fix now | Generic full-week hours conflict with limited days/call availability |
| TX | Lakeway | Watch | Generic/local hours differ |
| TX | Marble Falls | Fix now | Generic full-week hours conflict with Tue/Thu local availability |

Registry summary: **12 Fix now · 28 Watch · 2 Protect · 5 Needs verification**. These are website/entity screening states only, not branch scores.

## Alexander City focus evidence

### Network page

`https://enturgent.com/location/alexander-city/`

Observed in the research pass:
- branch identity: Alexander City;
- address shown: 1963 Memorial Pkwy SW, Suite 5A, Huntsville, AL 35801;
- phone shown: 256-536-9300;
- generic network hours differ from the local schedule;
- local `Book an Appointment` action was not observed in the captured branch block.

### Underlying local partner source of truth

Southern Head & Neck Surgery public Alexander City material resolves:
- `3368 Highway 280, Suite G-15, Alexander City, AL 35010`;
- `256-329-1114`;
- Monday–Thursday 7:45–12:00 and 12:30–5:00; Friday 7:45–1:00;
- public capabilities include in-office procedures such as balloon sinuplasty, endoscopy, audiology/vestibular and allergy services.

The partner also discloses that some insurance plans may require referral and that urgent same-day sinus/allergy appointments are described for established patients who call before 9:00. This is materially narrower than the network-wide blanket proposition `same-day`, `walk-ins welcome, most days`, `no referral needed`. The finding is a **promise/local-policy consistency issue**, not a clinical-quality judgment.

## Candidate Focus Selection for manager review

**Focus location:** Alexander City, AL — AI recommendation.  
**Candidate Primary:** Network-to-local public-path integrity.  
**Candidate Supporting 1:** Availability and promise consistency.  
**Candidate Supporting 2:** Location registry and executable-route integrity.  
**Do Not Fund Yet candidate:** do not increase paid demand into a branch until its local entity, availability and next-action path are verified. This is not a claim that current ads are ineffective.

Named-human approval is required before these become final.

## 30-Day implementation candidate — $2,500

The Sprint value is **not** correcting one wrong address. It is implementing one network-safe location architecture and proving it on a real branch.

1. Normalize a canonical 47-location registry: city, partner, address, phone, providers, hours, services, booking/call route, walk-in/referral notes, reputation entity.
2. Repair the shared location-page rendering so network defaults and local facts cannot silently overwrite each other.
3. Fully repair Alexander City as the implementation pilot.
4. Replace ambiguous blanket availability/referral wording with location-aware presentation where the local policy is known.
5. Repair wrong-city provider-heading/template mapping and broken declared routes.
6. Normalize branch CTA logic to the actual action: `Book`, `Call this location`, or `Visit partner practice`.
7. Align the pilot GBP when authorized; do not create a duplicate profile when the real-world entity is the partner practice.
8. Connect local reputation proof to the resolved local entity without review gating or scripted sentiment.
9. Apply only safe shared fixes across the network; queue branch-specific factual changes that require local owner verification.
10. Add automated QA for all 47 declared locations plus event measurement for local CTAs. This creates an implementation baseline; it does not claim revenue impact.

### Immediate corrections that do not justify the Sprint by themselves

- verify/correct Alexander City address and phone;
- correct Buffalo Grove and East Brainerd wrong-city provider headings;
- restore or redirect Burlington and Barrington declared routes after entity verification.

## Limitations

- No Network Score, average branch score, best/worst branch claim or revenue conclusion.
- Search/GBP geo-grid is not completed for all 47 branches.
- Comparable 90-day reputation velocity is not completed for all 47 branches.
- Social ownership/content coverage is not completed for all 47 branches.
- Internal Lead Intake / conversion stages are Not Assessed.
- ENT remains outside the currently approved CAESTHETIC production vertical enum. This artifact may be used for internal manager review but is not a canonical approved client Growth Score until that product decision is resolved.
