# CAESTHETIC — Products, Tools, Growth School and Practitioner Directory

**Status:** Proposed canonical architecture  
**Project:** CAESTHETIC  
**Repository:** `zaomir/grainee-v2`  
**Primary domain:** `caesthetic.com`  
**Directory domain:** `find.caesthetic.com`  

## 1. Core commercial model

CAESTHETIC sells products by audience, not by channel.

### Products

1. Marketing for aesthetic practitioners
2. Marketing for dental practices
3. Marketing for beauty businesses
4. Marketing for multi-location groups

A product page answers: who this is for, what problem is solved, what result is expected, what CAESTHETIC operates, what remains with the client, and how to start.

### Tools

Tools are methods used inside one or more products:

- Lead handling and booking
- AI assistant for first response and follow-up
- Remote administrator / response team
- CRM / single client database
- Maps and reviews
- Website and landing pages
- Advertising
- Content and personal brand
- Repeat visits and reactivation
- Analytics
- Team training
- Plan to reduce manual owner work
- Professional education coordination
- Drug and technology news
- Product sourcing and supply planning

Maps reputation is a tool, not a standalone product. Existing SEO URLs may remain, but navigation and commercial framing must place maps under Tools.

## 2. Language standard

Most visitors are not marketing specialists. Use short sentences and familiar words.

Prefer:

- We bring new enquiries.
- We answer first questions.
- We help book the patient.
- We remind people who stopped replying.
- We help old patients return.
- The doctor joins when a medical decision is needed.

Avoid:

- demand infrastructure
- lifecycle orchestration
- revenue operations
- omnichannel attribution
- operating-system language unless immediately explained

## 3. Product page standard

Each product page follows one simple structure:

1. Clear result
2. Daily problems the audience recognises
3. What happens to a lead today
4. What the improved journey looks like
5. What is automated
6. When a human or clinician takes over
7. Where enquiries come from
8. How trust is built
9. How missed enquiries are recovered
10. How repeat visits are created
11. What tools are used
12. Relevant Growth School lessons
13. Pricing summary
14. Assessment CTA

## 4. Product: Marketing for aesthetic practitioners

Primary audience: independent injectors, aesthetic doctors renting a room, doctors working inside another clinic, small med spas, and practitioners preparing to open their own practice.

Primary promise:

> More patients ready to talk. Less time spent answering the same questions.

Main problems:

- Empty appointment slots
- Unstable flow of enquiries
- Too many price-only questions
- Messages arriving during procedures
- Leads lost in WhatsApp and Instagram
- No consistent follow-up
- Patients not returning on time
- Weak personal brand compared with clinical skill
- Demand concentrated in cheap entry procedures
- Stock purchased without demand planning

CAESTHETIC operates:

- Lead generation
- First response
- Basic qualification
- FAQ handling
- Price-range explanation where appropriate
- Follow-up
- Booking support
- Lead summary before handoff
- Recall and reactivation
- Demand and stock planning

Clinical boundary:

Automation does not diagnose, prescribe, choose a product for a specific patient, assess contraindications, promise outcomes, or handle complications without human escalation.

## 5. Product: Marketing for dental practices

Primary promise:

> More enquiries for priority treatments. Fewer missed calls and unfinished treatment plans.

Segment-specific content must cover implants, veneers, orthodontics, treatment-plan acceptance, missed calls, admin scripts, no-shows, and unfinished treatment.

## 6. Product: Marketing for beauty businesses

Primary promise:

> Fill empty slots, bring clients back, and reduce the owner's daily messaging.

Segment-specific content must cover repeat booking, cancellations, waiting lists, staff utilisation, new specialist launch, loyalty, packages, and protection of the business-owned client database.

## 7. Product: Marketing for multi-location groups

Primary promise:

> One lead and marketing system across every location.

Segment-specific content must cover routing, shared CRM, common response standards, local maps, location comparison, SLA, and uneven capacity.

## 8. Tools hub

Public route: `/tools/`.

Each tool page must answer:

1. What problem it solves
2. How it works in plain language
3. What the client must provide
4. What CAESTHETIC operates
5. Limits and compliance
6. Which products use it
7. Relevant Growth School lesson
8. Assessment CTA

Recommended tool names:

- Answers and booking
- Smart enquiry assistant
- Remote administrator
- Client database
- Maps and trust
- Website that explains and books
- New client campaigns
- Content that helps people choose you
- Repeat visits
- Simple business numbers
- Administrator training
- Practice without constant owner involvement
- Training for doctors and teams
- What is new in products and technology
- Products and supplies

## 9. CRM white-label principle

CAESTHETIC may resell a medical CRM under a white-label agreement only after checking:

- white-label rights
- data ownership
- export rights
- API access
- support obligations
- server location
- GDPR and local health-data requirements
- language support
- termination and migration rights

The public product must remain CRM-independent. If a client already has a suitable CRM, CAESTHETIC works with it.

## 10. Growth School

Public route: `/school/`.

Name:

> Growth School

Subtitle:

> Simple instructions for doctors, clinics and beauty businesses.

The method is universal. Examples change by profession.

Core modules:

