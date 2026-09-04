---
title: Expert Dental Studio — реестр ссылок
status: ACTIVE REGISTER
version: 1.3
created: 2026-08-03
last_updated: 2026-08-30
id_prefix: ED-LINK
---

# Реестр ссылок Expert Dental

## Правило

В реестр вносятся только:

- URL, предоставленные пользователем;
- URL, зафиксированные в действующем SSOT;
- URL, подтверждённые production-проверкой.

Предполагаемые адреса не создаются. Если точный URL неизвестен, фиксируется идентификатор и статус `URL требуется`.

## Сайт и коммуникационные каналы клиники

| ID | Объект | URL / идентификатор | Статус источника | Связанный материал | Примечание |
|---|---|---|---|---|---|
| ED-LINK-001 | Основной сайт Expert Dental | `https://expertdental.kg/` | SSOT | ED-MAT-003 | Канон сайта клиники |
| ED-LINK-002 | Страница услуг | `http://expertdental.kg/services` | Предоставлен пользователем | ED-MAT-021 | Опубликована в первые две недели |
| ED-LINK-003 | Страница контактов | `http://expertdental.kg/contacts` | Предоставлен пользователем | ED-MAT-022 | Опубликована в первые две недели |
| ED-LINK-004 | Блог | `http://expertdental.kg/blog` | Предоставлен пользователем | ED-MAT-023 | Опубликовано 9 статей |
| ED-LINK-005 | Тестовая новая главная | `http://expertdental.kg/home-new` | Предоставлен пользователем | ED-MAT-025 | Прототип, будет дорабатываться |
| ED-LINK-033 | Страница цен `/price` | `https://expertdental.kg/price` | Production + clinic price list | ED-MAT-053 | Legacy alias; канон долгосрочно `/services/` |
| ED-LINK-006 | Instagram клиники | `https://www.instagram.com/expert_dental_studio?igsh=enRxbnpueTJxcXZ3` | SSOT | — | Аудит и статистика требуют доступа |
| ED-LINK-007 | Телефон / WhatsApp | `+996 555 255 455` | SSOT | — | Не преобразован в непроверенный deeplink |

## Карты и репутация

| ID | Объект | URL / идентификатор | Статус источника | Связанный материал | Примечание |
|---|---|---|---|---|---|
| ED-LINK-008 | Google Maps | `https://maps.app.goo.gl/GSsMuQfJ7hkY59cj8` | Получена от клиники 06.08.2026 · smoke 200 | ED-MAT-033, ED-MAT-063 | Короткая ссылка. Resolved place — ED-LINK-040. Writereview — ED-LINK-041 |
| ED-LINK-009 | 2ГИС | `https://2gis.kg/bishkek/firm/70000001089655879` | Источник v1.1, срез 03.08.2026 | ED-MAT-034 | Карточка Expert Dental Studio. Вкладка отзывов: `/tab/reviews` |
| ED-LINK-010 | Яндекс Карты | `https://yandex.ru/maps/org/ekspert_dental_studiya/222117460907/` | Источник v1.1, production link | ED-MAT-035 | Прямая цель белой QR-системы. Вкладка отзывов: `/reviews/` |

## Планы и отчёты CAESTHETIC

| ID | Объект | URL | Статус | Связанный материал | Доступ |
|---|---|---|---|---|---|
| ED-LINK-011 | Перечень периодов | `https://raimovdental.com/ru/valeria/` | Production verified | ED-MAT-014 | пароль `0726`, без username |
| ED-LINK-012 | Первый месяц | `https://raimovdental.com/ru/valeria/month-1/` | Production verified | ED-MAT-015 | пароль `0726`, без username |
| ED-LINK-013 | План первого месяца | `https://raimovdental.com/ru/valeria/month-1/plan/` | Production verified | ED-MAT-016 | 5 блоков, 16 пунктов |
| ED-LINK-014 | Отчёты первого месяца | `https://raimovdental.com/ru/valeria/month-1/reports/` | Production verified | ED-MAT-017 | содержит основной отчёт и его продолжение |
| ED-LINK-015 | Первые две недели | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/` | Production verified | ED-MAT-018 | родительский промежуточный отчёт |

## Подробное продолжение отчёта за первые две недели

Все восемь маршрутов проверены на origin и публичном домене. После входа отвечают HTTP `200`; без сессии — перенаправление на password-only вход.

| ID | Объект | URL | Статус | Связанный материал | Примечание |
|---|---|---|---|---|---|
| ED-LINK-025 | Карта подробного отчёта | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/` | Production verified | ED-MAT-051 | Продолжение ED-MAT-018, версия 1.1 |
| ED-LINK-026 | Конкурентное поле | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/competitors/` | Production verified | ED-MAT-051 | 15 конкурентов, срез 2ГИС 03.08.2026 |
| ED-LINK-027 | Выбранная позиция | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/position/` | Production verified | ED-MAT-051 | Комплексное лечение сложных случаев |
| ED-LINK-028 | Путь пациента | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/patient-path/` | Production verified | ED-MAT-051 | 14 этапов и 3 маршрута услуг |
| ED-LINK-029 | Обработка и возврат обращений | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/scripts/` | Production verified | ED-MAT-051 | 25 сценариев и 9 правил касаний |
| ED-LINK-030 | Отзывы без накрутки | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/reputation/` | Production verified | ED-MAT-051 | Белая система и прямой QR на Яндекс |
| ED-LINK-031 | Что считается результатом | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/measurement/` | Production verified | ED-MAT-051 | 3 зоны и 4 уровня KPI |
| ED-LINK-032 | Следующая половина месяца | `https://raimovdental.com/ru/valeria/month-1/reports/first-two-weeks/details/next/` | Production verified | ED-MAT-051 | Данные и задачи следующей волны |

