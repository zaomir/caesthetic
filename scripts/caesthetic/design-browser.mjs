import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { chromium, firefox, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { ROOT, sha, identity, validate } from "./design-contract.mjs";
const validation = validate();
if (validation.errors.length) throw new Error(validation.errors.join('\n'));
const contract = validation.contract;
const out = process.env.CAE_DESIGN_OUTPUT || "/tmp/caesthetic-design-browser";
fs.mkdirSync(out, { recursive: true });
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
};
const server = http.createServer((req, res) => {
  let p;
  try {
    p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (p === "/__design-kit/") {
    res.setHeader("Content-Type", "text/html");
    res.end(
      fs.readFileSync(
        path.join(ROOT, "tests/caesthetic/fixtures/design-system.html"),
      ),
    );
    return;
  }
  let f = path.resolve(ROOT, "site-caesthetic", "." + p);
  if (
    !f.startsWith(path.join(ROOT, "site-caesthetic") + path.sep) &&
    f !== path.join(ROOT, "site-caesthetic")
  ) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    if (fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    res.setHeader(
      "Content-Type",
      types[path.extname(f)] || "application/octet-stream",
    );
    res.end(fs.readFileSync(f));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base =
  process.env.CAE_DESIGN_BASE || `http://127.0.0.1:${server.address().port}`;
const browser = await { chromium, firefox, webkit }[
  process.env.CAE_DESIGN_ENGINE || "chromium"
].launch({ headless: true });
const results = [];
const errors = [];
const testedIdentity = identity();
const engine = process.env.CAE_DESIGN_ENGINE || "chromium";
const browserVersion = browser.version();
async function verifyReviewAccess(context, entry) {
  if (!process.env.CAE_DESIGN_BASE || entry.stage !== 'manager_review') return null;
  if (new URL(base).origin !== 'https://caesthetic.com') throw new Error('Review access smoke is restricted to canonical production');
  const url = base + entry.route;
  if (entry.accessMode !== 'pin') {
    const response = await context.request.get(url);
    const bytes = await response.body();
    const expectedHash = sha(fs.readFileSync(path.join(ROOT,entry.source)));
    if (response.status() !== 200 || sha(bytes) !== expectedHash || bytes.toString().includes('name="password"')) throw new Error('Direct-link review differs from exact release or still requires a password');
    if (!response.headers()['cache-control']?.includes('no-store') || !response.headers()['x-robots-tag']?.includes('noindex')) throw new Error('Review no-store/noindex headers missing');
    return {mode:'none',anonymous:200,contentSha256:expectedHash,sourceSha:testedIdentity.sha};
  }
  const gate = await context.request.get(url);
  const gateBody = await gate.text();
  if (gate.status() !== 200 || !gateBody.includes('name="password"') || gateBody.includes('data-review-state="manager_review"')) throw new Error('Review unauthenticated gate failed');
  if (!gate.headers()['cache-control']?.includes('no-store') || !gate.headers()['x-robots-tag']?.includes('noindex')) throw new Error('Review gate privacy headers failed');
  const wrong = await context.request.post(url, {form:{password:'invalid-review-smoke'},maxRedirects:0});
  if (wrong.status() !== 401) throw new Error('Review wrong PIN was not rejected');
  await new Promise(resolve=>setTimeout(resolve,2100));
  const passwords = JSON.parse(execFileSync(process.execPath,[path.join(ROOT,'scripts/caesthetic/score-pin-runtime.mjs'),'smoke-passwords'],{cwd:ROOT,encoding:'utf8'}));
  const pin = passwords[entry.accessGroupId];
  if (!/^\d{4}$/.test(pin || '')) throw new Error('Review PIN runtime unavailable');
  const login = await context.request.post(url,{form:{password:pin},maxRedirects:0});
  if (login.status() !== 303) throw new Error('Review correct PIN session failed');
  const authenticated = await context.request.get(url);
  const bytes = await authenticated.body();
  const expectedHash = sha(fs.readFileSync(path.join(ROOT,entry.source)));
  if (authenticated.status() !== 200 || sha(bytes) !== expectedHash) throw new Error('Review authenticated page differs from exact release');
  if (!authenticated.headers()['cache-control']?.includes('no-store') || !authenticated.headers()['x-robots-tag']?.includes('noindex')) throw new Error('Review authenticated privacy headers failed');
  return {gate:200,wrongPin:401,correctPin:303,authenticated:200,contentSha256:expectedHash,sourceSha:testedIdentity.sha};
}
try {
  const queue = [
    ...contract.pages.filter((p) => p.profile !== "fragment"),
    ...(!process.env.CAE_DESIGN_BASE ? contract.fixtures || [] : []),
  ].filter(
    (p) =>
      !process.env.CAE_DESIGN_FAMILIES_ONLY ||
      p.stage === 'manager_review' || p.stage === 'redirect' ||
      [
        "/",
        "/pricing/",
        "/sprint/",
        "/growth-system/",
        "/beauty-salons/",
        "/connect4/",
        "/lead-to-revenue-check/",
        "/score/demo-multi-location-growth-score/",
        "/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v2/",
        "/score/spoken-medspa-snellville-9d7f3a5c2e184b61-rus/v3/",
        "/score/spoken-medspa-snellville-9d7f3a5c2e184b61/v3/",
        "/__design-kit/",
      ].includes(p.route),
  );
  async function worker() {
    while (queue.length) {
      const entry = queue.shift();
      const context = await browser.newContext({ reducedMotion: "reduce" });
      await context.route("**/*", (route) => {
        const req = route.request();
        if (
          !["GET", "HEAD"].includes(req.method()) ||
          /supabase.co|google-analytics|googletagmanager/.test(req.url())
        )
          return route.abort();
        return route.continue();
      });
      const reviewAccess = await verifyReviewAccess(context,entry);
      const page = await context.newPage();
      for (const width of entry.viewports) {
        await page.setViewportSize({ width, height: 900 });
        await page
          .goto(base + entry.route, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
        await page
          .waitForLoadState("networkidle", { timeout: 5000 })
          .catch(() => {});
        await page.evaluate(() =>
          Promise.race([
            document.fonts.ready,
            new Promise((r) => setTimeout(r, 5000)),
          ]),
        );
        await page.waitForTimeout(200);
        const criticalPathFailures = [];
        if (entry.stage === 'manager_review') {
          const summaries = page.locator('.v6-question > summary');
          if (await summaries.count() !== 4) criticalPathFailures.push('four questions missing');
          else {
            for(let i=0;i<4;i++) await summaries.nth(i).click();
            if(await page.locator('.v6-question[open]').count() !== 4) criticalPathFailures.push('independent disclosures');
            await summaries.first().focus(); await summaries.first().press('Enter');
            if(await page.locator('.v6-question[open]').count() !== 3) criticalPathFailures.push('keyboard disclosure');
            await summaries.first().press('Enter');
          }
          const expectedCheckCount = entry.packageRole === 'focus_location' ? 0 : 2;
          if(await page.locator('[data-check500-placement]').count() !== expectedCheckCount) criticalPathFailures.push('Check placements must respect parent/focus role');
          if(entry.packageRole && await page.locator('html').getAttribute('data-package-role') !== entry.packageRole) criticalPathFailures.push('review package role mismatch');
          if(entry.packageRole === 'focus_location' && await page.locator(`a[href="../#next-step"]`).count() !== 1) criticalPathFailures.push('focus must return to parent implementation decision');
          await page.locator('#proposal a[href="#next-step"]').click();
          const anchor = await page.locator('#next-step').evaluate(e=>{
            const box=e.getBoundingClientRect();
            return {top:box.top,bottom:box.bottom,viewport:innerHeight,atEnd:scrollY+innerHeight>=document.documentElement.scrollHeight-2,hash:location.hash};
          });
          // A short final section cannot align to the top at the document boundary.
          // It must either align near the top or be completely visible at the bottom.
          const visibleAtEnd=anchor.atEnd && anchor.top>=0 && anchor.bottom<=anchor.viewport+2;
          if(anchor.hash!=='#next-step' || anchor.top < -2 || (anchor.top > 80 && !visibleAtEnd)) criticalPathFailures.push('implementation anchor');
          await page.evaluate(()=>window.scrollTo(0,0));
          if(!process.env.CAE_DESIGN_BASE && width===390){
            const artifactDir=path.join(ROOT,'design-artifacts');fs.mkdirSync(artifactDir,{recursive:true});
            const screenshotStem=`ru-review-${sha(entry.route).slice(0,10)}-${engine}`;
            const pageHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
            if(pageHeight<=30000){
              await page.screenshot({path:path.join(artifactDir,`${screenshotStem}.png`),fullPage:true});
            } else {
              // WebKit has a 32767-pixel bitmap limit; retain section views for long networks.
              await page.screenshot({path:path.join(artifactDir,`${screenshotStem}-top.png`)});
              const sectionIds=await page.locator('[data-diagnostic-section]').evaluateAll(es=>es.map(e=>e.id));
              for(const id of sectionIds){
                await page.locator(`#${id}`).evaluate(e=>e.scrollIntoView({block:'start'}));
                await page.screenshot({path:path.join(artifactDir,`${screenshotStem}-${id}.png`)});
              }
              await page.evaluate(()=>window.scrollTo(0,0));
            }
          }
        }
        const result = await page.evaluate(() => {
          const visible = (e) => {
            const r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return (
              r.width > 0 &&
              r.height > 0 &&
              s.visibility !== "hidden" &&
              s.display !== "none"
            );
          };
          const scrollParent = (e) => {
            for (
              let p = e.parentElement;
              p && p !== document.body;
              p = p.parentElement
            )
              if (
                ["auto", "scroll"].includes(getComputedStyle(p).overflowX) &&
                p.scrollWidth > p.clientWidth
              )
                return true;
            return false;
          };
          const clipped = [
            ...document.querySelectorAll(
              "main h1, main h2, main h3, main p, main .cae-btn, main input",
            ),
          ]
            .filter(visible)
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return (
                (r.left < -2 || r.right > innerWidth + 2) && !scrollParent(e)
              );
            })
            .map(
              (e) => e.tagName.toLowerCase() + "." + [...e.classList].join("."),
            );
          const smallActions = [
            ...document.querySelectorAll(
              ".cae-btn,input:not([type=hidden]):not([type=checkbox]):not([type=radio])",
            ),
          ]
            .filter(visible)
            .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16)
            .map(
              (e) => e.tagName.toLowerCase() + "." + [...e.classList].join("."),
            );
          return {
            clipped: [...new Set(clipped)],
            smallActions: [...new Set(smallActions)],
            missingImages: [...document.images]
              .filter((e) => visible(e) && e.complete && !e.naturalWidth)
              .map((e) => new URL(e.src).pathname),
            access: !!document.querySelector("input[type=password]"),
          };
        });
        if (width === 390) {
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          result.axe = axe.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target.join(" ")),
          }));
        }
        results.push({
          route: entry.route,
          profile: entry.profile,
          width,
          ...result,
          ...(entry.stage==='manager_review'?{criticalPathFailures,reviewAccess}:{}),
        });
        if (
          [
            "/",
            "/pricing/",
            "/connect4/",
            "/score/demo-multi-location-growth-score/",
          ].includes(entry.route) &&
          width === 390
        )
          await page.screenshot({
            path: path.join(out, sha(entry.route).slice(0, 10) + ".png"),
            fullPage: true,
          });
      }
      await context.close();
      console.log(`Checked ${entry.route}`);
      fs.writeFileSync(path.join(out, "partial.json"), JSON.stringify(results));
    }
  }
  await Promise.all([worker(), worker(), worker()]);
} finally {
  await browser.close();
  server.close();
}
const baselinePath = path.join(
  ROOT,
  "docs/caesthetic/design/browser-exceptions.json",
);
const baseline = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath))
  : [];
for (const r of results) {
  for (const kind of ["clipped", "smallActions", "missingImages", "axe", "criticalPathFailures"])
    for (const v of r[kind] || []) {
      const issue = { route: r.route, width: r.width, kind, value: v };
      const known = baseline.find(
        (b) => JSON.stringify(b.issue) === JSON.stringify(issue),
      );
      if (!known || Date.parse(known.expires) < Date.now()) errors.push(issue);
    }
}
fs.writeFileSync(
  path.join(out, "results.json"),
  JSON.stringify(
    {
      identity: testedIdentity,
      engine,
      browserVersion,
      base,
      checkedAt: new Date().toISOString(),
      results,
      errors,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    observations: results.length,
    newViolations: errors.length,
    violations: errors,
    evidence: out,
  }),
);
if (errors.length) process.exitCode = 1;

