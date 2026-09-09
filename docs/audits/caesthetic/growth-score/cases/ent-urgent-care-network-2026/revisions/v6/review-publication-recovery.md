# ENT Russian review publication recovery — 2026-09-09

Owner task: create a hosted Russian review page and return its working URL; reported 404 at 2026-09-09T15:15:56Z. The earlier URL was provided before production verification and is not a completed delivery.

Source: site-caesthetic/private/ent-urgent-care-review-6f2c9a4e81d7/index.html at 65231c76edecebebb931c1643400988ea6f5e709. Request: deploy-caesthetic-ent-review-20260909T1510Z. Durable result: status=error / deploy_hook_failed; Deploy CAESTHETIC run 34369108763 failed Contract and rejection tests and skipped deployment. No live success or deployed revision is claimed.

Recovery diagnostics: the existing required design workflow retains all tests and failure exit codes. Console output is bounded by a reporter, while full TAP failures are retained in the existing private workflow artifact. This changes observability only, not acceptance or diagnostic approval. Local reporter smoke with two tests (one deliberately huge failure) returned exit 1, pass=1/fail=1 and 3333 console bytes.

Remaining: identify exact failed assertions, register and protect the review route, fulfill the owner-requested review-link SSOT rule, rerun canonical acceptance and deploy, then verify the exact review page and access path. ENT eligibility and incomplete third diagnostic priority remain visible; do not invent final human approval or use a false supported vertical.
