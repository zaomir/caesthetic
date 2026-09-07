# Два комплексных чекапа — обновление текущего продукта

Дата: 2026-09-07. Репозиторий: `zaomir/grainee-v2`; runtime: `raimovdental`.

## Решение владельца и границы

Adult и Additional Adult: 2 комплексных стоматологических чекапа за 12 месяцев. Каждый включает осмотр врача, гигиену лёгкой/средней степени, осмотр дёсен/слизистой, оценку кариес-риска и домашней гигиены, фотопротокол с объяснением на экране, персональные рекомендации, обновление Smile Passport и фторпрофилактику по показаниям без доплаты. Гигиена входит в чекап, а не добавляется ещё двумя визитами.

Сканирование не включено. Тяжёлая гигиена — прежняя доплата 2 200 сом; третья гигиена — полный прайс. Снимки/КТ, лечение, хирургия, ортопедия, имплантация и ортодонтия отдельно. Kids, цены, идентификаторы, маршруты и аналитика сохранены.

Переименование PR #1549 уже находилось в исходном main `fc84a2d4b4c816c4bd470fbe31a260357dc7493f`. Изменения сохраняют его итог «RAIM SMILE · Год заботы». Новое переименование не выполнялось. Проверены открытые PR; открытого rename PR не обнаружено.

## Оставшиеся вопросы

| Вопрос | Evidence / ограничение | Владелец и следующий результат |
|---|---|---|
| Фторпрофилактика | clinic-confirmed protocol/material/cost before economics is final; стоимость и материал не выдуманы | Главврач: показания, противопоказания, протокол и материал; управляющий: время кресла, расход и себестоимость |
| Экономика | `NOT_FINAL`, действующие цены сохранены; нет утверждения о прибыли или маркетинговой субсидии | Управляющий: max-use расчёт двух чекапов и capacity; до расчёта не масштабировать выдачу |
| 1 дополнительный problem-focused осмотр | `CANDIDATE`: scope в PILOT_GATE_CHECKLIST не подтверждён. Запрет на сам осмотр не установлен, но duty-slot priority не подтверждает дополнительный включённый benefit | Главврач + управляющий: определить scope одного осмотра в рабочие часы без лечения/снимков, capacity, условия договора и персональный учёт. Затем синхронно обновить binding/catalog/copy/tests |
| Операционное использование | Обновление сайта не доказывает исполнение услуг и не закрывает expanded-v2, billing/ledger или partner pilot | Управляющий: клиническая применимость, условия оформления, обучение и контроль оказанных entitlements в утверждённом интерфейсе; новую CRM не создавать |

## Проверки

- Полный `tests/raimovdental/run-all.mjs`: `failed=0 skipped=0`.
- Проверки product contract, public cutover, naming compatibility и новый `smilecare12-checkups.test.mjs` проходят.
- Нормализованные защищённые значения каталога сравнены с исходным main: цены, SKU, Kids, exclusions, лимиты и прочие операционные поля сохранены. В economics добавлен только статус расчёта нового состава.
- Patient-site: 46 маршрутов; проверка 49 HTML, 341 изображений, 27 FAQPage, failures=0. Единственное предупреждение — прежний повтор на странице контактов.
- Браузер: обе страницы на 320/390/1440 px, состав/цены видимы, HTTP 200, без horizontal overflow и JS errors; сообщения пациентам/сотрудникам не отправлялись.
- Canonical deploy: `deploy-raimsmile.yml` для raimsmile.com и `deploy-expert-patient-staging.yml` для действующего clinic.raimovdental.com. Нового домена или cutover на expertdental.kg нет.
- Rollback: revert task commit через PR и повтор двух штатных deploy workflows; отдельный production rollback drill не выполнялся.

## Release evidence — VERIFIED

- PR: https://github.com/zaomir/grainee-v2/pull/1553, merged 2026-09-07 01:29:08 UTC.
- Merged SHA и deployed SHA обеих поверхностей: `f323705f2c03f5910aab100f461084228fc42279`.
- Оба deploy workflows: `success`; metadata сохранены в `CHECKUPS_WORKFLOWS_2026-09-07.json`.
- RAIM SMILE workflow: https://github.com/zaomir/grainee-v2/actions/runs/34073163294.
- Clinic workflow: https://github.com/zaomir/grainee-v2/actions/runs/34073163320.
- Live: https://raimsmile.com/smilecare-12/ и https://clinic.raimovdental.com/services/smilecare-12/ — HTTP 200.
- Release markers: https://raimsmile.com/assets/prices-release.json (`sourceSha`) и https://clinic.raimovdental.com/release.json (`sha`).
- `CHECKUPS_PRODUCTION_SMOKE_2026-09-07.json`: exact SHA, все восемь компонентов на RAIM SMILE, состав/цены обеих страниц, article HTTP 200, шесть legacy redirects 301; HTML RAIM SMILE совпадает с hash deployment manifest.
- `CHECKUPS_BROWSER_SMOKE_2026-09-07.json`: обе поверхности на 320/390/1440 px, HTTP 200, без overflow и JS errors; внешние сообщения не отправлены.

Подтверждено: программное внедрение, публикация, production smoke. Не подтверждено: клиническое исполнение нового состава, обучение/принятие командой и влияние на конверсию или экономику.
