---
owner: CAESTHETIC
status: active
version: 1.2
updated: 2026-08-18
scope: Valerie Petra still-photo inventory (identity + IG plates)
parent: docs/ssot/CAESTHETIC.md
---

# CAESTHETIC — Valerie Petra avatar photo library

One Dropbox folder is the photo library. Git holds working copies for ops. Do not invent a second cloud folder.

**Dropbox:** `CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates`  
**Share:** https://www.dropbox.com/scl/fo/hr7r3ru8f7yl3byt1sg94/ALMzdFgxeSnOqnwVyA04x0c?rlkey=yweiwmwsc66elgmma1wq61hnt&dl=0  
**rclone:** `dropbox:CAESTHETIC/CAESTHETIC MEDIA/Valerie-avatar-plates`

Rendered Stories (text on photo) live in `Huck/stories/` — that is output, not this library. Worker: `docs/ssot/CAESTHETIC_ASSET_WORKER.md`.

## Identity lock

Use this on every new still. Do not restyle into a different woman.

| Trait | Canon |
|-------|--------|
| Name | Valerie Petra |
| Role | CAESTHETIC founder / Growth Advisor presenter |
| Hair | Voluminous curly red hair to the shoulders |
| Eyes | Light (blue/grey) |
| Skin | Fair |
| Glasses | Black rectangular frames (keep sunglasses when the source scene has them) |
| Earrings | Small pearl studs |
| Wardrobe default | Navy blazer + cream/white blouse (`CAESTHETIC_HEYGEN_PRODUCTION_SYSTEM.md` §5) |
| Mood | Calm authority, editorial, not influencer grin, not spa pink |

Primary generation refs: `00-identity-refs/08-portrait-glasses-office-blazer.png` + `01-front-neutral.png`.

## Canonical source-library boundary

`Valerie-avatar-plates/` contains **reusable source material only**:

```text
Valerie-avatar-plates/
  00-identity-refs/
  01-pose-library/
  02-clean-plates/
  05-variants/
```

The existing `03-reel-example/` and `04-daily-growth-note/` folders are
format-specific production artifacts, not source-library layers. Logically they
belong under the `Production/` namespace described below. This is a storage
rule, not an instruction to migrate existing binary files now.

## Folder map (inventory observed 2026-08-16)

| Folder | Files | What | VDS / git working copy |
|--------|------:|------|-------------------------|
| `00-identity-refs` | 10 | Face/wardrobe lock (HeyGen character pack) | `docs/archive/personal/heygen-red-character-refs/` |
| `01-pose-library` | 8 | Canonical situation plates (first founder-grid restyle) | `docs/projects/caesthetic/operations/ig-growth/footage/valerie-pose-library/` |
| `02-clean-plates` | 31 | Expanded woman-only scene warehouse | `…/footage/valerie-clean-plates/` |
| `05-variants` | 156 | 4 pose/smile takes per plate (31×4 + 8×4) | `…/footage/valerie-variants/` |

The reusable source library contains **205 stills**. The 8 stills currently in
`03-reel-example/` and `04-daily-growth-note/` remain part of the observed
213-still Dropbox inventory until a separate binary migration is approved and
executed.

## Dropbox production and output namespaces

Recommended canonical structure:

```text
CAESTHETIC/CAESTHETIC MEDIA/
  Valerie-avatar-plates/
    00-identity-refs/
    01-pose-library/
    02-clean-plates/
    05-variants/
  Production/
    daily-growth-note/<episode>/
      source-manifest/
      heygen/
      captions/
      assembly/
    template-reels/<id>/
  Huck/
    stories/<request_id>/
    reels/<request_id>/
    thumbnails/
    archive/
```

Do not physically copy a selected source plate into an episode directory.
Record its canonical Dropbox path and source lineage in
`source-manifest/`. Episode-specific HeyGen clips, caption renders, assembly
intermediates, and other work products belong under `Production/`; none belong
in `Valerie-avatar-plates/`.

