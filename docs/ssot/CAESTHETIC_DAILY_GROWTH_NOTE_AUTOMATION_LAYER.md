---
owner: CAESTHETIC / platform ops
status: active
created: 2026-08-16
updated: 2026-08-26
authority: DEC-834 extension, amended by DEC-840, DEC-854
---

# CAESTHETIC Daily Growth Note Automation Layer

**Implementation and agent answers:** `docs/ssot/CAESTHETIC_REEL_AUTOMATION.md`
(DEC-854). This file keeps the short stage diagram only.

## Purpose

Automate the full Daily Growth Note production cycle from approved content manifest to final video asset.

The system separates:

- CAESTHETIC visual intelligence layer;
- Valerie human/avatar layer;
- final assembly layer.

The goal is not a generic AI video generator. It is a controlled editorial media pipeline.

## End-to-end pipeline

```
Content Manifest
        ↓
CAESTHETIC Asset Worker
        ↓
Asset Completion Event
        ↓
Continuous ElevenLabs Audio Master + Timestamps
        ↓
Kling Motion / Lip-sync Capability Gate
        ↓
CAESTHETIC_KARAOKE_CAPTION_V1
        ↓
Final Motion Insight
        ↓
Assembly
        ↓
Final MP4
        ↓
Huck storage
        ↓
Completion Notification
```

## Episode state machine

Each episode tracks:

- content manifest status;
- visual assets status;
- Valerie motion status;
- caption status;
- assembly status;
- delivery status.

Example:

```json
{
  "episode": "001",
  "stage": "assembly",
  "assets": "ready",
  "audio_master": "ready",
  "motion": "ready",
  "captions": "ready",
  "final": "pending"
}
```

## Asset Worker completion

After successful rendering:

```
Asset Worker
        ↓
result.json
        ↓
completion event
        ↓
next pipeline stage
```

Required outputs:

- Editorial Opener;
- Evidence Frames;
- Pause Trigger;
- Closing Card.

## Voice and motion integration

ElevenLabs produces one continuous spoken master for the full Reel using
Valerie voice `lxYfHSkYm1EzQzGhdbfc`. Its word/segment timestamps are the
timeline authority. It does not produce separate scene voices, and the first
word begins at `t=0`.

Kling is the primary Valerie motion layer. Audio-input lip sync is used only
when the official available integration declares support. Otherwise the stage
fails closed or routes the same ElevenLabs master segment to an approved
reserve lip-sync provider. HeyGen may be that declared reserve; it never
generates or replaces Valerie's voice.

Motion providers are not responsible for:

- voice synthesis;
- typography;
- branded cards;
- evidence visuals;
- final assembly.

## Caption layer

```
Audio-master timestamps + Valerie motion
        ↓
Caption Renderer
        ↓
Final Motion Insight
```

The caption layer uses `CAESTHETIC_KARAOKE_CAPTION_V1`.

## Final assembly

Combines:

```
Editorial Opener
Motion Insight #1
Evidence Frame
Pause Trigger
Motion Insight #2
Closing Card
```

## Completion notification

When final MP4 is ready, emit:

```json
{
  "episode": "001",
  "status": "completed",
  "output": "Huck/final/daily_growth_note_001.mp4"
}
```

## Principles

- Valerie = branded narrator / human continuity.
- Evidence = credibility anchor / intelligence layer.
- Captions = accessibility + brand control layer.
- Automation = consistency, not replacement of strategy.
- No fabricated outcomes or guarantees.

Scene timing, Pause Trigger overlay, Evidence Bank, Closing Card V1 and CTA
measurement inherit Reel System V2 from
`docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md` (DEC-837).
