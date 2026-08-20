# CAESTHETIC — TheBrain public control map

This directory is a public-safe navigation layer for TheBrain/Cerebro. It is a map of relationships and canonical links, not a second strategy authority.

## Start here

- Machine-readable graph: [`map.json`](./map.json)
- Cerebro import/read instructions: [`CEREBRO.md`](./CEREBRO.md)
- Strategy canon: [`../../../ssot/CAESTHETIC.md`](../../../ssot/CAESTHETIC.md)
- Public CAESTHETIC index: [`../../../caesthetic/00_INDEX.md`](../../../caesthetic/00_INDEX.md)

## System roles

| System | Role | Authority boundary |
|---|---|---|
| `grainee-v2` | Private canonical repository | Strategy, decisions, SSOT, operational rules and private evidence. Never infer private content from this projection. |
| `caesthetic` | Sanitized public satellite | Public-safe projection for agents, TheBrain and ChatGPT. It is not a replacement for the canonical repository. |
| TheBrain | Visual control layer | Relationships, navigation, context and current public-safe state. Do not store secrets or private row-level data here. |
| Asana | Work interface | Tasks, owners, due dates and execution state. No private identifiers or links are published in this map. |
| ChatGPT | Analytical interface | Reads the public projection on request and explains, audits or prepares changes; it does not become the authority. |

## Public-safe routing

The graph routes from strategy to product ladder, acquisition channels, signals, gates, tasks, cockpit and evidence. Each node should point to a canonical public-safe document where one exists. Missing or private sources are represented as boundaries, not reconstructed here.

The requested DEC-845 acquisition package and `CAESTHETIC_ACQUISITION_DIAGNOSTIC_GROWTH_CONTROL_SYSTEM.md` are intentionally not duplicated or synthesized in this entry point. They may be linked here only after they exist in the canonical repository and pass the public projection checks.

## Safety rules

- Do not publish prospect row-level data, emails, secrets, private URLs, Asana GIDs/URLs or runtime credentials.
- Do not add runtime/write-plane instructions or launch a pilot from this map.
- When a canonical document changes, update the projection through the existing bidirectional sync and verify the diff before pushing.
- Treat links in this directory as navigation hints; the repository and its declared SSOT remain authoritative.
