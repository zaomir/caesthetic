# Expert Dental bidirectional sync canary

- Canary ID: `expert-dental-caesthetic-writeback-20260904`
- Created at: `2026-09-04T21:20:00Z`
- Created in: `zaomir/caesthetic` managed mirror
- Expected authority path: `docs/projects/raimovdental/EXPERT_DENTAL_BIDIRECTIONAL_SYNC_CANARY.md`
- Data classification: synthetic operational evidence; no patient data, PHI, credentials, secrets, private client material or recordings

This durable canary proves that an explicitly allowlisted non-PHI Expert Dental
project document created in the CAESTHETIC mirror is written back to the same
relative path in `zaomir/grainee-v2`, after which `grainee-v2 main` remains the
authority and the mirror manifest is refreshed to the committed authority SHA.
