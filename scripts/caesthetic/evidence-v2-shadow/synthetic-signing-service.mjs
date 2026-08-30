import crypto from "node:crypto";
import {canonicalBytes} from "./canonical-json.mjs";

function fail(code, detail = "") {
  throw Object.assign(new Error(`${code}${detail ? `:${detail}` : ""}`), {code, detail});
}
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
}
function secretBytes(secret) {
  const bytes = Buffer.isBuffer(secret) ? Buffer.from(secret) : Buffer.from(String(secret), "utf8");
  if (bytes.length < 32) fail("hmac_secret_too_short");
  return bytes;
}

export class SyntheticSigningService {
  #keys = new Map();

  constructor(keys) {
    for (const key of keys) this.addKey(key);
  }

  addKey({key_id, secret, status = "active"}) {
    if (!["active", "retired", "revoked"].includes(status)) fail("invalid_key_status", status);
    if (this.#keys.has(key_id)) fail("duplicate_key_id", key_id);
    this.#keys.set(key_id, {secret: secretBytes(secret), status});
  }

  setStatus(keyId, status) {
    if (!["active", "retired", "revoked"].includes(status)) fail("invalid_key_status", status);
    const key = this.#keys.get(keyId);
    if (!key) fail("unknown_key_id", keyId);
    key.status = status;
  }

  sign(payload, keyId) {
    const key = this.#keys.get(keyId);
    if (!key) fail("unknown_key_id", keyId);
    if (key.status !== "active") fail(key.status === "revoked" ? "revoked_key" : "retired_key_signing_forbidden", keyId);
    const hmac_sha256 = crypto.createHmac("sha256", key.secret).update(canonicalBytes(payload)).digest("hex");
    return freeze({...structuredClone(payload), hmac_sha256});
  }

  verify(attestation) {
    const key = this.#keys.get(attestation?.key_id);
    if (!key) fail("unknown_key_id", attestation?.key_id);
    if (key.status === "revoked") fail("revoked_key", attestation.key_id);
    if (!/^[a-f0-9]{64}$/.test(attestation?.hmac_sha256 || "")) fail("invalid_hmac_encoding");
    const {hmac_sha256, ...payload} = attestation;
    const expected = crypto.createHmac("sha256", key.secret).update(canonicalBytes(payload)).digest();
    const actual = Buffer.from(hmac_sha256, "hex");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) fail("invalid_hmac");
    return freeze(structuredClone(payload));
  }

  describeKey(keyId) {
    const key = this.#keys.get(keyId);
    return key ? Object.freeze({key_id: keyId, status: key.status}) : null;
  }
}
