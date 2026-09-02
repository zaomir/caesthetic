# Publish Growth Score from the CAESTHETIC satellite

Canonical contract: `docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md`.

Directories:

- `artifacts/<request_id>/` — immutable package plus approved-report record(s);
- `requests/<request_id>.json` — exact-SHA request generated after the artifact commit is on satellite `main`;
- `results/<request_id>.json` — terminal bridge result returned by VPS2402;
- `canonical-records/<request_id>.json` — grainee-side audit/recovery record mirrored for transparency.

The agent never supplies a destination path, deploy command, password, password hash or secret. Single-location imports one report. Multi-Location imports one parent plus one focus child atomically.

