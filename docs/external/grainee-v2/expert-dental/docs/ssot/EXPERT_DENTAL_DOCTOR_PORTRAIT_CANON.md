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
- Mandatory for every doctor portrait and the reference image: a natural, open smile with clearly visible teeth. A closed-mouth smile or neutral expression fails acceptance (owner clarification 2026-09-15).
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

> Professional Expert Dental doctor portrait. Warm neutral gray-beige seamless studio background; vertical mid-torso composition with visible shoulders and upper torso; head approximately 35–40% of frame height with comfortable space above and to the sides; torso slightly turned in a calm 3/4 pose, face toward camera; natural friendly open smile with clearly visible teeth (mandatory; closed-mouth expression is not acceptable); soft even studio lighting and realistic skin texture. Replace/standardise clothing only as needed to a clean white short-sleeve medical tunic with a short stand collar and small V opening. No personal name badge. Place the official small Expert Dental Studio logo on the upper chest in dark graphite/deep green-gray, correctly following garment perspective. Do not alter facial identity, age, ethnicity or distinctive features. Avoid passport framing, oversized head, cold white/blue background, gray scrubs, large logo, beauty retouching, props or clinic-interior backgrounds.

## Web production

- The canonical master is a design reference. Individual doctor assets remain under `site-raimovdental/patient-site/assets/img/doctors/`.
- Web portraits should keep the project’s existing responsive variants (`-360.jpg`, `-560.jpg`, and base `.jpg`) generated/cropped from the approved master.
- Do not replace a real doctor photo with the canonical reference person.
- Doctor identity, name, specialty and experience are clinical/business facts and must come from owner/clinic-approved data, independently of the image-generation workflow.

## Acceptance gate

A doctor portrait is ready for publication only when all of the following are true: recognisable identity is preserved; framing and head scale match the reference; background is warm neutral gray-beige; white medical tunic and official small logo are correct; no personal badge remains; lighting and skin look natural; teeth are clearly visible in a natural open smile; the crop works consistently beside existing doctor cards on desktop and mobile.

## Provenance

Canon approved by owner in chat on 2026-09-14 after comparing the existing clinic portrait set and the supplied Expert Dental logo. Reference portrait was generated specifically as the visual standard and is not a patient or doctor record.

## Recovery and binding rule — 2026-09-15

Reuse approved prepared portraits. Never regenerate a missing person or bind a generic-named image by guessed identity. Record source file → doctor slug → SHA-256 before producing base, 560 and 360 JPEG derivatives. Preserve framing without stretching/upscaling. The earlier branch contained only this document, not the reference JPEG.

For this release, prepared guseinov-namik, akromov-asadbek, isakulov-amir and new duisheeva-aiday assets are unresolved. Three generic-named Library portraits were found, but their doctor bindings are unverified; none is published. Existing Aiday portrait is retained. New profiles use the existing non-photographic initials fallback; this does not satisfy portrait completion.


## Owner clarification — visible-teeth smile (2026-09-15)

Обязательный канон эталона и всех фото всех врачей: естественная открытая улыбка
с отчётливо видимыми зубами. Закрытая улыбка и нейтральное выражение не проходят
приёмку. Проверять улыбку визуально и в master, и в финальном crop карточки.
Сохранять узнаваемость человека и естественный размер/оттенок зубов; без
неестественной белизны и рекламного эффекта виниров. Если исходник уже содержит
улыбку с зубами, сохранять её. Это художественная нормализация портрета,
не клиническое свидетельство состояния зубов или результата лечения.

## Resolved portrait bindings — 2026-09-15

The owner supplied and explicitly identified all three source images in this task.
Built-in identity-preserving image edits normalised white short-sleeved tunics,
warm neutral backdrops, small source-matched clinic logos, no name badges, mid-torso
framing and visible-teeth smiles. The initial closed-mouth Asadbek edit was replaced
before release. Isakulov framing was extended to keep the head scale consistent.
Aiday was subsequently reframed from her existing identified portrait at the owner’s request; the full staff logo update is documented below.

### `akromov-asadbek`

