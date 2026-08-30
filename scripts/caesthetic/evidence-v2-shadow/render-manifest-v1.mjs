const SURFACES = new Set(["search", "website", "social", "reputation"]);
const EVENTS = new Set(["surface_introduced", "binding_constraint_selected", "growth_score_returned"]);
const LABELS = new Set(["Observed", "Measured", "Calculated", "Benchmark", "Estimated"]);
const CLAIM_SLOTS = new Set([
  "headline_text", "practice_label_text", "binding_constraint_surface", "growth_score_target_surface",
]);
const ID_RE = /^[A-Za-z0-9._-]{1,80}$/;
const SHA_RE = /^[a-f0-9]{64}$/;

function fail(code, path, detail = "") {
  throw Object.assign(new Error(`${code}:${path}${detail ? `:${detail}` : ""}`), {code, path, detail});
}
function objectAt(value, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("invalid_object", path);
  return value;
}
function exact(value, keys, path) {
  objectAt(value, path);
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail("unknown_field", `${path}.${key}`);
  for (const key of keys) if (!Object.hasOwn(value, key)) fail("missing_field", `${path}.${key}`);
}
function text(value, path, max = Infinity) {
  if (typeof value !== "string" || !value.trim() || value.length > max) fail("invalid_string", path);
}
function integer(value, path, min = 0) {
  if (!Number.isInteger(value) || value < min) fail("invalid_integer", path);
}
function unique(values, path) {
  if (new Set(values).size !== values.length) fail("duplicate_id", path);
}

