---
owner: CAESTHETIC
status: active
version: 1.1
created: 2026-08-18
updated: 2026-08-18
authority: CAESTHETIC visual canon, DEC-839 opening amendment
---

# CAESTHETIC Daily Growth Note — Editorial Opener Canon

## Canonical layout

All Daily Growth Note OPENERs use one primary layout: `LEFT_CONTOUR_EDITORIAL`.

The series must read consistently as:

```text
LEFT MESSAGE → RIGHT VALERIE
```

Do not switch OPENERs to `BOTTOM_EDITORIAL` merely because the source plate has insufficient negative space.

For published editorial Reels, this composition is a source surface for Reel
System V3.1's Motion Editorial Hook. The first published frame must already
carry restrained motion through push-in, subtle parallax or moving evidence.
For a Valerie opening master, the complete headline is visible and Valerie is
already moving and speaking at frame `0`; the headline does not reveal before
speech. The still composition rules below remain the visual authority; the
motion and opening-audio rules are governed by
`CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` (DEC-838, amended by DEC-839).

## Source plates

Which Valerie photo to use is defined in `docs/ssot/CAESTHETIC_VALERIE_AVATAR_LIBRARY.md`.

- **Pose library** (`01`, 8 plates): locked eight situations from the first founder grid.
- **Clean plates** (`02`, 31 plates): expanded woman-only scene warehouse — main volume for OPENERs.
- **Variants** (`05`, 156): four pose/smile clones of both sets. Still source plates, not OPENER renders.

An OPENER in `Huck/stories/` is a later editorial render on a chosen plate. Do not confuse the plate folders with finished OPENERs.

## Composition pipeline

```text
source plate
→ detect Valerie / face / eyes / hair / hands / important held objects
→ reserve fixed left editorial text zone
→ reposition Valerie to the right when needed
→ extend/reconstruct background when needed
→ preserve subject scale and anatomy; never stretch Valerie
→ build contour-aware cream field
→ apply wide feather to alpha 0
→ place fixed CAESTHETIC brand anchor and copy
→ visual QA
```

## Left field

The cream editorial field is always on the left.

It is not a rectangular banner and must not end at one vertical `fade_end` line.

The cream field must follow the silhouette of Valerie. Its right boundary adapts by Y-position to the contour of hair, head, shoulder, torso, arms, legs and other visually important body geometry.

The field may expand farther into the frame around empty background and retract earlier around Valerie.

## Gradient / feather

The transition from cream to the source image must be substantially wider and softer than a conventional linear side gradient.

Rules:

- start with a near-solid warm cream field at the left edge;
- use a broad nonlinear feather toward Valerie;
- alpha must reach 0 smoothly before important subject detail;
- no visible vertical seam, hard edge or narrow Canva-style gradient;
- the fade width may vary vertically to follow the subject silhouette;
- around hair and shoulders the transition should be especially soft;
- in the lower frame the cream field may widen again when the body contour allows it.

Target effect: the text field feels integrated into the photograph, as in premium editorial art direction, not layered on top of it.

## Repositioning before fallback

If Valerie occupies the left text zone:

1. shift/reframe Valerie to the right while preserving her proportions;
2. if the source canvas becomes insufficient, extend/reconstruct the background;
3. preserve face, hair, hands and meaningful props;
4. only reject the plate if a believable composition still cannot be created.

Do not solve this by moving the headline to the bottom.

## Fixed brand geometry

Canvas: `1080 × 1920`.

Brand anchor remains fixed across all OPENERs:

- X = `72 px`
- Y = `92 px`

Logo, `CAESTHETIC`, and `DAILY GROWTH NOTE NNN` must remain in exactly the same position across the series.

## Copy

- uppercase condensed bold headline;
- for the Scene 1A opening master, place the complete headline in the fixed
  lower-third area inside the left editorial zone from frame `0`;
- CAESTHETIC navy `#0B2438`;
- one meaningful word or phrase may be highlighted in burgundy;
- supporting copy remains concise;
- never cover Valerie's face, eyes, hair, hands or important held objects.

## QA gate

An OPENER is not valid merely because text avoids face/eyes.

QA must also verify:

- left editorial field is used;
- Valerie is composed on the right;
- contour-aware field follows subject geometry;
- feather reaches alpha 0 smoothly with no visible vertical seam;
- no important body/prop overlap;
- no subject stretching or anatomy distortion;
- brand anchor remains at `72,92`;
- final canvas is exactly `1080×1920`.

## Relationship to other cards

`LEFT_CONTOUR_EDITORIAL` is mandatory for OPENERs.

Evidence / Explanation and Pause Trigger cards may keep their own layouts. `BOTTOM_EDITORIAL` is not the default OPENER fallback.