Output routing:

- final OPENER, Evidence, Pause and Closing cards → `Huck/stories/<request_id>/`;
- final MP4 → `Huck/reels/<request_id>/`;
- thumbnails → `Huck/thumbnails/`;
- retired/superseded versions → `Huck/archive/`.

Canonical lineage:

```text
source_plate → opener render → HeyGen/motion → captions → assembly → final reel
```

Site mark `site-caesthetic/assets/img/team/valerie-petra.svg` is a logo-style SVG, not a photo. Keep it on the site; do not put it in this library.

## Pose library vs clean plates

Both folders are Valerie restyles of founder-grid cells: **our avatar in the scene, no competitor copy**. They are not two identities and not opener overlays. Opener/editorial cards in `Huck/stories/` are a later render on top of a chosen plate.

| | Pose library (`01`) | Clean plates (`02`) |
|--|--|--|
| Count | 8 | 31 |
| Role | Canonical pose set for the series / first editorial-card geometry | Expanded warehouse of locations and outfits |
| Source | The first founder reference grid: the same eight situations | The remaining unique woman-only grid cells |
| People | 7 solo + one two-person plate (`04-car-sunroof`) | Solo only |
| Naming | `01-profile-night.png` … `08-hand-behind-head.png` | `vcp-001-…` … `vcp-031-…` |
| For opener | Allowed, but a narrow set | Main volume of scenes |
| 4 clones | Yes — `pose-01-v1` … `pose-08-v4` | Yes — `vcp-001-v1` … `vcp-031-v4` |

Do not treat pose-library as “better Valerie” and clean-plates as “drafts”. Pose-library is the locked eight situations. Clean-plates is the rest of the grid after dropping repeats (same car selfie, same red sofa, same trench) and non-woman cells.

`05-variants` clones **both** (8 + 31 = 39 sources × 4 = 156). Clones keep outfit and environment; they change smile/pose/camera slightly. They are still source plates, not opener cards. Early opener tests used original clean plates, not `v1–v4`.

## 00 — identity refs

| File | View |
|------|------|
| `00-source-front.png` | Source front |
| `01-front-neutral.png` | Front, neutral |
| `02-three-quarter-left.png` | ¾ left |
| `03-three-quarter-right.png` | ¾ right |
| `04-profile-left.png` | Profile left |
| `05-profile-right.png` | Profile right |
| `06-front-speaking-mid.png` | Front, speaking |
| `07-full-body-arms-crossed-glasses.png` | Full body, arms crossed |
| `08-portrait-glasses-office-blazer.png` | Office portrait (primary lock) |
| `09-seated-office-chair-tortoiseshell-glasses.png` | Seated, office |

## 01 — pose library

| File | Scene | People |
|------|-------|--------|
| `01-profile-night.png` | Night profile, sunglasses | 1 |
| `02-city-walk.png` | City walk, looking up | 1 |
| `03-tree-seated.png` | Seated by tree | 1 |
| `04-car-sunroof.png` | Car + sunroof | 2 (Valerie + one other) |
| `05-podcast.png` | Studio microphone | 1 |
| `06-pillar.png` | Lean on stone pillar | 1 |
| `07-handbag.png` | Looking at bag | 1 |
| `08-hand-behind-head.png` | Hand behind head | 1 |

## 02 — clean plates

31 distinct situations (`vcp-001` … `vcp-031`). Woman-only. No competitor text, logos, view counts, or UI. Close-ups were generated with a smile; later randomized in `05-variants`.