Source: `WhatsApp Image 2026-08-24 at 14.18.21 (2)(1).jpeg`; Library ID `libfile_75e1696b67748191ab17357b768ba3c6`.
Source SHA-256: `12376cd8d2e57d214ed6b3930dfd972f5f67ce447a8413c91952d94150f25d5e`.

- `akromov-asadbek.jpg` (1024x1536) — SHA-256 `6042a74248f18b2e56a6a345316c1dcc7332cccf46d523b07d3bf95407d30cef`.
- `akromov-asadbek-560.jpg` (560x840) — SHA-256 `feee682d6b574b76f9ab30d8e88ee354d451c3eef6143a4c72778b92a3f4f317`.
- `akromov-asadbek-360.jpg` (360x540) — SHA-256 `20ecdb1d58ec0327e0a925e921f0e4c029a95f6d0e9664afb3e36dec9bd39e61`.

### `isakulov-amir`

Source: `ChatGPT Image Sep 14, 2026 at 08_37_18 PM.png`; Library ID `libfile_b32002cca86481918e3ee09f609bf825`.
Source SHA-256: `dc081d46a328781298852413bcc47159ee781e7cd51a6ee4f2be939d6aff3f85`.

- `isakulov-amir.jpg` (1024x1536) — SHA-256 `dc4ca36eef0051e07c476a04bd0b4248c483ae1817209590eb604e04209d3191`.
- `isakulov-amir-560.jpg` (560x840) — SHA-256 `84342651107af2499c0ebdf4f3951f997b01cabd38c1d5ebe68a66310a9f1e1c`.
- `isakulov-amir-360.jpg` (360x540) — SHA-256 `5a37a470171ac82541bb19a018cccd000d74c7d782ea7125477e90a7c2dea8e3`.

### `guseinov-namik`

Source: `WhatsApp Image 2026-08-24 at 14.18.20 (4).jpeg`; Library ID `libfile_ebc22b6f75b8819192aab40218b900e5`.
Source SHA-256: `0856ce011a29e552570dd02eea6c04eea6a7e172387159c1bce85648258e8113`.

- `guseinov-namik.jpg` (1024x1536) — SHA-256 `1c5c5a945f2b9235b51589f56c53e565c473bea3a1de7b86236f2cb6222bfd9f`.
- `guseinov-namik-560.jpg` (560x840) — SHA-256 `fbf01b8ca5db0bb5749a6abcd15d6401df6f1c8c632d8ea80ce93f121d856d77`.
- `guseinov-namik-360.jpg` (360x540) — SHA-256 `9d7a6d05a3937f15b903ebc7b039c83a342498d1065a7ed93377a0d6b8f91c59`.

## Staff logo and Aiday framing update — 2026-09-15

Owner requested all standalone tooth marks be replaced by the complete official
Expert Dental logo. Reference artwork: `site-raimovdental/patient-site/assets/img/brand/logo.png`
(rendered on white for editing); never substitute a lone tooth outline for this wordmark.
All eleven doctor portraits now use the full wordmark; Marina's personal badge was removed.
Aiday's identified existing portrait was reframed closer, preserving her visible-teeth smile.
Card image windows use 4:5 with top alignment, avoiding head clipping in vertical masters;
CTA footer alignment remains shared. Legacy square masters remain for logo-only edits.

Updated existing portrait derivatives (source: the corresponding named assets on base
`1e21336f62e0e92fcd193943fbc77cb492387130`; built-in identity-preserving logo edits):

