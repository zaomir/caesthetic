# Design enforcement

Visual authority: `docs/ssot/CAESTHETIC_DESIGN_SYSTEM.md` 3.1.0. This folder is its executable projection, not a second design authority.

## Change contract

1. Read the SSOT and route's assigned profile. Edit its source/generator and reusable components.
2. Register new routes, states, dependencies and test widths in `contract.json`. A file/profile omission fails closed.
3. Token changes update the SSOT table and machine projection together. Extra or duplicate root tokens are rejected; scoped custom-property definitions must match `scopedTokens`, including their selector and value. Preserve exact protected originals; optimized logo delivery files have their own budgets.
4. Run `node scripts/caesthetic/design-gate.mjs`, design rejection tests and `node scripts/caesthetic/design-browser.mjs`. Shared styles run all registered pages. The required CI job also checks renderer/privacy, public navigation and representative Firefox/WebKit surfaces.
5. Do not auto-refresh exception lists or visual baselines. Every exception has exact selector/rule/value/count, owner, reason, task and expiry. Removing a deviation requires pruning its exception. A new pattern requires a rationale and SSOT/component/test update.
6. Publish through Deploy CAESTHETIC. It validates main ancestry, checks the requested SHA, obtains CI acceptance, verifies artifact identity at both deploy entrypoints, then performs production smoke and rendered conformance. A failed or missing check is not accepted.

`design-receipt.mjs` rejects a different SHA, changed runtime bytes, changed SSOT/contract, failed/partial results and expired receipts. The workflow artifact transport is the canonical receipt source; repository administrators can still modify code/settings. No local-hook-only security claim is made.

## Test surfaces

`pages` inventories deployable sources and fragments; `fixtures` are served only by the local test server, outside the deployment directory. Writes/analytics are blocked in browser checks. Private authentication success is not inferred from a password screen. Browser exceptions are currently empty; static exact migration entries remain finite and expire on 2026-10-05.

## Release/rollback

Roll forward only after exact artifact acceptance. After a production regression, use the canonical workflow to validate/redeploy a prior compatible main SHA; very old commits without the new gate require an explicitly reviewed recovery path, not a disabled check. Existing snapshot/rollback operational tools are retained. Update the project status and acceptance evidence with deployed SHA and smoke result.

Main branch rulesets remain unavailable under the current GitHub plan (API 403). When capability becomes available, require `caesthetic-design-gate` from the trusted workflow and remove routine bypasses. No settings or subscription changes have been claimed here.

The Agent API dispatcher allows 55 minutes for the two bounded 25-minute jobs, so it does not report a premature timeout while required design acceptance is still running.
