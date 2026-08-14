# START — caesthetic (Cursor Agents)

Это satellite-репозиторий для **Cursor Agents** (Mobile / Cloud / Desktop) по CAESTHETIC.

## Cold start (≤3 шага)

1. Прочитай `AGENTS.md` (этот репо).
2. Прочитай `docs/ssot/CAESTHETIC.md`.
3. Прочитай `docs/projects/caesthetic/AGENTS.md` + `agents/manifests/caesthetic.yaml`.

## Где правда

| Роль | Репо |
|------|------|
| Cursor Agents (этот проект) | `zaomir/caesthetic` |
| Production SSOT + deploy | `zaomir/grainee-v2` |

Деплой **только** из grainee-v2. Синк двусторонний (DEC-829).

## Запреты

- Не деплоить из этого репо
- Не выдумывать proof, ranking/patient/revenue guarantees
- Не трогать `site-caesthetic/src/config/pricing.ts` без гейтов
- Не коммитить секреты / PII клиентов
- Не добавлять `site-caesthetic/private/` (чужие бренды)

## После правок

Коммит в этом репо → cron (10 мин) или ручной sync на VDS зеркалит в grainee → deploy только из grainee.
