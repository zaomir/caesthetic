# Patient funnel

Stores the approved operating model for:

`attention → trust → enquiry → booking → visit → diagnosis → treatment plan → payment → repeat treatment → referral`.

Use this namespace for CRM fields/statuses, responsibility maps, response SLA, reminders, attendance, diagnostic handoff, plan follow-up, loss reasons, recall and referral tracking.

**Patient motivation (retention / membership / points):** canonical SSOT is `docs/ssot/EXPERT_DENTAL_PATIENT_MOTIVATION_SYSTEM.md` (DEC-786). Continuity entry path: `docs/ssot/RAIMOV_ACCESS_CONTINUITY_SYSTEM.md` (DEC-774). Do not invent review-reward rules here.

No raw patient records or medical files belong in Git. Configuration must use anonymised schemas and example data only.
