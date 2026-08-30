---
owner: CAESTHETIC / Marketing / Platform
status: active
type: ssot
version: 0.4.0
created: 2026-08-22
last_updated: 2026-08-24
component_release_status: v1.0.0
decision: DEC-851
parent_spec: docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md
related:
  - docs/ssot/CAESTHETIC.md
  - docs/ssot/CAESTHETIC_EVIDENCE_BANK.md
  - docs/ssot/CAESTHETIC_REEL_FORMAT_B.md
  - docs/ssot/CAESTHETIC_REMOTION_EVIDENCE_RESOLVER.md
  - site-caesthetic/DESIGN.md
---

# CAESTHETIC Remotion Render Manifest

## 1. Authority and scope

This SSOT defines the fail-closed data contract for programmatic CAESTHETIC Reel evidence scenes rendered with React/Remotion.

It is an implementation adapter beneath **Reel System V3.2**. It does not change Reel timing, Valerie appearance rules, CTA policy, evidence policy, publication gates or Format A/B editorial structure. It does not reactivate the legacy Reel Factory held by DEC-838.

The first canonical component is `FourSurfaceMap`, representing the CAESTHETIC 4444 model:

1. Search / Google Business Profile;
2. Website;
3. Social;
4. Reputation / Reviews.

Paid Ads are not a fifth surface.

## 2. Core architecture

The render pipeline has two isolated contracts:

| Layer | Owns | Must not own |
|---|---|---|
| Data Contract | meaning, evidence mode, scene order, semantic events, alignment provenance | colors, fonts, strokes, icons, geometry, animation curves |
| Design System | CAESTHETIC tokens, typography, icons, layout, motion grammar, visual state mapping | evidence claims, cue meaning, source authority |

The component is a visual executor. The manifest carries semantics only.

A root `design_system_version` is permitted as a version dependency. Visual tokens and implementation details remain in code.

## 3. Canonical FourSurfaceMap semantics

`FourSurfaceMap` owns these visual facts and does not receive them from JSON:

- the four canonical surface labels and order;
- their icons;
- the system line crossing all four surfaces;
- the outer practice frame;
- the visual treatment of a binding constraint;
- all color, typography, spacing, stroke, masking, hatching, glow and easing decisions.

The manifest may select a semantic surface by ID:

`search | website | social | reputation`

It must not pass `icon`, `marker`, `style`, `stroke`, `color`, `owner_frame.visible`, canonical surface labels or geometry.

## 4. Root contract

Required root fields:

| Field | Rule |
|---|---|
| `manifest_version` | exact supported contract version; initial value `cae-render-manifest@0.1.0` |
| `design_system_version` | exact compatible CAESTHETIC Reel Design System version |
| `content_id` | stable unique content identifier |
| `spec_version` | parent editorial system, initially `Reel System V3.2` |
| `render_purpose` | `component_demo | editorial_preview | production` |
| `output` | width, height, fps and total duration |
| `audio_timeline` | discriminated timing provenance |
| `scenes` | ordered array from v0.1 |

`scenes: []` is mandatory from v0.1 so Format B can use multiple scenes without a major manifest migration.

Frame ranges use `start_frame` inclusive and `end_frame` exclusive. Cue frames are absolute within the composition.

## 5. Audio timing provenance

### 5.1 Editorial fixture

Allowed only for `component_demo` and `editorial_preview`:

```json
{
  "source": "editorial_fixture"
}
```

An editorial fixture is not publishable.

### 5.2 ElevenLabs alignment

Required for production scenes with voice:

```json
{
  "source": "elevenlabs_alignment",
  "master_ref": "private://caesthetic/audio/CAE-4444-001/master.mp3",
  "timestamps_ref": "private://caesthetic/audio/CAE-4444-001/alignment.json",
  "master_sha256": "<64 lowercase hex characters>",
  "timestamps_sha256": "<64 lowercase hex characters>"
}
```

Each production cue aligned to speech also carries:

```json
{
  "alignment_ref": {
    "segment_id": "AMS01",
    "token_start_ms": 1000
  }
}
```

References may point to governed private storage. Secrets, signed URLs and raw private evidence must never enter the manifest.

## 6. Typed timeline cues

`timeline_cues` is a typed array, never an arbitrary-key object.

Initial semantic events:

| Event | Required payload |
|---|---|
| `surface_introduced` | `surface_id` |
| `binding_constraint_selected` | none; resolves from scene `binding_constraint` |
| `growth_score_returned` | none; resolves from scene `growth_score_return` |

Each cue requires `cue_id`, `event` and absolute `at_frame`.

The component maps semantic events to reveal, emphasis and motion. The manifest does not request `clip-path`, fade, slide, hatching, glow or easing.

## 7. Scene contract

Initial scene type:

```text
type = four_surface_map
mode = illustrative | evidence_bound
```

Required scene fields:

- `scene_id`;
- `type`;
- `mode`;
- `locale`;
- `start_frame`;
- `end_frame`;
- `headline`;
- `practice_label`;
- `binding_constraint.surface_id`;
- `growth_score_return.target_surface_id`;
- `timeline_cues`;
- `evidence`.

`binding_constraint` is semantic. Its visual treatment is owned by `FourSurfaceMap.tsx`.

## 8. Evidence modes

### 8.1 Illustrative

An illustrative scene must contain:

```json
{
  "epistemic_label": "Illustrative",
  "evidence_ids": [],
  "public_label": "MODEL EXAMPLE — NOT A CLIENT CASE"
}
```

The public label must be visible in rendered output. It cannot be hidden, blank or moved outside safe area.

### 8.2 Evidence-bound

An evidence-bound scene must reference only evidence IDs in `PUBLISHABLE` state under `CAESTHETIC_EVIDENCE_BANK.md`.

The renderer must fail closed when an ID is missing, unknown, raw-only, expired, rights-blocked or not publishable. The render pipeline must never read `raw/` evidence.

The allowed epistemic labels remain: `Observed`, `Measured`, `Calculated`, `Benchmark`, `Estimated`, `Illustrative`.

## 9. Gold fixture — component demo

This is strict JSON. Comments are forbidden.

