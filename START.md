# START — caesthetic (Cursor Agents)

Это satellite-репозиторий для **Cursor Agents** (Mobile / Cloud / Desktop) по CAESTHETIC.

## Cold start

1. Прочитай `AGENTS.md` (этот репо).
2. Прочитай `docs/projects/caesthetic/GROWTH_SCORE_AGENT_ENFORCEMENT.md`.
3. Прочитай `docs/ssot/CAESTHETIC.md`.
4. Прочитай `docs/projects/caesthetic/AGENTS.md` + `agents/manifests/caesthetic.yaml`.
5. Для нетривиальной разработки/изменения workflow прочитай `STRATEGY.md`, `CODING_STANDARDS.md` и `docs/compound-engineering/README.md`.

Если задача относится к Expert Dental / RAIMOV, сначала открой
`docs/external/grainee-v2/expert-dental/.mirror-manifest.json` и следуй
зеркальным AGENTS/SSOT. Это гибридное двустороннее зеркало, но не второй
SSOT: non-PHI проектные документы в `docs/projects/healthcare-ecosystem/**`,
`docs/projects/raimovdental/**` и `docs/raimov/**` можно редактировать прямо в
зеркале — worker запишет их в те же пути `grainee-v2`. Legal/runtime/SSOT,
deploy и agent-routing в зеркале остаются защищёнными и редактируются только
через authority `grainee-v2`. Конкурирующие изменения блокируются fail-closed.

**Важно:** Growth Score pre-router и mandatory enforcement применяются до любых Compound Engineering skills, планов или автономных pipeline.

## Где правда

| Роль | Репо |
|------|------|
| Cursor Agents (этот проект) | `zaomir/caesthetic` |
| Production SSOT + deploy | `zaomir/grainee-v2` |

Деплой **только** из grainee-v2. Синк двусторонний (DEC-829).

`STRATEGY.md` — короткий agent-facing index, а не новый SSOT. Compound Engineering artifacts под `docs/compound-engineering/` — execution memory, а не каноническая продуктовая истина.

## Запреты

- Не деплоить из этого репо
- Не выдумывать proof, ranking/patient/revenue guarantees
- Не трогать `site-caesthetic/src/config/pricing.ts` без гейтов
- Не коммитить секреты / PII клиентов
- Не добавлять `site-caesthetic/private/` (чужие бренды)
- Не использовать CE/lfg/fast path для обхода Research Alignment, human Focus Selection, publication/access, pricing, privacy, sync или deploy gates

## После правок

### Тривиальная low-risk правка

Допустим существующий быстрый путь, если изменение механическое и никакой более строгий gate не требует PR/review.

### Нетривиальная или risk-bearing правка

branch → plan/guardrails → implementation → verification → structured review → PR/CI → merge → sync Agents↔grainee → deploy только из grainee.

После verified нетривиального решения с повторно используемым знанием зафиксируй learning в настроенном Compound Engineering `solutions/` store.
