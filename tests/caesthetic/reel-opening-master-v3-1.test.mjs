import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertReserveMotion, validateAudioMasterContract, validateMasterTimestamps } from "../../scripts/caesthetic/asset-worker/video-worker.mjs";

const episodePath = new URL(
  "../../docs/projects/caesthetic/operations/ig-growth/reels/episodes/001-more-traffic-not-yet.yaml",
  import.meta.url,
);
const registryPath = new URL(
  "../../docs/projects/caesthetic/operations/ig-growth/reels/REGISTRY.yaml",
  import.meta.url,
);

const episode = readFileSync(episodePath, "utf8");
const registry = readFileSync(registryPath, "utf8");

test("CAE-REEL-001 pins Reel System V3.2", () => {
  assert.match(episode, /spec_version: "Reel System V3\.2"/);
  assert.match(registry, /spec_version: "Reel System V3\.2"/);
});

test("episode uses one continuous ElevenLabs Valerie master across every voiced scene", () => {
  assert.match(episode, /provider: ElevenLabs/);
  assert.match(episode, /voice_id: lxYfHSkYm1EzQzGhdbfc/);
  assert.match(episode, /no_leading_silence: true/);
  assert.match(episode, /continuous_voice: true/);
  assert.match(episode, /per_scene_tts_allowed: false/);
  assert.match(episode, /scene_id: S02[\s\S]*?spoken_text: More traffic only amplifies[\s\S]*?audio_segment_ref: AMS02[\s\S]*?delivery_mode: voice_over[\s\S]*?presenter_mode: voice_over/);
  assert.match(episode, /lip_sync_provider: capability_gated/);
  assert.match(episode, /capability_status: unverified/);
  for (let i = 1; i <= 5; i += 1) {
    const id = String(i).padStart(2, "0");
    assert.match(episode, new RegExp(`scene_id: S${id}[\\s\\S]*?audio_segment_ref: AMS${id}`));
  }
  assert.doesNotMatch(episode, /Generate the exact spoken text|Speak the exact text|Speak the exact question/);
});

test("worker permits only the declared supported reserve motion path with audio-master lineage", () => {
  assert.throws(() => assertReserveMotion({ provider: "Kling", video_url: "https://example.com/motion.mp4" }), { code: "unsupported_motion_provider_capability" });
  assert.throws(() => assertReserveMotion({ provider: "HeyGen", path_role: "canonical_reserve_lip_sync", capability_status: "supported", video_url: "https://files2.heygen.ai/motion.mp4" }), { code: "invalid_motion_audio_lineage" });
  assert.equal(assertReserveMotion({
    provider: "HeyGen",
    path_role: "canonical_reserve_lip_sync",
    capability_status: "supported",
    voice_source: "audio_master",
    audio_segment_ref: "AMS03",
    video_url: "https://files2.heygen.ai/motion.mp4",
  }), "https://files2.heygen.ai/motion.mp4");
});

test("video worker fails closed without canonical audio master metadata", () => {
  assert.throws(() => validateAudioMasterContract(null), { code: "missing_audio_master" });
  assert.throws(() => validateAudioMasterContract({ provider: "HeyGen" }), { code: "invalid_audio_master_provider" });
  const valid = validateAudioMasterContract({
    provider: "ElevenLabs",
    voice_id: "lxYfHSkYm1EzQzGhdbfc",
    no_leading_silence: true,
    continuous_voice: true,
    master_ref: "CAESTHETIC/CAESTHETIC MEDIA/Production/reels/CAE-REEL-001/audio/master.wav",
    timestamps_ref: "CAESTHETIC/CAESTHETIC MEDIA/Production/reels/CAE-REEL-001/audio/master.timestamps.json",
    segments: [{ segment_id: "AMS01", scene_id: "S01", order: 1, text_anchor: "Opening line." }],
  });
  assert.equal(valid.voice_id, "lxYfHSkYm1EzQzGhdbfc");
  assert.deepEqual(validateMasterTimestamps({ segments: [{ segment_id: "AMS01", scene_id: "S01", start_s: 0, end_s: 1.5 }] }, valid), [
    { segment_id: "AMS01", scene_id: "S01", start_s: 0, end_s: 1.5 },
  ]);
  assert.throws(() => validateMasterTimestamps({ segments: [{ segment_id: "AMS01", scene_id: "S01", start_s: 0.1, end_s: 1.5 }] }, valid), { code: "audio_master_must_start_at_zero" });
});

test("opening master begins speech at frame 0 without artificial silence", () => {
  const opening = episode.match(/  - scene_id: S01[\s\S]*?(?=\n  - scene_id: S02)/)?.[0];
  assert.ok(opening, "S01 opening contract must exist");
  assert.match(opening, /starts_at_frame: 0/);
  assert.match(opening, /leading_silence_s: 0/);
  assert.match(opening, /continuous_through_1a_1b: true/);
  assert.doesNotMatch(opening, /silent_open_s|starts_after_headline_exit|silent_motion_plate/);
});
