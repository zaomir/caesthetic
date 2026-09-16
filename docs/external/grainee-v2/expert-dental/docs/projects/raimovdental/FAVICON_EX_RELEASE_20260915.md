# EX favicon release

Owner request: use the approved green-gradient EX on a white square as clinic.raimovdental.com favicon.

- Code commit: `fdff385286ec1ca2ba2074f500db3f5fec1e8dea`.
- Deployed SHA confirmed by public `/release.json`: `32e06400c19c8230aa814737b1caf976e7d3ac0d`.
- Release timestamp: `20260915T223340Z`.
- Bridge receipt: `docs/agent-api/results/raimov-ops-ex-favicon-20260916.json`; status success, health passed, smoke passed (8 assertions).
- Workflow: https://github.com/zaomir/grainee-v2/actions/runs/35031462259
- Local verification: Node syntax checks; all three asset references and fingerprint inputs present; ICO frames 16/32/48, PNG 48, touch icon 180.
- Public homepage includes hashed ICO/PNG/touch icon links. Public PNG downloaded successfully and matches the committed PNG byte for byte.
- Stable `/favicon.ico` emitted by the builder for browser fallback.

The shared template covers all patient-site documents, including error pages. Old generated arch SVG removed from the builder. Source and export notes: `site-raimovdental/patient-site/assets/img/brand/FAVICON.md`.