export function validateRenderManifestV1(input) {
  const manifest = objectAt(input, "$");
  exact(manifest, ["manifest_version", "design_system_version", "content_id", "spec_version", "render_purpose", "output", "audio_timeline", "scenes"], "$");
  if (manifest.manifest_version !== "cae-render-manifest@1.0.0") fail("unsupported_render_manifest_version", "$.manifest_version");
  if (manifest.design_system_version !== "caesthetic-reel@1.0.0") fail("unsupported_design_system_version", "$.design_system_version");
  text(manifest.content_id, "$.content_id");
  if (manifest.spec_version !== "Reel System V3.2") fail("unsupported_spec_version", "$.spec_version");
  if (manifest.render_purpose !== "production") fail("shadow_requires_production_manifest", "$.render_purpose");

  exact(manifest.output, ["width", "height", "fps", "duration_in_frames"], "$.output");
  for (const key of ["width", "height", "fps", "duration_in_frames"]) integer(manifest.output[key], `$.output.${key}`, 1);

  exact(manifest.audio_timeline, ["source", "master_ref", "timestamps_ref", "master_sha256", "timestamps_sha256"], "$.audio_timeline");
  if (manifest.audio_timeline.source !== "elevenlabs_alignment") fail("production_alignment_required", "$.audio_timeline.source");
  text(manifest.audio_timeline.master_ref, "$.audio_timeline.master_ref");
  text(manifest.audio_timeline.timestamps_ref, "$.audio_timeline.timestamps_ref");
  if (!SHA_RE.test(manifest.audio_timeline.master_sha256)) fail("invalid_sha256", "$.audio_timeline.master_sha256");
  if (!SHA_RE.test(manifest.audio_timeline.timestamps_sha256)) fail("invalid_sha256", "$.audio_timeline.timestamps_sha256");

  if (!Array.isArray(manifest.scenes) || manifest.scenes.length === 0) fail("scenes_required", "$.scenes");
  const sceneIds = [];
  const globalCueIds = [];
  let previousEnd = 0;
  for (let sceneIndex = 0; sceneIndex < manifest.scenes.length; sceneIndex += 1) {
    const scene = objectAt(manifest.scenes[sceneIndex], `$.scenes[${sceneIndex}]`);
    exact(scene, ["scene_id", "type", "mode", "locale", "start_frame", "end_frame", "headline", "practice_label", "binding_constraint", "growth_score_return", "timeline_cues", "evidence"], `$.scenes[${sceneIndex}]`);
    text(scene.scene_id, `$.scenes[${sceneIndex}].scene_id`);
    sceneIds.push(scene.scene_id);
    if (scene.type !== "four_surface_map" || scene.mode !== "evidence_bound" || scene.locale !== "en-US") {
      fail("unsupported_scene_contract", `$.scenes[${sceneIndex}]`);
    }
    integer(scene.start_frame, `$.scenes[${sceneIndex}].start_frame`);
    integer(scene.end_frame, `$.scenes[${sceneIndex}].end_frame`, 1);
    if (scene.start_frame >= scene.end_frame || scene.end_frame > manifest.output.duration_in_frames || scene.start_frame < previousEnd) {
      fail("invalid_scene_bounds", `$.scenes[${sceneIndex}]`);
    }
    previousEnd = scene.end_frame;
    text(scene.headline, `$.scenes[${sceneIndex}].headline`, 32);
    text(scene.practice_label, `$.scenes[${sceneIndex}].practice_label`, 24);

    exact(scene.binding_constraint, ["surface_id"], `$.scenes[${sceneIndex}].binding_constraint`);
    exact(scene.growth_score_return, ["target_surface_id"], `$.scenes[${sceneIndex}].growth_score_return`);
    if (!SURFACES.has(scene.binding_constraint.surface_id)) fail("invalid_surface_id", `$.scenes[${sceneIndex}].binding_constraint.surface_id`);
    if (scene.growth_score_return.target_surface_id !== scene.binding_constraint.surface_id) {
      fail("constraint_target_mismatch", `$.scenes[${sceneIndex}].growth_score_return.target_surface_id`);
    }

    if (!Array.isArray(scene.timeline_cues)) fail("invalid_array", `$.scenes[${sceneIndex}].timeline_cues`);
    let previousCue = -1;
    const introduced = [];
    const eventCounts = new Map();
    for (let cueIndex = 0; cueIndex < scene.timeline_cues.length; cueIndex += 1) {
      const cue = objectAt(scene.timeline_cues[cueIndex], `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}]`);
      const expected = cue.event === "surface_introduced"
        ? ["cue_id", "event", "surface_id", "at_frame", "alignment_ref"]
        : ["cue_id", "event", "at_frame", "alignment_ref"];
      exact(cue, expected, `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}]`);
      text(cue.cue_id, `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].cue_id`);
      globalCueIds.push(cue.cue_id);
      if (!EVENTS.has(cue.event)) fail("invalid_event", `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].event`);
      integer(cue.at_frame, `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].at_frame`);
      if (cue.at_frame < scene.start_frame || cue.at_frame >= scene.end_frame || cue.at_frame < previousCue) {
        fail("invalid_cue_frame", `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].at_frame`);
      }
      previousCue = cue.at_frame;
      exact(cue.alignment_ref, ["segment_id", "token_start_ms"], `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].alignment_ref`);
      text(cue.alignment_ref.segment_id, `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].alignment_ref.segment_id`);
      integer(cue.alignment_ref.token_start_ms, `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].alignment_ref.token_start_ms`);
      if (cue.event === "surface_introduced") {
        if (!SURFACES.has(cue.surface_id)) fail("invalid_surface_id", `$.scenes[${sceneIndex}].timeline_cues[${cueIndex}].surface_id`);
        introduced.push(cue.surface_id);
      }
      eventCounts.set(cue.event, (eventCounts.get(cue.event) || 0) + 1);
    }
    if (introduced.length !== 4 || new Set(introduced).size !== 4) fail("canonical_surface_cues_required", `$.scenes[${sceneIndex}].timeline_cues`);
    if (eventCounts.get("binding_constraint_selected") !== 1 || eventCounts.get("growth_score_returned") !== 1) {
      fail("singleton_event_required", `$.scenes[${sceneIndex}].timeline_cues`);
    }

    exact(scene.evidence, ["epistemic_label", "claim_bindings"], `$.scenes[${sceneIndex}].evidence`);
    if (!LABELS.has(scene.evidence.epistemic_label)) fail("invalid_epistemic_label", `$.scenes[${sceneIndex}].evidence.epistemic_label`);
    if (!Array.isArray(scene.evidence.claim_bindings)) fail("invalid_array", `$.scenes[${sceneIndex}].evidence.claim_bindings`);
    const bindingIds = [];
    const slots = [];
    for (let bindingIndex = 0; bindingIndex < scene.evidence.claim_bindings.length; bindingIndex += 1) {
      const binding = scene.evidence.claim_bindings[bindingIndex];
      exact(binding, ["binding_id", "claim_slot", "evidence_unit_id", "evidence_claim_id"], `$.scenes[${sceneIndex}].evidence.claim_bindings[${bindingIndex}]`);
      for (const key of ["binding_id", "evidence_unit_id", "evidence_claim_id"]) {
        text(binding[key], `$.scenes[${sceneIndex}].evidence.claim_bindings[${bindingIndex}].${key}`);
        if (!ID_RE.test(binding[key])) fail("invalid_id", `$.scenes[${sceneIndex}].evidence.claim_bindings[${bindingIndex}].${key}`);
      }
      if (!CLAIM_SLOTS.has(binding.claim_slot)) fail("invalid_claim_slot", `$.scenes[${sceneIndex}].evidence.claim_bindings[${bindingIndex}].claim_slot`);
      bindingIds.push(binding.binding_id);
      slots.push(binding.claim_slot);
    }
    unique(bindingIds, `$.scenes[${sceneIndex}].evidence.claim_bindings.binding_id`);
    unique(slots, `$.scenes[${sceneIndex}].evidence.claim_bindings.claim_slot`);
    const requiredSlots = ["headline_text", "binding_constraint_surface", "growth_score_target_surface"];
    if (scene.practice_label !== "YOUR PRACTICE") requiredSlots.push("practice_label_text");
    for (const slot of requiredSlots) if (!slots.includes(slot)) fail("missing_claim_binding", `$.scenes[${sceneIndex}].evidence.claim_bindings`, slot);
    for (const slot of slots) if (!requiredSlots.includes(slot)) fail("unexpected_claim_binding", `$.scenes[${sceneIndex}].evidence.claim_bindings`, slot);
  }
  unique(sceneIds, "$.scenes.scene_id");
  unique(globalCueIds, "$.scenes.timeline_cues.cue_id");
  return manifest;
}
