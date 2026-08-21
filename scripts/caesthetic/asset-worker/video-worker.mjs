#!/usr/bin/env node
/**
 * CAESTHETIC Daily Growth Note video assembly worker.
 * Safe operations only: assemble_episode, video_qa.
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { spawnSync } from "node:child_process";
import {
  REPO_ROOT,
  STORAGE_PATH,
  RCLONE_REMOTE,
  assertCanonicalAgentHost,
  assertRequestId,
  runtimeHostInfo,
} from "./allowlist.mjs";
import { buildBridgeResult } from "./worker.mjs";

const RESULTS_DIR = path.join(REPO_ROOT, "docs/agent-api/results");
const VIDEO_OPS = new Set(["assemble_episode", "video_qa"]);
const HUCK_STORIES = "CAESTHETIC/CAESTHETIC MEDIA/Huck/stories";
const HUCK_REELS = "CAESTHETIC/CAESTHETIC MEDIA/Huck/reels";
const CREAM = "E6EDF0"; // ASS BGR for #F0EDE6
const BURGUNDY = "4B247B"; // ASS BGR for #7B244B

function currentRepoSha() {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8", timeout: 10000 });
  const value = String(r.stdout || "").trim();
  return r.status === 0 && /^[a-f0-9]{40}$/i.test(value) ? value : null;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd || REPO_ROOT,
    encoding: "utf8",
    timeout: opts.timeout ?? 300000,
    env: process.env,
  });
  if (r.error) throw Object.assign(new Error(`spawn_failed:${cmd}`), { code: "spawn_failed" });
  if (r.status !== 0) {
    const details = String(r.stderr || r.stdout || "").trim().slice(0, 1200);
    throw Object.assign(new Error(`${cmd}_failed:${r.status}`), { code: `${cmd}_failed`, details });
  }
  return String(r.stdout || "").trim();
}

function remote(rel) {
  const prefix = RCLONE_REMOTE.endsWith(":") ? RCLONE_REMOTE : `${RCLONE_REMOTE}:`;
  return `${prefix}${rel}`;
}

function rclone(args, opts = {}) {
  return run("rclone", args, { timeout: opts.timeout ?? 300000 });
}

function writeResult(outputPath, result) {
  const resolved = path.resolve(outputPath);
  const base = path.resolve(RESULTS_DIR);
  if (!resolved.startsWith(base + path.sep)) throw new Error("video_bridge_output_not_whitelisted");
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(result, null, 2)}\n`);
  return resolved;
}

function resolveRequest(args) {
  const inputPath = path.resolve(path.isAbsolute(args.input) ? args.input : path.join(REPO_ROOT, args.input));
  const reqBase = path.resolve(REPO_ROOT, "docs/agent-api/requests");
  if (!inputPath.startsWith(reqBase + path.sep)) throw new Error("video_bridge_input_not_whitelisted");
  const req = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const requestId = assertRequestId(req.request_id || path.basename(inputPath, ".json"));
  req.request_id = requestId;
  const outputPath = path.join(RESULTS_DIR, `${requestId}.json`);
  return { inputPath, outputPath, req, requestId };
}

function probe(file) {
  const raw = run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size:stream=codec_type,width,height",
    "-of", "json",
    file,
  ], { timeout: 30000 });
  return JSON.parse(raw);
}

function videoDuration(file) {
  const data = probe(file);
  return Number(data?.format?.duration || 0);
}

function assTime(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = (s % 60).toFixed(2).padStart(5, "0");
  return `${h}:${String(m).padStart(2, "0")}:${ss}`;
}

function assEscape(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\n/g, "\\N");
}

function chunkWords(words, maxWords = 6) {
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) chunks.push(words.slice(i, i + maxWords));
  return chunks;
}

function wrapChunk(words) {
  const joined = words.join(" ");
  if (joined.length <= 30 || words.length < 4) return words;
  let best = 1;
  let delta = Infinity;
  for (let i = 1; i < words.length; i += 1) {
    const left = words.slice(0, i).join(" ").length;
    const right = words.slice(i).join(" ").length;
    const d = Math.abs(left - right);
    if (d < delta) { best = i; delta = d; }
  }
  return [...words.slice(0, best), "__BREAK__", ...words.slice(best)];
}

function writeKaraokeAss(script, duration, outPath, timedWords = null, timelineOffset = 0) {
  const words = String(script || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) throw Object.assign(new Error("missing_motion_script"), { code: "missing_motion_script" });
  const chunks = chunkWords(words, 6);
  const weights = words.map((w) => Math.max(2, w.replace(/[^A-Za-z0-9]/g, "").length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const usable = Math.max(0.5, duration - 0.1);
  let cursor = 0.05;
  let globalIndex = 0;
  const events = [];

  for (const chunk of chunks) {
    for (let local = 0; local < chunk.length; local += 1) {
      const w = chunk[local];
      const span = usable * (weights[globalIndex] / totalWeight);
      const start = cursor;
      const end = Math.min(duration, cursor + span);
      const layout = wrapChunk(chunk);
      let seen = 0;
      const rendered = layout.map((token) => {
        if (token === "__BREAK__") return "\\N";
        const isActive = seen === local;
        seen += 1;
        const safe = assEscape(token);
        return isActive ? `{\\c&H${BURGUNDY}&}${safe}{\\c&H${CREAM}&}` : safe;
      }).join(" ").replace(/ \\N /g, "\\N");
      events.push(`Dialogue: 0,${assTime(start)},${assTime(end)},Karaoke,,0,0,0,,${rendered}`);
      cursor = end;
      globalIndex += 1;
    }
  }

  if (Array.isArray(timedWords) && timedWords.length) {
    events.length = 0;
    for (const word of timedWords) {
      const start = Math.max(0, Number(word.start_s) - timelineOffset);
      const end = Math.min(duration, Number(word.end_s) - timelineOffset);
      events.push(`Dialogue: 0,${assTime(start)},${assTime(end)},Karaoke,,0,0,0,,{\\c&H${BURGUNDY}&}${assEscape(word.text)}{\\c&H${CREAM}&}`);
    }
  }

  const ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Karaoke,IBM Plex Sans,48,&H00${CREAM},&H00${CREAM},&H000B2438,&H8838240B,-1,0,0,0,100,100,0,0,3,0,0,2,110,110,285,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n${events.join("\n")}\n`;
  fs.writeFileSync(outPath, ass);
}

function assertReserveMotion(raw) {
  if (raw?.provider !== "HeyGen" || raw?.path_role !== "canonical_reserve_lip_sync" || raw?.capability_status !== "supported") {
    throw Object.assign(new Error("unsupported_motion_provider_capability"), { code: "unsupported_motion_provider_capability" });
  }
  if (raw?.voice_source !== "audio_master" || !raw?.audio_segment_ref) {
    throw Object.assign(new Error("invalid_motion_audio_lineage"), { code: "invalid_motion_audio_lineage" });
  }
  const source = raw.video_url;
  const u = new URL(String(source || ""));
  const host = u.hostname.toLowerCase();
  if (u.protocol !== "https:" || !(host === "files2.heygen.ai" || host.endsWith(".heygen.ai"))) {
    throw Object.assign(new Error("forbidden_motion_url"), { code: "forbidden_motion_url" });
  }
  if (!u.pathname.toLowerCase().endsWith(".mp4")) {
    throw Object.assign(new Error("motion_url_not_mp4"), { code: "motion_url_not_mp4" });
  }
  return u.toString();
}

async function downloadHttps(url, dest, redirects = 0) {
  if (redirects > 5) throw new Error("too_many_redirects");
  await new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "caesthetic-video-worker/1" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        downloadHttps(next, dest, redirects + 1).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`download_http_${res.statusCode}`));
        return;
      }
      const out = fs.createWriteStream(dest, { mode: 0o600 });
      res.pipe(out);
      out.on("finish", () => out.close(resolve));
      out.on("error", reject);
    });
    req.setTimeout(120000, () => req.destroy(new Error("download_timeout")));
    req.on("error", reject);
  });
}

function clampMs(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function validateAudioMasterContract(raw) {
  const audio = raw && typeof raw === "object" ? raw : null;
  if (!audio) throw Object.assign(new Error("missing_audio_master"), { code: "missing_audio_master" });
  if (audio.provider !== "ElevenLabs") throw Object.assign(new Error("invalid_audio_master_provider"), { code: "invalid_audio_master_provider" });
  if (audio.voice_id !== "lxYfHSkYm1EzQzGhdbfc") throw Object.assign(new Error("invalid_valerie_voice_id"), { code: "invalid_valerie_voice_id" });
  if (audio.no_leading_silence !== true || audio.continuous_voice !== true) {
    throw Object.assign(new Error("invalid_audio_master_continuity"), { code: "invalid_audio_master_continuity" });
  }
  const masterRef = String(audio.master_ref || "");
  const timestampsRef = String(audio.timestamps_ref || "");
  const prefix = "CAESTHETIC/CAESTHETIC MEDIA/Production/reels/";
  if (!masterRef.startsWith(prefix) || !/\.(wav|mp3|m4a)$/i.test(masterRef)) {
    throw Object.assign(new Error("invalid_audio_master_ref"), { code: "invalid_audio_master_ref" });
  }
  if (!timestampsRef.startsWith(prefix) || !timestampsRef.endsWith(".json")) {
    throw Object.assign(new Error("invalid_audio_timestamps_ref"), { code: "invalid_audio_timestamps_ref" });
  }
  const segments = Array.isArray(audio.segments) ? audio.segments : [];
  if (!segments.length || segments.some((s, i) => !s || s.order !== i + 1 || !s.segment_id || !s.scene_id)) {
    throw Object.assign(new Error("invalid_audio_master_segments"), { code: "invalid_audio_master_segments" });
  }
  return { ...audio, master_ref: masterRef, timestamps_ref: timestampsRef, segments };
}

function validateMasterTimestamps(raw, contract) {
  const timed = Array.isArray(raw?.segments) ? raw.segments : [];
  if (timed.length !== contract.segments.length) {
    throw Object.assign(new Error("audio_timestamp_coverage_mismatch"), { code: "audio_timestamp_coverage_mismatch" });
  }
  let previousEnd = 0;
  for (let i = 0; i < timed.length; i += 1) {
    const segment = timed[i];
    const expected = contract.segments[i];
    const start = Number(segment?.start_s);
    const end = Number(segment?.end_s);
    if (segment?.segment_id !== expected.segment_id || segment?.scene_id !== expected.scene_id || !Number.isFinite(start) || !Number.isFinite(end) || end <= start || start < previousEnd) {
      throw Object.assign(new Error("invalid_audio_timestamp_segments"), { code: "invalid_audio_timestamp_segments" });
    }
    const text = String(segment?.text || expected.text_anchor || "").trim();
    if (!text) throw Object.assign(new Error("missing_audio_timestamp_text"), { code: "missing_audio_timestamp_text" });
    if (Array.isArray(segment?.words)) {
      let previousWordEnd = start;
      for (const word of segment.words) {
        const wordStart = Number(word?.start_s);
        const wordEnd = Number(word?.end_s);
        if (!word?.text || !Number.isFinite(wordStart) || !Number.isFinite(wordEnd) || wordEnd <= wordStart || wordStart < previousWordEnd || wordStart < start || wordEnd > end) {
          throw Object.assign(new Error("invalid_audio_word_timestamps"), { code: "invalid_audio_word_timestamps" });
        }
        previousWordEnd = wordEnd;
      }
    }
    if (i === 0 && start !== 0) throw Object.assign(new Error("audio_master_must_start_at_zero"), { code: "audio_master_must_start_at_zero" });
    previousEnd = end;
  }
  return timed;
}

function makeStillSegment(image, durationSec, out) {
  run("ffmpeg", [
    "-y", "-loop", "1", "-framerate", "30", "-t", String(durationSec), "-i", image,
    "-f", "lavfi", "-t", String(durationSec), "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
    "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
    "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2", "-shortest", out,
  ]);
}

function captionMotion(input, timedSegment, fallbackText, outDir, label) {
  const duration = videoDuration(input);
  const segmentDuration = Number(timedSegment.end_s) - Number(timedSegment.start_s);
  if (Math.abs(duration - segmentDuration) > 0.5) {
    throw Object.assign(new Error("motion_duration_does_not_match_audio_segment"), { code: "motion_duration_does_not_match_audio_segment" });
  }
  const script = String(timedSegment.text || fallbackText || "").trim();
  const assPath = path.join(outDir, `${label}.ass`);
  const out = path.join(outDir, `${label}-captioned.mp4`);
  writeKaraokeAss(script, duration, assPath, timedSegment.words, Number(timedSegment.start_s));
  run("ffmpeg", [
    "-y", "-i", input,
    "-vf", `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,ass=${assPath}`,
    "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", out,
  ]);
  return { out, duration };
}

function ensureAssetSet(assetRequestId, episode) {
  const rid = assertRequestId(assetRequestId);
  const localDir = path.join(STORAGE_PATH, "generated", "stories", rid);
  fs.mkdirSync(localDir, { recursive: true });
  const prefix = String(episode).padStart(3, "0");
  const names = {
    opener: `${prefix}-editorial_opener.png`,
    evidence: `${prefix}-evidence_explanation.png`,
    pause: `${prefix}-pause_trigger.png`,
    closing: `${prefix}-closing_card.png`,
  };
  const missing = Object.values(names).filter((n) => !fs.existsSync(path.join(localDir, n)));
  if (missing.length) {
    rclone(["copy", remote(`${HUCK_STORIES}/${rid}`), localDir, "--include", "*.png", "--include", "qa-report.json"]);
  }
  for (const n of Object.values(names)) {
    if (!fs.existsSync(path.join(localDir, n))) throw Object.assign(new Error(`missing_asset:${n}`), { code: "missing_asset" });
  }
  const qaPath = path.join(localDir, "qa-report.json");
  let qaPass = true;
  if (fs.existsSync(qaPath)) {
    const qa = JSON.parse(fs.readFileSync(qaPath, "utf8"));
    qaPass = Array.isArray(qa.cards) && qa.cards.length >= 4 && qa.cards.every((c) => c.pass === true);
  }
  if (!qaPass) throw Object.assign(new Error("asset_qa_failed"), { code: "asset_qa_failed" });
  return { localDir, names };
}

function validateFinalVideo(file, expectedMin = 20, expectedMax = 35) {
  const p = probe(file);
  const streams = Array.isArray(p.streams) ? p.streams : [];
  const video = streams.find((s) => s.codec_type === "video");
  const audio = streams.find((s) => s.codec_type === "audio");
  const duration = Number(p?.format?.duration || 0);
  const size = Number(p?.format?.size || 0);
  const checks = {
    exists: fs.existsSync(file),
    dimensions: Number(video?.width) === 1080 && Number(video?.height) === 1920,
    duration: duration >= expectedMin && duration <= expectedMax,
    video_stream: Boolean(video),
    audio_stream: Boolean(audio),
    size: size > 100000,
    sequence: true,
    captions: true,
    asset_qa: true,
  };
  return { pass: Object.values(checks).every(Boolean), checks, duration, size, width: video?.width || null, height: video?.height || null };
}

async function assembleEpisode(req, context = {}) {
  const setStage = typeof context.onStage === "function" ? context.onStage : () => {};
  assertCanonicalAgentHost();
  const params = req.params && typeof req.params === "object" ? req.params : {};
  const requestId = assertRequestId(req.request_id);
  const assetRequestId = assertRequestId(params.assets_request_id);
  const episode = Number(params.episode || 1);
  if (!Number.isInteger(episode) || episode < 1 || episode > 999) throw new Error("invalid_episode");
  const motion = Array.isArray(params.motion) ? params.motion : [];
  if (motion.length !== 2) throw Object.assign(new Error("motion_requires_two_clips"), { code: "motion_requires_two_clips" });
  if (new Set(motion.map((item) => item?.audio_segment_ref)).size !== motion.length) {
    throw Object.assign(new Error("duplicate_motion_audio_segment_ref"), { code: "duplicate_motion_audio_segment_ref" });
  }
  if (motion.some((item) => item?.tts || item?.voice_id || item?.audio_script || item?.script || item?.spoken_text)) {
    throw Object.assign(new Error("per_scene_tts_forbidden"), { code: "per_scene_tts_forbidden" });
  }
  const audioMaster = validateAudioMasterContract(params.audio_master);

  const timings = {
    opener: clampMs(params.timings?.opener_ms, 2000, 1500, 4000) / 1000,
    evidence: clampMs(params.timings?.evidence_ms, 5000, 3000, 7000) / 1000,
    pause: clampMs(params.timings?.pause_ms, 2000, 1000, 3000) / 1000,
    closing: clampMs(params.timings?.closing_ms, 3000, 2000, 5000) / 1000,
  };

  setStage("resolve_assets");
  const { localDir, names } = ensureAssetSet(assetRequestId, episode);
  const workDir = path.join(STORAGE_PATH, "processing", requestId, "video");
  const outDir = path.join(STORAGE_PATH, "generated", "reels", requestId);
  fs.rmSync(path.join(STORAGE_PATH, "processing", requestId), { recursive: true, force: true });
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  setStage("resolve_audio_master");
  const audioMasterFile = path.join(workDir, `audio-master${path.extname(audioMaster.master_ref).toLowerCase()}`);
  const timestampsFile = path.join(workDir, "audio-master.timestamps.json");
  rclone(["copyto", remote(audioMaster.master_ref), audioMasterFile]);
  rclone(["copyto", remote(audioMaster.timestamps_ref), timestampsFile]);
  const audioProbe = probe(audioMasterFile);
  if (!(audioProbe.streams || []).some((stream) => stream.codec_type === "audio")) {
    throw Object.assign(new Error("audio_master_has_no_audio_stream"), { code: "audio_master_has_no_audio_stream" });
  }
  const timedSegments = validateMasterTimestamps(JSON.parse(fs.readFileSync(timestampsFile, "utf8")), audioMaster);

  setStage("download_motion");
  const motionFiles = [];
  for (let i = 0; i < motion.length; i += 1) {
    const url = assertReserveMotion(motion[i]);
    if (!audioMaster.segments.some((segment) => segment.segment_id === motion[i].audio_segment_ref)) {
      throw Object.assign(new Error("unknown_motion_audio_segment_ref"), { code: "unknown_motion_audio_segment_ref" });
    }
    const dest = path.join(workDir, `motion-${i + 1}.mp4`);
    await downloadHttps(url, dest);
    motionFiles.push(dest);
  }

  setStage("caption_render");
  const captioned = motion.map((entry, i) => {
    const index = audioMaster.segments.findIndex((segment) => segment.segment_id === entry.audio_segment_ref);
    return captionMotion(motionFiles[i], timedSegments[index], audioMaster.segments[index].text_anchor, workDir, `motion-${i + 1}`);
  });
  const [cap1, cap2] = captioned;

  setStage("segments");
  const seg = {
    opener: path.join(workDir, "01-opener.mp4"),
    evidence: path.join(workDir, "03-evidence.mp4"),
    pause: path.join(workDir, "04-pause.mp4"),
    closing: path.join(workDir, "06-closing.mp4"),
  };
  makeStillSegment(path.join(localDir, names.opener), timings.opener, seg.opener);
  makeStillSegment(path.join(localDir, names.evidence), timings.evidence, seg.evidence);
  makeStillSegment(path.join(localDir, names.pause), timings.pause, seg.pause);
  makeStillSegment(path.join(localDir, names.closing), timings.closing, seg.closing);

  setStage("assembly");
  const concatPath = path.join(workDir, "concat.txt");
  const ordered = [seg.opener, cap1.out, seg.evidence, seg.pause, cap2.out, seg.closing];
  fs.writeFileSync(concatPath, ordered.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n") + "\n");
  const visualPath = path.join(workDir, "visual-assembly.mp4");
  run("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0", "-i", concatPath,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30",
    "-an", visualPath,
  ], { timeout: 600000 });
  const finalName = `daily-growth-note-${String(episode).padStart(3, "0")}.mp4`;
  const finalPath = path.join(outDir, finalName);
  run("ffmpeg", [
    "-y", "-i", visualPath, "-i", audioMasterFile,
    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
    "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
    "-shortest", "-movflags", "+faststart", finalPath,
  ], { timeout: 600000 });

  setStage("video_qa");
  const qa = validateFinalVideo(finalPath, 20, 35);
  if (!qa.pass) throw Object.assign(new Error("video_qa_failed"), { code: "video_qa_failed", details: JSON.stringify(qa.checks) });
  const qaPath = path.join(outDir, "video-qa.json");
  fs.writeFileSync(qaPath, `${JSON.stringify({ episode, status: "qa_pass", qa }, null, 2)}\n`);

  setStage("upload");
  const dropboxDir = `${HUCK_REELS}/${requestId}`;
  rclone(["copy", outDir, remote(dropboxDir), "--include", "*.mp4", "--include", "video-qa.json"]);
  setStage("complete");

  return {
    ok: true,
    episode,
    file: finalName,
    local_file: finalPath,
    dropbox_dir: dropboxDir,
    qa,
    timings: { ...timings, motion_1: cap1.duration, motion_2: cap2.duration },
    audio_master: { provider: audioMaster.provider, voice_id: audioMaster.voice_id, master_ref: audioMaster.master_ref, timestamps_ref: audioMaster.timestamps_ref },
  };
}

function locateFinal(params) {
  const assemblyId = assertRequestId(params.assembly_request_id || params.request_id);
  const episode = Number(params.episode || 1);
  const file = `daily-growth-note-${String(episode).padStart(3, "0")}.mp4`;
  const localDir = path.join(STORAGE_PATH, "generated", "reels", assemblyId);
  fs.mkdirSync(localDir, { recursive: true });
  const localFile = path.join(localDir, file);
  if (!fs.existsSync(localFile)) {
    rclone(["copyto", remote(`${HUCK_REELS}/${assemblyId}/${file}`), localFile]);
  }
  return { localFile, file, assemblyId };
}

function videoQa(req, context = {}) {
  const setStage = typeof context.onStage === "function" ? context.onStage : () => {};
  assertCanonicalAgentHost();
  const params = req.params && typeof req.params === "object" ? req.params : {};
  setStage("video_qa");
  const { localFile, file, assemblyId } = locateFinal(params);
  const qa = validateFinalVideo(localFile, 20, 35);
  if (!qa.pass) throw Object.assign(new Error("video_qa_failed"), { code: "video_qa_failed", details: JSON.stringify(qa.checks) });
  setStage("complete");
  return { ok: true, status: "qa_pass", assembly_request_id: assemblyId, file, qa };
}

function supportsVideoOperation(op) {
  return VIDEO_OPS.has(String(op || ""));
}

function markVideoProcessing(args) {
  const { outputPath, req } = resolveRequest(args);
  const now = new Date().toISOString();
  return writeResult(outputPath, buildBridgeResult(req, {
    status: "processing",
    ok: false,
    stage: "received",
    attempt: 1,
    started_at: now,
    heartbeat_at: now,
    repo_sha: currentRepoSha(),
    warnings: ["channel: caesthetic-video-worker", "forbidden: arbitrary_shell"],
    errors: [],
  }));
}

async function cmdVideoBridge(args) {
  const { outputPath, req } = resolveRequest(args);
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  let stage = "received";
  const onStage = (value) => { stage = value; };
  try {
    if (String(req.type || "") !== "caesthetic_assets") throw Object.assign(new Error("invalid_type"), { code: "invalid_type" });
    if (!supportsVideoOperation(req.operation)) throw Object.assign(new Error(`forbidden_video_operation:${req.operation}`), { code: "forbidden_operation" });
    const data = req.operation === "assemble_episode" ? await assembleEpisode(req, { onStage }) : videoQa(req, { onStage });
    return writeResult(outputPath, buildBridgeResult(req, {
      status: "success",
      ok: true,
      stage: "complete",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedMs,
      repo_sha: currentRepoSha(),
      data,
      warnings: ["channel: caesthetic-video-worker", "forbidden: arbitrary_shell"],
      errors: [],
    }));
  } catch (err) {
    return writeResult(outputPath, buildBridgeResult(req, {
      status: "error",
      ok: false,
      stage,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedMs,
      repo_sha: currentRepoSha(),
      data: null,
      warnings: ["channel: caesthetic-video-worker", "forbidden: arbitrary_shell"],
      errors: [{ message: err.message, code: err.code || "internal", stage, details: err.details || null, retryable: false }],
    }));
  }
}

export { assembleEpisode, assertReserveMotion, cmdVideoBridge, markVideoProcessing, supportsVideoOperation, validateAudioMasterContract, validateFinalVideo, validateMasterTimestamps, videoQa, writeKaraokeAss };
