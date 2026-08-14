import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  matchedResponse,
  normalizeInstagramUsername,
  notFoundResponse,
} from "../../supabase/functions/lookup-caesthetic-instagram/contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("normalizes explicit Instagram username representations", () => {
  for (const input of [
    "Practice.Name",
    " @Practice.Name ",
    "https://instagram.com/Practice.Name/",
    "https://www.instagram.com/Practice.Name/?hl=en",
    "instagram.com/Practice.Name",
  ]) {
    assert.equal(normalizeInstagramUsername(input), "practice.name");
  }
});

test("rejects invalid, ambiguous and inferential username inputs", () => {
  for (const input of [
    "",
    null,
    "practice-name",
    "practice name",
    "https://example.com/practice.name",
    "https://instagram.com/p/ABC123/",
    "https://instagram.com/practice.name/extra",
    "a".repeat(31),
  ]) {
    assert.equal(normalizeInstagramUsername(input), "");
  }
  assert.notEqual(
    normalizeInstagramUsername("practice.name"),
    normalizeInstagramUsername("practice_name"),
  );
});

test("matched and not_found responses keep the stable ManyChat mapping shape", () => {
  assert.deepEqual(notFoundResponse(), {
    status: "not_found",
    practice_name: "",
    city_state: "",
    website: "",
  });
  assert.deepEqual(
    matchedResponse({
      practice_name: " Exact Practice ",
      city_state: " Austin, TX ",
      website: " https://example.test ",
    }),
    {
      status: "matched",
      practice_name: "Exact Practice",
      city_state: "Austin, TX",
      website: "https://example.test",
    },
  );
});

test("matched rows preserve status while missing source fields stay empty", () => {
  assert.deepEqual(matchedResponse({ practice_name: "Known Practice" }), {
    status: "matched",
    practice_name: "Known Practice",
    city_state: "",
    website: "",
  });
});

test("edge handler performs one exact normalized equality lookup and always maps failures", () => {
  const source = fs.readFileSync(
    path.join(root, "supabase/functions/lookup-caesthetic-instagram/index.ts"),
    "utf8",
  );
  assert.match(source, /\.eq\("username_normalized", username\)/);
  assert.match(source, /status: 200/);
  assert.match(source, /notFoundResponse\(\)/);
  assert.doesNotMatch(source, /\.ilike\(|\.like\(|similarity|levenshtein|openai|anthropic/i);
  assert.doesNotMatch(source, /business_name.*eq|practice_name.*eq|city_state.*eq/);
});

test("migration keeps the lookup projection private and atomically replaceable", () => {
  const migration = fs.readFileSync(
    path.join(
      root,
      "supabase/migrations/20260814160000_caesthetic_instagram_lookup_projection.sql",
    ),
    "utf8",
  );
  assert.match(migration, /username_normalized text\s+PRIMARY KEY/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL ON TABLE[\s\S]+FROM PUBLIC, anon, authenticated/);
  assert.match(migration, /replace_caesthetic_instagram_lookup_projection/);
  assert.match(migration, /DELETE FROM caesthetic_instagram_lookup_projection/);
  assert.match(migration, /TO service_role/);
});

test("deploy hook refreshes VDS runtime and private projection for the lookup slug", () => {
  const hook = fs.readFileSync(
    path.join(root, "scripts/ci/deploy-functions-hook.sh"),
    "utf8",
  );
  assert.match(hook, /LOOKUP_SLUG="lookup-caesthetic-instagram"/);
  assert.match(hook, /scripts\/ci\/update-vds-edge\.sh/);
  assert.match(hook, /sync_instagram_lookup_projection\.py/);
  assert.match(hook, /https:\/\/evo\.do\/api\/v1\/\$LOOKUP_SLUG/);
});

test("CAESTHETIC SSOT pins the API and ManyChat Response Mapping fields", () => {
  const ssot = fs.readFileSync(path.join(root, "docs/ssot/CAESTHETIC.md"), "utf8");
  assert.match(ssot, /POST https:\/\/evo\.do\/api\/v1\/lookup-caesthetic-instagram/);
  assert.match(ssot, /cae_lookup_status/);
  assert.match(ssot, /cae_candidate_name/);
  assert.match(ssot, /cae_candidate_city/);
  assert.match(ssot, /cae_candidate_website/);
  assert.match(ssot, /exact normalized username equality/);
});
