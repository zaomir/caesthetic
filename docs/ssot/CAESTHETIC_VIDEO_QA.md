---
owner: CAESTHETIC / platform ops
status: active
created: 2026-08-16
authority: DEC-836
---

# CAESTHETIC Video QA System

## Purpose

Every Daily Growth Note must pass automated QA before becoming a publish-ready asset.

QA is the final control layer after Assembly. A generated video is not considered complete only because rendering succeeded.

## Pipeline

```
Final Assembly
      ↓
CAESTHETIC_VIDEO_QA_V1
      ↓
PASS / FAIL
      ↓
Publish-ready asset
```

## Technical QA

Required checks:

- output MP4 exists;
- file opens successfully;
- correct vertical format 9:16;
- expected duration range;
- no empty frames or broken renders.

## Sequence QA

Verify canonical order:

```
EDITORIAL OPENER
        ↓
MOTION INSIGHT #1
        ↓
KARAOKE CAPTIONS
        ↓
EVIDENCE / EXPLANATION
        ↓
PAUSE TRIGGER
        ↓
MOTION INSIGHT #2
        ↓
KARAOKE CAPTIONS
        ↓
CLOSING CARD
```

## Brand QA

Verify:

- CAESTHETIC logo placement;
- approved typography;
- navy / cream / burgundy color system;
- karaoke captions use CAESTHETIC_KARAOKE_CAPTION_V1;
- Evidence cards use the approved headline + explanatory text grid;
- intermediate Evidence and Pause Trigger cards contain no CTA;
- the closing card contains exactly one CTA;
- no random HeyGen design elements.

## Content QA

Verify:

- no fabricated results;
- no unsupported patient/revenue claims;
- CTA matches approved funnel;
- evidence frames follow CAESTHETIC methodology.
- evidence artifacts are relevant to the stated takeaway;
- real interfaces, conversations and client material are permissioned and
  redacted;
- illustrative diagrams are not presented as real measured outcomes;
- no decorative portrait, fabricated dashboard or fake conversation is used as
  Evidence filler.

## Automation result format

Example:

```json
{
  "episode": "001",
  "status": "qa_pass",
  "checks": {
    "technical": true,
    "sequence": true,
    "brand": true,
    "content": true
  },
  "output": "Huck/final/daily_growth_note_001.mp4"
}
```

## Principle

CAESTHETIC is not an AI video generator. It is a controlled editorial production system where AI generation is only one production layer.
