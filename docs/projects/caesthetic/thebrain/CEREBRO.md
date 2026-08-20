# Cerebro instructions

Use this directory as the public entry point for the CAESTHETIC Brain.

1. Open `INDEX.md` as the root thought.
2. Read `map.json` and create one thought per node ID.
3. Preserve the `links` relationships as thought links; do not flatten the graph into copied strategy text.
4. Read `tasks.json` and `runtime.json` as incremental public-safe projections. Match records by stable ID, update existing thoughts, and create only missing auxiliary thoughts.
5. Attach the referenced public Markdown files as source links where available.
6. Keep TheBrain read/navigation-oriented. Do not write to Git, Asana or production systems from this map.
7. Re-import after a verified satellite commit; do not treat an old Brain snapshot as current authority.

## Incremental update contract

- Do not recreate the existing 11-node canonical graph.
- Preserve every canonical `links` entry in `map.json` exactly.
- Link task projection thoughts to the existing `tasks`, `current`, `runtime-gates`, `cockpit` or `evidence` thoughts only as auxiliary navigation; do not alter canonical relationships.
- Link runtime projection thoughts to the existing `runtime-gates` and `current` thoughts only as auxiliary navigation.
- `grainee-v2` is the Git authority; `caesthetic` is the public projection; Asana is the work interface; TheBrain is the visual layer; ChatGPT is the analytical/orchestration layer.
- Keep `UNVERIFIED`, `NOT_CONNECTED` and `NOT_RELEASED` states visible. Never infer a runtime state from configuration and never add private identifiers.

The public repository is the only source available to this map. Private canonical files, prospect records and runtime credentials are out of scope.
