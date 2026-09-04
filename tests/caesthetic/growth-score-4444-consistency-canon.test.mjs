import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Documentation-policy guards. These do not claim collector/runtime coverage.
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const modulePath = "docs/ssot/CAESTHETIC_4444_CONSISTENCY_STANDARD.md";
const standard = read(modulePath);
const enforcement = read("docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md");
const manifest = read("agents/manifests/caesthetic.yaml");
const decision = read("docs/projects/caesthetic/governance/2026-09-04-4444-consistency-first.md");
const contract = "caesthetic-4444-consistency-first/1.0.0";
const section = (number) => {
  const start = standard.indexOf(`## ${number}. `);
  assert.ok(start >= 0, `missing method section ${number}`);
  const end = standard.indexOf(`\n## ${number + 1}. `, start);
  return standard.slice(start, end < 0 ? undefined : end);
};

test("the registered method specializes the existing master, spec and SOP", () => {
  assert.match(standard, /^status: active$/m);
  assert.match(standard, /^version: 1\.0\.0$/m);
  assert.ok(standard.includes(`contract: ${contract}`));
  assert.match(standard, /^parent: docs\/ssot\/CAESTHETIC\.md$/m);
  assert.match(standard, /^implementation_spec: docs\/caesthetic\/growth_score_spec\.md$/m);
  assert.match(standard, /^operating_sop: docs\/ssot\/CAESTHETIC_GROWTH_SCORE_PRODUCTION_SOP\.md$/m);
  assert.match(section(1), /не второй продуктовый канон/);
  assert.match(section(1), /Соответствие/);
});

test("exactly ten fixed queries are required, not an approximate per-channel set", () => {
  assert.match(standard, /^query_count: 10$/m);
  assert.match(section(4), /ровно 10/);
  assert.match(section(4), /`K01`–`K10`/);
  assert.match(section(3), /один и тот же набор/);
  assert.match(section(3), /Не подбирать разные удобные запросы/);
});

test("the method keeps exactly four canonical surfaces without new scores", () => {
  const ids = [...section(2).matchAll(/^\|[^\n]+\| `(search|website|social|reputation)` \|/gm)].map((match) => match[1]);
  assert.deepEqual(ids, ["search", "website", "social", "reputation"]);
  assert.match(section(2), /Блог не пятая плоскость/);
  assert.match(section(2), /не меняет веса 30\/25\/15\/30/);
  assert.match(section(2), /не создаёт новый балл/);
  assert.match(section(2), /двойной учёт одного доказательства — нет/);
});

test("all four social platforms require discovery and ownership evidence", () => {
  assert.match(standard, /^required_social_platforms: \[Instagram, Facebook, TikTok, YouTube\]$/m);
  for (const platform of ["Instagram", "Facebook", "TikTok", "YouTube"]) {
    assert.ok(section(5).includes(platform));
    assert.ok(enforcement.includes(platform));
  }
  for (const status of ["owned_profile_found", "not_found_after_discovery", "ownership_ambiguous", "inaccessible"]) {
    assert.ok(section(5).includes(`\`${status}\``));
  }
  assert.match(section(5), /не утверждение, что у бизнеса должны существовать четыре аккаунта/);
});

test("social inspection includes content, transcripts, comments and replies separately", () => {
  const kinds = [...section(5).matchAll(/^\| `(\w+)` \|/gm)].map((match) => match[1]);
  assert.deepEqual(kinds, ["profile_text", "post_text", "video_description", "video_transcript", "user_comment", "practice_comment_reply"]);
  assert.match(section(5), /отдельном разделе отзывов/);
  assert.match(section(5), /Нельзя считать Social исследованным по одному описанию профиля/);
  assert.match(section(5), /в подписи к ролику не доказывает её наличия в речи/);
});

test("alignment approval precedes the first full-research query block", () => {
  const start = section(3);
  const interview = start.indexOf("Для нового аудита завершить менеджерское интервью");
  const approval = start.indexOf("named-manager approval");
  const queries = start.indexOf("Первым исследовательским блоком сформировать");
  const matrix = start.indexOf("матрицу 10 × 4");
  const review = start.indexOf("Передать на человеческую проверку");
  assert.ok(interview >= 0 && approval > interview && queries > approval && matrix > queries && review > matrix);
  assert.match(start, /не перезапускать активное интервью/);
  assert.match(start, /Финальная тройка приоритетов остаётся одной на пакет/);
});

