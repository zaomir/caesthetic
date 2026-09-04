---
owner: Expert Dental legal owner + product owner
status: CANONICAL_TABLET_PRESENTATION_STANDARD
created: 2026-08-30
last_updated: 2026-08-30
applies_to: patient-facing P0 legal and medical documents
---

# Expert Dental — tablet form design standard

## 1. Objective

The tablet version must let a patient comfortably read the complete approved wording, understand where they are in the document and sign without accidental taps or administrator substitution.

The tablet layer changes presentation only. Approved substantive wording remains unchanged and is bound to the released `DOC-ID + version + SHA256`.

## 2. Target devices

Primary target:

- iPad 10–13 inch, portrait orientation;
- Apple Pencil or equivalent active stylus;
- Safari/PWA kiosk mode;
- minimum viewport width: 768 CSS pixels.

Secondary targets:

- iPad landscape;
- Android tablet 10 inch or larger;
- desktop fallback for staff preview;
- A4/PDF fallback generated from the same source.

Phones are not an approved P0 signing surface. A phone may receive a copy after signing.

## 3. Reading dimensions

| Element | Tablet requirement |
|---|---|
| Main body | 19–21 px, line-height 1.58–1.7 |
| Main title | 30–38 px, line-height 1.15 |
| Section title | 23–28 px |
| Supporting/meta text | at least 15 px |
| Content column | 680–820 px maximum |
| Paragraph width | approximately 55–75 characters |
| Section spacing | 24–36 px |
| Touch target | at least 48×48 px; preferred 56 px |
| Checkbox | 30–36 px visible control |
| Signature area | minimum 240 px high; preferred 300 px |
| Bottom action area | safe-area aware; must not cover content |

Text must remain readable at 200% browser zoom without horizontal scrolling.

## 4. Information hierarchy

Every patient-facing form is presented in this order:

1. **Document identity** — title, DOC-ID, version, patient and clinician/authorised approver.
2. **Short orientation** — what the document concerns; no invented summary of legal or medical meaning.
3. **Approved substantive sections** — one visual card per source heading, in original order.
4. **Case-specific data** — clearly labelled values supplied by doctor/clinic/patient.
5. **Patient confirmations** — separate large checkboxes, not hidden inside paragraphs.
6. **Signature ceremony** — signature pad, signer name/role, local date/time and final confirmation.
7. **Copy delivery preference** — WhatsApp/secure link/paper where available.
8. **Service information** — DOC-ID, version, final hash, session/device and audit metadata.

Internal legal approval fields and template-review notes are not mixed into the patient reading flow. They remain in the template registry and evidence manifest.

## 5. Section cards

- Each `##` source heading becomes one card.
- Cards use a white background, 1 px neutral border and 16–22 px radius.
- No more than one primary decision or input cluster per card.
- Long risk or alternative clauses remain complete but may use accessible bullet layout where the source already expresses a list.
- Cards may not collapse substantive text by default.
- A patient may jump back to any completed section.

## 6. Progress and full-text presentation

The interface displays:

- current section and total sections;
- a progress bar based on viewed sections;
- a persistent `DOC-ID · version` marker;
- a visible indication when the complete document has been presented.

Signing remains disabled until:

- every substantive section has entered the viewport;
- the patient has reached the final section;
- every required acknowledgement is checked;
- a non-empty signature has been captured;
- the session has not expired and the exact document hash still matches doctor approval.

Scrolling can be recorded as presentation evidence, but scrolling alone must not be described as proof that the patient understood the text.

## 7. Inputs

### Text and numeric inputs

- Labels are always above fields.
- Placeholders do not replace labels.
- Required fields have a text indication, not colour alone.
- Monetary values display currency and totals in a dedicated block.
- `Входит` and `Не входит` are visually separated and never represented only by colour.

### Yes/no health questions

Use large segmented controls:

```text
[ Нет ] [ Да ] [ Не знаю ]
```

If `Да` or `Не знаю` is selected, the detail field appears immediately below. Critical health alerts must return to the doctor for review before a signing session can continue.

### Lists and risks

- Keep approved wording intact.
- Use bullets only where they do not change meaning.
- Do not shorten risk lists for the tablet.
- Individual risk additions are shown in a separate case-specific block approved by the doctor.

## 8. Signature ceremony

The patient signature screen must show immediately above the pad:

- document title;
- DOC-ID and version;
- patient/signer name;
- doctor or clinic approver;
- a statement that the signature applies only to this complete document;
- a warning that the signed text cannot be silently changed.

Signature pad requirements:

- active stylus and touch support;
- pointer-event capture;
- clear button;
- no preloaded or reusable signature image;
- stroke/time evidence retained only inside the protected signing evidence object;
- visual signature embedded in the final PDF;
- final confirmation requires a separate deliberate tap.

The administrator conducts the session but does not touch the signature pad for the patient.

## 9. Patient acknowledgements

Acknowledgements are concise and document-specific. They must not create new waivers beyond approved wording.

Common P0 confirmations:

- the complete document was made available for review;
- the signer’s identity and personal data shown on screen are correct;
- medical questions were answered by the doctor where applicable;
- the signature is voluntary and applies to the displayed version;
- the selected copy-delivery channel is correct.

## 10. Accessibility and language

- Colour contrast: WCAG AA minimum.
- No action is conveyed by colour alone.
- Focus order follows reading order.
- Visible keyboard focus is required.
- Buttons use verbs and outcomes: `Продолжить`, `Вернуться к разделу`, `Очистить подпись`, `Подписать документ`.
- Avoid legal abbreviations in patient labels; technical metadata may use DOC-ID/SHA256.
- Russian is the initial release language. A translation is a separate controlled version, not an automatic browser translation.

## 11. Print/PDF parity

The final PDF must contain the same substantive wording and case-specific values shown on the tablet.

PDF requirements:

- readable without zoom on A4;
- minimum body size 11.5–12 pt;
- page numbering `N из M`;
- DOC-ID/version in header or footer;
- patient, doctor/approver, date/time and final SHA256;
- signature image and signer role;
- copy-delivery record or reference;
- no interactive-only text omitted from the sealed artifact.

## 12. Clearance display

Forms with unresolved licence/service/provider evidence may be rendered for review, but the staff interface must show a blocking banner and must not offer `Начать подписание` for a real patient.

The clearance warning is operational metadata and is not inserted as a patient waiver.

## 13. Acceptance criteria

A form is `TABLET_READY` only when:

- approved wording is unchanged, verified by source-section hash;
- no text is clipped at 768×1024 and 820×1180;
- body text is at least 19 px on tablet;
- all touch targets meet the minimum size;
- the complete text can be read without horizontal scrolling;
- signature remains disabled until the full presentation and acknowledgements are complete;
- the final PDF contains the same wording and values;
- audit records include template version, content hash, doctor approval, administrator, signer, device/session, local/server time and copy delivery;
- a representative patient and administrator usability test is passed;
- service/provider hard stops are enforced independently from legal-form approval.
