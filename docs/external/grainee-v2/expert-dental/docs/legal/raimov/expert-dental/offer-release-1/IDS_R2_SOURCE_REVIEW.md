# IDS-R2 — review of clinic source forms and enrichment decisions

Date: 2026-09-07 (Bishkek).  
Status: `OWNER_REQUESTED_SOURCE_ENRICHMENT / MEDICAL_REAPPROVAL_REQUIRED / NOT_IN_USE`.

The owner supplied seven clinic PDFs for review. Their useful clinical content was compared with the canonical bilingual PAPER-0.2 profile consents. Only reusable clinical-information content was carried into IDS-R2. Source PDFs themselves are not committed to Git because they are external source artefacts; this record keeps filenames, hashes and transformation decisions.

## Source inventory

| Source | SHA-256 | Incorporated into IDS-R2 |
|---|---|---|
| `Имплантация на печать .pdf` | `314016e54d41b02b5994784d64f043defac8cc326d03c42bf0e5a3cbb8afd117` | Site/count/system, CT/CBCT reference, stages, alternatives, integration biology, detailed surgical/implant risks, soft/bone tissue limits, nicotine/hygiene/maintenance factors. Bone grafting/sinus lift remain separate consents when applicable. |
| `Эндо готовое.pdf` | `dfd546176d75c373ba8b629951734451f1532e3662e0d1df867f57e605064296` | Tooth/imaging/treatment type, rubber dam, canal anatomy and calcification, flare-up, ledge/transportation/perforation/instrument fracture/extrusion, retreatment limitations, final restoration and continuity obligations. |
| `Орто.pdf` | `114f7dc9c5d3bb1db728cd5822e9b51ad2459606cfde696cd0faee5b9e455a87` | Diagnosis/treatment type, records used for planning, approximate duration, enamel/periodontal/root risks, recession/black triangles, multifactorial TMJ symptoms, adjunctive procedures, retention and relapse. |
| `Удаление Готово печать .pdf` | `b028d2c691c12f3baeb810d2b916599c9e6e8c1fb54faf81949f1b571a9df97b` | Tooth/area and imaging, simple/complex extraction scope, alternatives, bleeding/infection/alveolitis, nerve/sinus/adjacent-structure risks, root-fragment risk-benefit decision, postoperative warnings and later replacement planning. |
| `Анкета доработка .pdf` | `6b325cdf022026f97ca329d656955114d7824c263a4c051823a9d2232e783896` | IDS now references the dated medical history and asks whether anything changed since it. Full questionnaire content is not duplicated inside each IDS. |
| `Несовершеннолетние_ГОТОВО_ОСТАВИМ_1_финал_.pdf` | `de3c159c06a43fece929735fe1d98c87125530ea121f3ade833db9b567b6ee96` | Only the routing principle is retained: minors/legal representatives require a separate validated route. The adult 18+ PAPER-0.2 form is not silently extended to minors. |
| `Expert Dental Договор1.pdf` | `84067d9c2764d1377f38ed1f9a829830d88383dc023d3ad2b8f300dcbe9a2193` | General safety language was used only where clinically relevant: disclosure of known health/allergy/medication information, no absolute biological-result guarantee, and the distinction between a known complication and proof of poor quality. |

## Deliberately not copied

1. References of the form `К Договору № ...` were not carried into IDS. The canonical civil route is ED-OFFER-1.0 + ED-CON-004 acceptance, not a new bilateral contract number per patient.
2. Contract, payment, dispute, privacy and marketing/photo clauses from the uploaded adult/minor combined documents were not merged into profile IDS. Those remain in the public offer, privacy notice and any separate media consent.
3. A profile IDS does not become blanket consent for anesthesia, radiology/CBCT, bone grafting, sinus lift, sedation/general anesthesia or another independent invasive intervention. Separate consent is retained when applicable.
4. The questionnaire is not copied into every IDS. Each IDS links to the patient history by date and asks for changes since that history.
5. No wording from the minor form changes the standard PAPER-0.2 acceptance boundary of a competent adult 18+.
6. Uploaded source forms do not establish licensed scope, provider authority or the permitted place of care.

## Governance consequence

The owner-reported medical-director approval recorded earlier applied to the previous PAPER-0.2 clinical wording. IDS-R2 materially expands the clinical disclosure text. Therefore IDS-R2 is a **candidate** and requires fresh medical-director approval before staff may use it. The generator marks the resulting profile-consent document accordingly and CI must fail if the enrichment payload hash or one-signature architecture drifts.

Source-enrichment semantic SHA-256: `154a52aa839d42015f025de381a1bae92632df9ca49b864c7fe701c84a87ebaa`.