test("query provenance separates verified demand from unmeasured candidates", () => {
  for (const term of ["verified_query", "candidate_query", "null", "Частотность не подтверждена"]) {
    assert.ok(section(4).includes(term));
  }
  assert.match(section(4), /Длинная фраза сама по себе не доказывает низкую частотность/);
  assert.match(section(4), /не дополнять список выдуманными услугами/);
  assert.match(section(4), /не переносятся/);
  assert.match(section(4), /GSC, GA4/);
});

test("five evidence states distinguish exact match, meaning, contradiction and missing access", () => {
  const states = [...section(7).matchAll(/^\| `(\w+)` \|/gm)].map((match) => match[1]);
  assert.deepEqual(states, ["exact_match", "semantic_match", "contradiction", "not_found_in_sample", "insufficient_evidence"]);
  assert.match(section(7), /Это не точное совпадение/);
  assert.match(section(7), /Это не ноль и не отсутствие/);
  assert.match(section(7), /Перевод, замена слов, синонимы/);
});

test("sample completeness cannot be replaced by one positive hit or an access failure", () => {
  assert.match(section(7), /Один положительный результат не делает всю плоскость/);
  assert.match(section(7), /Недоступность Instagram не означает отсутствие фраз/);
  assert.match(section(7), /Отсутствие транскрипции не означает отсутствие фразы в видео/);
  assert.match(section(6), /Нельзя называть выборку полным сканированием/);
});

test("automatic transcripts retain provenance and require human verification", () => {
  assert.match(section(5), /Автоматически распознанное совпадение остаётся кандидатом до проверки/);
  assert.match(section(5), /неуверенное распознавание не становится утверждённым/);
  assert.match(section(6), /происхождение транскрипции и временная отметка/);
  assert.match(enforcement, /Human verification is required for automatic transcript matches/);
});

test("public-only collection preserves author roles and privacy without bypasses", () => {
  assert.match(section(5), /Нельзя обходить авторизацию или ограничения доступа/);
  assert.match(section(5), /Insufficient evidence.*Not assessed/);
  assert.match(section(6), /`author_role`/);
  assert.match(section(6), /Не переносить в репозиторий лишние идентификаторы/);
  assert.match(section(6), /не подтверждённым результатом лечения/);
});

test("independent patient speech is not forced into the company keyword plan", () => {
  assert.match(section(8), /Не диктовать пациентам ключевые слова/);
  assert.match(section(8), /Не покупать и не стимулировать отзывы/);
  assert.match(section(8), /не использовать review gating/);
  assert.match(section(8), /не требуется вставлять все 10 фраз в каждый материал/);
  assert.match(section(8), /Нельзя раскрывать личные данные или подтверждать лечение/);
});

test("the first check never predetermines the binding constraint or Top 3", () => {
  assert.match(section(1), /диагноз не предрешён/);
  assert.match(section(1), /Если соответствие есть, это сильная сторона/);
  assert.match(section(3), /Class A facts, главное ограничение, Top 3, Do Not Fund Yet/);
  assert.match(section(9), /Ни название, ни первый ранг не публикуются автоматически/);
  assert.match(enforcement, /not an automatic binding constraint or Top 3 selection/);
  assert.match(enforcement, /A named human must verify evidence and manually select exactly one Primary Gap/);
});

test("owner reporting adds no extra section, product or impact guarantee", () => {
  assert.match(section(9), /Проверка соответствия ключевых фраз/);
  assert.match(section(9), /Нет соответствия формулировок в четырёх плоскостях/);
  assert.match(section(9), /не создаёт десятую секцию, пятый продукт/);
  assert.match(section(9), /не доказывает рост позиций, пациентов, выручки или окупаемости/);
  assert.match(section(9), /Shipped ≠ Adopted ≠ Impact Verified/);
});

test("the live method is mandatory in the agent read-first and project manifest", () => {
  assert.ok(enforcement.includes(`7. \`${modulePath}\``));
  assert.ok(enforcement.includes(`consistency_standard: ${modulePath}`));
  assert.match(enforcement, /Items 1–7 are mandatory/);
  assert.match(enforcement, /resolve the current `zaomir\/grainee-v2` `main`/);
  assert.ok(enforcement.includes(contract));
  assert.ok(manifest.includes(`    consistency: ${modulePath}`));
  assert.match(manifest, /consistency_policy_check: node --test tests\/caesthetic\/growth-score-4444-consistency-canon\.test\.mjs/);
});

test("documentation release preserves frozen reports and does not claim an implemented robot", () => {
  assert.match(section(10), /не пересобирает, не переоценивает и не публикует/);
  assert.match(section(10), /русская\/английская версии Spoken Med Spa остаются неизменными/);
  assert.match(section(10), /нельзя представлять документы как уже работающий робот/);
  assert.ok(decision.includes(contract));
  assert.match(decision, /docs and policy tests only/);
});