```json
{
  "manifest_version": "cae-render-manifest@0.1.0",
  "design_system_version": "caesthetic-reel@1.0.0",
  "content_id": "CAE-4444-DEMO-001",
  "spec_version": "Reel System V3.2",
  "render_purpose": "component_demo",
  "output": {
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "duration_in_frames": 180
  },
  "audio_timeline": {
    "source": "editorial_fixture"
  },
  "scenes": [
    {
      "scene_id": "S01",
      "type": "four_surface_map",
      "mode": "illustrative",
      "locale": "en-US",
      "start_frame": 0,
      "end_frame": 180,
      "headline": "PATIENTS CROSS-CHECK",
      "practice_label": "YOUR PRACTICE",
      "binding_constraint": {
        "surface_id": "website"
      },
      "growth_score_return": {
        "target_surface_id": "website"
      },
      "timeline_cues": [
        {
          "cue_id": "C01",
          "event": "surface_introduced",
          "surface_id": "search",
          "at_frame": 30
        },
        {
          "cue_id": "C02",
          "event": "surface_introduced",
          "surface_id": "website",
          "at_frame": 45
        },
        {
          "cue_id": "C03",
          "event": "surface_introduced",
          "surface_id": "social",
          "at_frame": 70
        },
        {
          "cue_id": "C04",
          "event": "surface_introduced",
          "surface_id": "reputation",
          "at_frame": 95
        },
        {
          "cue_id": "C05",
          "event": "binding_constraint_selected",
          "at_frame": 120
        },
        {
          "cue_id": "C06",
          "event": "growth_score_returned",
          "at_frame": 145
        }
      ],
      "evidence": {
        "epistemic_label": "Illustrative",
        "evidence_ids": [],
        "public_label": "MODEL EXAMPLE — NOT A CLIENT CASE"
      }
    }
  ]
}
```

## 10. Fail-closed Zod invariants

The eventual `render-manifest.schema.ts` must reject unknown keys and enforce:

1. exact supported `manifest_version`;
2. compatible `design_system_version`;
3. positive integer output dimensions, fps and duration;
4. unique `content_id` at the orchestration boundary;
5. non-empty, ordered, non-overlapping scenes for v0.1;
6. unique `scene_id` and globally unique `cue_id`;
7. `0 <= start_frame < end_frame <= duration_in_frames`;
8. every cue falls inside its scene range;
9. only canonical surface IDs;
10. exactly four `surface_introduced` cues per FourSurfaceMap scene, each canonical surface exactly once;
11. a binding constraint points to a canonical surface;
12. `growth_score_return.target_surface_id` equals the binding constraint surface;
13. cue order is non-decreasing by `at_frame`;
14. production with voice forbids `editorial_fixture`;
15. ElevenLabs production provenance requires master/timestamp references and valid SHA-256 values;
16. production speech cues require `alignment_ref`;
17. illustrative mode requires the exact visible public label and no evidence IDs;
18. evidence-bound mode requires at least one `PUBLISHABLE` evidence ID;
19. no visual-layer fields are accepted;
20. no comments, trailing commas, NaN or non-JSON values.

Any validation or evidence-resolution error aborts rendering. There is no permissive fallback to default claims, surfaces or timings.

## 11. Development and verification order

The canonical implementation order is:

1. `render-manifest.schema.ts`;
2. gold JSON fixture;
3. `FourSurfaceMap.tsx`;
4. deterministic frame tests;
5. real publishable evidence units.

Minimum frame tests cover:

- before first reveal;
- each surface reveal boundary;
- binding-constraint selection;
- Growth Score return;
- final frame;
- illustrative label visibility;
- rejected invalid fixtures;
- production rejection without ElevenLabs provenance.

Motion must be deterministic from frame number. Strong bounce is not part of the CAESTHETIC motion grammar; exact curves remain Design System implementation.

## 12. Publication gates

A valid render manifest authorizes a render attempt only. It does not authorize publication.

Production still requires the parent pipeline gates, including:

- evidence and rights clearance;
- `APPROVED_SCRIPT`;
- human QA of rendered output and captions;
- `APPROVED_PUBLISH`;
- channel-specific publication controls.

This SSOT does not authorize runtime implementation, dependency installation, production deployment or publication by itself.

## 13. Change control

Backward-compatible additions increment the contract minor version. Breaking field or semantic changes require a major version.

Changes to FourSurfaceMap visual execution belong to the Design System version. Changes to meaning, validation, provenance or evidence rules belong to the manifest version.

Authority: DEC-851.


## 14. Canonical implementation blueprint

This section freezes the source-level implementation candidate for `FourSurfaceMap v1`.

Current status:

```text
manifest contract: cae-render-manifest@0.1.0
design system dependency: caesthetic-reel@1.0.0
component: FourSurfaceMap v1.0.0
production rendering: DISABLED
stable v1.0.0: RELEASED 2026-08-23
```

The implementation is materialized at `scripts/caesthetic/remotion-four-surface-map/`. Sections 15–21 retain the reviewed architecture; the executable package is the source-level authority where the verified implementation details in §26 differ. Production remains fail-closed until the asynchronous PUBLISHABLE Evidence Resolver exists.

### 14.1 Module boundary

| Module | Authority |
|---|---|
| `render-manifest.schema.ts` | Runtime data validation |
| `four-surface-map.illustrative.json` | Gold component-demo fixture |
| `FourSurfaceMap.tsx` | Visual black-box renderer |
| `load-fonts.ts` | Deterministic local typography |
| `ValidatedFourSurfaceMap.tsx` | Untrusted-input boundary and production lock |
| `Root.tsx` | Registered base and Format B harness compositions |
| `index.ts` | Remotion entry point |
| `four-surface-map.spec.ts` | Pixel and timeline regression tests |
| `validation.spec.ts` | Schema/runtime rejection tests |
| asynchronous Evidence Resolver | Future production authorization boundary |

## 15. Canonical Zod schema