## Интерфейсы клиники

| ID | Объект | URL | Статус | Связанный материал | Примечание |
|---|---|---|---|---|---|
| ED-LINK-016 | Сводная страница интерфейсов | `https://raimovdental.com/assets/img/workspace/` | Production verified ранее | ED-MAT-026 | Основная ссылка для презентации |
| ED-LINK-017 | Общий interface app | `https://raimovdental.com/assets/img/workspace/app.html` | Production route | ED-MAT-027 | Демо без CRM |
| ED-LINK-018 | Администратор | `https://raimovdental.com/assets/img/workspace/admin/` | Production route | ED-MAT-028 | Детальная роль |
| ED-LINK-019 | Врач | `https://raimovdental.com/assets/img/workspace/doctor/` | Production route | ED-MAT-029 | Предварительная роль |
| ED-LINK-020 | Управляющий | `https://raimovdental.com/assets/img/workspace/manager/` | Production route | ED-MAT-030 | Предварительная роль |
| ED-LINK-021 | Владелец | `https://raimovdental.com/assets/img/workspace/owner/` | Production route | ED-MAT-031 | Предварительная роль |
| ED-LINK-022 | Детальный render администратора | `https://raimovdental.com/render/` | Production verified | ED-MAT-032 | Обучение, тесты и скрипты |
| ED-LINK-036 | Презентация для Атабека (workspace) | `https://raimovdental.com/assets/img/workspace/presentation/` | Production verified | ED-MAT-059 | Скриншоты 01–12 + функционал + результаты |
| ED-LINK-037 | Hub · сценарий презентации | `https://raimovdental.com/assets/img/workspace/#present` | Production verified (IP.3 smoke) | ED-MAT-026 | Блок «Как презентовать» · порядок 7→5→4→1→10→11→8 |
| ED-LINK-038 | Презентация · plan-map | `https://raimovdental.com/assets/img/workspace/presentation/#plan-map` | Production verified (IP.2 smoke) | ED-MAT-059 | Таблица «пункт месяца-1 → экран» для 1/4/5/7/8/10/11 |
| ED-LINK-039 | Render · deep-links скриптов и маркеров | `https://raimovdental.com/render/#scripts` · `#recontact` · `#markers` | Production verified | ED-MAT-032 | Три якоря сценария IP.3; базовый маршрут — ED-LINK-022 |
| ED-LINK-040 | Google Maps · resolved place | `https://www.google.com/maps/place/Stomatologiya:+Ekspert+Dental+Studiya/@42.8743647,74.6077928,17z` | Production verified (curl 200, 2026-08-08) | ED-MAT-063, ED-MAT-033 | Разворот ED-LINK-008; feature `/g/11w8nfy1bh`; Place ID → ED-LINK-041 |
| ED-LINK-041 | Google Maps · writereview | `https://search.google.com/local/writereview?placeid=ChIJq-8xG8a3njgR-Jz17KDbaKw` | Resolved 2026-08-08 · smoke 200 (signin wall OK) | ED-MAT-063, ED-MAT-033, ED-MAT-068 | Place ID `ChIJq-8xG8a3njgR-Jz17KDbaKw`; ftid `0x389eb7c61b31efab:0xac68dba0ecf59cf8`; evidence `media/maps-packaging-2026-08-08/google-place-id.txt` |
| ED-LINK-042 | Печатная версия гайдбука администратора | `https://raimovdental.com/assets/img/workspace/content/admin-guidebook.print.html` | Production verified 2026-08-30 | ED-MAT-073 | HTTP 200, noindex; deploy #569 и Workspace Live Smoke #86; содержание создаётся из того же SSOT, что суфлёр и онбординг |

## Стратегические и исторические страницы

| ID | Объект | URL | Статус | Связанный материал | Примечание |
|---|---|---|---|---|---|
| ED-LINK-023 | Стратегия Дмитрия | `https://raimovdental.com/ru/` | Protected production | — | Парольный контур сайта |
| ED-LINK-024 | Исторический закрытый оффер Expert Dental | `https://caesthetic.com/private/expert-dental/offer/` | Historical | ED-MAT-004 | Не является текущим источником цены |

## Ссылки, которые необходимо получить

| Приоритет | Объект | Причина |
|---|---|---|
| ~~P1~~ | ~~Place ID Google Maps~~ | **Закрыто 2026-08-08** → ED-LINK-041 |
| P1 | Девять прямых URL статей блога | Нужен полный каталог опубликованного контента |
| P1 | Прямые ссылки на конкретные QR-файлы | Целевая ссылка Яндекс известна; необходимо зарегистрировать файлы QR и A5-карточки после получения исходников |

## Следующий свободный ID

Следующая ссылка: `ED-LINK-043`.
