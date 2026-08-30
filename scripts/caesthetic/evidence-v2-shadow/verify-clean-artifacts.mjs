import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function fail(code, target, detail = "") {
  throw Object.assign(new Error(`${code}:${target}${detail ? `:${detail}` : ""}`), {code, target, detail});
}
function inside(child, parent) {
  const rel = path.relative(parent, child);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
function assertNoSymlinkPath(root, target) {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) fail("artifact_path_escape", target);
  let cursor = root;
  for (const segment of relative.split(path.sep)) {
    cursor = path.join(cursor, segment);
    const stat = fs.lstatSync(cursor);
    if (stat.isSymbolicLink()) fail("artifact_symlink_forbidden", cursor);
  }
}
function sniffMime(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (bytes.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp") return "video/mp4";
  try {
    const decoded = new TextDecoder("utf-8", {fatal: true}).decode(bytes);
    if (!decoded.includes("\u0000")) {
      try { JSON.parse(decoded); return "application/json"; } catch {}
      return "text/plain";
    }
  } catch {}
  return "application/octet-stream";
}

export function verifyCleanArtifacts(unit, unitDirectory) {
  const cleanRootLexical = path.resolve(unitDirectory, "clean");
  if (!fs.existsSync(cleanRootLexical)) fail("clean_root_missing", cleanRootLexical);
  const cleanRootStat = fs.lstatSync(cleanRootLexical);
  if (!cleanRootStat.isDirectory() || cleanRootStat.isSymbolicLink()) fail("clean_root_invalid", cleanRootLexical);
  const cleanRootReal = fs.realpathSync(cleanRootLexical);
  const verified = [];

  for (const artifact of unit.clean_artifacts) {
    if (!artifact.relative_path.startsWith("clean/")) fail("raw_or_non_clean_artifact_forbidden", artifact.relative_path);
    const lexical = path.resolve(unitDirectory, artifact.relative_path);
    if (!inside(lexical, path.resolve(unitDirectory))) fail("artifact_path_escape", artifact.relative_path);
    if (!fs.existsSync(lexical)) fail("artifact_missing", artifact.relative_path);
    assertNoSymlinkPath(path.resolve(unitDirectory), lexical);
    const real = fs.realpathSync(lexical);
    if (!inside(real, cleanRootReal)) fail("artifact_realpath_escape", artifact.relative_path);
    const stat = fs.statSync(real);
    if (!stat.isFile()) fail("artifact_not_regular_file", artifact.relative_path);
    if (stat.size !== artifact.byte_size) fail("artifact_size_mismatch", artifact.relative_path, `${stat.size}!=${artifact.byte_size}`);
    const bytes = fs.readFileSync(real);
    const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
    if (sha256 !== artifact.sha256) fail("artifact_sha256_mismatch", artifact.relative_path);
    const detectedMime = sniffMime(bytes);
    if (detectedMime !== artifact.media_type) fail("artifact_mime_mismatch", artifact.relative_path, `${detectedMime}!=${artifact.media_type}`);
    verified.push(Object.freeze({
      artifact_id: artifact.artifact_id,
      relative_path: artifact.relative_path,
      media_type: artifact.media_type,
      byte_size: artifact.byte_size,
      sha256,
      created_at: artifact.created_at,
      expires_at: artifact.expires_at,
      source_realpath: real,
    }));
  }
  return Object.freeze(verified);
}

export function stageVerifiedArtifacts(verifiedArtifacts, stagingRoot, renderRequestId) {
  const requestRoot = path.resolve(stagingRoot, renderRequestId);
  if (fs.existsSync(requestRoot)) fail("staging_request_exists", renderRequestId);
  fs.mkdirSync(requestRoot, {recursive: false, mode: 0o700});
  const staged = [];
  for (const artifact of verifiedArtifacts) {
    const ext = path.extname(artifact.relative_path).toLowerCase();
    const filename = `${artifact.sha256}${ext}`;
    const target = path.join(requestRoot, filename);
    fs.copyFileSync(artifact.source_realpath, target, fs.constants.COPYFILE_EXCL);
    fs.chmodSync(target, 0o400);
    const copied = fs.readFileSync(target);
    const copiedHash = crypto.createHash("sha256").update(copied).digest("hex");
    if (copiedHash !== artifact.sha256) fail("staging_sha256_mismatch", artifact.artifact_id);
    staged.push(Object.freeze({
      artifact_id: artifact.artifact_id,
      staged_path: target,
      media_type: artifact.media_type,
      byte_size: artifact.byte_size,
      sha256: artifact.sha256,
      expires_at: artifact.expires_at,
    }));
  }
  fs.chmodSync(requestRoot, 0o500);
  return Object.freeze(staged);
}
