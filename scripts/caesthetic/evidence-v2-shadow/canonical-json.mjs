import crypto from "node:crypto";

function fail(code, message = code) {
  throw Object.assign(new Error(message), { code });
}

function assertIJsonString(value) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) fail("jcs_unpaired_surrogate");
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      fail("jcs_unpaired_surrogate");
    }
  }
}

export function canonicalize(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "string") {
    assertIJsonString(value);
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("jcs_non_finite_number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => {
      if (item === undefined || typeof item === "function" || typeof item === "symbol") {
        fail("jcs_unrepresentable_array_value");
      }
      return canonicalize(item);
    }).join(",")}]`;
  }
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) fail("jcs_non_plain_object");
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => {
      assertIJsonString(key);
      const item = value[key];
      if (item === undefined || typeof item === "function" || typeof item === "symbol") {
        fail("jcs_unrepresentable_object_value");
      }
      return `${JSON.stringify(key)}:${canonicalize(item)}`;
    }).join(",")}}`;
  }
  fail("jcs_unsupported_type");
}

export function canonicalBytes(value) {
  return Buffer.from(canonicalize(value), "utf8");
}

export function sha256Hex(value) {
  const bytes = Buffer.isBuffer(value) ? value : canonicalBytes(value);
  return crypto.createHash("sha256").update(bytes).digest("hex");
}
