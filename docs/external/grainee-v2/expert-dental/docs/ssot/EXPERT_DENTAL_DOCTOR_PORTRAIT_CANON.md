# Expert Dental · Doctor Portrait Canon

Status: ACTIVE SSOT
Owner: Expert Dental / RAIMOV healthcare ecosystem
Scope: all public doctor portraits used by Expert Dental patient-facing websites and materials derived from `site-raimovdental/`.
Reference image: owner-referenced `EXPERT_DENTAL_DOCTOR_PORTRAIT_CANON.jpg`; file not present in the source commit and not resolved in this release. Do not treat an arbitrary portrait as the reference.

## Decision

All new or updated doctor portraits for Expert Dental must be brought to one visual standard before publication. The written specifications below are the canonical visual target pending recovery of the reference file. It is a style/composition reference, not a real doctor record and must not be published as a doctor profile.

## Canonical appearance

### Background
- Warm neutral gray-beige studio background.
- Smooth and visually quiet, without interior details, texture, props or visible gradients.
- Not pure white and not cold blue-gray.
- Reference image corner/background values are approximately RGB 139–152 / 129–147 / 123–139; this is guidance, not a hard pixel gate.

### Framing and body position
- Vertical master composition, approximately to mid torso (owner instruction 2026-09-15 supersedes the earlier square-master instruction).
- Portrait is chest-up / approximately to mid torso, not a passport crop.
- Head occupies roughly 35–40% of frame height; leave visible air above and on both sides.
- Torso is slightly turned in a calm 3/4 pose while the face remains directed toward the camera.
- Shoulders and upper torso remain clearly visible; do not crop tightly at the neck.
- Eye line sits near the upper-middle part of the frame, not close to the top edge.

### Expression
- Natural, open smile with teeth visible where anatomically natural for the person.
- Friendly and confident, not exaggerated, beauty-advertising or artificial.
- Direct eye contact with the camera.
- Preserve the doctor’s recognisable facial features; do not beautify to the point of changing identity.

### Clothing
- Clean white medical tunic/jacket.
- Short sleeves.
- Neat short stand collar with a small V-shaped opening at the front.
- Relaxed but structured clinical fit; not sporty V-neck scrubs.
- One simple chest pocket is acceptable.
- No contrasting piping, decorative zippers, oversized buttons or unrelated accessories.
- No personal name badge in the canonical portrait.

### Expert Dental branding
- Use the official `EXPERT DENTAL STUDIO` logo supplied by the owner.
- Logo placement: small and restrained on the upper chest, above/near the chest pocket, following garment perspective.
- Logo is a clinic mark, not an advertising banner: it must remain subordinate to the face.
- The mark must include `EXPERT` with the smaller `DENTAL [tooth symbol] STUDIO` line as in the approved logo artwork.
- Use a dark graphite/deep green-gray treatment on white clothing; no large high-contrast print.
- Do not add an invented badge, alternate wordmark, extra tooth icon or other logo variation.

### Light and retouching
- Soft professional studio light with gentle modelling of the face.
- No hard cast shadows, dramatic rim light or cinematic colour grading.
- Natural skin texture is retained; minor cleanup is allowed, identity-changing retouching is not.
- White clothing must retain texture and separation from the background.

## Image-generation / editing instruction

When normalising an existing doctor photo, preserve the person’s identity and use the following target:

> Professional Expert Dental doctor portrait. Warm neutral gray-beige seamless studio background; vertical mid-torso composition with visible shoulders and upper torso; head approximately 35–40% of frame height with comfortable space above and to the sides; torso slightly turned in a calm 3/4 pose, face toward camera; natural friendly smile; soft even studio lighting and realistic skin texture. Replace/standardise clothing only as needed to a clean white short-sleeve medical tunic with a short stand collar and small V opening. No personal name badge. Place the official small Expert Dental Studio logo on the upper chest in dark graphite/deep green-gray, correctly following garment perspective. Do not alter facial identity, age, ethnicity or distinctive features. Avoid passport framing, oversized head, cold white/blue background, gray scrubs, large logo, beauty retouching, props or clinic-interior backgrounds.

## Web production

- The canonical master is a design reference. Individual doctor assets remain under `site-raimovdental/patient-site/assets/img/doctors/`.
- Web portraits should keep the project’s existing responsive variants (`-360.jpg`, `-560.jpg`, and base `.jpg`) generated/cropped from the approved master.
- Do not replace a real doctor photo with the canonical reference person.
- Doctor identity, name, specialty and experience are clinical/business facts and must come from owner/clinic-approved data, independently of the image-generation workflow.

## Acceptance gate

A doctor portrait is ready for publication only when all of the following are true: recognisable identity is preserved; framing and head scale match the reference; background is warm neutral gray-beige; white medical tunic and official small logo are correct; no personal badge remains; lighting and skin look natural; the crop works consistently beside existing doctor cards on desktop and mobile.

## Provenance

Canon approved by owner in chat on 2026-09-14 after comparing the existing clinic portrait set and the supplied Expert Dental logo. Reference portrait was generated specifically as the visual standard and is not a patient or doctor record.

## Recovery and binding rule — 2026-09-15

Reuse approved prepared portraits. Never regenerate a missing person or bind a generic-named image by guessed identity. Record source file → doctor slug → SHA-256 before producing base, 560 and 360 JPEG derivatives. Preserve framing without stretching/upscaling. The earlier branch contained only this document, not the reference JPEG.

For this release, prepared guseinov-namik, akromov-asadbek, isakulov-amir and new duisheeva-aiday assets are unresolved. Three generic-named Library portraits were found, but their doctor bindings are unverified; none is published. Existing Aiday portrait is retained. New profiles use the existing non-photographic initials fallback; this does not satisfy portrait completion.