```ts
import {z} from "zod";

const SurfaceIdSchema = z.enum([
  "search",
  "website",
  "social",
  "reputation",
]);

const EventTypeSchema = z.enum([
  "surface_introduced",
  "binding_constraint_selected",
  "growth_score_returned",
]);

const EpistemicLabelSchema = z.enum([
  "Observed",
  "Measured",
  "Calculated",
  "Benchmark",
  "Estimated",
  "Illustrative",
]);

const NonEmptyString = z.string().trim().min(1);
const HeadlineSchema = z.string().trim().min(1).max(32);
const PracticeLabelSchema = z.string().trim().min(1).max(24);
const Sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "Must be a valid SHA-256 hash");

const AudioTimelineSchema = z.discriminatedUnion("source", [
  z
    .object({
      source: z.literal("editorial_fixture"),
    })
    .strict(),
  z
    .object({
      source: z.literal("elevenlabs_alignment"),
      master_ref: NonEmptyString,
      timestamps_ref: NonEmptyString,
      master_sha256: Sha256Schema,
      timestamps_sha256: Sha256Schema,
    })
    .strict(),
]);

const AlignmentRefSchema = z
  .object({
    segment_id: NonEmptyString,
    token_start_ms: z.number().int().nonnegative(),
  })
  .strict();

const TimelineCueSchema = z
  .object({
    cue_id: NonEmptyString,
    event: EventTypeSchema,
    surface_id: SurfaceIdSchema.optional(),
    at_frame: z.number().int().nonnegative(),
    alignment_ref: AlignmentRefSchema.optional(),
  })
  .strict()
  .superRefine((cue, ctx) => {
    if (cue.event === "surface_introduced" && !cue.surface_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "surface_id is required for surface_introduced events",
        path: ["surface_id"],
      });
    }

    if (
      cue.event !== "surface_introduced" &&
      cue.surface_id !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "surface_id is forbidden for events other than surface_introduced",
        path: ["surface_id"],
      });
    }
  });

const EvidenceSchema = z
  .object({
    epistemic_label: EpistemicLabelSchema,
    evidence_ids: z.array(NonEmptyString),
    public_label: NonEmptyString,
  })
  .strict();

const SceneSchema = z
  .object({
    scene_id: NonEmptyString,
    type: z.literal("four_surface_map"),
    mode: z.enum(["illustrative", "evidence_bound"]),
    locale: z.literal("en-US"),
    start_frame: z.number().int().nonnegative(),
    end_frame: z.number().int().positive(),
    headline: HeadlineSchema,
    practice_label: PracticeLabelSchema,
    binding_constraint: z
      .object({
        surface_id: SurfaceIdSchema,
      })
      .strict(),
    growth_score_return: z
      .object({
        target_surface_id: SurfaceIdSchema,
      })
      .strict(),
    timeline_cues: z.array(TimelineCueSchema),
    evidence: EvidenceSchema,
  })
  .strict()
  .superRefine((scene, ctx) => {
    if (scene.start_frame >= scene.end_frame) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "start_frame must be strictly less than end_frame",
        path: ["start_frame"],
      });
    }

    let previousFrame = -1;

    scene.timeline_cues.forEach((cue, index) => {
      if (
        cue.at_frame < scene.start_frame ||
        cue.at_frame >= scene.end_frame
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            `Cue ${cue.cue_id} is outside [${scene.start_frame}, ${scene.end_frame})`,
          path: ["timeline_cues", index, "at_frame"],
        });
      }

      if (cue.at_frame < previousFrame) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cues must be ordered by non-decreasing at_frame",
          path: ["timeline_cues", index, "at_frame"],
        });
      }

      previousFrame = cue.at_frame;
    });

    if (
      scene.growth_score_return.target_surface_id !==
      scene.binding_constraint.surface_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "growth_score_return.target_surface_id must match binding_constraint.surface_id",
        path: ["growth_score_return", "target_surface_id"],
      });
    }

    const introduced = scene.timeline_cues
      .filter((cue) => cue.event === "surface_introduced")
      .map((cue) => cue.surface_id);

    if (introduced.length !== 4 || new Set(introduced).size !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Scene requires exactly four distinct surface_introduced cues",
        path: ["timeline_cues"],
      });
    }

    for (const event of [
      "binding_constraint_selected",
      "growth_score_returned",
    ] as const) {
      const count = scene.timeline_cues.filter(
        (cue) => cue.event === event,
      ).length;

      if (count !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Scene requires exactly one '${event}' cue`,
          path: ["timeline_cues"],
        });
      }
    }

    if (scene.mode === "illustrative") {
      if (scene.evidence.evidence_ids.length !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Illustrative mode requires empty evidence_ids",
          path: ["evidence", "evidence_ids"],
        });
      }

      if (
        scene.evidence.public_label !==
        "MODEL EXAMPLE — NOT A CLIENT CASE"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Illustrative mode requires the exact public label",
          path: ["evidence", "public_label"],
        });
      }

      if (scene.evidence.epistemic_label !== "Illustrative") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Illustrative mode requires epistemic_label Illustrative",
          path: ["evidence", "epistemic_label"],
        });
      }
    }

    if (scene.mode === "evidence_bound") {
      if (scene.evidence.evidence_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Evidence-bound mode requires at least one evidence_id",
          path: ["evidence", "evidence_ids"],
        });
      }

      if (scene.evidence.epistemic_label === "Illustrative") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Evidence-bound mode cannot use the Illustrative label",
          path: ["evidence", "epistemic_label"],
        });
      }
    }
  });

export const RenderManifestSchema = z
  .object({
    manifest_version: z.literal("cae-render-manifest@0.1.0"),
    design_system_version: z.literal("caesthetic-reel@1.0.0"),
    content_id: NonEmptyString,
    spec_version: z.literal("Reel System V3.2"),
    render_purpose: z.enum([
      "component_demo",
      "editorial_preview",
      "production",
    ]),
    output: z
      .object({
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        fps: z.number().int().positive(),
        duration_in_frames: z.number().int().positive(),
      })
      .strict(),
    audio_timeline: AudioTimelineSchema,
    scenes: z.array(SceneSchema).min(1),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const duration = manifest.output.duration_in_frames;
    const sceneIds = new Set<string>();
    const cueIds = new Set<string>();

    manifest.scenes.forEach((scene, sceneIndex) => {
      if (scene.end_frame > duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            `Scene ${scene.scene_id} exceeds duration_in_frames`,
          path: ["scenes", sceneIndex, "end_frame"],
        });
      }

      if (
        sceneIndex < manifest.scenes.length - 1 &&
        scene.end_frame >
          manifest.scenes[sceneIndex + 1].start_frame
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            `Scene ${scene.scene_id} overlaps or is out of order`,
          path: ["scenes", sceneIndex],
        });
      }

      if (sceneIds.has(scene.scene_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate scene_id: ${scene.scene_id}`,
          path: ["scenes", sceneIndex],
        });
      }

      sceneIds.add(scene.scene_id);

      scene.timeline_cues.forEach((cue, cueIndex) => {
        if (cueIds.has(cue.cue_id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate cue_id: ${cue.cue_id}`,
            path: [
              "scenes",
              sceneIndex,
              "timeline_cues",
              cueIndex,
            ],
          });
        }

        cueIds.add(cue.cue_id);
      });
    });

    if (manifest.render_purpose === "production") {
      if (
        manifest.audio_timeline.source !==
        "elevenlabs_alignment"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Production requires elevenlabs_alignment audio",
          path: ["audio_timeline", "source"],
        });
      }

      manifest.scenes.forEach((scene, sceneIndex) => {
        scene.timeline_cues.forEach((cue, cueIndex) => {
          if (!cue.alignment_ref) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Production requires alignment_ref on every cue",
              path: [
                "scenes",
                sceneIndex,
                "timeline_cues",
                cueIndex,
                "alignment_ref",
              ],
            });
          }
        });
      });
    }
  });

