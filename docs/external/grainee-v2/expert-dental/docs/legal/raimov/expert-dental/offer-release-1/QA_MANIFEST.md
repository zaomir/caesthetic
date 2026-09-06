# ED-OFFER-1.0 — verified build and publication boundary

Owner task 2026-09-06T20:34:45Z: publish agreed offer on existing RAIM SMILE, prefill from licence and deliver role instructions. No new CRM, signature provider, domain or patient-upload form.

Build source SHA: 829df32291d219865fcb529afa45a4d914e53c1c. Read-only verification workflow: https://github.com/zaomir/grainee-v2/actions/runs/34061944210 — SUCCESS. Artifact 9997771071, sha256 102919a9466cf42a3583e5162286fe2a79ece59518df307f1ee1b124a27a1cc3. PUBLIC_RELEASE_LOCK.json is copied from that exact successfully verified artifact; no post-verification legal text edits.

PASS: 12 DOCX and 12 PDF files built; public PDF renderer repeated deterministically; existing RAIM_SMILE_PUBLIC_TEST_PASS (16 routes, main_words 9231); 8 new offer tests; shell syntax; browser 4 routes x widths 320/390/768/1440 (16), static complete terms, anchors, downloads and PDF SHA equality. Reflow720 CSS pixels at2x density PASS; native browser zoom is not claimed. Previous body-CSS-zoom test was corrected because CSS zoom retains original media-query viewport; this was not a production failure.

Visual direction: existing RAIM SMILE logo/navigation/footer and ink/paper/rose tokens; restrained text-first legal reading surface; no changed protected images. RU/KY mobile and desktop captures reviewed. Existing noindex/noarchive policy retained. Public assets exclude licence scan, residential address and signatures.

Runtime assets are generated before the existing cutover, not committed as patient materials. The normal builder requires the verified lock and rejects altered terms/font/PDF; no init-lock occurs on deployment. New editions must retain old source/locks and old archive routes. Archive HTML wrapper may track site shell, but legal terms and PDF bytes stay fixed.

This records BUILD verification, not production. Live URLs, actual deployed SHA and smoke must be recorded after canonical deploy result. Clinic adoption remains unverified: real order/names, medical approval of adapted templates, storage/data-processing details and actual-address/licence reconciliation are not simulated.
