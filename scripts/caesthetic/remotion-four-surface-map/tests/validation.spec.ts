import goldFixture from "../src/four-surface-map.illustrative.json";
import {RenderManifestSchema} from "../src/render-manifest.schema";
import {resolveRenderableScene} from "../src/ValidatedFourSurfaceMap";

const clone = <T>(value: T): T => structuredClone(value);

describe("render manifest fail-closed validation", () => {
  it("accepts the gold illustrative fixture", () => {
    expect(RenderManifestSchema.parse(goldFixture).content_id).toBe("CAE-4444-DEMO-001");
  });

  it("rejects unknown root and nested visual fields", () => {
    expect(() =>
      RenderManifestSchema.parse({...goldFixture, unauthorized_field: "inject"}),
    ).toThrow();

    const nested = clone(goldFixture) as typeof goldFixture & {
      scenes: Array<(typeof goldFixture.scenes)[number] & {marker?: string}>;
    };
    nested.scenes[0].marker = "burgundy_hatching";
    expect(() => RenderManifestSchema.parse(nested)).toThrow();
  });

  it("rejects over-capacity and whitespace-only text", () => {
    const longHeadline = clone(goldFixture);
    longHeadline.scenes[0].headline = "W".repeat(33);
    expect(() => RenderManifestSchema.parse(longHeadline)).toThrow();

    const blankPractice = clone(goldFixture);
    blankPractice.scenes[0].practice_label = "   ";
    expect(() => RenderManifestSchema.parse(blankPractice)).toThrow();
  });

  it("rejects duplicate cues and missing canonical surfaces", () => {
    const duplicateCue = clone(goldFixture);
    duplicateCue.scenes[0].timeline_cues[1].cue_id = "C01";
    expect(() => RenderManifestSchema.parse(duplicateCue)).toThrow();

    const missingSurface = clone(goldFixture);
    missingSurface.scenes[0].timeline_cues[3].surface_id = "search";
    expect(() => RenderManifestSchema.parse(missingSurface)).toThrow();
  });

  it("rejects illustrative leakage into evidence_bound mode", () => {
    const invalid = clone(goldFixture);
    Object.assign(invalid.scenes[0], {
      mode: "evidence_bound",
      evidence: {
        epistemic_label: "Illustrative",
        evidence_ids: ["CAE-EV-001"],
        public_label: "CLIENT EVIDENCE",
      },
    });
    expect(() => RenderManifestSchema.parse(invalid)).toThrow();
  });

  it("rejects schema-valid production before evidence resolution", () => {
    const productionFixture = {
      ...goldFixture,
      render_purpose: "production",
      audio_timeline: {
        source: "elevenlabs_alignment",
        master_ref: "private://caesthetic/audio/master.mp3",
        timestamps_ref: "private://caesthetic/audio/alignment.json",
        master_sha256: "a".repeat(64),
        timestamps_sha256: "b".repeat(64),
      },
      scenes: goldFixture.scenes.map((scene) => ({
        ...scene,
        timeline_cues: scene.timeline_cues.map((cue, index) => ({
          ...cue,
          alignment_ref: {
            segment_id: `AMS${String(index + 1).padStart(2, "0")}`,
            token_start_ms: Math.round((cue.at_frame * 1000) / 30),
          },
        })),
      })),
    };

    expect(() => resolveRenderableScene(productionFixture, "S01")).toThrow(
      "Production rendering is disabled until PUBLISHABLE evidence resolution succeeds",
    );
  });
});