export type RenderManifest = z.infer<typeof RenderManifestSchema>;
export type FourSurfaceMapScene = Extract<
  RenderManifest["scenes"][number],
  {type: "four_surface_map"}
>;
```

## 16. Canonical FourSurfaceMap renderer

```tsx
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {Globe, Search, Star, Users} from "lucide-react";
import type {
  FourSurfaceMapScene,
} from "./render-manifest.schema";

type TimelineCue =
  FourSurfaceMapScene["timeline_cues"][number];
type EventType = TimelineCue["event"];
type SurfaceId = NonNullable<TimelineCue["surface_id"]>;

type Props = {
  scene: FourSurfaceMapScene;
};

const TOKENS = {
  colors: {
    bg: "#F0EDE6",
    primary: "#0B2438",
    accent: "#7B244B",
  },
  fonts: {
    sans: '"IBM Plex Sans", sans-serif',
    mono: '"IBM Plex Mono", monospace',
  },
  layout: {
    safeAreaPx: 120,
  },
} as const;

const CANONICAL_SURFACES = [
  {id: "search", label: "SEARCH / GBP", icon: Search},
  {id: "website", label: "WEBSITE", icon: Globe},
  {id: "social", label: "SOCIAL", icon: Users},
  {
    id: "reputation",
    label: "REPUTATION / REVIEWS",
    icon: Star,
  },
] as const;

const NODE_SIZE = 144;
const NODE_GAP = 60;
const SYSTEM_HEIGHT = NODE_SIZE * 4 + NODE_GAP * 3;
const FIRST_CENTER = NODE_SIZE / 2;
const LAST_CENTER = SYSTEM_HEIGHT - NODE_SIZE / 2;

