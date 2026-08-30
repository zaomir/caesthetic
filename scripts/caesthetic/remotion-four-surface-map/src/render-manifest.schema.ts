import {z} from "zod";

const SurfaceIdSchema = z.enum(["search", "website", "social", "reputation"]);
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
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/, "Must be a valid SHA-256 hash");

const AudioTimelineSchema = z.discriminatedUnion("source", [
  z.object({source: z.literal("editorial_fixture")}).strict(),
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
    if (cue.event !== "surface_introduced" && cue.surface_id !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "surface_id is forbidden for events other than surface_introduced",
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
    binding_constraint: z.object({surface_id: SurfaceIdSchema}).strict(),
    growth_score_return: z.object({target_surface_id: SurfaceIdSchema}).strict(),
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
      if (cue.at_frame < scene.start_frame || cue.at_frame >= scene.end_frame) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cue ${cue.cue_id} is outside [${scene.start_frame}, ${scene.end_frame})`,
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

    if (scene.growth_score_return.target_surface_id !== scene.binding_constraint.surface_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "growth_score_return.target_surface_id must match binding_constraint.surface_id",
        path: ["growth_score_return", "target_surface_id"],
      });
    }

    const introduced = scene.timeline_cues
      .filter((cue) => cue.event === "surface_introduced")
      .map((cue) => cue.surface_id);
    if (introduced.length !== 4 || new Set(introduced).size !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scene requires exactly four distinct surface_introduced cues",
        path: ["timeline_cues"],
      });
    }

    for (const event of ["binding_constraint_selected", "growth_score_returned"] as const) {
      if (scene.timeline_cues.filter((cue) => cue.event === event).length !== 1) {
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
      if (scene.evidence.public_label !== "MODEL EXAMPLE — NOT A CLIENT CASE") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Illustrative mode requires the exact public label",
          path: ["evidence", "public_label"],
        });
      }
      if (scene.evidence.epistemic_label !== "Illustrative") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Illustrative mode requires epistemic_label Illustrative",
          path: ["evidence", "epistemic_label"],
        });
      }
    }

    if (scene.mode === "evidence_bound") {
      if (scene.evidence.evidence_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Evidence-bound mode requires at least one evidence_id",
          path: ["evidence", "evidence_ids"],
        });
      }
      if (scene.evidence.epistemic_label === "Illustrative") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Evidence-bound mode cannot use the Illustrative label",
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
    render_purpose: z.enum(["component_demo", "editorial_preview", "production"]),
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
    const sceneIds = new Set<string>();
    const cueIds = new Set<string>();

    manifest.scenes.forEach((scene, sceneIndex) => {
      if (scene.end_frame > manifest.output.duration_in_frames) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Scene ${scene.scene_id} exceeds duration_in_frames`,
          path: ["scenes", sceneIndex, "end_frame"],
        });
      }
      if (
        sceneIndex < manifest.scenes.length - 1 &&
        scene.end_frame > manifest.scenes[sceneIndex + 1].start_frame
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Scene ${scene.scene_id} overlaps or is out of order`,
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
            path: ["scenes", sceneIndex, "timeline_cues", cueIndex],
          });
        }
        cueIds.add(cue.cue_id);
      });
    });

    if (manifest.render_purpose === "production") {
      if (manifest.audio_timeline.source !== "elevenlabs_alignment") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Production requires elevenlabs_alignment audio",
          path: ["audio_timeline", "source"],
        });
      }
      manifest.scenes.forEach((scene, sceneIndex) => {
        scene.timeline_cues.forEach((cue, cueIndex) => {
          if (!cue.alignment_ref) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Production requires alignment_ref on every cue",
              path: ["scenes", sceneIndex, "timeline_cues", cueIndex, "alignment_ref"],
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
