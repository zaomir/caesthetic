# ENT Urgent Care — Alexander City focus audit

**Status:** internal Russian manager-review artifact · human approval pending  
**Network:** ENT Urgent Care · 47 declared locations / 16 states  
**Focus candidate:** Alexander City, Alabama  
**Research boundary:** public/open sources only; no calls, forms, appointments, CRM, PHI, ad accounts or internal conversion data.  
**Role in package:** focus child of the ENT Urgent Care Multi-Location review. It does not create a second commercial funnel.

## Executive finding

Alexander City is the clearest pilot because the public journey changes local identity inside the same branch page.

The ENT Urgent Care page is titled **Alexander City** but displays:

- `1963 Memorial Pkwy SW, Suite 5A, Huntsville, AL 35801`;
- `256-536-9300`;
- a generic network hours block and a second local hours block;
- no local `Book an Appointment` action in the captured branch block.

The underlying local partner, Southern Head & Neck Surgery, publicly resolves Alexander City to:

- `3368 Highway 280, Suite G-15, Alexander City, AL 35010`;
- `256-329-1114`;
- Mon–Thu `7:45–12:00 / 12:30–5:00`, Fri `7:45–1:00`;
- office capabilities including balloon sinuplasty, endoscopy, audiology/vestibular testing and allergy services.

Sources:

- https://enturgent.com/location/alexander-city/
- https://www.southernheadandnecksurgery.net/team
- https://www.southernheadandnecksurgery.net/patient-care

This is a confirmed **public identity / next-step integrity problem**. It is not evidence of poor clinical quality, lost revenue or weak staff performance.

## Patient-choice path

### 1. Discovery promise

ENT Urgent Care presents a broad network promise: fast specialist ENT access, same-day appointments, walk-ins on most days and no referral needed.

Source: https://enturgent.com/locations/

### 2. Local branch selection

A patient selects Alexander City.

### 3. Identity break

The selected Alexander City page publishes the address and phone of Huntsville Medical District. The local partner source publishes a different Alexander City address and phone.

**State:** broken / Fix now.

### 4. Availability ambiguity

The network page presents generic hours plus a separate local schedule. The local partner publishes its own office schedule and additionally states that **established patients** can receive same-day appointments for urgent sinus and allergy problems when calling before 9am.

The partner also states that some BlueCross BlueShield policies, Medicaid and TRICARE Prime require a primary-care referral. That is narrower than the network blanket `no referral needed` proposition.

Source: https://www.southernheadandnecksurgery.net/patient-care

**State:** friction / needs location-aware wording.

### 5. Next action

The local patient should not have to decide whether the correct action is a network booking route, local partner portal, local call or another destination. The branch needs one explicit, verified next action.

**State:** needs repair / branch-specific routing rule.

### 6. Trust / reputation

The local partner is a real, established ENT practice with named clinicians and public patient/reputation evidence. The problem is therefore not `no trust exists`; it is whether the network page connects the patient to the **same local entity and its proof**.

**State:** protect local proof; resolve exact GBP/review entity before publication or GBP edits.

## Four questions

### 1. Is it clear which clinic the patient is choosing?

**No.** The branch label says Alexander City while the public contact block resolves to Huntsville.

**Repair:** canonical location record must bind city, partner, address, phone, providers and action destination.

**Done when:** the patient can move from the Alexander City entry to call/booking without the city or practice silently changing.

### 2. Is it clear when care is actually available?

**Not consistently.** Network default hours, branch-local hours and the partner's actual policy are separate pieces of information.

**Repair:** show one authoritative local-hours block and, if different, one explicit same-day/urgent-availability policy.

**Done when:** hours and urgent availability have separate labels and match the owner-confirmed local source of truth.

### 3. Is the specialist value proposition supported locally?

**Yes, and this is a strength to protect.** Southern Head & Neck Surgery publicly shows Alexander City capabilities that include office procedures, balloon sinuplasty, endoscopy, audiology/vestibular evaluation and allergy services.

**Repair:** connect the network's priority-service explanation to verified local capabilities rather than relying only on generic network copy.

**Done when:** local service claims are supported by the local partner and medically reviewed before publication.

### 4. Is the next step clearer than nearby alternatives?

**Not currently.** Local urgent-care substitutes make their action unusually explicit:

- Russell Medical Urgent Care: Alexander City location, walk-in, no appointment needed, sinus and ear infections explicitly included — https://www.russellcares.com/patients-visitors/urgent-care
- MainStreet Family Care Alexander City: 7-day hours, online registration and walk-ins — https://www.mainstreetfamilycare.com/locations/alexander-city/

These are not equivalent specialist ENT competitors. They matter because they set a simple standard for `where / when / what do I do now?`.

Specialty alternatives in the wider catchment include:

- East Alabama Ear, Nose & Throat, Opelika — https://www.eastalabamahealth.org/location/east-alabama-ear-nose-throat
- Baptist Health ENT Partners, Montgomery — https://www.baptistfirst.org/location/baptist-health-ent-partners-baptist-medical-center-east

**Defend:** specialist ENT access and real local capabilities.  
**Close:** branch identity, availability and next-action ambiguity.  
**Differentiate:** specialist-level ENT care with a locally verified path.  
**Do not copy:** broad general urgent-care positioning that dilutes ENT specialization.

## Immediate corrections — do not use these alone to justify a $2,500 Sprint

1. Verify and correct the Alexander City address and phone on the ENT Urgent Care page.
2. Verify the intended Alexander City providers and partner identity.
3. Remove or relabel the generic hours block so it cannot be mistaken for local office/urgent availability.
4. Set one verified local action: `Book`, `Call this location` or `Visit partner practice`.
5. Reconcile the broad no-referral/same-day language with the actual local insurance and appointment rules.

## What makes this a Sprint rather than a typo fix

Alexander City is the implementation pilot for the **shared network defect** identified in the parent review.

The 30-day repair candidate is:

1. build one canonical location data model for all 47 branches;
2. separate shared marketing copy from location-owned facts;
3. rebuild location rendering so another city's address/provider/hours cannot leak into a branch;
4. make CTA type branch-specific;
5. make same-day/walk-in/referral wording location-aware;
6. connect local service proof and reputation entity;
7. fully implement the corrected model on Alexander City;
8. apply safe template-level fixes network-wide;
9. QA all 47 declared routes and location fields;
10. deliver the remaining branch-specific repair backlog at no additional charge during the Sprint.

The focus child itself does not create a second Sprint offer. Commercial terms live on the Multi-Location parent.

## Candidate decision for Valerie

**Focus location:** Alexander City, AL — AI recommendation.  
**Primary candidate:** Network-to-local public-path integrity.  
**Supporting candidate 1:** Availability / promise consistency.  
**Supporting candidate 2:** Location registry / route integrity.  

Final selection, causality, publication and client delivery require named-human approval.

## Limitations

- No Local Falcon / equivalent 5×5 geo-grid was completed for Alexander City.
- A canonical branch-level Google Business Profile / 90-day review benchmark is not frozen.
- Social ownership/content coverage remains incomplete.
- No internal enquiry, booking, show, consultation or payment data were used.
- No revenue impact or causal loss estimate is claimed.
- ENT remains outside the currently approved CAESTHETIC production vertical enum; this is an internal review artifact, not a canonical approved client Growth Score.
