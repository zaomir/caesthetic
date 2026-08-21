---
owner: CAESTHETIC
status: active
version: 1.0
created: 2026-08-16
---

# CAESTHETIC_PIPELINE_MONITOR_V1

## Purpose

Automatic monitoring and orchestration layer for CAESTHETIC content production.

The monitor prevents manual polling and ensures every production stage is completed before the next one starts.

## Pipeline

```
Content Manifest
      ↓
Asset Worker
      ↓
Asset QA
      ↓
HeyGen Motion
      ↓
Motion QA
      ↓
Caption Renderer
      ↓
Caption QA
      ↓
Assembly
      ↓
CAESTHETIC_VIDEO_QA_V1
      ↓
Delivery
      ↓
Notification
```

## Episode State

Each episode must expose machine-readable state:

```
created
assets_running
assets_ready
motion_running
motion_ready
captions_running
captions_ready
assembly_running
qa_running
qa_pass
failed
```

## Rules

- Never start a stage if the previous required stage has not passed.
- Every worker must emit heartbeat/status.
- Failures must include stage, reason and recovery action.
- Secrets are never included in status payloads.

## Completion Event

Example:

```json
{
  "episode":"001",
  "stage":"qa",
  "status":"success",
  "output":"Huck/final/daily_growth_note_001.mp4"
}
```

## Goal

CAESTHETIC content production should run as a controlled media pipeline, not a manual AI workflow.