| File | Scene |
|------|-------|
| `vcp-001-bookshelf-smile.png` | Bookshelf, blue dress |
| `vcp-002-car-seatbelt-smile.png` | Car, red seatbelt, denim |
| `vcp-003-pool-smile.png` | Pool deck, navy swimsuit |
| `vcp-004-pink-shirt-smile.png` | Pink blouse headshot |
| `vcp-005-dog-stone-wall.png` | Knit dress, doodle dog, stone wall |
| `vcp-006-suv-white-dress.png` | Cream dress, black SUV, city |
| `vcp-007-pillar-smile.png` | Colonnade, rust top, olive skirt |
| `vcp-008-podcast-smile.png` | Dark blazer, studio mic |
| `vcp-009-clinic-blazer-smile.png` | Clinic hallway, white blazer |
| `vcp-010-office-phone-smile.png` | Desk, phone |
| `vcp-011-gold-top-smile.png` | Gold/champagne top |
| `vcp-012-city-call.png` | City street, phone |
| `vcp-013-mirror-selfie.png` | Mirror selfie |
| `vcp-014-beach-coverup.png` | Beach, beige cover-up |
| `vcp-015-curb-overhead-smile.png` | Sitting on curb |
| `vcp-016-champagne-sofa-smile.png` | Sofa, champagne |
| `vcp-017-red-gown-path.png` | Red gown, outdoor path |
| `vcp-018-clinic-shirt-smile.png` | Clinic, shirt |
| `vcp-019-tennis-bench.png` | Tennis bench |
| `vcp-020-white-shirt-smile.png` | White shirt |
| `vcp-021-trench-sunglasses.png` | Trench, sunglasses |
| `vcp-022-red-sofa-smile.png` | Red sofa |
| `vcp-023-cafe-coffee-smile.png` | Cafe, coffee |
| `vcp-024-hand-in-hair-smile.png` | Close-up, hand in hair |
| `vcp-025-glasses-phone-desk.png` | Desk, phone, shelves |
| `vcp-026-striped-blazer-smile.png` | Striped blazer |
| `vcp-027-boat-champagne-smile.png` | Boat, champagne |
| `vcp-028-desk-hands-smile.png` | Desk, hands |
| `vcp-029-driver-smile.png` | Driver seat |
| `vcp-030-flowers-sunglasses-smile.png` | Flowers, sunglasses |
| `vcp-031-armchair-smile.png` | Armchair |

## 05 — variants

For each file in `01` and `02`, four takes:

1. closed-mouth smile  
2. small asymmetric laugh  
3. quiet half-smile, looking away  
4. mid-speech smile  

Keep outfit and environment. Slight camera shift. Naming: `vcp-001-v1.png` … `pose-08-v4.png`.

## Do not put here

| Thing | Where it actually lives |
|-------|-------------------------|
| Competitor grid slices | `valerie-clean-plates/_crops/` (local cache only) |
| Editorial Story Card renders | Dropbox `Huck/stories/` + `valerie-pose-library/_editorial-v2/` |
| Text overlay previews | `valerie-pose-library/_overlay-v1-preview/` |
| Episode manifest and intermediates | Dropbox `Production/daily-growth-note/<episode>/` |
| Template Reel production artifacts | Dropbox `Production/template-reels/<id>/` |
| Final Story cards | Dropbox `Huck/stories/<request_id>/` |
| Final Reel MP4 | Dropbox `Huck/reels/<request_id>/` |
| Site SVG | `site-caesthetic/assets/img/team/valerie-petra.svg` |

## Related

- HeyGen presenter rules: `docs/ssot/CAESTHETIC_HEYGEN_PRODUCTION_SYSTEM.md`
- Template Reel: `docs/ssot/CAESTHETIC_IG_TEMPLATE_REEL_FACTORY.md` (DEC-831)
- Daily Growth Note video: `docs/ssot/CAESTHETIC_IG_DAILY_GROWTH_NOTE.md` (DEC-832)
- Editorial still-card geometry: `docs/ssot/CAESTHETIC_IG_EDITORIAL_STORY_CARD.md` (DEC-833)
- Dropbox → renderer → Huck: `docs/ssot/CAESTHETIC_ASSET_WORKER.md` (DEC-834)
- rclone: `docs/ssot/RCLONE_CLOUD_STORAGE.md`
