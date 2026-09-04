import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const REPO = resolve(new URL('../..', import.meta.url).pathname);
const SITE = resolve(REPO, 'site-caesthetic');
const read = (path) => readFileSync(resolve(SITE, path), 'utf8');
const readRepo = (path) => readFileSync(resolve(REPO, path), 'utf8');

const routes = {
  en: {
    path: 'beauty-salons/index.html',
    canonical: 'https://caesthetic.com/beauty-salons/',
    lang: 'en-US',
    h1: 'Find where your salon loses clients — before you spend more to attract them.',
  },
  es: {
    path: 'es/salones-de-belleza/index.html',
    canonical: 'https://caesthetic.com/es/salones-de-belleza/',
    lang: 'es',
  },
  ru: {
    path: 'ru/salony-krasoty/index.html',
    canonical: 'https://caesthetic.com/ru/salony-krasoty/',
    lang: 'ru',
    h1: 'Узнайте, где салон теряет клиентов, прежде чем тратить больше на их привлечение.',
  },
  fr: {
    path: 'fr/salons-de-beaute/index.html',
    canonical: 'https://caesthetic.com/fr/salons-de-beaute/',
    lang: 'fr',
  },
};

const alternates = {
  en: 'https://caesthetic.com/beauty-salons/',
  es: 'https://caesthetic.com/es/salones-de-belleza/',
  ru: 'https://caesthetic.com/ru/salony-krasoty/',
  fr: 'https://caesthetic.com/fr/salons-de-beaute/',
  'x-default': 'https://caesthetic.com/beauty-salons/',
};

const IA_IDS = [
  'problem',
  'surfaces',
  'journey',
  'stages',
  'operations',
  'do-not-fund',
  'what-you-get',
  'ladder',
  'example',
  'faq',
  'salon-score-form',
];

const OPTIONAL_FIELDS = [
  'website_url',
  'gbp_url',
  'instagram_url',
  'booking_url_system',
  'location_count',
  'priority_treatments',
  'main_concern',
];

const FORBIDDEN_PRE_SAVE = [
  'revenue',
  'ad_budget',
  'employees',
  'decision_maker',
  'purchase_intent',
];

function visibleText(source) {
  return source
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ids(source) {
  return [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
}

test('beauty-salon routes are standalone localized documents with reciprocal hreflang', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [locale, route] of Object.entries(routes)) {
    const source = read(route.path);
    assert.match(source, new RegExp(`<html lang="${route.lang}"[^>]*data-page="beauty-salons"`));
    assert.ok(source.includes(`<link rel="canonical" href="${route.canonical}">`));
    assert.match(source, /<meta property="og:title"/);
    assert.match(source, /<meta property="og:description"/);
    assert.match(source, /<meta property="og:url"/);
    assert.doesNotMatch(source, /noindex/i);
    const title = source.match(/<title>([^<]+)<\/title>/)?.[1] || '';
    const description = source.match(/name="description" content="([^"]+)"/)?.[1] || '';
    assert.ok(title);
    assert.ok(description);
    titles.add(title);
    descriptions.add(description);
    for (const [hreflang, href] of Object.entries(alternates)) {
      assert.ok(source.includes(`<link rel="alternate" hreflang="${hreflang}" href="${href}">`), `${locale} missing ${hreflang}`);
    }
    assert.match(source, /data-cae-language-selector/);
    assert.equal((source.match(/data-cae-language-link/g) || []).length, 4);
    if (route.h1) assert.ok(source.includes(`<h1 class="cae-h1">${route.h1}</h1>`), `${locale} H1`);
  }
  assert.equal(titles.size, 4);
  assert.equal(descriptions.size, 4);
});

test('first screen exposes all four languages as ordinary links', () => {
  for (const route of Object.values(routes)) {
    const source = read(route.path);
    for (const [locale, href] of Object.entries({
      en: '/beauty-salons/',
      es: '/es/salones-de-belleza/',
      ru: '/ru/salony-krasoty/',
      fr: '/fr/salons-de-beaute/',
    })) {
      assert.ok(source.includes(`href="${href}" hreflang="${locale}"`));
    }
    assert.doesNotMatch(source, /navigator\.language|geoip|window\.location\.replace/i);
  }
});

