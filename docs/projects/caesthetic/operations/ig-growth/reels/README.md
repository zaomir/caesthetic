# CAESTHETIC Reel Scenario Registry

This namespace is the machine-readable scenario authority for CAESTHETIC
Reels. It implements Reel System V3.0 (`DEC-838`).

## Contract

- One Reel is one YAML file under `episodes/`.
- `REGISTRY.yaml` is the only enumeration point. Workers must discover an
  episode there, then load the referenced episode YAML. They must not enumerate
  `episodes/` or reconstruct a scenario from chat history or model memory.
- Future scenarios are created here as YAML before generation or production.
- An episode records the exact spoken script, ordered scenes, evidence/method
  lineage, production inputs and output/publication references. The registry
  carries discovery metadata only and must not duplicate the script.
- `spec_version` is pinned for a production batch. Structural, timing, CTA,
  Valerie or evidence-rule changes require a versioned authority change.
- `compiled_against_git_sha` stays `null` until a production worker compiles
  the episode, then records the exact repository commit used.

## Storage authority

- Repository: scenario and production contracts.
- Dropbox: heavy media under
  `CAESTHETIC/CAESTHETIC MEDIA/Production/...` and the `Huck/...` delivery
  namespaces defined by the V3 SSOT.
- Notion: optional human-facing catalogue only. It is not authority and is not
  in the generation, production or publication critical path.

The scenario/production worker input contract is therefore:

```text
REGISTRY.yaml -> episodes/<episode>.yaml -> pinned SSOT/method/evidence refs
```

## Canonical references

- `docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md`
- `docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_OPENER_CANON.md`
- `docs/ssot/CAESTHETIC_HEYGEN_PRODUCTION_SYSTEM.md`
- `docs/ssot/CAESTHETIC_VALERIE_AVATAR_LIBRARY.md`
- `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
