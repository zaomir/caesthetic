# Agents repo sync marker

- **Mode:** bidirectional (DEC-829)
- **Grainee SHA (pre-commit):** `192e9ce746e1adf73e7210307acd0fdd692838dd`
- **Satellite SHA (pre-commit):** `573a039a5e27fe454ffc25c22147169e9db29570`
- **Synced at (UTC):** 2026-09-02T21:27:48Z
- **Script:** `scripts/caesthetic/sync-agents-bidirectional.sh`
- **Summary:** g2s=3 s2g=0 conflicts=0

Production deploy still ships only from grainee-v2.

Approved Growth Score publication is a separate exact-SHA allowlisted control plane; ordinary bidirectional mirroring never grants satellite deploy authority. Contract: `docs/ssot/CAESTHETIC_GROWTH_SCORE_PUBLISH_CONTROL_PLANE.md`.
