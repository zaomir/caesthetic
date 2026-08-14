import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { relative, resolve } from "node:path";
import test from "node:test";

const REPO = resolve(new URL("../..", import.meta.url).pathname);
const SITE = resolve(REPO, "site-caesthetic");
const SCANNED_EXTENSIONS = /\.(?:html|js|mjs|json|ts|md)$/i;
const FORBIDDEN = [
  /\b70\s*%\s*off\b/i,
  /\bsave\s+70\s*%\b/i,
  /\breferral\s+fee\b/i,
  /\bper[-\s]patient\s+commission\b/i,
  /\bpay\s+for\s+(?:a\s+)?review\b/i,
  /\bbuy\s+reviews?\b/i,
  /\bguaranteed\s+(?:growth|revenue|ranking)\b/i,
  /\bскидк[а-яё]*\s+70\s*%\b/i,
  /\bсэконом[а-яё]*[^.!?\n]{0,30}70\s*%\b/i,
  /\bреферальн[а-яё]*\s+комисси[а-яё]*\b/i,
  /\bкомисси[а-яё]*\s+за\s+пациент[а-яё]*\b/i,
  /\b(?:платить|оплата)\s+за\s+отзыв[а-яё]*\b/i,
  /\bкупить\s+отзыв[а-яё]*\b/i,
  /\bгарантир[а-яё]*\s+(?:рост|доход|выручк[а-яё]*|рейтинг[а-яё]*)\b/i,
];
const ALLOWED_SEVENTY =
  /70\s*%\s+lower\s+fixed\s+fee|фиксированн[а-яё\s]+(?:плата|гонорар|часть)[а-яё\s]*на\s+70\s*%\s+ниже/gi;

function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (SCANNED_EXTENSIONS.test(entry)) files.push(path);
  }
  return files;
}

function pricingCopyFiles() {
  const direct = [
    resolve(SITE, "src/config/pricing.ts"),
    resolve(SITE, "assets/data/pricing.json"),
    resolve(SITE, "assets/js/pricing-api.js"),
    resolve(SITE, "assets/js/pricing.js"),
    resolve(SITE, "src/i18n/pricing.en.ts"),
    resolve(SITE, "src/i18n/pricing.ru.ts"),
  ].filter(existsSync);
  return [
    ...direct,
    ...walk(resolve(SITE, "src/components/pricing")),
    ...walk(resolve(SITE, "pricing")),
    ...walk(resolve(SITE, "ru/pricing")),
  ].filter((path, index, paths) => paths.indexOf(path) === index);
}

test("pricing copy contains no prohibited commercial or review claims", (t) => {
  const files = pricingCopyFiles();
  if (!files.length) {
    t.skip("waiting for Lane A/B pricing copy and pages");
    return;
  }

  const violations = [];
  for (const path of files) {
    const source = readFileSync(path, "utf8");
    const file = relative(SITE, path).replaceAll("\\", "/");
    for (const phrase of FORBIDDEN) {
      const match = source.match(phrase);
      if (match) violations.push(`${file}: forbidden phrase ${JSON.stringify(match[0])}`);
    }

    const withoutAllowedSeventy = source.replace(ALLOWED_SEVENTY, "");
    const otherSeventy = withoutAllowedSeventy.match(/\b70\s*%/);
    if (otherSeventy) {
      violations.push(
        `${file}: unsupported 70% claim ${JSON.stringify(otherSeventy[0])}; only "70% lower fixed fee" is allowed`,
      );
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Pricing compliance violations:\n${violations.join("\n")}`,
  );
});