test('every locale shares the same information architecture', () => {
  for (const [locale, route] of Object.entries(routes)) {
    const source = read(route.path);
    for (const id of IA_IDS) {
      assert.ok(source.includes(`id="${id}"`), `${locale} missing #${id}`);
    }
    assert.match(source, /<details class="cae-salon-language"/);
    const faqIndex = source.indexOf('id="faq"');
    const formIndex = source.indexOf('id="salon-score-form"');
    assert.ok(faqIndex > 0 && formIndex > faqIndex, `${locale} FAQ must precede intake`);
    const pageIds = ids(source);
    assert.equal(pageIds.length, new Set(pageIds).size, `${locale} duplicate IDs`);
  }
});

test('salon pages preserve the four-surface and decision-first canon', () => {
  const operationalBoundary = {
    en: /Not assessed without operational access \/ evidence\./,
    es: /No evaluado sin acceso operativo o evidencia\./,
    ru: /Не оценивается без операционного доступа или доказательств\./,
    fr: /Non évalué sans accès opérationnel ou preuves\./,
  };
  for (const [locale, route] of Object.entries(routes)) {
    const source = read(route.path);
    const surfaceCards = source.match(/<div class="cae-salon-surface-grid">([\s\S]*?)<\/div>/)?.[1] || '';
    assert.equal((surfaceCards.match(/<article /g) || []).length, 4, `${locale} must show exactly four surfaces`);
    assert.match(source, /Paid Ads amplify the system\. They do not repair it\./);
    assert.match(source, /Cross-Surface Consistency/);
    assert.match(source, operationalBoundary[locale]);
    assert.match(source, /data-cae-score-price/);
    assert.match(source, /data-cae-sprint-price/);
    assert.doesNotMatch(source, /SEO \+ ads \+ website \+ CRM/i);
  }

  const en = read(routes.en.path);
  for (const marker of [
    'Search / Maps',
    'Website / Booking',
    'Social',
    'Reputation',
    'Binding Constraint',
    'Top 3',
    'Do Not Fund Yet',
    'Four-Surface findings',
    'Insufficient evidence',
    'service → specialist → location → available time → booking',
  ]) {
    assert.ok(en.toLowerCase().includes(marker.toLowerCase()), `missing ${marker}`);
  }
  assert.match(en, /Paid advertising is not a fifth surface|Demand Layer, not a fifth surface/i);
  assert.match(en, /Illustrative example\. Not a client case or reported result\./);
  assert.match(en, /Two-location salon · illustrative example/);
  assert.match(en, /named human approval/);
  assert.match(en, /CAESTHETIC for aesthetic practices/);
  const visible = visibleText(en).replace(/CAESTHETIC for aesthetic practices/gi, ' ');
  assert.doesNotMatch(visible, /\b(patient|clinician|clinic)\b/i);
});

test('copy forbids guaranteed growth, fabricated statistics and medical terminology drift', () => {
  for (const route of Object.values(routes)) {
    const visible = visibleText(read(route.path));
    assert.doesNotMatch(visible, /guaranteed (growth|revenue|roi|ranking)/i);
    assert.doesNotMatch(visible, /\bROI\b/);
    assert.doesNotMatch(visible, /\+\s?\d{2,}%/);
    assert.doesNotMatch(visible, /increased revenue by/i);
    assert.doesNotMatch(visible, /\bclient testimonial\b|\bfake testimonial\b/i);
  }
});

test('every locale mounts the canonical four-field salon score form with localized errors', () => {
  for (const route of Object.values(routes)) {
    const source = read(route.path);
    assert.match(source, /cae-salon-form cae-request-launch/);
    assert.match(source, /data-cae-request/);
    assert.match(source, /\/assets\/js\/caesthetic\.js/);
    assert.match(source, /\/assets\/js\/beauty-salons\.js/);
    for (const name of FORBIDDEN_PRE_SAVE) {
      assert.doesNotMatch(source, new RegExp(`name="${name}"`));
    }
  }
  const launcher = read('assets/js/caesthetic.js');
  for (const name of ['name', 'email', 'practice_name', 'city_state']) {
    assert.ok(launcher.includes(`name="${name}"`), `missing runtime field ${name}`);
  }
  assert.match(launcher, /data-label-submitting=/);
  assert.match(launcher, /data-error-network=/);
  assert.match(launcher, /No pudimos registrar tu solicitud/);
  assert.match(launcher, /Не удалось зарегистрировать запрос/);
  assert.match(launcher, /Nous n’avons pas pu enregistrer votre demande/);
});

