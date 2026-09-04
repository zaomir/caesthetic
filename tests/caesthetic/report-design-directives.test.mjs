import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inflateSync } from "node:zlib";

const root = resolve(new URL("../..", import.meta.url).pathname);
const renderer = readFileSync(resolve(root, "scripts/caesthetic/render-growth-score.mjs"), "utf8");
const css = readFileSync(resolve(root, "site-caesthetic/assets/css/growth-report-base.css"), "utf8");
const mobileCss = readFileSync(resolve(root, "site-caesthetic/assets/css/growth-report-mobile.css"), "utf8");
const report = readFileSync(resolve(root, "site-caesthetic/score/spoken-medspa-snellville-9d7f3a5c2e184b61/index.html"), "utf8");
const image = resolve(root, "site-caesthetic/assets/img/growth-score/lead-to-revenue-map.png");
const imageBytes = readFileSync(image);
const approvedImageSha256 = "9a2d659a52d26a1ea32626991856f7951e468a6602ff377e537155276480ccb6";

function inspectPng(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(buffer.subarray(0, 8).equals(signature), true, "PNG signature must be valid");

  let offset = 8;
  let header;
  let hasEnd = false;
  const imageData = [];

  while (offset < buffer.length) {
    assert.ok(offset + 12 <= buffer.length, "PNG chunk header must be complete");
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const end = offset + 12 + length;
    assert.ok(end <= buffer.length, `PNG chunk ${type} must fit within the file`);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "IDAT") {
      imageData.push(data);
    } else if (type === "IEND") {
      hasEnd = true;
      offset = end;
      break;
    }

    offset = end;
  }

  assert.ok(header, "PNG must contain IHDR");
  assert.equal(hasEnd, true, "PNG must contain IEND");
  assert.equal(offset, buffer.length, "PNG must not contain truncated or trailing data");
  assert.ok(imageData.length > 0, "PNG must contain image data");

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[header.colorType];
  assert.ok(channels, `PNG color type ${header.colorType} must be supported by the guard`);
  assert.equal(header.interlace, 0, "approved PNG must remain non-interlaced");
  const decoded = inflateSync(Buffer.concat(imageData));
  const scanlineBytes = Math.ceil((header.width * channels * header.bitDepth) / 8) + 1;
  assert.equal(decoded.length, scanlineBytes * header.height, "PNG image data must decode completely");

  return header;
}

test("Spoken report uses the approved Lead-to-Revenue image instead of Cross-Surface overview", () => {
  assert.equal(existsSync(image), true);
  assert.match(report, /lead-to-revenue-map\.png/);
  assert.doesNotMatch(report, /Cross-Surface Connections Overview/i);
  assert.match(renderer, /lead-to-revenue-map\.png/);
});

test("approved Lead-to-Revenue raster is complete, decodable, and hash-locked", () => {
  assert.equal(createHash("sha256").update(imageBytes).digest("hex"), approvedImageSha256);
  assert.deepEqual(inspectPng(imageBytes), {
    width: 1536,
    height: 1024,
    bitDepth: 8,
    colorType: 2,
    interlace: 0,
  });
});

test("report support cards are equal-height and Check500 is visible", () => {
  const supportCards = report.match(/<div class="cae-report-hero__support-grid">[\s\S]*?<\/div>/)?.[0] || "";
  assert.match(report, /cae-report-hero__support-grid/);
  assert.match(report, /cae-report-state cae-report-state--support/);
  assert.match(report, /What already works/);
  assert.match(report, /Fix first/);
  assert.match(css, /\.cae-report-hero__support-grid[\s\S]*align-items:\s*stretch/);
  assert.match(css, /\.cae-report-hero__support-grid\s*>\s*\.cae-report-state[\s\S]*height:\s*100%/);
  assert.match(mobileCss, /\.cae-report-hero__support-grid > \.cae-report-state--support\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(mobileCss, /\.cae-report-state--support > \.cae-kicker\s*\{[\s\S]*border-bottom:/);
  assert.match(renderer, /<li>\$\{escapeHtml\(item\)\}<\/li>/);
  assert.doesNotMatch(renderer, /strengths\.map\(\(item\) => `<li>✓/);
  assert.match(report, /<li>Strong Botox page and Ivy authority\.<\/li>/);
  assert.doesNotMatch(supportCards, /<li>\s*✓/);
  assert.match(report, /Lead-to-Revenue Check[\s\S]*\$500/);
});

test("Spoken report starts an ongoing content, GBP and reputation program", () => {
  assert.match(report, /Start in 30 days[\s\S]*Filler trust continuity trails Botox/);
  assert.doesNotMatch(report, /No long initiative was started\./);
  assert.match(report, /provider-led blog cadence/);
  assert.match(report, /Google Business Profile/);
  assert.match(report, /compliant all-patient Google review request and response cadence/);
  assert.match(report, /no filtering, incentives or review gating/);
  assert.match(report, /After Day 30:[\s\S]*Continue the blog and cross-surface publishing cadence/);
});

test("report keeps typography and spacing directives", () => {
  assert.match(css, /--cae-report-type-small:\s*0\.875rem/);
  assert.match(css, /--cae-report-type-body:\s*1\.125rem/);
  assert.match(css, /--cae-report-type-heading:/);
  assert.match(css, /cae-report-method__grid[\s\S]*padding:\s*clamp/);
  assert.match(css, /cae-report-market-gap[\s\S]*padding:\s*clamp/);
  assert.doesNotMatch(report, /Evidence:\s*(?:website|social|search|reputation)\./i);
});
