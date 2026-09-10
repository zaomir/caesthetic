# Expert Dental public offer publishing contract

Status: ACTIVE PUBLISHING CONTRACT  
Authority: `zaomir/grainee-v2` → `main`  
Knowledge domain: `healthcare-ecosystem`  
Runtime unit: `raimovdental`

## 1. Canonical legal source

The public offer is edited only through the current release selected by:

- `docs/legal/raimov/expert-dental/OFFER_EDITIONS.json`
- current source: `docs/legal/raimov/expert-dental/offer-release-2/offer.json`

The legal document identity remains `ED-CON-003`. The paper acceptance identity remains `ED-CON-004` (and the representative/minor acceptance defined by the current release). These IDs are part of the legal release and MUST NOT be renamed merely for website presentation.

The current public website presentation ID is `ED-PUB-OFFER-001`. It is a presentation/distribution identity only. It does not replace `ED-CON-003` in the legal archive, acceptance form, immutable release manifest, or evidentiary chain.

## 2. One edit point

No legal prose is edited in Tilda or separately in RAIM SMILE.

Flow:

`current offer.json` → build → `/legal/public-offer.json` → website consumers.

The feed is a deterministic projection of the canonical source and contains:

- `document_id = ED-PUB-OFFER-001` — public presentation ID;
- `legal_document_id = ED-CON-003` — legal source ID;
- `version` — current offer edition;
- `source_sha256` — SHA-256 of the exact canonical source bytes;
- RU/KY sections projected from the same clauses;
- public operator/licence fields only.

No patient data, signatures, clinical records, credentials or secrets may be published in this feed.

## 3. Public consumers

### RAIM SMILE

Canonical legal page:

- `https://raimsmile.com/legal/public-offer/`
- shared feed: `https://raimsmile.com/legal/public-offer.json`

RAIM SMILE may render the legal identity `ED-CON-003` because it is the canonical legal publication surface and immutable archive owner.

### Expert Dental / Tilda

Tilda page:

- `https://expertdental.kg/oferta`

The T123 renderer must fetch only:

`https://raimsmile.com/legal/public-offer.json`

Tilda MUST NOT contain an independently maintained copy of the offer text. It may contain presentation CSS/JS only.

## 4. Version parity

For every release:

- Tilda-visible `version` MUST equal the feed `version`;
- RAIM SMILE current legal page MUST render the same current edition;
- `source_sha256` is the cross-surface content authority;
- historical editions remain immutable under their archive routes;
- a legal text change requires a new edition according to the offer release process, never mutation of an accepted historical edition.

## 5. Acceptance boundary

Website viewing, booking, form submission, messenger interaction or ordinary browsing is not treated as acceptance under the current paper pilot unless the canonical offer release expressly changes that rule.

The website publication does not replace informed medical consent, treatment plan, estimate, clinical record or procedure-specific documents.

## 6. Release verification

A release is verified only after:

1. deterministic feed build succeeds;
2. legal offer tests pass;
3. RAIM SMILE production deploy succeeds;
4. production legal page and feed return successfully;
5. feed `version` and `source_sha256` match the current canonical release;
6. Tilda `/oferta` renders the same feed version when externally reachable.

If Tilda is temporarily unreachable from automated probes, RAIM SMILE/feed production verification can be recorded separately, but Tilda parity remains `UNVERIFIED` until a live probe or owner-provided rendered evidence confirms it.

## 7. Change rule

To change the public offer, edit only the current/new canonical legal release in `grainee-v2` according to the immutable release process. Do not edit the legal prose in Tilda and do not create a second source in another repository or CMS.
