---
owner: CAESTHETIC
status: active
updated: 2026-09-06
visibility: internal
parent: docs/ssot/CAESTHETIC_SOCIAL_CASES.md
issue: "#1524"
---

# Social case artifacts and reproduction

Canonical content/design/publishing contract: [CAESTHETIC_SOCIAL_CASES.md](../../ssot/CAESTHETIC_SOCIAL_CASES.md). This register preserves prior work and the first actual content package. Internal source references do not belong in public captions or site bundles.

## Earlier deliverables

| Artifact | Durable reference | Provenance and role |
| --- | --- | --- |
| `CAESTHETIC_Case_Publishing_Plan_RU.md` | Library file `libfile_8f2fddba235c81918d7ca4e067a87766`, version 0 | Original Russian publishing proposal. Format/layout advice is superseded by Social Cases 1.0.0; retain as history. 38,762 bytes; SHA-256 `ff7698409863ccf552214caf0fe10b1288b38c77645afd75fc78fa04504c60cc`. |
| `CAESTHETIC_Case_Stories_RU.docx` | Library file `libfile_3a2a9a51b04481919ef7e8a5ad484da1`, version 0 | 33 individualized stories, six sections per story, 38 pages. Dated editorial manuscript, not independent source verification. 56,036 bytes; SHA-256 `2db2eb21b5f2655c6b24e5e406eef35a7c3bfe9ea06d710469e8f23235de744d`. |
| `case_stories_editorial.json` | Historical source kit, Library `libfile_2340a3a1af808191a732c517c56d11e4`, version 0 | Structured manuscript, 33 stories. 94,271 bytes; SHA-256 `4e47149112664cd0cc55f69145fcb5d5a5824b494bf20ec1151dba5f1d89b8e3`. |
| `cases-for-document.json` | Historical source kit, Library `libfile_2340a3a1af808191a732c517c56d11e4`, version 0 | Dated active API export, generated at `2026-09-06T16:57:05.177Z`, 33 published cases. 288,488 bytes; SHA-256 `c149e55da9df6a0f9b2b57be9a8020d9505991920a105617ba6bf610c6c3f03c`. |

These Library IDs are owner-accessible artifact references, not public sharing URLs. They were recovered from the delivered files' identity metadata. No new public link or publication is implied.

## Pilot CN-001

The pilot uses one actual published Med spa case from that export. The source record is preserved in the source-kit archive; the explicit internal mapping is recorded here, not claimed as a separate file in the ZIP. Public alias: **CN-001**. Public working headline: **Three ways to inquire. One clear next step.** The current release is American English only. The earlier bilingual release remains historical version 0.

Internal mapping: `CN-001` → first record of `cases-for-document.json`, source ID `scottsdale-hayden-consult-split`, source code `CASE-2026-77DA2B58`. Export generated at `2026-09-06T16:57:05.177Z`; snapshot SHA-256 `c149e55da9df6a0f9b2b57be9a8020d9505991920a105617ba6bf610c6c3f03c`. These identifiers are internal and excluded from all public creative/caption/article outputs.

- Source-backed result: scheduled consultations / qualified enquiries, `36/201` → `59/220`, rounded `18%` → `27%`, about `+9 percentage points`.
- Before: 6 January–5 April 2025. After: 5 May–2 August 2025.
- Recorded first human reply within two hours: `54/201` → `123/220`, rounded `27%` → `56%`. Missing two-hour reply evidence does not establish whether a reply was late, absent or unrecorded.
- Media spend was not increased. No holdout group; no independent isolation of the interventions.
- Internal service mapping: A03 + A10. B01 is a proposed continuation, not a completed implementation claim.
- Destination: `https://caesthetic.com/growth-score/`. Contextual public service link: `https://caesthetic.com/sprint/`. No invented blog URL or related article.
- Publication state: produced for review/use; not deployed, queued or externally published by this task.

Versioned source files:

- [content.json](pilot/CN-001/content.json): English-only copy, metrics, slide payloads, captions, first comments and rendering intent.
- [article-en.md](pilot/CN-001/article-en.md): current English article. The former Russian draft is retained in Git history and the version-0 source kit.
- [README_EN.md](pilot/CN-001/README_EN.md): current English publication handoff.
- [build_pack.py](build_pack.py): deterministic PDF/PNG/MP4 build.
- [asset-manifest.json](pilot/CN-001/asset-manifest.json) and [SOURCE_KIT_README.md](pilot/CN-001/SOURCE_KIT_README.md): exact input assets, licenses, dependencies and source kit usage.

