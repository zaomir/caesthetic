# Expert Dental Workspace MVP

**Status:** approved for MVP implementation  
**Owner:** Expert Dental Studio / Атабек Саидович  
**Surface:** RAIMOV DENTAL private staff workspace

## Product rule

One system, one role-based workplace, one dominant next action.

Mandatory flow:

`updates → learning → test → accept handoff → start shift → work → handoff → finish shift`

A user cannot start a shift until mandatory updates are acknowledged, the current test is passed, and previous-shift responsibility is accepted.

## Roles

- Administrator: calls, booking, patient requests, doctor transfer, shift handoff.
- Doctor: accepted patient requests, duty status, callback tasks, medical outcome.
- Manager: shifts, training status, retakes, open tasks, quality control.
- Clinic owner: clinic-level status, standards, permissions and compliance.

## MVP onboarding content

1. Clinic service standard and role boundaries.
2. Doctors, specialties and routing.
3. Priority services: veneers, implants, orthodontics and complex treatment.
4. Incoming-call standard.
5. Existing-patient and post-procedure requests.
6. Medical red flags and administrator limitations.
7. Doctor handoff: information plus explicit acceptance of responsibility.
8. CRM/journal discipline and next action.
9. Start-of-shift acceptance.
10. End-of-shift handoff.

## Testing

- Pass score: 90%.
- Critical safety questions: 100%.
- Failed test keeps workplace access limited.
- Product updates may be informational or mandatory.
- Mandatory updates include a short lesson and 3–5 questions.

## Shift rules

Start:

1. Read updates published since the last shift.
2. Pass mandatory tests.
3. Review and accept open tasks.
4. Confirm workplace readiness.
5. Press `Начать работу`.

Finish:

1. Every open task has an owner, next action and due time.
2. Urgent medical responsibility is accepted by a doctor before shift end.
3. Press `Передать смену`.
4. Press `Завершить работу`.

## Routing rule

For a post-procedure request, system recommendation order is:

1. treating doctor when available;
2. designated replacement;
3. free doctor of the same specialty;
4. duty doctor;
5. controlled callback queue.

Red flags override continuity and route to the first qualified available doctor or duty doctor.

A transfer is complete only after the receiving doctor presses `Принять обращение`.

## Interaction motion

- Screen and card transitions use short ease-out motion rather than abrupt replacement.
- Buttons provide immediate pressed feedback without delaying the underlying action.
- Progress indicators animate between states.
- Motion is disabled automatically for users with `prefers-reduced-motion`.
- Motion must never hide status changes or slow urgent clinical routing.

## MVP limitations

- Demo authentication and local browser state only.
- No real patient data.
- No CRM/PBX write integration.
- Passwords must be replaced by server-side identity before clinical use.