1. Who you want to attract
2. Why people should choose you
3. Where enquiries come from
4. How to answer
5. How to book
6. How to follow up
7. How to bring clients back
8. How to reduce manual work
9. How to track simple business numbers
10. How to choose products and suppliers

Every lesson includes tabs or examples for:

- Aesthetic practitioner
- Dental practice
- Beauty business
- Multi-location group

Every lesson ends with two choices:

- Do it yourself
- Ask CAESTHETIC to set it up

The School publishes the method openly. Paid value is diagnosis, adaptation, setup, operation, control and accountability.

## 11. Product and supply positioning

Products and supplies are presented as a way to improve practice efficiency, not as a hidden sales objective.

CAESTHETIC can source different brands, categories and countries of origin. The practitioner chooses products based on patients, positioning, regulation, clinical judgement and economics.

Do not claim broad superiority of one country of origin.

For product-specific claims such as comfort, duration, safety, environmental impact or complication rate, publish only evidence-backed statements tied to a named product and permitted market.

## 12. Practitioner directory and map

### Domain decision

Use `find.caesthetic.com` for the public practitioner map.

Reasons:

- separates patient-facing search from B2B services
- preserves CAESTHETIC brand trust
- allows a simpler patient-focused interface
- lets practitioners claim and improve profiles
- creates a natural bridge from directory visibility to CAESTHETIC tools

Do not launch a separate unrelated brand or root domain at this stage.

### Directory purpose

Patients can search for aesthetic practitioners by:

- location
- specialty
- treatment category
- languages
- consultation format
- verified profile status

The directory must not rank practitioners by payment, claim clinical superiority, or imply medical endorsement without a documented verification standard.

### Public data only

Git must never contain the full contact database or private enrichment fields.

The directory receives a publish-safe export with only:

- public display name
- professional title
- public clinic/practice name
- public business address or approximate location
- city, region and country
- public website
- public booking/contact URL
- public business phone where allowed
- public social profile
- specialties and treatment categories
- languages
- public opening information
- profile claim status
- verification status and method
- source and last checked date
- consent/legitimate-publication state

Never publish:

- private email
- personal mobile collected for outreach
- hidden database notes
- lead scores
- purchase history
- enrichment confidence notes
- suppression status
- personal home address

### Map privacy

For solo practitioners working from a private or home address, show an approximate service area or city-level point until the practitioner explicitly approves exact publication.

### Profile workflow

1. Import candidate record from internal database
2. Match to public professional source
3. Build publish-safe draft
4. Run duplicate and compliance checks
5. Publish as unclaimed or invite-only depending on jurisdiction
6. Allow practitioner to claim
7. Verify identity and professional status
8. Allow corrections and removal
9. Recheck periodically

### Profile states

- Draft
- Public — unclaimed
- Claimed
- Verified
- Needs review
- Hidden
- Removed

### Commercial bridge

Directory inclusion must not depend on buying marketing or products.

Paid optional services may include:

- profile setup assistance
- professional photography/content
- booking integration
- website connection
- response automation
- CRM connection
- marketing services

Paid placement must be labelled clearly as sponsored and must not be mixed with clinical quality ranking.

## 13. Directory technical architecture

Initial source can live under `site-caesthetic/find/`, while production serves it through `find.caesthetic.com`.

Recommended components:

- publish-safe practitioner API or generated JSON feed
- geocoding pipeline
- map and list view
- city and specialty landing pages
- profile claim flow
- correction/removal form
- verification log
- duplicate handling
- sitemap split for profiles and locations
- noindex for thin or unverified pages until quality threshold is met

Do not commit database exports containing personal data.

## 14. Navigation model

Primary CAESTHETIC navigation:

- For whom
- Tools
- Growth School
- Pricing
- Work
- About

Patient directory link:

- Find a practitioner

The directory opens `find.caesthetic.com` and uses patient-facing language. The B2B site uses business-facing language.

## 15. Required migration

1. Reframe `/dental/`, `/beauty/`, `/aesthetic-medicine/` as “Marketing for…” products.
2. Add multi-location product when representative template passes QA.
3. Create `/tools/` hub.
4. Reframe `/maps-reputation/` as “Maps and trust” under Tools while preserving SEO value.
5. Reclassify current `/solutions/*` pages as tool pages or redirect to the new tool structure.
6. Create `/school/` hub and one representative lesson template.
7. Add directory teaser to CAESTHETIC.
8. Build `find.caesthetic.com` only with publish-safe data flow.
9. Keep pricing SSOT in `site-caesthetic/src/config/pricing.ts`.
10. Keep AI public text routes limited to `/ru/text` and `/en/text`.
11. Use existing Telegram deeplink rules only.

## 16. Definition of done

- Products are audience-based.
- Tools are no longer sold as independent audience products.
- Maps reputation is under Tools.
- Product copy differs materially by specialty.
- Language is understandable without marketing education.
- Growth School is universal with specialty-specific examples.
- Supply is positioned as efficiency and choice.
- `find.caesthetic.com` is defined as the patient-facing directory.
- No private database fields are published or committed.
- Directory claim, correction, verification and removal flows are defined.