test('salon intake reuses the existing fail-closed Growth Score API contract', () => {
  const source = read('assets/js/beauty-salons.js');
  assert.match(source, /caesthetic-growth-score\/2\.0/);
  assert.match(source, /CAESTHETIC_API\.submitScore/);
  assert.match(source, /source_page:\s*window\.location\.pathname/);
  assert.match(source, /vertical:\s*"beauty_salon"/);
  assert.match(source, /utm_content:\s*utm\.utm_content\s*\|\|/);
  assert.match(source, /beauty_salon_page_viewed/);
  assert.match(source, /beauty_language_selected/);
  assert.match(source, /beauty_score_cta_clicked/);
  assert.match(source, /beauty_score_form_started/);
  assert.match(source, /score_request_submitted/);
  assert.match(source, /intake_stage:\s*"optional"/);
  assert.doesNotMatch(source, /\/ru\/text|\/en\/text|openai|anthropic/i);
});

test('salon analytics events stay inside the allowed non-PII parameter set', () => {
  const source = read('assets/js/beauty-salons.js');
  const safeDetail = source.slice(source.indexOf('function safeDetail'), source.indexOf('function track'));
  assert.match(safeDetail, /locale:/);
  assert.match(safeDetail, /vertical:/);
  assert.match(safeDetail, /route:/);
  assert.match(safeDetail, /cta_position/);
  assert.doesNotMatch(safeDetail, /email|practice_name|website_url|name:/);
  assert.doesNotMatch(source, /track\([^)]*fieldValue/);
});

test('beauty-salon CSS stays inside the Clinical Editorial Intelligence tokens', () => {
  const source = read('assets/css/beauty-salons.css');
  assert.doesNotMatch(source, /#[0-9a-f]{3,8}\b/i);
  const withoutFocusRing = source.replaceAll('box-shadow: var(--cae-outline-focus);', '');
  assert.doesNotMatch(withoutFocusRing, /linear-gradient|radial-gradient|box-shadow:/i);
  assert.match(source, /var\(--cae-signal\)/);
  assert.match(source, /var\(--cae-accent\)/);
  assert.match(source, /@media \(max-width: 720px\)/);
  assert.match(source, /@media \(max-width: 390px\)/);
  assert.match(source, /min-height: 44px/);
  assert.match(source, /prefers-reduced-motion/);
});

test('sitemap, footer, redirects and Website Studio manifests cover the vertical', () => {
  const sitemap = read('sitemap.xml');
  for (const { canonical } of Object.values(routes)) assert.ok(sitemap.includes(canonical));
  const footer = read('templates/footer.html');
  assert.match(footer, /href="\/beauty-salons\/">Beauty salons/);
  const header = read('templates/header.html');
  assert.doesNotMatch(header, /href="\/beauty-salons\/"/);

  const nginx = readRepo('deploy/nginx/snippets/caesthetic-legacy-redirects.conf');
  const router = readRepo('infra/cloudflare/router/src/index.ts');
  for (const from of ['/beauty/', '/go/new-salon-launch/', '/go/salon-growth/']) {
    assert.match(nginx, new RegExp(`${from.replaceAll('/', '\\/')} \\{ return 301 /beauty-salons/\\$is_args\\$args;`));
    assert.match(router, new RegExp(`'${from}': '/beauty-salons/'`));
  }

  for (const manifest of [
    'docs/website-studio/site-caesthetic-beauty-salons.md',
    'docs/website-studio/site-caesthetic-es-salones-de-belleza.md',
    'docs/website-studio/site-caesthetic-ru-salony-krasoty.md',
    'docs/website-studio/site-caesthetic-fr-salons-de-beaute.md',
  ]) {
    const qa = read(manifest);
    assert.match(qa, /WEBSITE_STUDIO_STANDARD/);
    assert.match(qa, /IMPECCABLE/);
    assert.match(qa, /SURFACE MODE/);
    assert.match(qa, /DESIGN DISCOVERY/);
    assert.match(qa, /REPRESENTATIVE SURFACE/);
    assert.match(qa, /\/impeccable audit/);
    assert.match(qa, /DETECT TARGET/);
  }
});
