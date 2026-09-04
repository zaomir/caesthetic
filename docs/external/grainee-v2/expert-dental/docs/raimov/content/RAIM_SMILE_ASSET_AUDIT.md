# RAIM SMILE — initial asset audit

**Date:** 2026-08-29
**Status:** sources verified / selected repo assets rights-marked / case reuse still gated

## 1. Existing archive

Canonical research archive exists for both clinic and founder accounts:

| Account | Posts | Successful manifest media | Failures |
|---|---:|---:|---:|
| `@expert_dental_studio` | 272 | 774 | 0 |
| `@doctor_raimov` | 366 | 1,115 | 0 |

Source namespace:

`research/raimov-profile/media/instagram/expert_dental_studio/`

`research/raimov-profile/media/instagram/doctor_raimov/`

Git keeps metadata only; the Instagram binary folders are not committed.

### Verified Dropbox binary mirror

Read-only listing on 2026-08-29 confirmed the live mirror at:

`/Projects/ROVLEX/Фото Для Отзывов/instagram-archive/2026-08-06/`

This supersedes the stale `RAIMOV/instagram-archive/...` path recorded in older repo metadata.

| Account media tree | Files | Binary image/video files | Bytes |
|---|---:|---:|---:|
| `expert_dental_studio/media` | 1,076 | 324 JPG + 219 MP4 | 1,401,232,880 |
| `doctor_raimov/media` | 1,442 | 508 JPG + 199 MP4 + 6 WEBP | 1,740,608,179 |

Counts include per-post JSON/TXT metadata. Presence in the mirror proves availability, not publication rights or medical suitability.

### Repo media manifest

`research/raimov-profile/MEDIA_MANIFEST.json` contains 91 items:

- all 91 are `archive_eligible`;
- 9 are explicitly `public_site_eligible=true` under the 2026-07-21 founder rights record;
- the other 82 are archive-only until their status changes.

The nine patient-site-eligible files are:

| File | Useful bucket | Limitation |
|---|---|---|
| `media/portraits/atabek-portrait.jpg` | `DOCTOR_PORTRAIT` | strong owner portrait; not a treatment-process image |
| `media/clinic/006_IMG_4953.JPG` | `CLINIC_INTERIOR` | reception/interior only |
| `media/clinic/017_0A2A0386.JPG` | `TEAM_CONSILIUM` candidate | posed team portrait, not actual consilium |
| `media/clinic/018_0A2A0432.JPG` | `DOCTOR_PORTRAIT` / functional theme | clinician portrait with model skull; verify role/copy before use |
| `media/clinic/028__MG_8727.jpeg` | `ADULT_BITE_TMJ` / clinical candidate | identifiable patient clinical image; case context and medical review required |
| `media/clinic/031__MG_1039.jpeg` | `FUNCTIONAL_AESTHETICS` candidate | identifiable patient result; before/after context is not established by this file alone |
| `media/clinic/052_0A2A0467.JPG` | `DOCTOR_PORTRAIT` / implant theme | posed implant prop, not proof of outcome |
| `media/clinic/069_0A2A0453.JPG` | `DOCTOR_PORTRAIT` | clinician portrait; verify role/copy |
| `media/clinic/078_0A2A0520.JPG` | `DOCTOR_PORTRAIT` / diagnostics theme | portrait with radiographs; distributed derivative must not expose patient-identifiable data |

`public_site_eligible` is a rights marker, not automatic RAIM SMILE case approval. Patient/case assets still need case identity mapping, consent scope check and medical/copy approval.

### Google Drive visual folder

Connected Google Drive contains a folder named `Expert Dental` with five downloadable source files and no finance/CRM export:

- `RAIM SMILE SYSTEM.-whitewebp.webp`;
- `RAIM SMILE SYSTEM.webp`;
- `Expert X in Round.png`;
- `dental-team.png`;
- `EXPERT_DENTAL-logo.svg`.

These are brand/team source candidates. Their presence does not establish RAIM SMILE trademark, derivative or publication rights beyond existing records.

### Existing production video

`site-raimovdental/feedback-hub/assets/atabek.mp4` is a 23.2-second, 720×720 H.264/AAC production asset with a poster. It is an `ATABEK_EXPLAINER` source candidate, but its current production use does not by itself clear reuse in RAIM SMILE acquisition.

## 2. What can already be done without publication rights

- index media by shortcode/type/date/caption;
- classify likely content into RAIM SMILE programs;
- select visual candidates for internal review;
- derive shot gaps;
- avoid unnecessary reshooting where rights later exist;
- create protected design mockups using local controlled derivatives only after rights are confirmed.

## 3. Required classification buckets

Every archived post/media candidate should be classified into:

- `ATABEK_EXPLAINER`;
- `ATABEK_CLINICAL`;
- `TEAM_CONSILIUM`;
- `DOCTOR_PORTRAIT`;
- `FUNCTIONAL_AESTHETICS`;
- `FULL_MOUTH_IMPLANT_PROSTHO`;
- `ADULT_BITE_TMJ`;
- `DIAGNOSTICS_SCAN`;
- `MOCKUP_PREVIEW`;
- `CLINIC_INTERIOR`;
- `PATIENT_JOURNEY`;
- `BEFORE_AFTER_CANDIDATE`;
- `TESTIMONIAL_CANDIDATE`;
- `GENERIC / NOT_USEFUL`.

## 4. Rights state

For every candidate:

```text
UNKNOWN
→ SOURCE_IDENTIFIED
→ CLINIC_OWNS_OR_LICENSES
→ PATIENT_CONSENT_VERIFIED (if patient visible/identifiable)
→ MEDICAL_COPY_REVIEWED
→ PUBLISHABLE
```

No state may be skipped.

## 5. Current useful evidence

The verified cross-account archive is large enough that RAIM SMILE should **audit before reshoot** rather than assume all content must be produced from zero. Nine repo assets already carry patient-site rights markers and can seed the non-case visual system after copy/context review.

However, a new production day remains necessary for a coherent visual language because archived Instagram assets were created over time for different purposes, framing and aspect ratios. The new shoot should prioritise assets difficult to reconstruct from social archive:

1. cinematic horizontal hero footage;
2. consistent environmental portraits;
3. real consilium footage;
4. planned diagnostic journey sequence;
5. matched horizontal + vertical versions;
6. standardised before/after capture;
7. clean room/interior footage;
8. 12 deliberate Atabek explainers.

## 6. BLOCKED

To promote Instagram/Drive assets or identifiable clinical assets from `research-only` / `public_site_eligible` to RAIM SMILE `PUBLISHABLE`, required inputs are:

- rights/ownership record for photographer/video source;
- patient consent where a patient is identifiable;
- medical/copy approval for claims and before/after context.

No asset in this audit is declared a verified RAIM SMILE case. The nine rights-marked repo files may be used only within their existing permission and after the applicable medical/context check; `public_site_eligible` must not be rewritten as blanket case consent.
