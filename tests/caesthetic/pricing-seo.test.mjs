import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const PATH = resolve(REPO, "site-caesthetic/pricing/index.html");
const CANONICAL = "https://caesthetic.com/pricing/";

function tags(source, name) {
  return source.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) || [];
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return match ? match[1] ?? match[2] : "";
}

test("US-English pricing page has complete canonical SEO metadata", () => {
  const source = readFileSync(PATH, "utf8");
  assert.match(source, /<html\b[^>]*\blang=["']en-US["']/i);
  assert.match(source, /<title\b[^>]*>[^<]+<\/title>/i);
  assert.ok(tags(source, "meta").some((tag) => attribute(tag, "name") === "description" && attribute(tag, "content")));

  const canonicals = tags(source, "link").filter((tag) => attribute(tag, "rel") === "canonical");
  assert.equal(canonicals.length, 1);
  assert.equal(attribute(canonicals[0], "href"), CANONICAL);

  const alternates = tags(source, "link").filter((tag) => attribute(tag, "rel") === "alternate");
  assert.deepEqual(
    Object.fromEntries(alternates.map((tag) => [attribute(tag, "hreflang"), attribute(tag, "href")])),
    { en: CANONICAL, "x-default": CANONICAL },
  );
  assert.doesNotMatch(source, /AggregateOffer/i);

  const og = Object.fromEntries(
    tags(source, "meta")
      .filter((tag) => attribute(tag, "property").startsWith("og:"))
      .map((tag) => [attribute(tag, "property"), attribute(tag, "content")]),
  );
  assert.equal(og["og:type"], "website");
  assert.equal(og["og:url"], CANONICAL);
  assert.ok(og["og:title"] && og["og:description"] && og["og:image"]);
});
