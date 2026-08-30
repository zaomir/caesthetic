---
owner: CAESTHETIC / Platform
status: verification-record
type: audit
created: 2026-08-24
last_updated: 2026-08-24
decision: DEC-851
scope: Evidence Unit v2 phases 1-5
production_authorized: false
deploy_performed: false
publication_performed: false
---

# CAESTHETIC Evidence Unit v2 — phases 1–5 verification

## Executed scope

Implementation branch: `codex/cae-evidence-v2-phases-1-5`
Draft PR: [#894](https://github.com/zaomir/grainee-v2/pull/894)
Verified implementation head: `644a42711893c585b13269f1d8dde7197e50c81c`

| Phase | Result |
|---|---|
| 1. Evidence Unit v2 schema | complete in isolated v2 file |
| 2. Contracts and negative tests | complete for shadow boundary |
| 3. Synthetic fixtures | complete; no client/private evidence |
| 4. Shadow Resolver | complete; produces only `SHADOW_PUBLISHABLE` |
| 5. Synthetic end-to-end still render | complete; two byte-identical PNGs |

## CI evidence

Clean-install shadow run:
[32719619939](https://github.com/zaomir/grainee-v2/actions/runs/32719619939) — **success**

Locked FourSurfaceMap regression run:
[32719619981](https://github.com/zaomir/grainee-v2/actions/runs/32719619981) — **success**

Repository CI:
[32719619977](https://github.com/zaomir/grainee-v2/actions/runs/32719619977) — **success**

Executed results:

- `npm ci`: success; zero reported package vulnerabilities;
- TypeScript `tsc --noEmit`: success;
- existing render schema/runtime tests: 6/6;
- Evidence Unit v2/security tests: 13/13;
- existing visual/localization assertions: 23/23;
- approved PNG snapshots: 20/20;
- missing-font fail-closed test: 1/1;
- synthetic shadow render: success;
- second synthetic render: byte-identical;
- synthetic render SHA-256:
  `2b59d03552af1137e0af31710e2d1f8ace088b34b694a83907c72e92ec606990`;
- synthetic render size: 133128 bytes;
- shadow attestation SHA-256:
  `2ba9a8833c6425f60832ae6335d55a17452429780c559aa7dc2375ca4e2fab81`;
- source Evidence Unit after render: still `CAPTURED`;
- audit record created: yes;
- staged clean artifacts: 1.

The first shadow run
[32719388634](https://github.com/zaomir/grainee-v2/actions/runs/32719388634)
passed all validation, security, visual and rendering work but failed during
temporary-directory cleanup because immutable staging permissions intentionally
blocked recursive removal. Commit
`644a42711893c585b13269f1d8dde7197e50c81c` restores permissions only inside
the synthetic temporary directory before deletion. The clean rerun passed.

## Security checks passed

1. strict v2 version and unknown-field rejection;
2. legacy/unversioned manifest rejection;
3. expired rights rejection;
4. expired clean-artifact rejection;
5. `raw/` and signed-secret source-reference rejection;
6. byte-size mismatch rejection;
7. SHA-256/content mutation rejection;
8. MIME mismatch rejection;
9. symlink/realpath evidence rejection;
10. exact claim-binding mismatch rejection;
11. render-manifest mutation rejection;
12. source unit byte-for-byte immutability;
13. source unit remains `CAPTURED`;
14. metadata-only audit record excludes claim text, artifact text and test key material;
15. HMAC mutation rejection;
16. retired key cannot sign but may verify an existing synthetic attestation;
17. revoked key cannot verify;
18. 30-minute expiry rejection;
19. wrong request rejection;
20. replay rejection;
21. hand-edited `PUBLISHABLE` input rejected by the shadow Resolver;
22. production throw presence verified before synthetic render;
23. default `Root.tsx` verified to contain no production composition;
24. synthetic HMAC key exists only inside the synthetic signing-service test boundary.

## Production side-effect proof

The following protected files have identical Git blob SHA on `main` and the
implementation branch:

| File | Unchanged blob SHA |
|---|---|
| `scripts/caesthetic/evidence/schema.mjs` | `8107d669bcbbcbc5a8303dba2b2295222ee55153` |
| `scripts/caesthetic/evidence/new-unit.mjs` | `1a1344373a0fa80554041732d23be186862a57c6` |
| `src/ValidatedFourSurfaceMap.tsx` | `a889cd0016c66b531996aec18ae367441cf96d25` |
| `src/Root.tsx` | `8f173e1ef2a9deec1406f548ac10976339794162` |
| Remotion package lockfile | `cd29d3df3ec812ea73049811d2126fe2e2cb01c4` |

Additional proof:

- no legacy Evidence Bank unit was read, changed or migrated;
- accepted v2 schema is a new file beside the current schema;
- shadow modules are isolated under `scripts/caesthetic/evidence-v2-shadow/`;
- synthetic Evidence Bank lives only in test fixtures and temporary CI storage;
- synthetic render uses a test-only Remotion entry, not the default Root;
- no production HMAC secret exists;
- no production service, composition or replay store exists;
- no deploy, activation, publication or external write occurred;
- draft PR #894 remains unmerged.

## Files added

- `.github/workflows/caesthetic-evidence-v2-shadow.yml`;
- `scripts/caesthetic/evidence/evidence-unit-v2.schema.json`;
- `scripts/caesthetic/evidence-v2-shadow/canonical-json.mjs`;
- `scripts/caesthetic/evidence-v2-shadow/evidence-unit-v2.mjs`;
- `scripts/caesthetic/evidence-v2-shadow/render-manifest-v1.mjs`;
- `scripts/caesthetic/evidence-v2-shadow/verify-clean-artifacts.mjs`;
- `scripts/caesthetic/evidence-v2-shadow/synthetic-signing-service.mjs`;
- `scripts/caesthetic/evidence-v2-shadow/shadow-resolver.mjs`;
- `scripts/caesthetic/remotion-four-surface-map/tests/evidence-v2-shadow.test.mjs`;
- `scripts/caesthetic/remotion-four-surface-map/tests/synthetic-shadow-entry.tsx`;
- `scripts/caesthetic/remotion-four-surface-map/scripts/run-synthetic-e2e.mjs`;
- synthetic fixture manifest, Evidence Unit and clean text artifact.

Existing file changed:

- `scripts/caesthetic/remotion-four-surface-map/package.json` — test scripts only.

## Next boundary

Phases 1–5 are complete. The additional enterprise infrastructure previously
listed here is not part of the current project and is not required for the
shadow implementation.

The only retained boundary is explicit: production remains disabled until a
separate founder instruction authorizes changing the existing production
wrapper. No migration, deploy, activation or publication is implied by this
verification record.
