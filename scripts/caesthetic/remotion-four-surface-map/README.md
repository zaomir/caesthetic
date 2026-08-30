# CAESTHETIC FourSurfaceMap

Fail-closed Remotion implementation of the canonical CAESTHETIC 4444 scene.

Authority: `docs/ssot/CAESTHETIC_REMOTION_RENDER_MANIFEST.md` and DEC-851.

Status: `v1.0.0`. Baseline PNGs were approved on 2026-08-23. Production rendering is intentionally disabled until the PUBLISHABLE Evidence Resolver exists.

```bash
npm ci
npm run build
npm run test:schema
npm run test:visual:update  # human-approved baseline creation only
npm run test:visual         # repeat run must be pixel-identical
npm run test:font
```

Review PNGs are written to `artifacts/review/` and are intentionally gitignored. The named-human-approved pixel baselines are committed under `tests/__image_snapshots__/`.

Typography is pinned to the real static faces shipped by IBM: IBM Plex Sans Bold 700 and IBM Plex Mono SemiBold 600. `npm ci` copies the checksum-verified WOFF2 files from the pinned packages into `public/fonts/`; the browser never fetches a CDN. Browser synthesis is disabled.

The stable release gate is a clean `npm ci` followed by the complete `npm test` suite against the committed, human-approved PNG baselines.