export const FourSurfaceMap: React.FC<Props> = ({scene}) => {
  const localFrame = useCurrentFrame();

  const resolveCueOrThrow = (
    event: EventType,
    surfaceId?: SurfaceId,
  ): TimelineCue => {
    const cue = scene.timeline_cues.find(
      (item) =>
        item.event === event &&
        (surfaceId === undefined ||
          item.surface_id === surfaceId),
    );

    if (!cue) {
      throw new Error(
        `Missing validated cue: ${event}:${surfaceId ?? "scene"}`,
      );
    }

    return cue;
  };

  const getLocalCueFrame = (
    event: EventType,
    surfaceId?: SurfaceId,
  ) =>
    resolveCueOrThrow(event, surfaceId).at_frame -
    scene.start_frame;

  const getRevealProgress = (
    startFrame: number,
    duration = 15,
  ) =>
    interpolate(
      localFrame,
      [startFrame - 1, startFrame + duration - 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      },
    );

  const constraintFrame = getLocalCueFrame(
    "binding_constraint_selected",
  );
  const constraintProgress = getRevealProgress(
    constraintFrame,
    10,
  );

  const returnFrame = getLocalCueFrame(
    "growth_score_returned",
  );
  const returnProgress = getRevealProgress(returnFrame, 15);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.colors.bg,
        color: TOKENS.colors.primary,
        fontFamily: TOKENS.fonts.sans,
        fontSynthesis: "none",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: `${TOKENS.layout.safeAreaPx}px 60px`,
        }}
      >
        <div
          style={{
            marginBottom: 80,
            opacity: getRevealProgress(0, 10),
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 2,
              margin: "0 0 12px",
              textTransform: "uppercase",
            }}
          >
            {scene.practice_label}
          </h2>
          <h1
            style={{
              color: TOKENS.colors.primary,
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {scene.headline}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              border: `2px solid ${TOKENS.colors.primary}`,
              bottom: -10,
              left: -30,
              opacity: 0.2,
              pointerEvents: "none",
              position: "absolute",
              right: -30,
              top: -30,
            }}
          >
            <div
              style={{
                backgroundColor: TOKENS.colors.bg,
                fontFamily: TOKENS.fonts.mono,
                fontSize: 18,
                fontWeight: 600,
                padding: "0 10px",
                position: "absolute",
                right: 40,
                top: -14,
              }}
            >
              ONE OWNER OF THE LOGIC
            </div>
          </div>

          <div
            style={{
              height: SYSTEM_HEIGHT,
              position: "relative",
            }}
          >
            <svg
              height={SYSTEM_HEIGHT}
              width={NODE_SIZE}
              style={{
                inset: 0,
                pointerEvents: "none",
                position: "absolute",
                zIndex: 0,
              }}
            >
              <line
                x1={FIRST_CENTER}
                x2={FIRST_CENTER}
                y1={FIRST_CENTER}
                y2={LAST_CENTER}
                stroke={TOKENS.colors.primary}
                strokeDasharray="12 12"
                strokeWidth={4}
                opacity={0.3}
              />
            </svg>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: NODE_GAP,
                position: "relative",
                zIndex: 10,
              }}
            >
              {CANONICAL_SURFACES.map((surface) => {
                const startFrame = getLocalCueFrame(
                  "surface_introduced",
                  surface.id,
                );
                const progress =
                  getRevealProgress(startFrame);
                const Icon = surface.icon;
                const isConstraint =
                  scene.binding_constraint.surface_id ===
                  surface.id;

                return (
                  <div
                    key={surface.id}
                    style={{
                      alignItems: "center",
                      display: "flex",
                      gap: 40,
                      opacity: progress,
                      transform: `translateY(${interpolate(
                        progress,
                        [0, 1],
                        [40, 0],
                      )}px)`,
                    }}
                  >
                    <div
                      style={{
                        alignItems: "center",
                        backgroundColor: TOKENS.colors.bg,
                        border: `4px solid ${
                          isConstraint &&
                          localFrame >= constraintFrame
                            ? TOKENS.colors.accent
                            : TOKENS.colors.primary
                        }`,
                        borderRadius: "50%",
                        boxSizing: "border-box",
                        display: "flex",
                        height: NODE_SIZE,
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                        width: NODE_SIZE,
                      }}
                    >
                      {isConstraint ? (
                        <div
                          style={{
                            background:
                              `repeating-linear-gradient(` +
                              `45deg, transparent, transparent 10px, ` +
                              `${TOKENS.colors.accent}1A 10px, ` +
                              `${TOKENS.colors.accent}1A 20px)`,
                            inset: 0,
                            opacity: constraintProgress,
                            pointerEvents: "none",
                            position: "absolute",
                          }}
                        />
                      ) : null}

                      <Icon
                        color={
                          isConstraint &&
                          localFrame >= constraintFrame
                            ? TOKENS.colors.accent
                            : TOKENS.colors.primary
                        }
                        size={64}
                        strokeWidth={1.5}
                        style={{zIndex: 2}}
                      />
                    </div>

                    <div>
                      <h3
                        style={{
                          fontSize: 42,
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {surface.label}
                      </h3>

                      {isConstraint &&
                      localFrame >= returnFrame ? (
                        <div
                          style={{
                            color: TOKENS.colors.accent,
                            fontFamily: TOKENS.fonts.mono,
                            fontSize: 24,
                            fontWeight: 600,
                            marginTop: 12,
                            opacity: returnProgress,
                            transform: `translateX(${interpolate(
                              returnProgress,
                              [0, 1],
                              [-20, 0],
                            )}px)`,
                          }}
                        >
                          ↳ FIX FIRST. DO NOT FUND THE LEAK.
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {scene.mode === "illustrative" ? (
          <div
            style={{
              backgroundColor: TOKENS.colors.accent,
              color: TOKENS.colors.bg,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 1,
              marginTop: "auto",
              padding: 24,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {scene.evidence.public_label}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
```

## 17. Deterministic local fonts

Required assets:

```text
public/fonts/IBMPlexSans-ExtraBold.woff2
public/fonts/IBMPlexSans-Bold.woff2
public/fonts/IBMPlexMono-SemiBold.woff2
```

Canonical loader:

```ts
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

let fontLoadStarted = false;

export const loadLocalFonts = () => {
  if (typeof window === "undefined" || fontLoadStarted) {
    return;
  }

  fontLoadStarted = true;

  const handle = delayRender(
    "Loading IBM Plex fonts for deterministic rendering",
  );

  const sansBold = new FontFace(
    "IBM Plex Sans",
    `url('${staticFile(
      "fonts/IBMPlexSans-Bold.woff2",
    )}') format('woff2')`,
    {weight: "700"},
  );

  const mono = new FontFace(
    "IBM Plex Mono",
    `url('${staticFile(
      "fonts/IBMPlexMono-SemiBold.woff2",
    )}') format('woff2')`,
    {weight: "600"},
  );

  Promise.all([
    sansBold.load(),
    mono.load(),
  ])
    .then((fonts) => {
      fonts.forEach((font) => document.fonts.add(font));
      continueRender(handle);
    })
    .catch((cause: unknown) => {
      const error =
        cause instanceof Error
          ? cause
          : new Error(String(cause));

      cancelRender(error);
    });
};
```

No CDN font source is allowed. `fontSynthesis: "none"` is mandatory on the composition root.

## 18. Runtime validation boundary

```tsx
import React from "react";
import {
  RenderManifestSchema,
  type FourSurfaceMapScene,
} from "./render-manifest.schema";
import {FourSurfaceMap} from "./FourSurfaceMap";

export type RenderInputProps = {
  manifest: unknown;
  sceneId: string;
};

export const resolveRenderableScene = (
  manifest: unknown,
  sceneId: string,
): FourSurfaceMapScene => {
  const parsed = RenderManifestSchema.parse(manifest);

  if (parsed.render_purpose === "production") {
    throw new Error(
      "Production rendering is disabled until PUBLISHABLE evidence resolution succeeds",
    );
  }

  const scene = parsed.scenes.find(
    (item): item is FourSurfaceMapScene =>
      item.scene_id === sceneId &&
      item.type === "four_surface_map",
  );

  if (!scene) {
    throw new Error(
      `Validated four_surface_map scene not found: ${sceneId}`,
    );
  }

  return scene;
};

export const ValidatedFourSurfaceMap: React.FC<
  RenderInputProps
> = ({manifest, sceneId}) => (
  <FourSurfaceMap
    scene={resolveRenderableScene(manifest, sceneId)}
  />
);
```

This wrapper is mandatory for CLI, API, Studio and test entry points. Direct unvalidated use of `FourSurfaceMap` outside its own unit tests is forbidden.

## 19. Composition registration and Format B harness

```tsx
import React from "react";
import {Composition, Sequence} from "remotion";
import goldFixture from "./four-surface-map.illustrative.json";
import {loadLocalFonts} from "./load-fonts";
import {
  type RenderInputProps,
  ValidatedFourSurfaceMap,
} from "./ValidatedFourSurfaceMap";

loadLocalFonts();

const shiftManifest = (offset: number) => ({
  ...goldFixture,
  output: {
    ...goldFixture.output,
    duration_in_frames:
      goldFixture.output.duration_in_frames + offset,
  },
  scenes: goldFixture.scenes.map((scene) => ({
    ...scene,
    start_frame: scene.start_frame + offset,
    end_frame: scene.end_frame + offset,
    timeline_cues: scene.timeline_cues.map((cue) => ({
      ...cue,
      at_frame: cue.at_frame + offset,
    })),
  })),
});

const harnessManifest = shiftManifest(200);

const HarnessWrapper: React.FC<RenderInputProps> = (
  props,
) => (
  <Sequence from={200} durationInFrames={180}>
    <ValidatedFourSurfaceMap {...props} />
  </Sequence>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FourSurfaceMap"
      component={ValidatedFourSurfaceMap}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={180}
      defaultProps={{
        manifest: goldFixture,
        sceneId: "S01",
      }}
    />

    <Composition
      id="FourSurfaceMapHarness"
      component={HarnessWrapper}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={380}
      defaultProps={{
        manifest: harnessManifest,
        sceneId: "S01",
      }}
    />
  </>
);
```

```ts
import {registerRoot} from "remotion";
import {RemotionRoot} from "./Root";

registerRoot(RemotionRoot);
```

The harness is test-only. Production orchestration builds `Sequence` ranges from validated scene boundaries; it must not use the fixed offset `200`.

## 20. Canonical snapshot tests

```ts
import {bundle} from "@remotion/bundler";
import {
  renderStill,
  selectComposition,
  type VideoConfig,
} from "@remotion/renderer";
import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {toMatchImageSnapshot} from "jest-image-snapshot";
import goldFixture from "./four-surface-map.illustrative.json";

expect.extend({toMatchImageSnapshot});

const FORMAT_A_FRAMES = [
  0, 29, 30, 44, 45, 69, 70,
  94, 95, 119, 120, 144, 145, 179,
];

const FORMAT_B_FRAMES = [199, 200, 229, 230, 379];

describe("FourSurfaceMap visual boundaries", () => {
  let serveUrl: string;
  let outputDir: string;
  let formatA: VideoConfig;
  let formatB: VideoConfig;

  const shiftedManifest = {
    ...goldFixture,
    output: {
      ...goldFixture.output,
      duration_in_frames: 380,
    },
    scenes: goldFixture.scenes.map((scene) => ({
      ...scene,
      start_frame: scene.start_frame + 200,
      end_frame: scene.end_frame + 200,
      timeline_cues: scene.timeline_cues.map((cue) => ({
        ...cue,
        at_frame: cue.at_frame + 200,
      })),
    })),
  };

  beforeAll(async () => {
    outputDir = await mkdtemp(\n      join(tmpdir(), "cae-four-surface-snapshots-"),\n    );

    serveUrl = await bundle({
      entryPoint: resolve(__dirname, "../index.ts"),
    });

    formatA = await selectComposition({
      serveUrl,
      id: "FourSurfaceMap",
      inputProps: {
        manifest: goldFixture,
        sceneId: "S01",
      },
    });

    formatB = await selectComposition({
      serveUrl,
      id: "FourSurfaceMapHarness",
      inputProps: {
        manifest: shiftedManifest,
        sceneId: "S01",
      },
    });
  });

  afterAll(async () => {
    await rm(outputDir, {force: true, recursive: true});
  });

  it.each(FORMAT_A_FRAMES)(
    "matches Format A frame %i",
    async (frame) => {
      const output = join(
        outputDir,
        `format-a-${frame}.png`,
      );

      await renderStill({
        composition: formatA,
        frame,
        inputProps: {
          manifest: goldFixture,
          sceneId: "S01",
        },
        output,
        serveUrl,
      });

      expect(await readFile(output)).toMatchImageSnapshot({
        customSnapshotIdentifier:
          `four-surface-format-a-${frame}`,
      });
    },
  );

  it.each(FORMAT_B_FRAMES)(
    "matches localized Format B frame %i",
    async (frame) => {
      const output = join(
        outputDir,
        `format-b-${frame}.png`,
      );

      await renderStill({
        composition: formatB,
        frame,
        inputProps: {
          manifest: shiftedManifest,
          sceneId: "S01",
        },
        output,
        serveUrl,
      });

      expect(await readFile(output)).toMatchImageSnapshot({
        customSnapshotIdentifier:
          `four-surface-format-b-${frame}`,
      });
    },
  );

  it("fits the maximum-width headline fixture", async () => {
    const stressManifest = {
      ...goldFixture,
      scenes: goldFixture.scenes.map((scene) => ({
        ...scene,
        headline: "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      })),
    };

    const stressComposition = await selectComposition({
      serveUrl,
      id: "FourSurfaceMap",
      inputProps: {
        manifest: stressManifest,
        sceneId: "S01",
      },
    });

    const output = join(outputDir, "headline-stress.png");

    await renderStill({
      composition: stressComposition,
      frame: 179,
      inputProps: {
        manifest: stressManifest,
        sceneId: "S01",
      },
      output,
      serveUrl,
    });

    expect(await readFile(output)).toMatchImageSnapshot({
      customSnapshotIdentifier:
        "four-surface-headline-32-wide-characters",
    });
  });
});
```

The temporary output directory must be created by the test runner before rendering. Snapshot baselines are committed separately by the implementation task after human approval.

## 21. Runtime rejection tests

```ts
import goldFixture from "./four-surface-map.illustrative.json";
import {RenderManifestSchema} from "./render-manifest.schema";
import {
  resolveRenderableScene,
} from "./ValidatedFourSurfaceMap";

describe("runtime fail-closed validation", () => {
  it("rejects an unknown root field", () => {
    expect(() =>
      RenderManifestSchema.parse({
        ...goldFixture,
        unauthorized_field: "inject",
      }),
    ).toThrow();
  });

  it("rejects an over-capacity headline", () => {
    expect(() =>
      RenderManifestSchema.parse({
        ...goldFixture,
        scenes: goldFixture.scenes.map((scene) => ({
          ...scene,
          headline:
            "THIS HEADLINE EXCEEDS THE THIRTY TWO CHARACTER LIMIT",
        })),
      }),
    ).toThrow();
  });

  it("rejects schema-valid production before evidence resolution", () => {
    const productionFixture = {
      ...goldFixture,
      render_purpose: "production",
      audio_timeline: {
        source: "elevenlabs_alignment",
        master_ref: "private://caesthetic/audio/master.mp3",
        timestamps_ref:
          "private://caesthetic/audio/alignment.json",
        master_sha256: "a".repeat(64),
        timestamps_sha256: "b".repeat(64),
      },
      scenes: goldFixture.scenes.map((scene) => ({
        ...scene,
        timeline_cues: scene.timeline_cues.map(
          (cue, index) => ({
            ...cue,
            alignment_ref: {
              segment_id: `AMS${String(index + 1).padStart(
                2,
                "0",
              )}`,
              token_start_ms: Math.round(\n                cue.at_frame * 1000 / 30,\n              ),
            },
          }),
        ),
      })),
    };

    expect(() =>
      resolveRenderableScene(productionFixture, "S01"),
    ).toThrow(
      "Production rendering is disabled until PUBLISHABLE evidence resolution succeeds",
    );
  });
});
```

Production fixture tests must first satisfy the production audio/alignment schema; otherwise the Zod error will correctly occur before the explicit production lock. A dedicated test for the lock must therefore start from a schema-valid production fixture.

## 22. CI and release gate

Pin all Remotion, React, Zod, Lucide, image-snapshot and Chromium versions in the repository lockfile.

Required CI order:

1. TypeScript compile;
2. Zod negative suite;
3. runtime boundary suite;
4. Format A snapshots;
5. shifted Format B snapshots;
6. 32-wide-character headline stress snapshot;
7. missing-WOFF2 test proving immediate `cancelRender`;
8. a second snapshot run without baseline update;
9. named human visual approval of every baseline PNG.

Release invariant:

```text
green first run
+ green repeat run
+ identical pinned-environment pixels
+ human baseline approval
= FourSurfaceMap v1.0.0
```

All §22 gates passed on 2026-08-23. The canonical component status is `v1.0.0`; production rendering remains independently disabled.

## 23. Production Evidence Resolver boundary

The production unlock is a separate change and requires a new decision or an explicit amendment to DEC-851.

The Node-side preflight must:

1. parse the strict manifest;
2. resolve every evidence ID only against the clean Evidence Bank;
3. require current `PUBLISHABLE` lifecycle state;
4. verify rights, expiry and evidence hashes;
5. reject access to `raw/`;
6. bind the resolution result to the manifest content hash;
7. pass only the attested manifest into rendering;
8. retain an audit record without private evidence contents.

No boolean such as `evidence_checked: true` supplied by arbitrary input is sufficient. Until an unforgeable or process-trusted attestation path exists, `ValidatedFourSurfaceMap` must reject every production manifest.

## 24. Version boundary

`cae-render-manifest@0.1.0` is the data-contract version and remains unchanged by this implementation blueprint.

`FourSurfaceMap v1.0.0` is the stable component version released after §22 passed. Future visual changes require a Design System/component version increment.

This manifest fixture remains explicitly pinned to Reel System V3.2. The parent Reel System on current main has advanced to V3.3; migrating the manifest literal requires a separate versioned contract decision and is not implied by this RC implementation. No deployment or publication is authorized by this SSOT update.


## 25. New-session handoff

### 25.1 Goal

Build a reusable, deterministic React/Remotion renderer for CAESTHETIC Reel evidence scenes without allowing AI-authored JSON to control visual design or introduce unsupported claims.

The first scene is `FourSurfaceMap`, based on the canonical CAESTHETIC 4444 model:

1. Search / GBP;
2. Website;
3. Social;
4. Reputation / Reviews.

Paid Ads remain a Demand Layer, not a fifth surface.

### 25.2 Decisions already closed

Do not reopen these decisions without new evidence or an explicit founder change:

- Data Contract and Design System are isolated.
- The manifest contains semantics only.
- Visual tokens, icons, labels, layout, system line, outer owner frame, constraint treatment and easing live inside the component.
- Unknown JSON keys fail through strict Zod objects.
- `scenes: []` exists from manifest v0.1 for Format B.
- Scene ranges are `start_frame` inclusive and `end_frame` exclusive.
- Cues use absolute composition frames in the manifest.
- A scene rendered inside `Sequence` converts them to local frames by subtracting `scene.start_frame`.
- Cue reveals are inclusive: the cue frame is the first visually changed frame.
- Strong spring/bounce and CSS runtime transitions are forbidden.
- Illustrative scenes visibly show `MODEL EXAMPLE — NOT A CLIENT CASE`.
- Evidence-bound scenes cannot use the `Illustrative` epistemic label.
- Production voice requires checksummed ElevenLabs alignment provenance.
- Production rendering is disabled until the PUBLISHABLE Evidence Resolver exists.
- A valid manifest never authorizes publication.
- Reel System V3.2, Format B rules, Valerie rules and human approval gates remain unchanged.
- The legacy template Reel Factory remains on hold.

### 25.3 Canonical versions

| Layer | Current version/status |
|---|---|
| Render manifest | `cae-render-manifest@0.1.0` |
| Design System dependency | `caesthetic-reel@1.0.0` |
| FourSurfaceMap component | `v1.0.0` |
| Production rendering | blocked |
| Stable component release | released 2026-08-23; commit `a8c7f6c4fa4babf5535d13066f7dd6c7c094c651` |

The stable label is backed by approved baselines and clean-install Actions run `32661828063`; it does not authorize production.

### 25.4 Canonical artifacts

- This file is the only active SSOT for the Remotion render-manifest topic.
- DEC authority: `docs/founder-notes/DEC-851.md`.
- Parent editorial authority: `docs/ssot/CAESTHETIC_DAILY_GROWTH_NOTE_VIDEO_PIPELINE.md`.
- Evidence authority: `docs/ssot/CAESTHETIC_EVIDENCE_BANK.md`.
- Format B authority: `docs/ssot/CAESTHETIC_REEL_FORMAT_B.md`.
- Visual authority: `site-caesthetic/DESIGN.md`.

### 25.5 What has been completed

- Architecture and manifest semantics agreed.
- Fail-closed validation rules specified.
- Strict gold illustrative fixture fixed.
- Canonical source blueprints assembled for:
  - schema;
  - renderer;
  - runtime wrapper;
  - deterministic font loader;
  - Remotion Root;
  - Format B offset harness;
  - snapshot suite;
  - runtime rejection suite.
- Exact frame boundaries fixed:
  `0, 29, 30, 44, 45, 69, 70, 94, 95, 119, 120, 144, 145, 179`.
- Format B localization frames fixed:
  `199, 200, 229, 230, 379`.
- Maximum headline capacity fixed at 32 characters.
- Practice label capacity fixed at 24 characters.
- Required font weights fixed at IBM Plex Sans Bold 700 and IBM Plex Mono SemiBold 600; the pinned upstream Sans package has no static ExtraBold 800 face, so synthetic 800 is forbidden.
- Browser font synthesis forbidden.

### 25.6 Stable implementation state

Released on 2026-08-23:

- standalone package is canonical at `scripts/caesthetic/remotion-four-surface-map/`;
- exact dependency versions and npm lockfile are committed;
- checksum-verified local WOFF2 assets are materialized from pinned IBM packages; no font CDN or browser synthesis is used;
- all 20 named-human-approved baseline PNGs are committed;
- clean `npm ci`, TypeScript, six schema/runtime tests, twenty-three visual/localization assertions, twenty snapshots and the missing-font cancellation test passed in GitHub Actions run `32661828063`;
- Format B frames 200/230/379 are byte-identical to local Format A frames 0/30/179;
- the 32-wide-character stress fixture fits through deterministic two-line wrapping;
- release commit is `a8c7f6c4fa4babf5535d13066f7dd6c7c094c651`.

Intentionally still blocked:

- the Evidence Resolver does not exist;
- production rendering remains unavailable;
- no deploy and no publication occurred.

## 25.7 Next action

Use `v1.0.0` as the locked baseline for component-demo and editorial-preview manifests. Any production unlock remains a separate milestone requiring the PUBLISHABLE Evidence Resolver and explicit change authority.

## 25.8 Stable-release acceptance

The next session may declare `FourSurfaceMap v1.0.0` only when all are true:

- exact dependency and Chromium versions are pinned;
- strict schema tests pass;
- runtime production rejection passes;
- missing-font failure calls `cancelRender`;
- all specified still frames render;
- Format B offset behavior matches Format A locally;
- the 32-wide-character stress fixture does not overflow;
- a second run produces identical accepted pixels;
- a named human approves every baseline;
- the release record includes the commit SHA.

### 25.9 Production unlock

Production is a separate milestone. It requires an asynchronous clean-bank Evidence Resolver, manifest-hash-bound resolution evidence and an explicit DEC-851 amendment or new founder decision.

Never replace this gate with an input boolean, a TODO, an assumed upstream check or direct access to raw evidence.

### 25.10 Session restart prompt

Use this exact compact prompt when opening the next session:

```text
Continue CAESTHETIC FourSurfaceMap v1.0.0 from
docs/ssot/CAESTHETIC_REMOTION_RENDER_MANIFEST.md §26.
Treat the committed PNG baselines and release commit
a8c7f6c4fa4babf5535d13066f7dd6c7c094c651 as locked.
Do not enable production, deploy, publish, redesign 4444, or bypass the
PUBLISHABLE Evidence Resolver gate.
```


## 26. Executed stable-release verification — 2026-08-23

### 26.1 Repository state

| Item | Executed value |
|---|---|
| Implementation root | `scripts/caesthetic/remotion-four-surface-map/` |
| Branch | `codex/cae-four-surface-map-rc2` |
| Stable release commit | `a8c7f6c4fa4babf5535d13066f7dd6c7c094c651` |
| Component status | `v1.0.0` |
| Production | disabled by `ValidatedFourSurfaceMap` |
| Deploy / publication | not performed |

### 26.2 Pinned runtime

- Node `24.19.0`;
- Chromium Headless Shell `149.0.7790.0`;
- Remotion packages `4.0.515`;
- React and React DOM `19.2.8`;
- Zod `4.4.3`;
- Lucide React `1.33.0`;
- Jest `29.7.0`;
- TypeScript `5.9.3`;
- lockfile SHA-256 `07970e59bbf63010628e120edb02254da7bc167a00d2307b66119450602581ad`.

### 26.3 Deterministic font correction

The executable package uses IBM Plex Sans Bold 700 and IBM Plex Mono SemiBold 600. The pinned `@ibm/plex-sans@1.1.0` package does not ship a static ExtraBold 800 WOFF2 face. The implementation therefore does not request 800 and does not permit browser synthesis.

`scripts/prepare-fonts.mjs` verifies the package assets before copying them into Remotion's local `public/fonts/` directory:

- Sans Bold: `fa7130d854a660b39a7fc9e6e0f2dc23dba5f1346e2adea3e1fe37b6d884133d`;
- Mono SemiBold: `6a825b4824c01cbb401e829e5a066a1818411bcb3538b5a5792c5ca9b82343c3`;
- IBM Plex license: `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da`.

### 26.4 Test evidence

- TypeScript compile: passed.
- Zod/runtime negative tests: `6/6` passed.
- Visual, stress and localization assertions: `23/23` passed.
- Snapshot comparisons: `20/20` passed on a second run without updating baselines.
- Format B localization: global frames `200`, `230`, `379` are byte-identical to Format A local frames `0`, `30`, `179`.
- Missing WOFF2 test: expected `cancelRender` path passed in less than the 15-second ceiling; no PNG was produced.
- Maximum headline: 32 worst-case wide glyphs fit through renderer-owned deterministic two-line wrapping and a reserved header block.

### 26.5 Release closure

Named human baseline approval was recorded on 2026-08-23. The exact 20 PNGs were committed, and clean-install GitHub Actions run [32661828063](https://github.com/zaomir/grainee-v2/actions/runs/32661828063) passed every step. PR #884 merged as release commit `a8c7f6c4fa4babf5535d13066f7dd6c7c094c651`.

This closes `FourSurfaceMap v1.0.0` only. Production still requires the PUBLISHABLE Evidence Resolver and separate change authority.


## 27. Production-resolver readiness audit — 2026-08-24

The post-release audit is recorded in `docs/ssot/CAESTHETIC_REMOTION_EVIDENCE_RESOLVER.md` with status `proposed`.

The audit found that production cannot yet be unlocked without new versioned contracts:

- current Evidence Bank units have no clean-artifact inventory, SHA-256/byte-size integrity fields, manifest version or explicit expiry declarations;
- scene-level `evidence_ids` do not bind rendered claims to an evidence unit's `allowed_public_wording`;
- no manifest-bound, key-verifiable attestation or private-content-free audit envelope exists.

Accordingly:

```text
FourSurfaceMap v1.0.0: RELEASED AND LOCKED
component_demo/editorial_preview: ENABLED
production: DISABLED
next milestone: PROPOSED CONTRACT ONLY
```

The existing unconditional production throw remains source truth. No resolver runtime, deploy or publication is authorized by this audit. Acceptance requires an explicit DEC-851 amendment or a new founder decision.
