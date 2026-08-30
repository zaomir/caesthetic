# CAESTHETIC Reel Scenario Registry

This namespace is the machine-readable scenario authority for CAESTHETIC
Reels. It supports the default Reel System V3.3 (`DEC-838`, amended by
`DEC-839`, `DEC-840` and the founder-locked Format A acceptance on 2026-08-22)
and explicitly tagged parallel formats. Format B v1.0
is governed by `docs/ssot/CAESTHETIC_REEL_FORMAT_B.md`; it does not replace or
recompile Format A/V3.3 episodes.

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
- Every episode declares one `audio_master` with provider `elevenlabs`, voice id
  `lxYfHSkYm1EzQzGhdbfc`, `no_leading_silence: true` and
  `continuous_voice: true`. Heavy master/timestamp files are Dropbox refs, not
  Git binaries.
- Voiced scenes use `delivery_mode: on_camera|voice_over` and an ordered,
  non-overlapping `audio_segment_ref` into that master. `spoken_text` is review
  copy only; workers must not synthesize it per scene.
- `lip_sync_provider` is capability-gated. Missing master/timestamps or an
  unsupported selected lip-sync route fails closed; a reserve provider may use
  the same master segment but may not generate a new voice.
- Format B episodes declare `format_system` and `spec_ref`; workers must not
  apply Format B timing, loop or long-form scene rules to untagged episodes.

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

- `docs/ssot/CAESTHETIC_REEL_AUTOMATION.md` (ops / ElevenLabs / Kling / agent answers)
- `docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md`
- `docs/ssot/CAESTHETIC_REEL_FORMAT_B.md`
- `docs/ssot/CAESTHETIC_REEL_FORMAT_B_TOPIC_BANK.md` (proposed; no production authority until Format B v1.1)
- `docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_OPENER_CANON.md`
- `docs/ssot/CAESTHETIC_HEYGEN_PRODUCTION_SYSTEM.md`
- `docs/ssot/CAESTHETIC_VALERIE_AVATAR_LIBRARY.md`
- `docs/ssot/EVIDENCE_AND_IMPACT_STANDARD.md`