## Reproduce the package

```sh
python3 docs/caesthetic/social-cases/build_pack.py \
  --content docs/caesthetic/social-cases/pilot/CN-001/content.json \
  --assets /path/to/delivered/assets \
  --output /path/to/generated/CN-001
```

Keep the adjacent article Markdown sources with `content.json` when rendering. The delivered assets directory contains the exact logo and canonical token snapshot, IBM Plex Sans and Source Serif 4 fonts, and their OFL license files. Dependencies and the complete artifact manifest are supplied with the package. Do not substitute a generic font or logo silently; record asset hashes when regenerating.

Current English publication family: article Markdown/PDF; eight PNG slides at 1080×1350 and an eight-page carousel PDF; short-post card; captions/first-comments; a 39-second 1080×1920 MP4 derived from the same eight slide records, with a silent AAC track. The voiceover script is present as speaker notes; no voiceover or licensed music is claimed.

The ZIP is a private editorial handoff. Its source/archive directory can contain internal identifiers and must not be bulk-uploaded to a social platform. Select the actual public creative files and platform text fields.

## Original bilingual delivery — historical version 0

The final package manifest records output filenames, dimensions, byte counts and SHA-256 values. The source/pilot commit and session proof are in `docs/runtime/projects/caesthetic/sessions/2026-09-06-social-cases.json`.

| Deliverable | Durable reference | Bytes / SHA-256 |
| --- | --- | --- |
| `CN-001_Package.zip` | Library `libfile_852bd3c20f808191be7f671e43dfe16f`, version 0 | 6,322,301 bytes; `e1f7c1ad1a09675715b8936d2bfca908d674c6099db63ad067f6b60824cb55bc` |
| `CAESTHETIC_Social_Cases_Source_Kit.zip` | Library `libfile_2340a3a1af808191a732c517c56d11e4`, version 0 | 3,345,748 bytes; `7d80c1767ec6bd90558a0f4cae447533e62c969475c8a37ddcb930bf781b0597` |

The source kit includes the unchanged historical manuscript/plan and both structured source JSON files in its internal archive. The main package contains 36 entries with the English and Russian deliverables, public content and notes. The source kit has 17 entries, including the four historical sources, fonts and builder. Both ZIPs passed CRC checks. Both saves succeeded on 2026-09-06; Library metadata is recorded, not a public sharing link.

Verification: all carousel/vertical slides, both short cards and every article page were visually inspected by the producing agent; 360 layout blocks checked; both videos fully decoded at 1080×1920, H.264/AAC, 30 fps, 39 seconds. All 12 platform captions passed length checks. The paired PDF articles include working Growth Score link annotations and the relevant Sprint link. Evidence: `docs/runtime/projects/caesthetic/evidence/2026-09-06-social-cases-render-qa.json` and `2026-09-06-social-cases-build-checks.json`. No scheduling or external publication was performed.

## Current English-only delivery — version 1.1.0

Owner correction: all texts and posts must be English. The active content, article, renderer and handoff now use American English. This release replaces the current publication ZIP and source-kit ZIP; their version-0 artifacts remain historical references.

| Deliverable | Library reference | Bytes / SHA-256 |
| --- | --- | --- |
| `CN-001_Package.zip` | `libfile_852bd3c20f808191be7f671e43dfe16f`, version 1 | 3,097,587 bytes; `b2290dc0a55e55d48e77879edd9193bb4be346b3adc8ed1fb582a089b7e873e1` |
| `CAESTHETIC_Social_Cases_Source_Kit.zip` | `libfile_2340a3a1af808191a732c517c56d11e4`, version 1 | 3,240,656 bytes; `4851575e6efdf48ba2ef20d922085f3481490bc216549c38cfc0d404f4f18ff0` |

The release ZIP has 20 entries and contains no Russian publication files. The current source kit has 13 entries; its instructions and inputs are English. The historical four-source archive remains in source-kit version 0, not in this current source kit.

Validation: source measurements unchanged; six captions within their limits; no Cyrillic in publication text or extracted PDF text; eight carousel slides; all three article pages and the carousel overview visually checked; 180 layout blocks checked; the 39-second 1080×1920 MP4 fully decoded. No publishing or scheduling was performed. Evidence: `docs/runtime/projects/caesthetic/evidence/2026-09-06-social-cases-english-qa.json`; session: `docs/runtime/projects/caesthetic/sessions/2026-09-06-social-cases-english.json`.
