# Clinic contact replacement — 2026-09-14

Owner instruction: replace clinic telephone and WhatsApp on all sites and in the canon with **+996774255455**.

## Canon and source
- Public display: +996 774 255 455.
- Telephone: `tel:+996774255455`.
- WhatsApp: `https://wa.me/996774255455`.
- SSOT: `configs/expert-dental/public-contact.json`; RAIMOV and Expert Dental website SSOT updated.
- PR: https://github.com/zaomir/grainee-v2/pull/1636
- Merged source: `459c1c4d70347256102f11953dc51219a1a71941`.
- Updated active canon, source configs, static RAIM SMILE and BALAM pages, fallback links, RU/EN data, JSON-LD, administrator guidebook and Tilda source snippets.
- Dated historical audits/release evidence retain the number observed at their original date.
- Catalogue diff contains exactly contacts.phone, contacts.phoneDisplay and cta.href; prices, SKUs and benefits unchanged.

## Verified deployment
| Surface | Evidence | Result |
|---|---|---|
| clinic.raimovdental.com | [run 34909354441](https://github.com/zaomir/grainee-v2/actions/runs/34909354441) | SUCCESS. Source SHA above; build/quality/contact checks; 14 live routes HTTP 200; live homepage new number and release SHA verified. |
| raimsmile.com | [run 34909354486](https://github.com/zaomir/grainee-v2/actions/runs/34909354486) | Deployment and scoped production verification PASS: source SHA above, 31 HTTP checks, 282 pricing browser checks, 387 smile-preview browser checks. Entire workflow FAILURE only at separate expertdental.kg/oferta DNS lookup. No global workflow success claimed. |
| raimovdental.com | [run 34909354551](https://github.com/zaomir/grainee-v2/actions/runs/34909354551) | SUCCESS; same source SHA, public/private/media/demo smoke. Receipt: docs/audits/raimovdental-deploy/LAST_RUN.md. |
| balamdental.com | [result](../../../agent-api/results/expert-phone-balam-stage0-20260914-run.json) | SUCCESS, health/smoke PASS including exact booking destination; deployed SHA 04e2b1b8c3d0446d3cb7e42d741a5f618188d8cf includes source change. |
| Clinic feedback hub | [run 34909354488](https://github.com/zaomir/grainee-v2/actions/runs/34909354488) | SUCCESS; recovery contact content deployed. Duplicate ops request failed and is not used as acceptance evidence. |

## Remaining blocker
`expertdental.kg` did not resolve from GitHub runners:
- public smoke [34909354510](https://github.com/zaomir/grainee-v2/actions/runs/34909354510): curl (6) Could not resolve host.
- RAIM SMILE final offer verifier: net::ERR_NAME_NOT_RESOLVED at https://expertdental.kg/oferta.
Repository Tilda snippets have the new number, but no Tilda publishing connector was available; plugin directory search returned no Tilda plugin. The primary domain is **not verified updated**. Do not claim all-sites completion or change DNS/domain routing based on this phone-only request.

Next: restore/verify the registered primary domain and use its established publisher to apply the updated contact; rerun primary-domain and offer-alias smoke. No patient messages, calls or CRM writes were made. Link verification is not proof that the clinic received a call/message.
