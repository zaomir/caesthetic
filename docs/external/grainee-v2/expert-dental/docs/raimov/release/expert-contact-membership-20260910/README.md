# Expert Dental / RAIM SMILE — owner display copy and contact choice

Owner instruction: 2026-09-10, continuation of «Анализ готовности переноса». Base `grainee-v2/main` at `ff2555292`. Scope: patient-site on clinic.raimovdental.com and existing RAIM SMILE public copy on raimsmile.com. No expertdental.kg cutover, DNS change, new product, CRM, automatic message or receipt.

## Display decision

Owner replaces the product endorsement with **Абонемент · Год заботы**, translates the three current tariff labels and changes the requested lead/result text. This is a public rendering override of the older naming decision. `membership-public-copy.mjs` applies only to non-legal display output. Source prices, SKU, benefits, contract and medical-review article hashes stay unchanged. Reviewed article originals remain source evidence; the display adapter changes naming only when rendering them. Signed/legal/licence documents stay unchanged; only the product hero operator sentence is removed. Footer licence and the existing no-guarantee/exclusions statements remain. The requested result sentence is not evidence of guaranteed clinical outcome.

Prices in option headings resolve from existing SKU tokens. Price tables continue to show each amount once per row. No typed commercial numbers were introduced in rendering code.

## Contact decision and design

Use the current clinic design: desktop dialog with a locally generated QR and phone; below 768px, bottom sheet with explicit WhatsApp/call choice. No WhatsApp Web link or desktop redirect. Every contextual WhatsApp CTA uses the same adapter, including form retry. No-JS links reach an on-page contact section with responsive QR/phone/actions. The form never asserts receipt; users send the message themselves. Context and synthetic form draft verified; analytics contain no entered data.

QR library: vendored qrcode-generator 1.4.4, MIT, served from this site. No CDN or QR service receives a draft. Very long text exceeding QR capacity retains the full form draft and shows a copy/call fallback. Dialog supports Escape, close, backdrop, focus containment/restore and scroll lock. Threshold is viewport-based, not a claim to detect installed WhatsApp.

Hypothesis: explicit channel choice and preserved service context reduce channel friction. No conversion uplift, administrator receipt or business impact is claimed from UI QA. Next operational decision needs actual contact/booking evidence.

## Verification

- Staging build: 46 routes; patient guard 0 failures (7 existing repeated-sentence warnings).
- Chromium/WebKit: 294 site checks, 136 contact checks, 0 failures; 320/390/768/1440px; mobile/desktop visually inspected.
- Dialog WCAG AA passes, keyboard and no-JS fallback checked. External message navigation intercepted; messagesSent=0.
- Independent jsQR decoder successfully read the screenshot QR in both engines, recovering the correct number and contextual product draft.
- Commercial/product contract, public pricing, release and patient routing tests pass. repo-check passes; Website Studio/project guards pass (no new routes).

## Release

PR #1602 merged to main. Both surfaces report deployed source SHA `12e3945403441ecfca033bd1a22f31d9f333ef8f`.

- Expert staging: https://clinic.raimovdental.com/ and /services/smilecare-12/; workflow https://github.com/zaomir/grainee-v2/actions/runs/34419347362.
- RAIM SMILE production: https://raimsmile.com/god-zaboty/ and /prices/; workflow https://github.com/zaomir/grainee-v2/actions/runs/34419347340.
- Independent live smoke: 27 checks PASS, including exact deployed SHA, routes, product display, catalogue amounts, legal licence disclosure and unchanged Tilda on expertdental.kg.
- Live Chromium/WebKit: 136 contact checks PASS; QR screenshots independently decoded in both browsers. No messages sent and no CRM writes.

Evidence: live-smoke.json, live-browser.json and live-qr-decode.json. Existing expertdental.kg cutover gates remain unchanged; clinical/service/legal approval and actual administrator receipt are not inferred from this release.

## Inherited general CI issue

`Codex Mobile CI/CD / Fast checks` fails in `tests/caesthetic/growth-score-spec-canon.test.mjs:193` because the expected Private Beauty Salon Network example sentence is absent from `docs/caesthetic/growth_score_spec.md`. Reproduced locally; both files are byte-identical to pre-release `origin/main` (`ff2555292`). No dental files participate in the failing assertion. Dental staging, RAIM SMILE validation, RAIMOV validation and Expert cutover readiness all passed on PR #1602. The full local dental aggregate reports failed=0, skipped=0. The unrelated CAESTHETIC mismatch is left unchanged.

## Incidental feedback-hub deploy repair

Changing shared patient config also triggered the existing feedback workflow. Its standalone installation copied `site.mjs` but omitted the repository-relative contact JSON that this module already imports on main. The service failed to start and `/feedback/` returned 502 after run 34419347343. The corrected deploy materializes only the public `maps` export required by the hub; no patient data, secrets, channel configuration or feedback behavior changes. An isolated-import regression proves the installed module works without the repository tree. Restored by PR #1603, deployed commit `718f1e110934aedee6bdf1c9d82402d7880b2a6d`. Workflow https://github.com/zaomir/grainee-v2/actions/runs/34419842648 completed SUCCESS. Independent live checks: `/feedback/health` HTTP 200, `ok:true`; `/feedback/demo` HTTP 200 with the rating scale and team introduction. No feedback submitted.

## Final state

Website release and feedback recovery are complete. No release blocker remains for the requested surfaces. Unresolved outside this release: existing expertdental.kg cutover gates, actual administrator receipt/booking confirmation, and the inherited CAESTHETIC general-CI assertion documented above. UI shipment does not prove conversion or revenue improvement.