- `raimov-atabek.jpg` (1024x1024) — SHA-256 `6d9b114520c6f9a097029ba75e78facc7518920b7ec0ae5b8148b8c4e45913db`.
- `raimov-atabek-560.jpg` (560x560) — SHA-256 `80f9334a0e5d62709c96fdfe509f7335da958f0228c935996b23870672bda028`.
- `raimov-atabek-360.jpg` (360x360) — SHA-256 `b1e61c31abb68db75b2f62611a35c328d4bb5cbdf7d05646734a663727adcac5`.
- `talyshkhanov-mirali.jpg` (1024x1024) — SHA-256 `4fa501272cdc4bdc95cb5edc8f3635d0e984d71c88fd1f929088c90a23a1b737`.
- `talyshkhanov-mirali-560.jpg` (560x560) — SHA-256 `88253c1fbb02356692b70d5186ac82f5862a64ce8891de21c181ceae6ec12e62`.
- `talyshkhanov-mirali-360.jpg` (360x360) — SHA-256 `adf5337e05d28e52e074bfbd33bb61b959b9d2d67b1ae5f4a387e6fdd70b79e2`.
- `khalbaev-islambek.jpg` (1024x1024) — SHA-256 `b88435c97a48e83a1a867aabf901273de250c5467b60cd7f4790624fe06596ca`.
- `khalbaev-islambek-560.jpg` (560x560) — SHA-256 `f4e23e3d551a5127f5a853661bcabbefe546d3dac5c5189f6eceaffe8c4c512f`.
- `khalbaev-islambek-360.jpg` (360x360) — SHA-256 `d45e59a688963b45d7a059a85aae49d69665c78118fed76425619a8f0be42084`.
- `gribanova-marina.jpg` (1024x1024) — SHA-256 `407367b92b99556432b47f93f24d81554d03b0b334e7b92d4e196002ca20dc0a`.
- `gribanova-marina-560.jpg` (560x560) — SHA-256 `194bc13ba9e763654b097f84e76d70c159abf2b6b35f5578a456c6fef2eca905`.
- `gribanova-marina-360.jpg` (360x360) — SHA-256 `1c835855ffe66c3b8a6a8e1c19432fa7cda79b4cefea9e0885f82b2d695a96a0`.
- `kerimkulova-aiperi.jpg` (1024x1024) — SHA-256 `ec5e5db543c1c8c2fc65e95fd3de2b20346ec5819cfa5b40a490c016a3c7ff31`.
- `kerimkulova-aiperi-560.jpg` (560x560) — SHA-256 `b21e98a07a14b596a9ab48e781d222ced02bf22e2cb6eb00b5790190ebbb730c`.
- `kerimkulova-aiperi-360.jpg` (360x360) — SHA-256 `6a36ef4246c16b422784ead679ab96ec63d18d9f26722baa90b2ab0fa99becb1`.
- `ergeshova-begimai.jpg` (1024x1024) — SHA-256 `5d05e113dda01b2bf29ec9a7443a6952c22647d5130f097b73fc773b4af610a7`.
- `ergeshova-begimai-560.jpg` (560x560) — SHA-256 `47af9006bdcab0d765a0349151ea8d3c572311c7c5bb1918bf05682cd33d1c5c`.
- `ergeshova-begimai-360.jpg` (360x360) — SHA-256 `b3d7d9e5722297825002d7bb53eda93310a1fa156df6d922628869dd9465287b`.
- `taalaibekova-cholpon.jpg` (1024x1024) — SHA-256 `414beebb9bccbb79336ed10d30a7e32ec6913731f1978c5f2877ca0271bb242f`.
- `taalaibekova-cholpon-560.jpg` (560x560) — SHA-256 `53a24016adb37bcffbc6355cb8a1e418b9b3c4f22f4f1d5ddf1a2efa9a277705`.
- `taalaibekova-cholpon-360.jpg` (360x360) — SHA-256 `c6cf3619bf7e007f662f8131f0f931bb7c2ebadde4efeb7b3b660d5d0ae02809`.
- `duisheeva-aiday.jpg` (1024x1536) — SHA-256 `f7312a9c688db155612e97d8c7ed313d51a428161c3fd6ab40b985964154d33a`.
- `duisheeva-aiday-560.jpg` (560x840) — SHA-256 `4007737c29dd30e267a4898a3d2d06b6fe156047b361b8ed938d9545cd4295e5`.
- `duisheeva-aiday-360.jpg` (360x540) — SHA-256 `c5d4572929b3513e2d1a2bd62603e041c7c1d2ca0a812c637f0641ef0472caf2`.
